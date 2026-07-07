import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// Prisma + Neon adapter need the Node.js runtime (WebSocket via `ws`).
export const runtime = "nodejs";

function fullName(first?: string | null, last?: string | null) {
  return [first, last].filter(Boolean).join(" ") || null;
}

export async function POST(req: NextRequest) {
  let evt;
  try {
    // Verifies the Svix signature using CLERK_WEBHOOK_SIGNING_SECRET.
    evt = await verifyWebhook(req);
  } catch (err) {
    console.error("Clerk webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  try {
    switch (evt.type) {
      case "user.created":
      case "user.updated": {
        const data = evt.data;
        const email =
          data.email_addresses.find(
            (e) => e.id === data.primary_email_address_id,
          )?.email_address ??
          data.email_addresses[0]?.email_address ??
          "";
        const name = fullName(data.first_name, data.last_name);
        await prisma.user.upsert({
          where: { clerkId: data.id },
          create: { clerkId: data.id, email, name },
          update: { email, name },
        });
        break;
      }

      case "user.deleted": {
        if (evt.data.id) {
          await prisma.user.deleteMany({ where: { clerkId: evt.data.id } });
        }
        break;
      }

      case "organization.created":
      case "organization.updated": {
        const data = evt.data;
        await prisma.organization.upsert({
          where: { clerkOrgId: data.id },
          create: { clerkOrgId: data.id, name: data.name, plan: "FREE" },
          update: { name: data.name },
        });
        break;
      }

      case "organization.deleted": {
        if (evt.data.id) {
          await prisma.organization.deleteMany({
            where: { clerkOrgId: evt.data.id },
          });
        }
        break;
      }

      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const data = evt.data;
        const role = data.role === "org:admin" ? "ADMIN" : "MEMBER";

        // Ensure the org exists (events can arrive out of order).
        const org = await prisma.organization.upsert({
          where: { clerkOrgId: data.organization.id },
          create: {
            clerkOrgId: data.organization.id,
            name: data.organization.name,
            plan: "FREE",
          },
          update: { name: data.organization.name },
        });

        // Ensure the user exists.
        const u = data.public_user_data;
        const user = await prisma.user.upsert({
          where: { clerkId: u.user_id },
          create: {
            clerkId: u.user_id,
            email: u.identifier ?? "",
            name: fullName(u.first_name, u.last_name),
          },
          update: {},
        });

        await prisma.organizationMember.upsert({
          where: {
            userId_organizationId: { userId: user.id, organizationId: org.id },
          },
          create: { userId: user.id, organizationId: org.id, role },
          update: { role },
        });
        break;
      }

      case "organizationMembership.deleted": {
        const data = evt.data;
        const org = await prisma.organization.findUnique({
          where: { clerkOrgId: data.organization.id },
        });
        const user = await prisma.user.findUnique({
          where: { clerkId: data.public_user_data.user_id },
        });
        if (org && user) {
          await prisma.organizationMember.deleteMany({
            where: { userId: user.id, organizationId: org.id },
          });
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge so Clerk doesn't retry.
        break;
    }
  } catch (err) {
    console.error(`Error handling Clerk webhook (${evt.type}):`, err);
    return new Response("Error processing webhook", { status: 500 });
  }

  return new Response("Webhook received", { status: 200 });
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { renameProject, deleteProject } from "./actions";

export function ProjectActions({
  id,
  name,
  canDelete,
}: {
  id: string;
  name: string;
  canDelete: boolean;
}) {
  const [renameOpen, setRenameOpen] = useState(false);

  return (
    <div className="flex items-center gap-2">
      {/* Rename */}
      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            Rename
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form
            action={async (fd) => {
              await renameProject(fd);
              setRenameOpen(false);
            }}
          >
            <DialogHeader>
              <DialogTitle>Rename project</DialogTitle>
            </DialogHeader>
            <input type="hidden" name="id" value={id} />
            <div className="mt-4 flex flex-col gap-2">
              <Label htmlFor={`rename-${id}`}>Name</Label>
              <Input
                id={`rename-${id}`}
                name="name"
                defaultValue={name}
                required
                maxLength={100}
                autoFocus
              />
            </div>
            <DialogFooter className="mt-4">
              <DialogClose asChild>
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      {/* Delete — ADMIN only */}
      {canDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete “{name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently deletes the project and all of its tasks. This
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <form action={deleteProject}>
                <input type="hidden" name="id" value={id} />
                <AlertDialogAction type="submit">Delete</AlertDialogAction>
              </form>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

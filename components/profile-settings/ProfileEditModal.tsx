"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ProfileEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ProfileEditModal({
  open,
  onOpenChange,
  onSuccess,
}: ProfileEditModalProps) {
  const { user, mutate } = useAuthUser();
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Initialize name when modal opens or user changes
  useEffect(() => {
    if (open && user?.name) {
      setName(user.name);
    }
  }, [open, user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      toast.success("Profile updated!", {
        description: "Your name has been updated successfully.",
      });

      // Refresh user data from API - this will update the displayed name immediately
      if (mutate) {
        await mutate();
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update profile", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border-zinc/60 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">Edit Profile</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Update your profile information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-zinc-300">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="bg-zinc-900/50 border-border-zinc text-white placeholder:text-zinc-500 focus-visible:ring-emerald-normal/50 focus-visible:border-emerald-normal"
                disabled={isLoading}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border-zinc bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-emerald-normal to-cyan-normal hover:from-emerald-normal hover:to-cyan-normal text-white border-0"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


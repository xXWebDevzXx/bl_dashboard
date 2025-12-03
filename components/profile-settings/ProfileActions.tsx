"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthUser } from "@/hooks/useAuthUser";
import { KeyRound, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ProfileEditModal } from "./ProfileEditModal";

export function ProfileActions() {
  const { user } = useAuthUser();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleChangePassword = async () => {
    if (!user?.email) {
      toast.error("Unable to send reset email", {
        description: "User email not found. Please try again.",
      });
      return;
    }

    setIsChangingPassword(true);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send password reset email");
      }

      toast.success("Password reset email sent!", {
        description: `Check ${user.email} for instructions to reset your password.`,
      });
    } catch (error) {
      toast.error("Failed to send reset email", {
        description:
          error instanceof Error ? error.message : "Please try again later.",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    // TODO: Implement account deletion with confirmation
    toast.warning("Account deletion coming soon!", {
      description: "This feature requires additional confirmation steps.",
    });
  };

  return (
    <>
      <Card className="lg:col-span-3 bg-[#161B22] border-zinc-800/60 shadow-2xl shadow-black/40 animate-[fadeInScale_0.6s_ease-out_0.3s_both]">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-zinc-400">
            Manage your profile and account settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button
              className="bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white border-0 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-all duration-300"
              size="lg"
              onClick={() => setIsEditModalOpen(true)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Update Profile
            </Button>
            <Button
              variant="outline"
              className="border-zinc-700 bg-zinc-900/50 text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-600 transition-all duration-300"
              size="lg"
              onClick={handleChangePassword}
              disabled={isChangingPassword}
            >
              {isChangingPassword ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <KeyRound className="w-4 h-4 mr-2" />
              )}
              {isChangingPassword ? "Sending..." : "Change Password"}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-950/50 text-red-400 border border-red-900/50 hover:bg-red-900/50 hover:text-red-300 hover:border-red-800 shadow-lg shadow-red-500/10 hover:shadow-red-500/20 transition-all duration-300"
              size="lg"
              onClick={handleDeleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileEditModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
      />
    </>
  );
}

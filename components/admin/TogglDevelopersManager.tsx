"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Plus,
  RefreshCw,
  Trash2,
  User as UserIcon,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

interface TogglDeveloper {
  id: string;
  togglId: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function TogglDevelopersManager() {
  const [developers, setDevelopers] = useState<TogglDeveloper[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDeveloper, setDeleteDeveloper] = useState<TogglDeveloper | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [addingDeveloper, setAddingDeveloper] = useState(false);

  const fetchDevelopers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/toggl-developers");

      if (!response.ok) {
        if (response.status === 403) {
          toast.error("You don't have permission to access this");
          return;
        }
        throw new Error("Failed to fetch developers");
      }

      const data = await response.json();
      setDevelopers(data.developers);
    } catch (error) {
      console.error("Error fetching developers:", error);
      toast.error("Failed to load developers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevelopers();
  }, [fetchDevelopers]);

  const handleAddDeveloper = async () => {
    if (!newEmail.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    try {
      setAddingDeveloper(true);
      const response = await fetch("/api/admin/toggl-developers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim() }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add developer");
      }

      toast.success("Developer added successfully");
      setIsAddDialogOpen(false);
      setNewEmail("");
      fetchDevelopers();
    } catch (error) {
      console.error("Error adding developer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to add developer");
    } finally {
      setAddingDeveloper(false);
    }
  };

  const handleToggleActive = async (developer: TogglDeveloper) => {
    try {
      const response = await fetch(`/api/admin/toggl-developers/${developer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !developer.isActive }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update developer");
      }

      toast.success(`Developer ${developer.isActive ? "deactivated" : "activated"}`);
      fetchDevelopers();
    } catch (error) {
      console.error("Error updating developer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update developer");
    }
  };

  const handleDelete = (developer: TogglDeveloper) => {
    setDeleteDeveloper(developer);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteDeveloper) return;

    try {
      const response = await fetch(`/api/admin/toggl-developers/${deleteDeveloper.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete developer");
      }

      toast.success("Developer removed successfully");
      setIsDeleteDialogOpen(false);
      setDeleteDeveloper(null);
      fetchDevelopers();
    } catch (error) {
      console.error("Error deleting developer:", error);
      toast.error(error instanceof Error ? error.message : "Failed to delete developer");
    }
  };

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return "Never";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <Card className="bg-[#161B22] border-zinc-800/60">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white">Toggl Developers</CardTitle>
            <CardDescription className="text-zinc-400">
              Manage developers whose time entries are synced from Toggl
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDevelopers()}
              disabled={loading}
              className="bg-zinc-900/50 border-zinc-700 text-white hover:bg-zinc-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              size="sm"
              onClick={() => setIsAddDialogOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Developer
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-zinc-400">Loading developers...</div>
        ) : developers.length === 0 ? (
          <div className="text-center py-8 text-zinc-400">
            No developers configured. Add a developer to start syncing time entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Developer
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Toggl ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-zinc-400">
                    Added
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-zinc-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {developers.map((developer) => (
                  <tr
                    key={developer.id}
                    className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <UserIcon className="w-4 h-4 text-zinc-400" />
                        <span className="text-white font-medium">{developer.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-zinc-400" />
                        <span className="text-zinc-300">{developer.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-zinc-400 font-mono text-sm">
                        {developer.togglId}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        className={
                          developer.isActive
                            ? "bg-green-600/20 text-green-400 border-green-600/30"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }
                      >
                        {developer.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-zinc-400 text-sm">
                      {formatDate(developer.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(developer)}
                          className="text-zinc-400 hover:text-white hover:bg-zinc-800"
                          title={developer.isActive ? "Deactivate" : "Activate"}
                        >
                          {developer.isActive ? (
                            <ToggleRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(developer)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>

      {/* Add Developer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#161B22] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Add Developer</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Enter the email address of a Toggl user in your workspace. Their name and
              Toggl ID will be fetched automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <label className="text-sm font-medium text-zinc-300 mb-2 block">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="developer@company.com"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddDeveloper()}
              className="bg-zinc-900/50 border-zinc-700 text-white"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsAddDialogOpen(false);
                setNewEmail("");
              }}
              className="bg-zinc-900/50 border-zinc-700 text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddDeveloper}
              disabled={addingDeveloper}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {addingDeveloper ? "Adding..." : "Add Developer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-[#161B22] border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Remove Developer</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to remove this developer? Their time entries will no
              longer be synced.
            </DialogDescription>
          </DialogHeader>
          {deleteDeveloper && (
            <div className="py-4">
              <div className="bg-zinc-900/50 rounded-md p-4 space-y-2">
                <div className="text-sm">
                  <span className="text-zinc-400">Name: </span>
                  <span className="text-white font-medium">{deleteDeveloper.name}</span>
                </div>
                <div className="text-sm">
                  <span className="text-zinc-400">Email: </span>
                  <span className="text-white">{deleteDeveloper.email}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="bg-zinc-900/50 border-zinc-700 text-white"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

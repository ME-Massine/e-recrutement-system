import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { User } from "../../types";
import { ShieldCheck, ShieldAlert, Search, Trash2, Eye } from "lucide-react";
import { PageHeader, Skeleton, EmptyState, Modal } from "@/components/shared/SharedComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

function getRoleBadgeVariant(role: string): "default" | "warning" | "secondary" {
  if (role === "ROLE_ADMIN") return "warning";
  if (role === "ROLE_RECRUITER") return "default";
  return "secondary";
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: number) => {
    try {
      const updatedUser = await adminService.toggleUserStatus(userId);
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (error) {
      console.error("Failed to toggle user status", error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.deleteUser(selectedUser.id);
      setUsers(users.filter((u) => u.id !== selectedUser.id));
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-shell animate-in">
      <PageHeader
        title="Manage Users"
        description="Activate or deactivate candidate and recruiter accounts."
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search users…"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-border/80 bg-muted/40">
                <tr>
                  <th className="px-5 py-3.5 kicker">User</th>
                  <th className="px-5 py-3.5 kicker">Role</th>
                  <th className="px-5 py-3.5 kicker">Status</th>
                  <th className="px-5 py-3.5 kicker text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-muted/25">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="bg-primary/10 text-xs text-primary">
                            {getInitials(user.firstName, user.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role.replace("ROLE_", "")}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 text-sm font-medium",
                          user.enabled ? "text-success" : "text-muted-foreground"
                        )}
                      >
                        {user.enabled ? (
                          <><ShieldCheck className="h-4 w-4" /> Active</>
                        ) : (
                          <><ShieldAlert className="h-4 w-4" /> Disabled</>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => { setSelectedUser(user); setIsDetailsOpen(true); }}
                          aria-label="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "text-xs font-medium",
                            user.enabled
                              ? "text-destructive hover:bg-destructive/10 hover:text-destructive"
                              : "text-success hover:bg-success/10 hover:text-success"
                          )}
                          onClick={() => handleToggleStatus(user.id)}
                          disabled={user.role === "ROLE_ADMIN"}
                        >
                          {user.enabled ? "Deactivate" : "Activate"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => { setSelectedUser(user); setIsDeleteOpen(true); }}
                          disabled={user.role === "ROLE_ADMIN"}
                          aria-label="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <EmptyState
                title="No users found"
                description="Try adjusting your search."
                className="rounded-none border-none shadow-none"
              />
            )}
          </div>
        </div>
      )}

      <Modal
        open={isDetailsOpen && !!selectedUser}
        onClose={() => setIsDetailsOpen(false)}
        title="User Details"
        footer={
          <Button variant="outline" size="sm" onClick={() => setIsDetailsOpen(false)}>
            Close
          </Button>
        }
      >
        {selectedUser && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Name</p>
              <p className="mt-1 text-sm font-semibold">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Email</p>
              <p className="mt-1 text-sm">{selectedUser.email}</p>
            </div>
            <div className="flex gap-8">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Role</p>
                <div className="mt-1.5">
                  <Badge variant={getRoleBadgeVariant(selectedUser.role)}>
                    {selectedUser.role.replace("ROLE_", "")}
                  </Badge>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Status</p>
                <p className={cn("mt-1 text-sm font-medium", selectedUser.enabled ? "text-success" : "text-destructive")}>
                  {selectedUser.enabled ? "Active" : "Disabled"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isDeleteOpen && !!selectedUser}
        onClose={() => setIsDeleteOpen(false)}
        title={
          <span className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            Confirm Deletion
          </span>
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteUser}>
              Delete Permanently
            </Button>
          </>
        }
      >
        {selectedUser && (
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold">
                {selectedUser.firstName} {selectedUser.lastName}
              </span>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone and will remove all associated data.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;

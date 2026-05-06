import React, { useState } from "react";
import { useAuth } from "../../store/authStore";
import adminService from "../../services/adminService";
import { Save } from "lucide-react";
import { PageHeader, FormField, InlineAlert } from "@/components/shared/SharedComponents";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const AdminProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." });
      return;
    }

    setLoading(true);
    try {
      await adminService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setFormData({ ...formData, currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.response?.data?.message || "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-in">
      <PageHeader
        title="Edit Profile"
        description="Update your administrative account details."
      />

      {message && <InlineAlert type={message.type} message={message.text} />}

      <form onSubmit={handleSubmit} className="surface-card p-6 space-y-5">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <FormField label="First Name" required>
            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </FormField>
          <FormField label="Last Name" required>
            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </FormField>
        </div>

        <FormField label="Email Address" required>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </FormField>

        <div className="pt-1">
          <Separator className="mb-5" />
          <p className="mb-5 text-sm font-medium text-primary">Change Password (optional)</p>
          <div className="space-y-5">
            <FormField label="Current Password" description="Required to authorize any changes">
              <Input
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                placeholder="Enter current password"
              />
            </FormField>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <FormField label="New Password">
                <Input
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
              </FormField>
              <FormField label="Confirm New Password">
                <Input
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </div>
        </div>

        <Button type="submit" disabled={loading} loading={loading} className="w-full">
          <Save className="h-4 w-4" />
          Save Changes
        </Button>
      </form>
    </div>
  );
};

export default AdminProfilePage;

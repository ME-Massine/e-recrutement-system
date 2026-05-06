import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useAuth } from "@/store/authStore";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormGrid, InlineAlert, AuthPageHeader } from "@/components/shared/SharedComponents";
import { UserIcon, MailIcon, LockIcon } from "lucide-react";
import { AxiosError } from "axios";
import { ApiError } from "@/types";
import { useEffect } from "react";
import { getDashboardPath } from "@/lib/auth";

const schema = z
  .object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormValues = z.infer<typeof schema>;

export function RegisterCandidatePage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (vals: FormValues) =>
      authService.registerCandidate({
        firstName: vals.firstName,
        lastName: vals.lastName,
        email: vals.email,
        password: vals.password,
      }),
    onSuccess: (data) => {
      login(data);
      navigate(getDashboardPath(data.role), { replace: true });
    },
  });

  const getError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiError;
      return data?.detail || data?.error || "Registration failed. Please try again.";
    }
    return "Something went wrong.";
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <AuthPageHeader
          icon={<UserIcon className="h-6 w-6" />}
          title="Create your account"
          subtitle="Join as a candidate and start applying"
        />

        <div className="surface-card p-6">
          <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
            <FormGrid>
              <FormField label="First Name" error={errors.firstName?.message} required>
                <Input id="reg-c-firstname" placeholder="Jane" {...register("firstName")} />
              </FormField>
              <FormField label="Last Name" error={errors.lastName?.message} required>
                <Input id="reg-c-lastname" placeholder="Doe" {...register("lastName")} />
              </FormField>
            </FormGrid>

            <FormField label="Email" error={errors.email?.message} required>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="reg-c-email" type="email" placeholder="jane@example.com" className="pl-9" {...register("email")} />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="reg-c-password" type="password" placeholder="••••••••" className="pl-9" {...register("password")} />
              </div>
            </FormField>

            <FormField label="Confirm Password" error={errors.confirmPassword?.message} required>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="reg-c-confirm" type="password" placeholder="••••••••" className="pl-9" {...register("confirmPassword")} />
              </div>
            </FormField>

            {mutation.isError && (
              <InlineAlert type="error" message={getError(mutation.error)} />
            )}

            <Button type="submit" className="w-full" loading={mutation.isPending} id="reg-c-submit">
              Create Account
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-foreground hover:underline">Sign in</Link>
          {" / "}
          <Link to="/register/recruiter" className="font-medium text-foreground hover:underline">Recruiter?</Link>
        </p>
      </motion.div>
    </div>
  );
}

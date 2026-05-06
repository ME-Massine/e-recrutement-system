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
import { FormField, InlineAlert, AuthPageHeader } from "@/components/shared/SharedComponents";
import { BriefcaseIcon, MailIcon, LockIcon } from "lucide-react";
import { AxiosError } from "axios";
import { ApiError } from "@/types";
import { useEffect } from "react";
import { getDashboardPath } from "@/lib/auth";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate(getDashboardPath(user?.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data);
      navigate(getDashboardPath(data.role), { replace: true });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiError;
      return data?.detail || data?.error || "Invalid email or password.";
    }
    return "Something went wrong. Please try again.";
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
          icon={<BriefcaseIcon className="h-6 w-6" />}
          title="Welcome back"
          subtitle="Sign in to your account"
        />

        <div className="surface-card p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" error={errors.email?.message} required>
              <div className="relative">
                <MailIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  autoComplete="email"
                  {...register("email")}
                />
              </div>
            </FormField>

            <FormField label="Password" error={errors.password?.message} required>
              <div className="relative">
                <LockIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9"
                  autoComplete="current-password"
                  {...register("password")}
                />
              </div>
            </FormField>

            {mutation.isError && (
              <InlineAlert type="error" message={getErrorMessage(mutation.error)} />
            )}

            <Button
              type="submit"
              className="w-full"
              loading={mutation.isPending}
              id="login-submit"
            >
              Sign In
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register/candidate" className="font-medium text-foreground hover:underline">
            Register as Candidate
          </Link>
          {" / "}
          <Link to="/register/recruiter" className="font-medium text-foreground hover:underline">
            Register as Recruiter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

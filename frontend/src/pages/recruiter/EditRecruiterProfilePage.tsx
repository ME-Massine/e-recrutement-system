import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { recruiterService } from "@/services/recruiterService";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormField,
  FormGrid,
  FormActions,
  InlineAlert,
  PageHeader,
  Skeleton,
} from "@/components/shared/SharedComponents";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { AxiosError } from "axios";
import { ApiError } from "@/types";

const schema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyWebsite: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  companySector: z.string().optional(),
  companyDescription: z.string().max(1000, "Description too long").optional(),
});

type FormValues = z.infer<typeof schema>;

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function EditRecruiterProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.recruiterProfile,
    queryFn: recruiterService.getProfile,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        companyName: profile.companyName ?? "",
        companyWebsite: profile.companyWebsite ?? "",
        companySector: profile.companySector ?? "",
        companyDescription: profile.companyDescription ?? "",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      recruiterService.updateProfile({
        companyName: values.companyName.trim(),
        companyWebsite: normalizeOptional(values.companyWebsite),
        companySector: normalizeOptional(values.companySector),
        companyDescription: normalizeOptional(values.companyDescription),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.recruiterProfile });
      navigate("/recruiter/profile");
    },
  });

  const getErrorMessage = (error: unknown) => {
    if (error instanceof AxiosError) {
      const data = error.response?.data as ApiError;
      return data?.detail || data?.error || "Failed to update profile. Please try again.";
    }
    return "Failed to update profile. Please try again.";
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 animate-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in">
      <PageHeader title="Edit Company Profile" description="Update your recruiter profile information" />

      <div className="surface-card p-6">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
          <FormField label="Company Name" error={errors.companyName?.message} required>
            <Input id="edit-r-company" placeholder="TechCorp" {...register("companyName")} />
          </FormField>

          <FormGrid>
            <FormField label="Company Website" error={errors.companyWebsite?.message}>
              <Input id="edit-r-website" type="url" placeholder="https://techcorp.com" {...register("companyWebsite")} />
            </FormField>
            <FormField label="Sector / Industry" error={errors.companySector?.message}>
              <Input id="edit-r-sector" placeholder="Software Engineering" {...register("companySector")} />
            </FormField>
          </FormGrid>

          <FormField label="Company Description" error={errors.companyDescription?.message} description="Tell candidates about your company (max 1000 characters)">
            <Textarea
              id="edit-r-description"
              placeholder="Describe your company, culture, and what makes it a great place to work..."
              className="min-h-[120px]"
              {...register("companyDescription")}
            />
          </FormField>

          {mutation.isError && (
            <InlineAlert type="error" message={getErrorMessage(mutation.error)} />
          )}

          <FormActions>
            <Button type="button" variant="outline" asChild>
              <Link to="/recruiter/profile">
                <ArrowLeftIcon className="h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" loading={mutation.isPending} id="save-r-profile">
              <SaveIcon className="h-4 w-4" />
              Save Changes
            </Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
}

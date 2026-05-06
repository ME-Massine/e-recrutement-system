import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { candidateService } from "@/services/candidateService";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  FormField,
  FormSection,
  FormGrid,
  FormActions,
  InlineAlert,
  PageHeader,
  Skeleton,
} from "@/components/shared/SharedComponents";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { useEffect } from "react";
import { AxiosError } from "axios";
import { ApiError } from "@/types";

const CONTRACT_TYPES = ["CDI", "CDD", "STAGE", "FREELANCE", "INTERIM"] as const;

const schema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  headline: z.string().max(120, "Headline too long").optional(),
  summary: z.string().max(1000, "Summary too long").optional(),
  cvUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  skills: z.string().max(1000, "Skills text too long").optional(),
  yearsOfExperience: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || (Number.isInteger(Number(value)) && Number(value) >= 0),
      "Must be a non-negative whole number"
    ),
  expectedSalary: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || (!Number.isNaN(Number(value)) && Number(value) >= 0),
      "Must be a non-negative number"
    ),
  preferredContractType: z.enum(CONTRACT_TYPES).optional().or(z.literal("")),
  preferredLocation: z.string().max(255, "Preferred location too long").optional(),
});

type FormValues = z.infer<typeof schema>;

function normalizeOptional(value?: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseOptionalNumber(value?: string) {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function EditCandidateProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.candidateProfile,
    queryFn: candidateService.getProfile,
  });

  const { register, control, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone ?? "",
        address: profile.address ?? "",
        headline: profile.headline ?? "",
        summary: profile.summary ?? "",
        cvUrl: profile.cvUrl ?? "",
        skills: profile.skills ?? "",
        yearsOfExperience: profile.yearsOfExperience?.toString() ?? "",
        expectedSalary: profile.expectedSalary?.toString() ?? "",
        preferredContractType: profile.preferredContractType ?? "",
        preferredLocation: profile.preferredLocation ?? "",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      candidateService.updateProfile({
        phone: normalizeOptional(values.phone),
        address: normalizeOptional(values.address),
        headline: normalizeOptional(values.headline),
        summary: normalizeOptional(values.summary),
        cvUrl: normalizeOptional(values.cvUrl),
        skills: normalizeOptional(values.skills),
        yearsOfExperience: parseOptionalNumber(values.yearsOfExperience),
        expectedSalary: parseOptionalNumber(values.expectedSalary),
        preferredContractType: normalizeOptional(values.preferredContractType),
        preferredLocation: normalizeOptional(values.preferredLocation),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.candidateProfile });
      navigate("/candidate/profile");
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
      <PageHeader title="Edit Profile" description="Update your candidate information" />

      <div className="surface-card p-6">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
          <FormSection title="Personal">
            <FormGrid>
              <FormField label="Phone" error={errors.phone?.message}>
                <Input id="edit-c-phone" placeholder="+212 6 00 000 000" {...register("phone")} />
              </FormField>
              <FormField label="Location / Address" error={errors.address?.message}>
                <Input id="edit-c-address" placeholder="Casablanca, Morocco" {...register("address")} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Professional">
            <FormField label="Professional Headline" error={errors.headline?.message} description="One line that describes your expertise">
              <Input id="edit-c-headline" placeholder="e.g. Java Backend Developer" {...register("headline")} />
            </FormField>
            <FormField label="CV / Portfolio URL" error={errors.cvUrl?.message}>
              <Input id="edit-c-cvurl" type="url" placeholder="https://yourportfolio.com/cv.pdf" {...register("cvUrl")} />
            </FormField>
            <FormField label="Summary" error={errors.summary?.message} description="Tell recruiters about yourself (max 1000 characters)">
              <Textarea
                id="edit-c-summary"
                placeholder="Describe your experience, skills, and what you're looking for..."
                className="min-h-[120px]"
                {...register("summary")}
              />
            </FormField>
            <FormField label="Skills (comma-separated)" error={errors.skills?.message} description="Example: Java, Spring Boot, PostgreSQL">
              <Textarea
                id="edit-c-skills"
                placeholder="Java, Spring Boot, PostgreSQL"
                className="min-h-[90px]"
                {...register("skills")}
              />
            </FormField>
          </FormSection>

          <FormSection title="Preferences">
            <FormGrid>
              <FormField label="Years of Experience" error={errors.yearsOfExperience?.message}>
                <Input id="edit-c-experience" type="number" min="0" {...register("yearsOfExperience")} />
              </FormField>
              <FormField label="Expected Salary (MAD)" error={errors.expectedSalary?.message}>
                <Input id="edit-c-expected-salary" type="number" min="0" {...register("expectedSalary")} />
              </FormField>
              <FormField label="Preferred Contract Type" error={errors.preferredContractType?.message}>
                <Controller
                  name="preferredContractType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="edit-c-contract">
                        <SelectValue placeholder="No preference" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDI">Permanent (CDI)</SelectItem>
                        <SelectItem value="CDD">Fixed-term (CDD)</SelectItem>
                        <SelectItem value="STAGE">Internship</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                        <SelectItem value="INTERIM">Temporary</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>
              <FormField label="Preferred Location" error={errors.preferredLocation?.message}>
                <Input id="edit-c-preferred-location" placeholder="e.g. Casablanca, Morocco" {...register("preferredLocation")} />
              </FormField>
            </FormGrid>
          </FormSection>

          {mutation.isError && (
            <InlineAlert type="error" message={getErrorMessage(mutation.error)} />
          )}

          <FormActions>
            <Button type="button" variant="outline" asChild>
              <Link to="/candidate/profile">
                <ArrowLeftIcon className="h-4 w-4" />
                Cancel
              </Link>
            </Button>
            <Button type="submit" loading={mutation.isPending} id="save-c-profile">
              <SaveIcon className="h-4 w-4" />
              Save Changes
            </Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
}

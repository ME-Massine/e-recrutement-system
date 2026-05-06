import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { jobOfferService } from "@/services/jobOfferService";
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
} from "@/components/shared/SharedComponents";
import { ArrowLeftIcon, PlusCircleIcon } from "lucide-react";

const CONTRACT_TYPES = ["CDI", "CDD", "STAGE", "FREELANCE", "INTERIM"] as const;

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  contractType: z.enum(CONTRACT_TYPES),
  location: z.string().min(2, "Location is required"),
  salary: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || (!Number.isNaN(Number(value)) && Number(value) > 0),
      "Must be a positive number"
    ),
  requiredSkills: z.string().max(1000, "Skills text too long").optional(),
  requiredExperienceYears: z
    .string()
    .optional()
    .refine(
      (value) =>
        !value || (Number.isInteger(Number(value)) && Number(value) >= 0),
      "Must be a non-negative whole number"
    ),
  active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function CreateJobOfferPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { active: true, salary: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      jobOfferService.createOffer({
        title: values.title,
        description: values.description,
        contractType: values.contractType,
        location: values.location,
        salary: values.salary ? Number(values.salary) : null,
        requiredSkills: values.requiredSkills?.trim() || null,
        requiredExperienceYears: values.requiredExperienceYears
          ? Number(values.requiredExperienceYears)
          : null,
        active: values.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myJobOffers"] });
      navigate("/recruiter/job-offers");
    },
  });

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in">
      <Button variant="ghost" size="sm" className="mb-5 -ml-2" asChild>
        <Link to="/recruiter/job-offers">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Job Offers
        </Link>
      </Button>

      <PageHeader title="Post a New Job" description="Create a job offer and start receiving applications" />

      <div className="surface-card p-6">
        <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
          <FormSection title="Position">
            <FormField label="Job Title" error={errors.title?.message} required>
              <Input id="create-job-title" placeholder="e.g. Java Backend Developer" {...register("title")} />
            </FormField>
            <FormGrid>
              <FormField label="Contract Type" error={errors.contractType?.message} required>
                <Controller
                  name="contractType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger id="create-job-contract">
                        <SelectValue placeholder="Select type…" />
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
              <FormField label="Location" error={errors.location?.message} required>
                <Input id="create-job-location" placeholder="e.g. Casablanca" {...register("location")} />
              </FormField>
            </FormGrid>
            <FormField label="Monthly Salary (MAD)" error={errors.salary?.message} description="Leave blank if not specified">
              <Input id="create-job-salary" type="number" placeholder="e.g. 12000" {...register("salary")} />
            </FormField>
          </FormSection>

          <FormSection title="Requirements">
            <FormGrid>
              <FormField label="Required Skills (comma-separated)" error={errors.requiredSkills?.message}>
                <Input id="create-job-required-skills" placeholder="Java, Spring Boot, PostgreSQL" {...register("requiredSkills")} />
              </FormField>
              <FormField label="Required Experience (years)" error={errors.requiredExperienceYears?.message}>
                <Input id="create-job-required-exp" type="number" min="0" placeholder="e.g. 3" {...register("requiredExperienceYears")} />
              </FormField>
            </FormGrid>
          </FormSection>

          <FormSection title="Description">
            <FormField label="Job Description" error={errors.description?.message} required>
              <Textarea
                id="create-job-description"
                placeholder="Describe the role, responsibilities, and requirements…"
                className="min-h-[160px]"
                {...register("description")}
              />
            </FormField>
          </FormSection>

          <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/45 p-4">
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <input
                  type="checkbox"
                  id="create-job-active"
                  checked={field.value}
                  onChange={field.onChange}
                  className="h-4 w-4 rounded accent-primary"
                />
              )}
            />
            <label htmlFor="create-job-active" className="cursor-pointer text-sm font-medium">
              Publish immediately (make offer active)
            </label>
          </div>

          {mutation.isError && (
            <InlineAlert type="error" message="Failed to create job offer. Please try again." />
          )}

          <FormActions>
            <Button type="button" variant="outline" asChild>
              <Link to="/recruiter/job-offers">Cancel</Link>
            </Button>
            <Button type="submit" loading={mutation.isPending} id="create-job-submit">
              <PlusCircleIcon className="h-4 w-4" />
              Post Job Offer
            </Button>
          </FormActions>
        </form>
      </div>
    </div>
  );
}

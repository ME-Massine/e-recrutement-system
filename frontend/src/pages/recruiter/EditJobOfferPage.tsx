import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AxiosError } from "axios";
import { jobOfferService } from "@/services/jobOfferService";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ErrorDisplay,
  FormField,
  FormSection,
  FormGrid,
  FormActions,
  InlineAlert,
  PageHeader,
  Skeleton,
} from "@/components/shared/SharedComponents";
import { ArrowLeftIcon, SaveIcon } from "lucide-react";
import { ApiError, JobOffer } from "@/types";

const CONTRACT_TYPES = ["CDI", "CDD", "STAGE", "FREELANCE", "INTERIM"] as const;

const schema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(20, "Description too short"),
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

function EditJobForm({ offer, offerId }: { offer: JobOffer; offerId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: offer.title,
      description: offer.description,
      contractType: offer.contractType as (typeof CONTRACT_TYPES)[number],
      location: offer.location,
      salary: offer.salary?.toString() ?? "",
      requiredSkills: offer.requiredSkills ?? "",
      requiredExperienceYears: offer.requiredExperienceYears?.toString() ?? "",
      active: offer.active,
    },
  });

  const mutation = useMutation({
    mutationFn: (vals: FormValues) =>
      jobOfferService.updateOffer(offerId, {
        title: vals.title,
        description: vals.description,
        contractType: vals.contractType,
        location: vals.location,
        salary: vals.salary ? Number(vals.salary) : null,
        requiredSkills: vals.requiredSkills?.trim() || null,
        requiredExperienceYears: vals.requiredExperienceYears
          ? Number(vals.requiredExperienceYears)
          : null,
        active: vals.active,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myJobOffers"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.jobOffer(offerId) });
      navigate("/recruiter/job-offers");
    },
  });

  return (
    <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-6">
      <FormSection title="Position">
        <FormField label="Job Title" error={errors.title?.message} required>
          <Input id="edit-job-title" {...register("title")} />
        </FormField>
        <FormGrid>
          <FormField label="Contract Type" error={errors.contractType?.message} required>
            <Controller
              name="contractType"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="edit-job-contract">
                    <SelectValue />
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
            <Input id="edit-job-location" {...register("location")} />
          </FormField>
        </FormGrid>
        <FormField label="Monthly Salary (MAD)" error={errors.salary?.message} description="Leave blank if not specified">
          <Input id="edit-job-salary" type="number" {...register("salary")} />
        </FormField>
      </FormSection>

      <FormSection title="Requirements">
        <FormGrid>
          <FormField label="Required Skills (comma-separated)" error={errors.requiredSkills?.message}>
            <Input
              id="edit-job-required-skills"
              placeholder="Java, Spring Boot, PostgreSQL"
              {...register("requiredSkills")}
            />
          </FormField>
          <FormField label="Required Experience (years)" error={errors.requiredExperienceYears?.message}>
            <Input
              id="edit-job-required-exp"
              type="number"
              min="0"
              {...register("requiredExperienceYears")}
            />
          </FormField>
        </FormGrid>
      </FormSection>

      <FormSection title="Description">
        <FormField label="Job Description" error={errors.description?.message} required>
          <Textarea id="edit-job-description" className="min-h-[160px]" {...register("description")} />
        </FormField>
      </FormSection>

      <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/45 p-4">
        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <input
              type="checkbox"
              id="edit-job-active"
              checked={field.value}
              onChange={field.onChange}
              className="h-4 w-4 rounded accent-primary"
            />
          )}
        />
        <label htmlFor="edit-job-active" className="cursor-pointer text-sm font-medium">
          Active (visible to candidates)
        </label>
      </div>

      {mutation.isError && (
        <InlineAlert type="error" message="Failed to update job offer. Please try again." />
      )}

      <FormActions>
        <Button type="button" variant="outline" asChild>
          <Link to="/recruiter/job-offers">Cancel</Link>
        </Button>
        <Button type="submit" loading={mutation.isPending} id="edit-job-submit">
          <SaveIcon className="h-4 w-4" />
          Save Changes
        </Button>
      </FormActions>
    </form>
  );
}

export function EditJobOfferPage() {
  const { id } = useParams<{ id: string }>();
  const offerId = Number(id);
  const isValidOfferId = Number.isInteger(offerId) && offerId > 0;

  const { data: offer, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryKeys.jobOffer(offerId),
    queryFn: () => jobOfferService.getMyOfferById(offerId),
    enabled: isValidOfferId,
  });

  if (!isValidOfferId) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center animate-in">
        <p className="text-muted-foreground">Invalid job offer ID.</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/recruiter/job-offers">Back to Job Offers</Link>
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 animate-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-80 rounded-lg" />
      </div>
    );
  }

  if (isError || !offer) {
    const loadErrorMessage =
      error instanceof AxiosError
        ? (error.response?.data as ApiError | undefined)?.detail ??
          (error.response?.data as ApiError | undefined)?.error ??
          "Failed to load this job offer."
        : "Failed to load this job offer.";

    return (
      <div className="mx-auto max-w-4xl animate-in">
        <ErrorDisplay
          title="Unable to load job offer"
          message={loadErrorMessage}
          onRetry={refetch}
        />
        <div className="mt-4 text-center">
          <Button variant="outline" asChild>
            <Link to="/recruiter/job-offers">Back to Job Offers</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in">
      <Button variant="ghost" size="sm" className="mb-5 -ml-2" asChild>
        <Link to="/recruiter/job-offers">
          <ArrowLeftIcon className="h-4 w-4" />
          Back
        </Link>
      </Button>

      <PageHeader title="Edit Job Offer" description="Update your job offer details" />

      <div className="surface-card p-6">
        <EditJobForm key={offer.id} offer={offer} offerId={offerId} />
      </div>
    </div>
  );
}

import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { applicationService } from "@/services/applicationService";
import { jobOfferService } from "@/services/jobOfferService";
import { queryKeys } from "@/lib/queryKeys";
import { formatDate } from "@/lib/utils";
import { Application, ApplicationStatus, Page } from "@/types";
import { ApplicationStatusBadge } from "@/components/shared/ApplicationStatusBadge";
import { ApplicationStatusSelect } from "@/components/shared/ApplicationStatusSelect";
import { Pagination } from "@/components/shared/Pagination";
import {
  PageHeader,
  EmptyState,
  Skeleton,
  ErrorDisplay,
} from "@/components/shared/SharedComponents";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, UsersIcon, MailIcon, CalendarIcon } from "lucide-react";

const PAGE_SIZE = 10;

export function JobOfferApplicationsPage() {
  const { jobOfferId } = useParams<{ jobOfferId: string }>();
  const offerId = Number(jobOfferId);
  const [page, setPage] = useState(0);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const jobOfferApplicationsQueryKey = queryKeys.jobOfferApplications(offerId, page, PAGE_SIZE);

  const { data: offer } = useQuery({
    queryKey: queryKeys.jobOffer(offerId),
    queryFn: () => jobOfferService.getOfferById(offerId),
    enabled: !!offerId,
  });

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: jobOfferApplicationsQueryKey,
    queryFn: () => applicationService.getJobOfferApplications(offerId, page, PAGE_SIZE),
    enabled: !!offerId,
  });

  const statusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: number; status: ApplicationStatus }) => {
      setUpdatingId(appId);
      return applicationService.updateStatus(appId, { status });
    },
    onSuccess: (updatedApplication, variables) => {
      setUpdatingId(null);
      const nextStatus = updatedApplication.status ?? variables.status;

      const patchStatus = (oldPage: Page<Application> | undefined) => {
        if (!oldPage) return oldPage;
        if (!oldPage.content.some((app) => app.id === updatedApplication.id)) {
          return oldPage;
        }
        return {
          ...oldPage,
          content: oldPage.content.map((app) =>
            app.id === updatedApplication.id ? { ...app, status: nextStatus } : app
          ),
        };
      };

      queryClient.setQueryData<Page<Application>>(jobOfferApplicationsQueryKey, patchStatus);
      queryClient.setQueriesData<Page<Application>>(
        { queryKey: queryKeys.jobOfferApplicationsRoot, exact: false },
        patchStatus
      );
      queryClient.setQueriesData<Page<Application>>(
        { queryKey: queryKeys.recruiterApplicationsRoot, exact: false },
        patchStatus
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.jobOfferApplicationsRoot,
        exact: false,
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.recruiterApplicationsRoot,
        exact: false,
        refetchType: "active",
      });
    },
    onError: () => setUpdatingId(null),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in">
      <Button variant="ghost" size="sm" className="mb-5 -ml-2" asChild>
        <Link to="/recruiter/job-offers">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Job Offers
        </Link>
      </Button>

      <PageHeader
        title={offer?.title ?? "Applications"}
        description={
          data
            ? `${data.totalElements} candidate${data.totalElements !== 1 ? "s" : ""} applied`
            : "Loading…"
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <ErrorDisplay
          title="Failed to load applications"
          message="Please try again."
          onRetry={refetch}
        />
      )}

      {!isLoading && !isError && data && (
        <>
          {data.content.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="h-12 w-12" />}
              title="No applications yet"
              description="Share this job offer to attract candidates."
            />
          ) : (
            <div className="space-y-3">
              {data.content.map((app, i) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="list-row space-y-3 p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <MailIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{app.candidateEmail}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarIcon className="h-3 w-3" />
                        Applied {formatDate(app.appliedAt)}
                      </div>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
                  </div>

                  <div className="rounded-md bg-muted/40 p-3">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">Cover Letter</p>
                    <p className="line-clamp-3 text-sm leading-6 text-foreground/80">
                      {app.coverLetter}
                    </p>
                  </div>

                  <ApplicationStatusSelect
                    appId={app.id}
                    status={app.status}
                    onUpdate={(appId, status) => statusMutation.mutate({ appId, status })}
                    isPending={updatingId === app.id}
                  />
                </motion.div>
              ))}
            </div>
          )}

          <Pagination
            currentPage={page}
            totalPages={data.totalPages}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        </>
      )}
    </div>
  );
}

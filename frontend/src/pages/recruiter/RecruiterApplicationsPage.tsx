import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { applicationService } from "@/services/applicationService";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UsersIcon, CalendarIcon, MailIcon } from "lucide-react";

const PAGE_SIZE = 10;
const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All Statuses", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "In Review", value: "IN_REVIEW" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
];

export function RecruiterApplicationsPage() {
  const [page, setPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const recruiterApplicationsQueryKey = queryKeys.recruiterApplications(
    page,
    PAGE_SIZE,
    statusFilter !== "ALL" ? statusFilter : undefined
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: recruiterApplicationsQueryKey,
    queryFn: () =>
      applicationService.getRecruiterApplications(
        page,
        PAGE_SIZE,
        statusFilter !== "ALL" ? (statusFilter as ApplicationStatus) : undefined
      ),
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

      queryClient.setQueryData<Page<Application>>(recruiterApplicationsQueryKey, patchStatus);
      queryClient.setQueriesData<Page<Application>>(
        { queryKey: queryKeys.recruiterApplicationsRoot, exact: false },
        patchStatus
      );
      queryClient.setQueriesData<Page<Application>>(
        { queryKey: queryKeys.jobOfferApplicationsRoot, exact: false },
        patchStatus
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.recruiterApplicationsRoot,
        exact: false,
        refetchType: "active",
      });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.jobOfferApplicationsRoot,
        exact: false,
        refetchType: "active",
      });
    },
    onError: () => setUpdatingId(null),
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in">
      <PageHeader
        title="All Applications"
        description={data ? `${data.totalElements} application${data.totalElements !== 1 ? "s" : ""}` : ""}
        action={
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(0); }}>
            <SelectTrigger className="w-44" id="app-filter-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
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
              title="No applications found"
              description="Adjust the status filter or wait for candidates to apply."
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
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">{app.jobOfferTitle}</h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MailIcon className="h-3 w-3" />
                          {app.candidateEmail}
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          {formatDate(app.appliedAt)}
                        </span>
                      </div>
                    </div>
                    <ApplicationStatusBadge status={app.status} />
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

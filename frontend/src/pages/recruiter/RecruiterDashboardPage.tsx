import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { recruiterService } from "@/services/recruiterService";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/store/authStore";
import { StatCard, PageHeader, Skeleton, QuickActionLink } from "@/components/shared/SharedComponents";
import { Button } from "@/components/ui/button";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  FileTextIcon,
  ClockIcon,
  EyeIcon,
  XCircleIcon,
  PlusCircleIcon,
  UsersIcon,
} from "lucide-react";

export function RecruiterDashboardPage() {
  const { user } = useAuth();

  const { data: dashboard, isLoading } = useQuery({
    queryKey: queryKeys.recruiterDashboard,
    queryFn: recruiterService.getDashboard,
  });

  return (
    <div className="page-shell animate-in">
      <PageHeader
        title={`Welcome, ${user?.firstName}`}
        description="Monitor job performance, application flow, and the next hiring actions."
        action={
          <Button asChild size="sm">
            <Link to="/recruiter/job-offers/new">
              <PlusCircleIcon className="h-4 w-4" />
              Post a Job
            </Link>
          </Button>
        }
      />

      <section>
        <p className="kicker mb-3">
          Job Offers
        </p>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : dashboard ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <StatCard
              label="Total Offers"
              value={dashboard.totalJobOffers}
              icon={<BriefcaseIcon className="h-5 w-5" />}
              colorClass="bg-primary/10 text-primary"
            />
            <StatCard
              label="Active"
              value={dashboard.activeJobOffers}
              icon={<CheckCircleIcon className="h-5 w-5" />}
              colorClass="bg-success/10 text-success"
            />
            <StatCard
              label="Inactive"
              value={dashboard.inactiveJobOffers}
              icon={<XCircleIcon className="h-5 w-5" />}
              colorClass="bg-muted text-muted-foreground"
            />
          </div>
        ) : null}
      </section>

      <section>
        <p className="kicker mb-3">
          Applications Received
        </p>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        ) : dashboard ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard
              label="Total"
              value={dashboard.totalApplicationsReceived}
              icon={<FileTextIcon className="h-5 w-5" />}
              colorClass="bg-primary/10 text-primary"
            />
            <StatCard
              label="Pending"
              value={dashboard.pendingApplications}
              icon={<ClockIcon className="h-5 w-5" />}
              colorClass="bg-warning/10 text-warning"
            />
            <StatCard
              label="In Review"
              value={dashboard.inReviewApplications}
              icon={<EyeIcon className="h-5 w-5" />}
              colorClass="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              label="Accepted"
              value={dashboard.acceptedApplications}
              icon={<CheckCircleIcon className="h-5 w-5" />}
              colorClass="bg-success/10 text-success"
            />
          </div>
        ) : null}
      </section>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="surface-card p-5"
      >
        <h2 className="section-title mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: "Post a Job", description: "Create a new job offer", href: "/recruiter/job-offers/new", icon: <PlusCircleIcon className="h-5 w-5" /> },
            { label: "View Applications", description: "Review incoming candidates", href: "/recruiter/applications", icon: <UsersIcon className="h-5 w-5" /> },
            { label: "My Job Offers", description: "Manage your active listings", href: "/recruiter/job-offers", icon: <BriefcaseIcon className="h-5 w-5" /> },
          ].map((item) => (
            <QuickActionLink key={item.href} {...item} />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

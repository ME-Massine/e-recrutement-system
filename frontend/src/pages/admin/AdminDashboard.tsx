import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { PlatformStats } from "../../types";
import { Users, Briefcase, FileText, UserCheck, UserX } from "lucide-react";
import { PageHeader, StatCard, Skeleton, ErrorDisplay } from "@/components/shared/SharedComponents";

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await adminService.getStats();
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = stats
    ? [
        { title: "Total Users", value: stats.totalUsers, icon: <Users className="h-5 w-5" />, colorClass: "bg-primary/10 text-primary" },
        { title: "Candidates", value: stats.totalCandidates, icon: <UserCheck className="h-5 w-5" />, colorClass: "bg-success/10 text-success" },
        { title: "Recruiters", value: stats.totalRecruiters, icon: <UserX className="h-5 w-5" />, colorClass: "bg-warning/10 text-warning" },
        { title: "Job Offers", value: stats.totalJobOffers, icon: <Briefcase className="h-5 w-5" />, colorClass: "bg-blue-500/10 text-blue-500" },
        { title: "Applications", value: stats.totalApplications, icon: <FileText className="h-5 w-5" />, colorClass: "bg-destructive/10 text-destructive" },
      ]
    : [];

  return (
    <div className="page-shell animate-in">
      <PageHeader
        title="Admin Dashboard"
        description="Monitor platform activity and metrics."
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : error ? (
        <ErrorDisplay
          title="Failed to load statistics"
          message="Please refresh the page to try again."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {statCards.map((card) => (
            <StatCard
              key={card.title}
              label={card.title}
              value={card.value}
              icon={card.icon}
              colorClass={card.colorClass}
            />
          ))}
        </div>
      )}

      {!loading && !error && stats && (
        <div className="surface-card p-6">
          <h2 className="mb-3">Quick Insights</h2>
          {stats.totalUsers > 0 ? (
            <p className="text-sm leading-7 text-muted-foreground">
              The platform serves{" "}
              <span className="font-semibold text-foreground">{stats.totalUsers}</span> users —{" "}
              <span className="font-semibold text-foreground">
                {Math.round((stats.totalCandidates / stats.totalUsers) * 100)}%
              </span>{" "}
              candidates and{" "}
              <span className="font-semibold text-foreground">
                {Math.round((stats.totalRecruiters / stats.totalUsers) * 100)}%
              </span>{" "}
              recruiters.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No users registered yet.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

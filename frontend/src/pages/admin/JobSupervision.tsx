import React, { useEffect, useState } from "react";
import adminService from "../../services/adminService";
import { JobOffer } from "../../types";
import { Search, Trash2, MapPin, Briefcase, Calendar, Eye, DollarSign, ShieldAlert } from "lucide-react";
import { PageHeader, Skeleton, EmptyState, Modal } from "@/components/shared/SharedComponents";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const JobSupervision: React.FC = () => {
  const [jobs, setJobs] = useState<JobOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState<JobOffer | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const data = await adminService.getAllJobs();
      setJobs(data);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async () => {
    if (!selectedJob) return;
    try {
      await adminService.deleteJob(selectedJob.id);
      setJobs(jobs.filter((j) => j.id !== selectedJob.id));
      setIsDeleteOpen(false);
      setIsDetailsOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error("Failed to delete job", error);
    }
  };

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.recruiterEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page-shell animate-in">
      <PageHeader
        title="Supervise Job Offers"
        description="Monitor and remove non-compliant job postings."
        action={
          <div className="relative w-full sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search jobs…"
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        }
      />

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      ) : filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Briefcase className="h-12 w-12" />}
          title="No job offers found"
          description="Try adjusting your search filters."
        />
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <div key={job.id} className="list-row p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{job.title}</h3>
                    <Badge variant={job.active ? "success" : "secondary"}>
                      {job.active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <p className="mb-2 text-xs font-medium text-primary">{job.recruiterEmail}</p>
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {job.description}
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />{job.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />{job.contractType}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />{new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => { setSelectedJob(job); setIsDetailsOpen(true); }}
                >
                  <Eye className="h-3.5 w-3.5" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        open={isDetailsOpen && !!selectedJob}
        onClose={() => setIsDetailsOpen(false)}
        title="Job Offer Details"
        size="lg"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              className="text-destructive hover:border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setIsDeleteOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete Job
            </Button>
            <Button size="sm" onClick={() => setIsDetailsOpen(false)}>
              Close
            </Button>
          </>
        }
      >
        {selectedJob && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold">{selectedJob.title}</h3>
                <p className="mt-1 text-sm font-medium text-primary">{selectedJob.recruiterEmail}</p>
              </div>
              <Badge variant={selectedJob.active ? "success" : "secondary"}>
                {selectedJob.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: <MapPin className="h-3.5 w-3.5" />, label: "Location", value: selectedJob.location },
                { icon: <Briefcase className="h-3.5 w-3.5" />, label: "Contract", value: selectedJob.contractType },
                { icon: <DollarSign className="h-3.5 w-3.5" />, label: "Salary", value: selectedJob.salary ? `$${selectedJob.salary}` : "Not specified" },
                { icon: <Calendar className="h-3.5 w-3.5" />, label: "Posted", value: new Date(selectedJob.createdAt).toLocaleDateString() },
              ].map((item) => (
                <div key={item.label} className="rounded-md border border-border/70 bg-muted/30 p-3">
                  <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                    {item.icon} {item.label}
                  </p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="kicker mb-2">Description</p>
              <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                {selectedJob.description}
              </p>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={isDeleteOpen && !!selectedJob}
        onClose={() => setIsDeleteOpen(false)}
        title={
          <span className="flex items-center gap-2 text-destructive">
            <ShieldAlert className="h-4 w-4" />
            Confirm Deletion
          </span>
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteJob}>
              Delete Permanently
            </Button>
          </>
        }
      >
        {selectedJob && (
          <div className="space-y-2">
            <p className="text-sm text-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold">"{selectedJob.title}"</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone and will remove all associated applications.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobSupervision;

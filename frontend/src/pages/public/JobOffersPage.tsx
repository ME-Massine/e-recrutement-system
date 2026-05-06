import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { jobOfferService } from "@/services/jobOfferService";
import { matchingService } from "@/services/matchingService";
import { queryKeys } from "@/lib/queryKeys";
import { useAuth } from "@/store/authStore";
import { getJobDetailPath } from "@/lib/auth";
import { formatDate, formatSalary, getContractTypeLabel } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/shared/Pagination";
import { EmptyState, Skeleton } from "@/components/shared/SharedComponents";
import { ContractType, MatchResult } from "@/types";
import {
  MapPinIcon,
  BriefcaseIcon,
  BanknoteIcon,
  CalendarIcon,
  SearchIcon,
  BuildingIcon,
  SparklesIcon,
  ArrowUpRightIcon,
  FlameIcon,
  CheckCircleIcon,
  AlertTriangleIcon,
} from "lucide-react";

const PAGE_SIZE = 9;

type JobCard = {
  id: number;
  title: string;
  description: string;
  contractType: ContractType;
  location: string;
  salary: number | null;
  recruiterEmail?: string;
  createdAt?: string;
  match?: MatchResult;
};

function getMatchBadgeClass(score: number) {
  if (score >= 80) return "border-success/30 bg-success/10 text-success";
  if (score >= 60) return "border-warning/30 bg-warning/10 text-warning";
  return "border-destructive/30 bg-destructive/10 text-destructive";
}

export function JobOffersPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const { user } = useAuth();
  const isCandidateView = user?.role === "ROLE_CANDIDATE";

  const publicOffersQuery = useQuery({
    queryKey: queryKeys.jobOffers(page, PAGE_SIZE),
    queryFn: () => jobOfferService.getPublicOffers(page, PAGE_SIZE),
  });

  const candidateMatchesQuery = useQuery({
    queryKey: queryKeys.candidateMatches,
    queryFn: matchingService.getCandidateMatches,
    enabled: isCandidateView,
  });

  const publicCards: JobCard[] = (publicOffersQuery.data?.content ?? []).map((offer) => {
    const match = isCandidateView ? candidateMatchesQuery.data?.find(m => m.jobId === offer.id) : undefined;
    return {
      id: offer.id,
      title: offer.title,
      description: offer.description,
      contractType: offer.contractType,
      location: offer.location,
      salary: offer.salary,
      recruiterEmail: offer.recruiterEmail,
      createdAt: offer.createdAt,
      match: match,
    };
  });

  const allCards = publicCards;
  const filtered = allCards.filter(
    (offer) =>
      search.trim() === "" ||
      offer.title.toLowerCase().includes(search.toLowerCase()) ||
      offer.location.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedCards = filtered;

  const totalPages = publicOffersQuery.data?.totalPages ?? 1;

  const isLoading = publicOffersQuery.isLoading;
  const isError = publicOffersQuery.isError;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 border-b border-border/80 pb-7 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card/85 px-3 py-1 text-xs font-medium text-primary">
            <SparklesIcon className="h-3.5 w-3.5" />
            {isCandidateView ? "Smart matching enabled" : "Curated opportunities"}
          </div>
          <h1>{isCandidateView ? "Recommended jobs" : "Browse opportunities"}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {isCandidateView
              ? `${publicOffersQuery.data?.totalElements ?? "-"} active job offers with your strongest matches highlighted.`
              : `${publicOffersQuery.data?.totalElements ?? "-"} active job offers from hiring teams.`}
          </p>
        </div>

        <div className="w-full lg:w-[360px]">
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="jobs-search"
              type="text"
              placeholder="Search title or location"
              className="h-10 pl-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
            />
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="surface-card p-5 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-8 w-24 mt-2" />
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-muted-foreground">
          Failed to load job offers. Please try again.
        </div>
      )}

      {!isLoading && (
        <>
          {filtered.length === 0 ? (
            <EmptyState
              icon={<BriefcaseIcon className="h-12 w-12" />}
              title="No jobs found"
              description={isCandidateView ? "Try updating your profile skills and preferences." : "Try adjusting your search or check back later."}
            />
          ) : (
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedCards.map((offer, i) => (
                <motion.article
                  key={offer.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ delay: i * 0.03, duration: 0.22 }}
                  className="surface-card surface-card-hover group flex flex-col p-4"
                >
                  <div className="mb-3 flex items-start gap-3">
                    <div className="icon-tile h-9 w-9">
                      <BuildingIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="truncate text-lg font-semibold leading-tight transition-colors group-hover:text-primary">
                        {offer.title}
                      </h2>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {isCandidateView ? "Personalized recommendation" : offer.recruiterEmail}
                      </p>
                    </div>
                  </div>

                  {offer.match && (
                    <div className="mb-3 flex items-center gap-2">
                      <Badge
                        className={`gap-1 border ${getMatchBadgeClass(offer.match.score)}`}
                        title="Includes semantic matching of your experience and job description"
                      >
                        <FlameIcon className="h-3.5 w-3.5" />
                        {offer.match.score}% Match
                      </Badge>
                      <span className="text-xs font-medium text-muted-foreground">
                        {offer.match.matchCategory === "HIGH_MATCH"
                          ? "High Match"
                          : offer.match.matchCategory === "GOOD_MATCH"
                            ? "Good Match"
                            : "Explore"}
                      </span>
                    </div>
                  )}

                  <p className="mb-3 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">
                    {offer.description}
                  </p>

                  <div className="mb-3 flex flex-wrap gap-1.5">
                    <Badge variant="secondary" className="gap-1">
                      <MapPinIcon className="h-3 w-3" />
                      {offer.location}
                    </Badge>
                    <Badge variant="outline">
                      {getContractTypeLabel(offer.contractType)}
                    </Badge>
                    {offer.salary !== null && offer.salary !== undefined && (
                      <Badge variant="outline" className="gap-1">
                        <BanknoteIcon className="h-3 w-3" />
                        {formatSalary(offer.salary)}
                      </Badge>
                    )}
                  </div>

                  {offer.match && (
                    <div className="mb-3 rounded-md bg-muted/40 p-3">
                      <p className="text-sm font-semibold">Why this matches</p>
                      <div className="mt-2 space-y-1.5">
                        {offer.match.explanations.slice(0, 3).map((explanation) => (
                          <div key={explanation} className="flex items-start gap-2 text-xs text-muted-foreground">
                            {explanation.toLowerCase().includes("gap") || explanation.toLowerCase().includes("missing") ? (
                              <AlertTriangleIcon className="h-3.5 w-3.5 mt-0.5 text-warning shrink-0" />
                            ) : (
                              <CheckCircleIcon className="h-3.5 w-3.5 mt-0.5 text-success shrink-0" />
                            )}
                            <span>{explanation}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-border/60 pt-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CalendarIcon className="h-3 w-3" />
                      {offer.createdAt ? formatDate(offer.createdAt) : "Ranked recommendation"}
                    </span>
                    <Button size="sm" variant="outline" asChild className="group/btn">
                      <Link to={getJobDetailPath(user?.role, offer.id)}>
                        View Details
                        <ArrowUpRightIcon className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                      </Link>
                    </Button>
                  </div>
                </motion.article>
              ))}
            </div>
          )}

          {!search && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}

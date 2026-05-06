import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { candidateService } from "@/services/candidateService";
import { queryKeys } from "@/lib/queryKeys";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton, PageHeader, ProfileRow } from "@/components/shared/SharedComponents";
import { getInitials } from "@/lib/utils";
import {
  PhoneIcon,
  MapPinIcon,
  LinkIcon,
  EditIcon,
  BriefcaseIcon,
  AlignLeftIcon,
  SparklesIcon,
  BanknoteIcon,
  Clock3Icon,
} from "lucide-react";


export function CandidateProfilePage() {
  const { data: profile, isLoading } = useQuery({
    queryKey: queryKeys.candidateProfile,
    queryFn: candidateService.getProfile,
  });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl space-y-4 animate-in">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-32 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-in">
      <PageHeader
        title="My Profile"
        description="Your public candidate profile"
        action={
          <Button size="sm" asChild>
            <Link to="/candidate/profile/edit">
              <EditIcon className="h-4 w-4" />
              Edit Profile
            </Link>
          </Button>
        }
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="surface-emphasized p-6">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 ring-1 ring-primary/20">
                <AvatarFallback className="bg-primary/15 text-lg text-primary">
                  {profile ? getInitials(profile.firstName, profile.lastName) : "?"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-bold leading-tight">
                  {profile?.firstName} {profile?.lastName}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
                {profile?.headline && (
                  <p className="mt-1.5 text-sm font-medium text-foreground/90">{profile.headline}</p>
                )}
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary sm:flex">
              <SparklesIcon className="h-3.5 w-3.5" />
              Candidate Profile
            </div>
          </div>

          <Separator className="mb-5" />

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <ProfileRow
              icon={<PhoneIcon className="h-4 w-4" />}
              label="Phone"
              value={profile?.phone ?? null}
            />
            <ProfileRow
              icon={<MapPinIcon className="h-4 w-4" />}
              label="Location"
              value={profile?.address ?? null}
            />
            <ProfileRow
              icon={<BriefcaseIcon className="h-4 w-4" />}
              label="Headline"
              value={profile?.headline ?? null}
            />
            <ProfileRow
              icon={<LinkIcon className="h-4 w-4" />}
              label="CV / Portfolio"
              value={profile?.cvUrl ?? null}
              isLink
            />
            <ProfileRow
              icon={<Clock3Icon className="h-4 w-4" />}
              label="Years of Experience"
              value={
                profile?.yearsOfExperience !== null && profile?.yearsOfExperience !== undefined
                  ? `${profile.yearsOfExperience} years`
                  : null
              }
            />
            <ProfileRow
              icon={<BanknoteIcon className="h-4 w-4" />}
              label="Expected Salary"
              value={
                profile?.expectedSalary !== null && profile?.expectedSalary !== undefined
                  ? `${profile.expectedSalary} MAD`
                  : null
              }
            />
            <ProfileRow
              icon={<BriefcaseIcon className="h-4 w-4" />}
              label="Preferred Contract"
              value={profile?.preferredContractType ?? null}
            />
            <ProfileRow
              icon={<MapPinIcon className="h-4 w-4" />}
              label="Preferred Location"
              value={profile?.preferredLocation ?? null}
            />
          </div>
        </div>

        <div className="surface-card p-6">
          <div className="flex items-center gap-2 mb-3">
            <AlignLeftIcon className="h-4 w-4 text-primary" />
            <h3 className="section-title">
              About Me
            </h3>
          </div>
          <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {profile?.summary || "No summary added yet."}
          </p>
          <Separator className="my-4" />
          <div>
            <h3 className="section-title mb-2">
              Skills
            </h3>
            <p className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
              {profile?.skills || "No skills added yet."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

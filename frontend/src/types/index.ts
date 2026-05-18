// Shared TypeScript types for the E-Recruitment system

// ── Auth ──────────────────────────────────────────────────
export type Role = "ROLE_ADMIN" | "ROLE_RECRUITER" | "ROLE_CANDIDATE";

export interface AuthResponse {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  token: string;
  message: string;
}

export interface CurrentUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
}

// ── Candidate ─────────────────────────────────────────────
export interface CandidateProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  address: string | null;
  headline: string | null;
  summary: string | null;
  cvUrl: string | null;
  skills: string | null;
  yearsOfExperience: number | null;
  expectedSalary: number | null;
  preferredContractType: ContractType | null;
  preferredLocation: string | null;
}

export interface CandidateDashboard {
  totalApplications: number;
  pendingApplications: number;
  inReviewApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

// ── Recruiter ─────────────────────────────────────────────
export interface RecruiterProfile {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  companyName: string | null;
  companyWebsite: string | null;
  companySector: string | null;
  companyDescription: string | null;
}

export interface RecruiterDashboard {
  totalJobOffers: number;
  activeJobOffers: number;
  inactiveJobOffers: number;
  totalApplicationsReceived: number;
  pendingApplications: number;
  inReviewApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
}

// ── Job Offers ────────────────────────────────────────────
export type ContractType = "CDI" | "CDD" | "STAGE" | "FREELANCE" | "INTERIM";

export interface JobOffer {
  id: number;
  title: string;
  description: string;
  contractType: ContractType;
  location: string;
  salary: number | null;
  requiredSkills: string | null;
  requiredExperienceYears: number | null;
  active: boolean;
  createdAt: string;
  recruiterId: number;
  recruiterEmail: string;
}

export interface MatchResult {
  jobId: number;
  title: string;
  description: string;
  location: string;
  contractType: ContractType;
  salary: number | null;
  score: number;
  matchCategory: "HIGH_MATCH" | "GOOD_MATCH" | "EXPLORE";
  ruleBasedScore: number;
  semanticScore: number;
  breakdown: {
    skills: number;
    experience: number;
    location: number;
    salary: number;
    contract: number;
  };
  explanations: string[];
}

// ── Applications ──────────────────────────────────────────
export type ApplicationStatus = "PENDING" | "IN_REVIEW" | "ACCEPTED" | "REJECTED";

export interface Application {
  id: number;
  coverLetter: string;
  status: ApplicationStatus;
  appliedAt: string;
  candidateId: number;
  candidateFirstName: string;
  candidateLastName: string;
  candidateEmail: string;
  jobOfferId: number;
  jobOfferTitle: string;
}

// ── Notifications ─────────────────────────────────────────
export type NotificationType = "NEW_APPLICATION" | "APPLICATION_STATUS_UPDATED";

export interface Notification {
  id: number;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  recipientId: number;
  recipientEmail: string;
}

// ── Pagination ────────────────────────────────────────────
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

// ── Admin ──────────────────────────────────────────────────
export interface PlatformStats {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalJobOffers: number;
  totalApplications: number;
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  enabled: boolean;
  role: Role;
}

// ── API Error ─────────────────────────────────────────────
export interface ApiError {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  error?: string;
  instance?: string;
}

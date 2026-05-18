package com.erecruitment.backend.application.service;

import com.erecruitment.backend.application.dto.ApplyJobRequest;
import com.erecruitment.backend.application.dto.JobApplicationResponse;
import com.erecruitment.backend.application.dto.UpdateApplicationStatusRequest;
import com.erecruitment.backend.application.entity.JobApplication;
import com.erecruitment.backend.application.repository.JobApplicationRepository;
import com.erecruitment.backend.common.enums.ApplicationStatus;
import com.erecruitment.backend.common.enums.RoleName;
import com.erecruitment.backend.common.exception.DuplicateApplicationException;
import com.erecruitment.backend.common.exception.ForbiddenOperationException;
import com.erecruitment.backend.common.exception.ResourceNotFoundException;
import com.erecruitment.backend.job.entity.JobOffer;
import com.erecruitment.backend.job.repository.JobOfferRepository;
import com.erecruitment.backend.user.entity.User;
import com.erecruitment.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.erecruitment.backend.common.enums.NotificationType;
import com.erecruitment.backend.notification.service.NotificationService;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobApplicationService {

        private final JobApplicationRepository jobApplicationRepository;
        private final JobOfferRepository jobOfferRepository;
        private final UserRepository userRepository;
        private final NotificationService notificationService;

        public JobApplicationResponse applyToJob(Long jobOfferId, String candidateEmail, ApplyJobRequest request) {
                User candidate = userRepository.findByEmail(candidateEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

                if (candidate.getRole().getName() != RoleName.ROLE_CANDIDATE) {
                        throw new ForbiddenOperationException("Only candidates can apply to job offers.");
                }

                JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                                .orElseThrow(() -> new ResourceNotFoundException("Job offer not found"));

                if (!jobOffer.isActive()) {
                        throw new ForbiddenOperationException("Cannot apply to an inactive job offer.");
                }

                if (jobApplicationRepository.existsByCandidateIdAndJobOfferId(candidate.getId(), jobOfferId)) {
                        throw new DuplicateApplicationException("You have already applied to this job offer.");
                }

                JobApplication application = JobApplication.builder()
                                .candidate(candidate)
                                .jobOffer(jobOffer)
                                .coverLetter(request.coverLetter())
                                .status(ApplicationStatus.PENDING)
                                .build();

                JobApplication saved = jobApplicationRepository.save(application);
                notificationService.createNotification(
                                jobOffer.getRecruiter(),
                                NotificationType.NEW_APPLICATION,
                                "New application received for job offer '" + jobOffer.getTitle() +
                                                "' from candidate " + candidate.getEmail() + ".");
                return mapToResponse(saved);
        }

        public Page<JobApplicationResponse> getMyApplications(String email, Pageable pageable) {
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                return jobApplicationRepository.findByCandidateId(user.getId(), pageable)
                                .map(this::mapToResponse);
        }

        public JobApplicationResponse getMyApplicationById(Long applicationId, String candidateEmail) {
                User candidate = userRepository.findByEmail(candidateEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("Candidate not found"));

                JobApplication application = jobApplicationRepository.findWithRelationsById(applicationId)
                                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

                if (!application.getCandidate().getId().equals(candidate.getId())) {
                        throw new ForbiddenOperationException("You can only access your own applications.");
                }

                return mapToResponse(application);
        }

        public Page<JobApplicationResponse> getRecruiterApplications(
                        String email,
                        ApplicationStatus status,
                        Pageable pageable) {
                User recruiter = userRepository.findByEmail(email)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

                if (status != null) {
                        return jobApplicationRepository
                                        .findByJobOfferRecruiterIdAndStatus(recruiter.getId(), status, pageable)
                                        .map(this::mapToResponse);
                }

                return jobApplicationRepository
                                .findByJobOfferRecruiterId(recruiter.getId(), pageable)
                                .map(this::mapToResponse);
        }

        public JobApplicationResponse updateApplicationStatus(
                        Long applicationId,
                        String recruiterEmail,
                        UpdateApplicationStatusRequest request) {
                User recruiter = userRepository.findByEmail(recruiterEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

                JobApplication application = jobApplicationRepository
                                .findByIdAndJobOfferRecruiterId(applicationId, recruiter.getId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Application not found for this recruiter"));

                application.setStatus(request.status());

                JobApplication updated = jobApplicationRepository.save(application);
                notificationService.createNotification(
                                application.getCandidate(),
                                NotificationType.APPLICATION_STATUS_UPDATED,
                                "Your application for '" + application.getJobOffer().getTitle() +
                                                "' has been updated to status: " + request.status() + ".");

                return mapToResponse(updated);
        }

        public Page<JobApplicationResponse> getApplicationsForSpecificJobOffer(
                        Long jobOfferId,
                        String recruiterEmail,
                        Pageable pageable) {
                User recruiter = userRepository.findByEmail(recruiterEmail)
                                .orElseThrow(() -> new ResourceNotFoundException("Recruiter not found"));

                JobOffer jobOffer = jobOfferRepository.findById(jobOfferId)
                                .orElseThrow(() -> new ResourceNotFoundException("Job offer not found"));

                if (!jobOffer.getRecruiter().getId().equals(recruiter.getId())) {
                        throw new ForbiddenOperationException(
                                        "You can only access applications for your own job offers.");
                }

                return jobApplicationRepository.findByJobOfferId(jobOfferId, pageable)
                                .map(this::mapToResponse);
        }

        private JobApplicationResponse mapToResponse(JobApplication application) {
                return JobApplicationResponse.builder()
                                .id(application.getId())
                                .coverLetter(application.getCoverLetter())
                                .status(application.getStatus())
                                .appliedAt(application.getAppliedAt())
                                .candidateId(application.getCandidate().getId())
                                .candidateFirstName(application.getCandidate().getFirstName())
                                .candidateLastName(application.getCandidate().getLastName())
                                .candidateEmail(application.getCandidate().getEmail())
                                .jobOfferId(application.getJobOffer().getId())
                                .jobOfferTitle(application.getJobOffer().getTitle())
                                .build();
        }
}

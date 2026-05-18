package com.erecruitment.backend.application.service;

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
import com.erecruitment.backend.notification.service.NotificationService;
import com.erecruitment.backend.user.entity.Role;
import com.erecruitment.backend.user.entity.User;
import com.erecruitment.backend.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobApplicationServiceTest {

    @Mock
    private JobApplicationRepository jobApplicationRepository;

    @Mock
    private JobOfferRepository jobOfferRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @InjectMocks
    private JobApplicationService jobApplicationService;

    @Test
    void duplicateApplicationShouldBeRejected() {
        User candidate = candidate(1L);
        JobOffer offer = activeOffer(10L, recruiter(2L));

        when(userRepository.findByEmail(candidate.getEmail())).thenReturn(Optional.of(candidate));
        when(jobOfferRepository.findById(offer.getId())).thenReturn(Optional.of(offer));
        when(jobApplicationRepository.existsByCandidateIdAndJobOfferId(candidate.getId(), offer.getId()))
                .thenReturn(true);

        assertThrows(
                DuplicateApplicationException.class,
                () -> jobApplicationService.applyToJob(offer.getId(), candidate.getEmail(), request())
        );
    }

    @Test
    void inactiveOfferShouldRejectApplication() {
        User candidate = candidate(1L);
        JobOffer offer = activeOffer(10L, recruiter(2L));
        offer.setActive(false);

        when(userRepository.findByEmail(candidate.getEmail())).thenReturn(Optional.of(candidate));
        when(jobOfferRepository.findById(offer.getId())).thenReturn(Optional.of(offer));

        assertThrows(
                ForbiddenOperationException.class,
                () -> jobApplicationService.applyToJob(offer.getId(), candidate.getEmail(), request())
        );
    }

    @Test
    void candidateCannotReadAnotherCandidateApplication() {
        User owner = candidate(1L);
        User otherCandidate = candidate(3L);
        JobApplication application = application(99L, owner, activeOffer(10L, recruiter(2L)));

        when(userRepository.findByEmail(otherCandidate.getEmail())).thenReturn(Optional.of(otherCandidate));
        when(jobApplicationRepository.findWithRelationsById(application.getId()))
                .thenReturn(Optional.of(application));

        assertThrows(
                ForbiddenOperationException.class,
                () -> jobApplicationService.getMyApplicationById(application.getId(), otherCandidate.getEmail())
        );
    }

    @Test
    void recruiterCannotUpdateApplicationOutsideOwnedOffers() {
        User recruiter = recruiter(2L);

        when(userRepository.findByEmail(recruiter.getEmail())).thenReturn(Optional.of(recruiter));
        when(jobApplicationRepository.findByIdAndJobOfferRecruiterId(99L, recruiter.getId()))
                .thenReturn(Optional.empty());

        assertThrows(
                ResourceNotFoundException.class,
                () -> jobApplicationService.updateApplicationStatus(
                        99L,
                        recruiter.getEmail(),
                        new UpdateApplicationStatusRequest(ApplicationStatus.ACCEPTED)
                )
        );
    }

    @Test
    void recruiterCanUpdateOwnedApplicationStatus() {
        User recruiter = recruiter(2L);
        User candidate = candidate(1L);
        JobApplication application = application(99L, candidate, activeOffer(10L, recruiter));

        when(userRepository.findByEmail(recruiter.getEmail())).thenReturn(Optional.of(recruiter));
        when(jobApplicationRepository.findByIdAndJobOfferRecruiterId(application.getId(), recruiter.getId()))
                .thenReturn(Optional.of(application));
        when(jobApplicationRepository.save(any(JobApplication.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = jobApplicationService.updateApplicationStatus(
                application.getId(),
                recruiter.getEmail(),
                new UpdateApplicationStatusRequest(ApplicationStatus.ACCEPTED)
        );

        assertEquals(ApplicationStatus.ACCEPTED, application.getStatus());
        assertEquals(ApplicationStatus.ACCEPTED, response.status());
        assertEquals(candidate.getFirstName(), response.candidateFirstName());
        assertEquals(candidate.getLastName(), response.candidateLastName());
    }

    private com.erecruitment.backend.application.dto.ApplyJobRequest request() {
        return new com.erecruitment.backend.application.dto.ApplyJobRequest(
                "I am interested in this position and my experience matches the requested profile."
        );
    }

    private User candidate(Long id) {
        return user(id, RoleName.ROLE_CANDIDATE);
    }

    private User recruiter(Long id) {
        return user(id, RoleName.ROLE_RECRUITER);
    }

    private User user(Long id, RoleName roleName) {
        return User.builder()
                .id(id)
                .firstName("First" + id)
                .lastName("Last" + id)
                .email("user" + id + "@example.com")
                .password("password")
                .role(Role.builder().id(id).name(roleName).build())
                .build();
    }

    private JobOffer activeOffer(Long id, User recruiter) {
        return JobOffer.builder()
                .id(id)
                .title("Backend Developer")
                .description("Backend role")
                .contractType("CDI")
                .location("Casablanca")
                .active(true)
                .recruiter(recruiter)
                .build();
    }

    private JobApplication application(Long id, User candidate, JobOffer offer) {
        return JobApplication.builder()
                .id(id)
                .candidate(candidate)
                .jobOffer(offer)
                .coverLetter("Cover letter")
                .status(ApplicationStatus.PENDING)
                .build();
    }
}

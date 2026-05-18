package com.erecruitment.backend.application.controller;

import com.erecruitment.backend.application.dto.ApplyJobRequest;
import com.erecruitment.backend.application.dto.JobApplicationResponse;
import com.erecruitment.backend.application.dto.UpdateApplicationStatusRequest;
import com.erecruitment.backend.application.service.JobApplicationService;
import com.erecruitment.backend.common.enums.ApplicationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PostMapping("/job-offers/{jobOfferId}")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('CANDIDATE')")
    public JobApplicationResponse applyToJob(
            @PathVariable Long jobOfferId,
            @Valid @RequestBody ApplyJobRequest request,
            Authentication authentication
    ) {
        return jobApplicationService.applyToJob(jobOfferId, authentication.getName(), request);
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('CANDIDATE')")
    public Page<JobApplicationResponse> getMyApplications(
            Authentication authentication,
            Pageable pageable
    ) {
        return jobApplicationService.getMyApplications(authentication.getName(), pageable);
    }

    @GetMapping("/me/{applicationId}")
    @PreAuthorize("hasRole('CANDIDATE')")
    public JobApplicationResponse getMyApplicationById(
            @PathVariable Long applicationId,
            Authentication authentication
    ) {
        return jobApplicationService.getMyApplicationById(applicationId, authentication.getName());
    }

    @GetMapping("/recruiter")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<JobApplicationResponse> getRecruiterApplications(
            Authentication authentication,
            @RequestParam(required = false) ApplicationStatus status,
            Pageable pageable
    ) {
        return jobApplicationService.getRecruiterApplications(
                authentication.getName(),
                status,
                pageable
        );
    }

    @PatchMapping("/{applicationId}/status")
    @PreAuthorize("hasRole('RECRUITER')")
    public JobApplicationResponse updateApplicationStatus(
            @PathVariable Long applicationId,
            @Valid @RequestBody UpdateApplicationStatusRequest request,
            Authentication authentication
    ) {
        return jobApplicationService.updateApplicationStatus(applicationId, authentication.getName(), request);
    }

    @GetMapping("/recruiter/job-offers/{jobOfferId}")
    @PreAuthorize("hasRole('RECRUITER')")
    public Page<JobApplicationResponse> getApplicationsForSpecificJobOffer(
            @PathVariable Long jobOfferId,
            Authentication authentication,
            Pageable pageable
    ) {
        return jobApplicationService.getApplicationsForSpecificJobOffer(
                jobOfferId,
                authentication.getName(),
                pageable
        );
    }
}

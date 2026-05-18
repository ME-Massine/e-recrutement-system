package com.erecruitment.backend.application.dto;

import com.erecruitment.backend.common.enums.ApplicationStatus;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record JobApplicationResponse(
        Long id,
        String coverLetter,
        ApplicationStatus status,
        LocalDateTime appliedAt,
        Long candidateId,
        String candidateFirstName,
        String candidateLastName,
        String candidateEmail,
        Long jobOfferId,
        String jobOfferTitle
) {
}

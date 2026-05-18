package com.erecruitment.backend.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;

@Builder
public record ApplyJobRequest(
        @NotBlank(message = "Cover letter is required")
        @Size(min = 50, max = 2000, message = "Cover letter must be between 50 and 2000 characters")
        String coverLetter
) {
}

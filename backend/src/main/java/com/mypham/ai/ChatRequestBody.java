package com.mypham.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ChatRequestBody(
        @NotBlank @Size(max = 1000) String message,
        Long sessionId
) {}

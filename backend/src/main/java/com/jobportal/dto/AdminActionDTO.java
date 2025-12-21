package com.jobportal.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionDTO {
    private Long targetId;
    private String targetType; // USER, JOB, COMPANY
    private String action; // LOCK, UNLOCK, HIDE, DELETE, UNHIDE
    private String reason;
    private Long adminId;
    private LocalDateTime actionTime;
}

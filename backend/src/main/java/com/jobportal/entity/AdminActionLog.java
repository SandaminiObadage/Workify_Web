package com.jobportal.entity;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "admin_action_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionLog {
    @Id
    private Long id;
    private Long targetId;
    private String targetType;
    private String action;
    private String reason;
    private Long adminId;
    private String adminName;
    private String targetName;
    private LocalDateTime actionTime;
    private String previousState;
    private String newState;
}

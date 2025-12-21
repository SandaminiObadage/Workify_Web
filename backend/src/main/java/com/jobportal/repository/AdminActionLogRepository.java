package com.jobportal.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.jobportal.entity.AdminActionLog;

public interface AdminActionLogRepository extends MongoRepository<AdminActionLog, Long> {
    List<AdminActionLog> findByTargetIdAndTargetType(Long targetId, String targetType);
    List<AdminActionLog> findByAdminIdOrderByActionTimeDesc(Long adminId);
    List<AdminActionLog> findAllByOrderByActionTimeDesc();
    List<AdminActionLog> findTop50ByOrderByActionTimeDesc();
}

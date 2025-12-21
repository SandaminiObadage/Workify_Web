package com.jobportal.service;

import java.util.List;

import com.jobportal.dto.AdminActionDTO;
import com.jobportal.dto.CompanyStatsDTO;
import com.jobportal.dto.DashboardStatsDTO;
import com.jobportal.dto.JobDTO;
import com.jobportal.dto.ProfileDTO;
import com.jobportal.dto.UserDTO;
import com.jobportal.entity.AdminActionLog;
import com.jobportal.exception.JobPortalException;

public interface AdminService {
    
    // Dashboard Statistics
    DashboardStatsDTO getDashboardStats() throws JobPortalException;
    
    // User Management
    List<UserDTO> getAllUsers() throws JobPortalException;
    List<UserDTO> getAllApplicants() throws JobPortalException;
    List<UserDTO> getAllEmployers() throws JobPortalException;
    UserDTO getUserDetails(Long userId) throws JobPortalException;
    void lockUserAccount(AdminActionDTO action) throws JobPortalException;
    void unlockUserAccount(AdminActionDTO action) throws JobPortalException;
    void deleteUserAccount(AdminActionDTO action) throws JobPortalException;
    
    // Job Management
    List<JobDTO> getAllJobsAdmin() throws JobPortalException;
    JobDTO getJobDetails(Long jobId) throws JobPortalException;
    void hideJob(AdminActionDTO action) throws JobPortalException;
    void unhideJob(AdminActionDTO action) throws JobPortalException;
    void deleteJob(AdminActionDTO action) throws JobPortalException;
    
    // Company Management
    List<CompanyStatsDTO> getAllCompanies() throws JobPortalException;
    CompanyStatsDTO getCompanyDetails(String companyName) throws JobPortalException;
    
    // Profile Management
    List<ProfileDTO> getAllProfiles() throws JobPortalException;
    ProfileDTO getProfileDetails(Long profileId) throws JobPortalException;
    
    // Action Logs
    List<AdminActionLog> getActionLogs() throws JobPortalException;
    List<AdminActionLog> getActionLogsByAdmin(Long adminId) throws JobPortalException;
    
    // Admin Account Creation
    UserDTO createAdminAccount(UserDTO userDTO) throws JobPortalException;
}

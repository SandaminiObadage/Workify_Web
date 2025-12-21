package com.jobportal.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.jobportal.dto.AccountStatus;
import com.jobportal.dto.AccountType;
import com.jobportal.dto.AdminActionDTO;
import com.jobportal.dto.CompanyStatsDTO;
import com.jobportal.dto.DashboardStatsDTO;
import com.jobportal.dto.JobDTO;
import com.jobportal.dto.JobStatus;
import com.jobportal.dto.NotificationDTO;
import com.jobportal.dto.ProfileDTO;
import com.jobportal.dto.UserDTO;
import com.jobportal.entity.AdminActionLog;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.AdminActionLogRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.ProfileRepository;
import com.jobportal.repository.UserRepository;
import com.jobportal.utility.Utilities;

@Service("adminService")
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private AdminActionLogRepository adminActionLogRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public DashboardStatsDTO getDashboardStats() throws JobPortalException {
        DashboardStatsDTO stats = new DashboardStatsDTO();
        
        List<User> allUsers = userRepository.findAll();
        List<Job> allJobs = jobRepository.findAll();
        
        // Count applicants and employers
        long applicants = allUsers.stream()
            .filter(u -> u.getAccountType() == AccountType.APPLICANT)
            .count();
        long employers = allUsers.stream()
            .filter(u -> u.getAccountType() == AccountType.EMPLOYER)
            .count();
        long lockedAccounts = allUsers.stream()
            .filter(u -> u.getAccountStatus() == AccountStatus.LOCKED)
            .count();
        
        // Count jobs by status
        long activeJobs = allJobs.stream()
            .filter(j -> j.getJobStatus() == JobStatus.ACTIVE)
            .count();
        long closedJobs = allJobs.stream()
            .filter(j -> j.getJobStatus() == JobStatus.CLOSED)
            .count();
        
        // Count total applications
        long totalApplications = allJobs.stream()
            .mapToLong(j -> j.getApplicants() != null ? j.getApplicants().size() : 0)
            .sum();
        
        // Count unique companies
        long uniqueCompanies = allJobs.stream()
            .map(Job::getCompany)
            .distinct()
            .count();
        
        // New users this month
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0);
        long newUsersThisMonth = allUsers.stream()
            .filter(u -> u.getCreatedAt() != null && u.getCreatedAt().isAfter(startOfMonth))
            .count();
        
        // New jobs this month
        long newJobsThisMonth = allJobs.stream()
            .filter(j -> j.getPostTime() != null && j.getPostTime().isAfter(startOfMonth))
            .count();
        
        stats.setTotalApplicants(applicants);
        stats.setTotalEmployers(employers);
        stats.setTotalJobs((long) allJobs.size());
        stats.setTotalActiveJobs(activeJobs);
        stats.setTotalClosedJobs(closedJobs);
        stats.setTotalApplications(totalApplications);
        stats.setTotalCompanies(uniqueCompanies);
        stats.setNewUsersThisMonth(newUsersThisMonth);
        stats.setNewJobsThisMonth(newJobsThisMonth);
        stats.setLockedAccounts(lockedAccounts);
        
        return stats;
    }

    @Override
    public List<UserDTO> getAllUsers() throws JobPortalException {
        return userRepository.findAll().stream()
            .map(u -> {
                UserDTO dto = u.toDTO();
                dto.setPassword(null);
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllApplicants() throws JobPortalException {
        return userRepository.findAll().stream()
            .filter(u -> u.getAccountType() == AccountType.APPLICANT)
            .map(u -> {
                UserDTO dto = u.toDTO();
                dto.setPassword(null);
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getAllEmployers() throws JobPortalException {
        return userRepository.findAll().stream()
            .filter(u -> u.getAccountType() == AccountType.EMPLOYER)
            .map(u -> {
                UserDTO dto = u.toDTO();
                dto.setPassword(null);
                return dto;
            })
            .collect(Collectors.toList());
    }

    @Override
    public UserDTO getUserDetails(Long userId) throws JobPortalException {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        UserDTO dto = user.toDTO();
        dto.setPassword(null);
        return dto;
    }

    @Override
    public void lockUserAccount(AdminActionDTO action) throws JobPortalException {
        User user = userRepository.findById(action.getTargetId())
            .orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        
        User admin = userRepository.findById(action.getAdminId())
            .orElseThrow(() -> new JobPortalException("ADMIN_NOT_FOUND"));
        
        if (user.getAccountType() == AccountType.ADMIN) {
            throw new JobPortalException("Cannot lock admin accounts");
        }
        
        String previousStatus = user.getAccountStatus() != null ? user.getAccountStatus().toString() : "ACTIVE";
        
        user.setAccountStatus(AccountStatus.LOCKED);
        user.setLockedReason(action.getReason());
        user.setLockedBy(action.getAdminId());
        userRepository.save(user);
        
        // Log the action
        logAction(action, admin.getName(), user.getName(), previousStatus, "LOCKED");
        
        // Send notification to the user
        NotificationDTO notification = new NotificationDTO();
        notification.setUserId(user.getId());
        notification.setMessage("Your account has been locked. Reason: " + action.getReason());
        notification.setAction("ACCOUNT_LOCKED");
        notificationService.sendNotification(notification);
    }

    @Override
    public void unlockUserAccount(AdminActionDTO action) throws JobPortalException {
        User user = userRepository.findById(action.getTargetId())
            .orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        
        User admin = userRepository.findById(action.getAdminId())
            .orElseThrow(() -> new JobPortalException("ADMIN_NOT_FOUND"));
        
        String previousStatus = user.getAccountStatus() != null ? user.getAccountStatus().toString() : "UNKNOWN";
        
        user.setAccountStatus(AccountStatus.ACTIVE);
        user.setLockedReason(null);
        user.setLockedBy(null);
        userRepository.save(user);
        
        // Log the action
        logAction(action, admin.getName(), user.getName(), previousStatus, "ACTIVE");
        
        // Send notification to the user
        NotificationDTO notification = new NotificationDTO();
        notification.setUserId(user.getId());
        notification.setMessage("Your account has been unlocked. You can now login again.");
        notification.setAction("ACCOUNT_UNLOCKED");
        notificationService.sendNotification(notification);
    }

    @Override
    public void deleteUserAccount(AdminActionDTO action) throws JobPortalException {
        User user = userRepository.findById(action.getTargetId())
            .orElseThrow(() -> new JobPortalException("USER_NOT_FOUND"));
        
        User admin = userRepository.findById(action.getAdminId())
            .orElseThrow(() -> new JobPortalException("ADMIN_NOT_FOUND"));
        
        if (user.getAccountType() == AccountType.ADMIN) {
            throw new JobPortalException("Cannot delete admin accounts");
        }
        
        // Log the action before deletion
        logAction(action, admin.getName(), user.getName(), "EXISTS", "DELETED");
        
        // Delete user's profile
        if (user.getProfileId() != null) {
            profileRepository.deleteById(user.getProfileId());
        }
        
        // Delete the user
        userRepository.delete(user);
    }

    @Override
    public List<JobDTO> getAllJobsAdmin() throws JobPortalException {
        return jobRepository.findAll().stream()
            .map(Job::toDTO)
            .collect(Collectors.toList());
    }

    @Override
    public JobDTO getJobDetails(Long jobId) throws JobPortalException {
        return jobRepository.findById(jobId)
            .orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"))
            .toDTO();
    }

    @Override
    public void hideJob(AdminActionDTO action) throws JobPortalException {
        Job job = jobRepository.findById(action.getTargetId())
            .orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
        
        User admin = userRepository.findById(action.getAdminId())
            .orElseThrow(() -> new JobPortalException("ADMIN_NOT_FOUND"));
        
        String previousStatus = job.getJobStatus() != null ? job.getJobStatus().toString() : "UNKNOWN";
        
        job.setJobStatus(JobStatus.HIDDEN);
        jobRepository.save(job);
        
        // Log the action
        logAction(action, admin.getName(), job.getJobTitle() + " at " + job.getCompany(), previousStatus, "HIDDEN");
        
        // Notify the employer
        if (job.getPostedBy() != null) {
            NotificationDTO notification = new NotificationDTO();
            notification.setUserId(job.getPostedBy());
            notification.setMessage("Your job posting '" + job.getJobTitle() + "' has been hidden by admin. Reason: " + action.getReason());
            notification.setAction("JOB_HIDDEN");
            notificationService.sendNotification(notification);
        }
    }

    @Override
    public void unhideJob(AdminActionDTO action) throws JobPortalException {
        Job job = jobRepository.findById(action.getTargetId())
            .orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
        
        User admin = userRepository.findById(action.getAdminId())
            .orElseThrow(() -> new JobPortalException("ADMIN_NOT_FOUND"));
        
        String previousStatus = job.getJobStatus() != null ? job.getJobStatus().toString() : "UNKNOWN";
        
        job.setJobStatus(JobStatus.ACTIVE);
        jobRepository.save(job);
        
        // Log the action
        logAction(action, admin.getName(), job.getJobTitle() + " at " + job.getCompany(), previousStatus, "ACTIVE");
        
        // Notify the employer
        if (job.getPostedBy() != null) {
            NotificationDTO notification = new NotificationDTO();
            notification.setUserId(job.getPostedBy());
            notification.setMessage("Your job posting '" + job.getJobTitle() + "' has been restored.");
            notification.setAction("JOB_UNHIDDEN");
            notificationService.sendNotification(notification);
        }
    }

    @Override
    public void deleteJob(AdminActionDTO action) throws JobPortalException {
        Job job = jobRepository.findById(action.getTargetId())
            .orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
        
        User admin = userRepository.findById(action.getAdminId())
            .orElseThrow(() -> new JobPortalException("ADMIN_NOT_FOUND"));
        
        // Log the action before deletion
        logAction(action, admin.getName(), job.getJobTitle() + " at " + job.getCompany(), "EXISTS", "DELETED");
        
        // Notify the employer
        if (job.getPostedBy() != null) {
            NotificationDTO notification = new NotificationDTO();
            notification.setUserId(job.getPostedBy());
            notification.setMessage("Your job posting '" + job.getJobTitle() + "' has been deleted by admin. Reason: " + action.getReason());
            notification.setAction("JOB_DELETED");
            notificationService.sendNotification(notification);
        }
        
        jobRepository.delete(job);
    }

    @Override
    public List<CompanyStatsDTO> getAllCompanies() throws JobPortalException {
        List<Job> allJobs = jobRepository.findAll();
        
        // Group jobs by company
        Map<String, List<Job>> jobsByCompany = allJobs.stream()
            .filter(j -> j.getCompany() != null)
            .collect(Collectors.groupingBy(Job::getCompany));
        
        List<CompanyStatsDTO> companies = new ArrayList<>();
        
        for (Map.Entry<String, List<Job>> entry : jobsByCompany.entrySet()) {
            CompanyStatsDTO company = new CompanyStatsDTO();
            company.setCompanyName(entry.getKey());
            company.setTotalJobs((long) entry.getValue().size());
            company.setActiveJobs(entry.getValue().stream()
                .filter(j -> j.getJobStatus() == JobStatus.ACTIVE)
                .count());
            company.setTotalApplications(entry.getValue().stream()
                .mapToLong(j -> j.getApplicants() != null ? j.getApplicants().size() : 0)
                .sum());
            company.setJobs(entry.getValue().stream().map(Job::toDTO).collect(Collectors.toList()));
            companies.add(company);
        }
        
        return companies;
    }

    @Override
    public CompanyStatsDTO getCompanyDetails(String companyName) throws JobPortalException {
        List<Job> companyJobs = jobRepository.findAll().stream()
            .filter(j -> companyName.equalsIgnoreCase(j.getCompany()))
            .collect(Collectors.toList());
        
        if (companyJobs.isEmpty()) {
            throw new JobPortalException("COMPANY_NOT_FOUND");
        }
        
        CompanyStatsDTO company = new CompanyStatsDTO();
        company.setCompanyName(companyName);
        company.setTotalJobs((long) companyJobs.size());
        company.setActiveJobs(companyJobs.stream()
            .filter(j -> j.getJobStatus() == JobStatus.ACTIVE)
            .count());
        company.setTotalApplications(companyJobs.stream()
            .mapToLong(j -> j.getApplicants() != null ? j.getApplicants().size() : 0)
            .sum());
        company.setJobs(companyJobs.stream().map(Job::toDTO).collect(Collectors.toList()));
        
        return company;
    }

    @Override
    public List<ProfileDTO> getAllProfiles() throws JobPortalException {
        return profileRepository.findAll().stream()
            .map(p -> p.toDTO())
            .collect(Collectors.toList());
    }

    @Override
    public ProfileDTO getProfileDetails(Long profileId) throws JobPortalException {
        return profileRepository.findById(profileId)
            .orElseThrow(() -> new JobPortalException("PROFILE_NOT_FOUND"))
            .toDTO();
    }

    @Override
    public List<AdminActionLog> getActionLogs() throws JobPortalException {
        return adminActionLogRepository.findTop50ByOrderByActionTimeDesc();
    }

    @Override
    public List<AdminActionLog> getActionLogsByAdmin(Long adminId) throws JobPortalException {
        return adminActionLogRepository.findByAdminIdOrderByActionTimeDesc(adminId);
    }

    @Override
    public UserDTO createAdminAccount(UserDTO userDTO) throws JobPortalException {
        // Check if email already exists
        if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
            throw new JobPortalException("USER_FOUND");
        }
        
        userDTO.setId(Utilities.getNextSequenceId("users"));
        userDTO.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        userDTO.setAccountType(AccountType.ADMIN);
        userDTO.setAccountStatus(AccountStatus.ACTIVE);
        userDTO.setCreatedAt(LocalDateTime.now());
        
        User user = userRepository.save(userDTO.toEntity());
        user.setPassword(null);
        
        return user.toDTO();
    }
    
    private void logAction(AdminActionDTO action, String adminName, String targetName, 
                          String previousState, String newState) throws JobPortalException {
        AdminActionLog log = new AdminActionLog();
        log.setId(Utilities.getNextSequenceId("admin_action_logs"));
        log.setTargetId(action.getTargetId());
        log.setTargetType(action.getTargetType());
        log.setAction(action.getAction());
        log.setReason(action.getReason());
        log.setAdminId(action.getAdminId());
        log.setAdminName(adminName);
        log.setTargetName(targetName);
        log.setActionTime(LocalDateTime.now());
        log.setPreviousState(previousState);
        log.setNewState(newState);
        
        adminActionLogRepository.save(log);
    }
}

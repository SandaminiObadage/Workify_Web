package com.jobportal.api;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.jobportal.dto.AdminActionDTO;
import com.jobportal.dto.CompanyStatsDTO;
import com.jobportal.dto.DashboardStatsDTO;
import com.jobportal.dto.JobDTO;
import com.jobportal.dto.ProfileDTO;
import com.jobportal.dto.ResponseDTO;
import com.jobportal.dto.UserDTO;
import com.jobportal.entity.AdminActionLog;
import com.jobportal.exception.JobPortalException;
import com.jobportal.service.AdminService;

import jakarta.validation.Valid;

@RestController
@CrossOrigin
@RequestMapping("/admin")
@Validated
public class AdminAPI {

    @Autowired
    private AdminService adminService;

    // ==================== Dashboard ====================
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() throws JobPortalException {
        return new ResponseEntity<>(adminService.getDashboardStats(), HttpStatus.OK);
    }

    // ==================== User Management ====================
    
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() throws JobPortalException {
        return new ResponseEntity<>(adminService.getAllUsers(), HttpStatus.OK);
    }

    @GetMapping("/users/applicants")
    public ResponseEntity<List<UserDTO>> getAllApplicants() throws JobPortalException {
        return new ResponseEntity<>(adminService.getAllApplicants(), HttpStatus.OK);
    }

    @GetMapping("/users/employers")
    public ResponseEntity<List<UserDTO>> getAllEmployers() throws JobPortalException {
        return new ResponseEntity<>(adminService.getAllEmployers(), HttpStatus.OK);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserDTO> getUserDetails(@PathVariable Long id) throws JobPortalException {
        return new ResponseEntity<>(adminService.getUserDetails(id), HttpStatus.OK);
    }

    @PostMapping("/users/lock")
    public ResponseEntity<ResponseDTO> lockUserAccount(@RequestBody AdminActionDTO action) throws JobPortalException {
        action.setAction("LOCK");
        action.setTargetType("USER");
        adminService.lockUserAccount(action);
        return new ResponseEntity<>(new ResponseDTO("User account locked successfully"), HttpStatus.OK);
    }

    @PostMapping("/users/unlock")
    public ResponseEntity<ResponseDTO> unlockUserAccount(@RequestBody AdminActionDTO action) throws JobPortalException {
        action.setAction("UNLOCK");
        action.setTargetType("USER");
        adminService.unlockUserAccount(action);
        return new ResponseEntity<>(new ResponseDTO("User account unlocked successfully"), HttpStatus.OK);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<ResponseDTO> deleteUserAccount(@PathVariable Long id, @RequestBody AdminActionDTO action) throws JobPortalException {
        action.setTargetId(id);
        action.setAction("DELETE");
        action.setTargetType("USER");
        adminService.deleteUserAccount(action);
        return new ResponseEntity<>(new ResponseDTO("User account deleted successfully"), HttpStatus.OK);
    }

    // ==================== Job Management ====================
    
    @GetMapping("/jobs")
    public ResponseEntity<List<JobDTO>> getAllJobs() throws JobPortalException {
        return new ResponseEntity<>(adminService.getAllJobsAdmin(), HttpStatus.OK);
    }

    @GetMapping("/jobs/{id}")
    public ResponseEntity<JobDTO> getJobDetails(@PathVariable Long id) throws JobPortalException {
        return new ResponseEntity<>(adminService.getJobDetails(id), HttpStatus.OK);
    }

    @PostMapping("/jobs/hide")
    public ResponseEntity<ResponseDTO> hideJob(@RequestBody AdminActionDTO action) throws JobPortalException {
        action.setAction("HIDE");
        action.setTargetType("JOB");
        adminService.hideJob(action);
        return new ResponseEntity<>(new ResponseDTO("Job hidden successfully"), HttpStatus.OK);
    }

    @PostMapping("/jobs/unhide")
    public ResponseEntity<ResponseDTO> unhideJob(@RequestBody AdminActionDTO action) throws JobPortalException {
        action.setAction("UNHIDE");
        action.setTargetType("JOB");
        adminService.unhideJob(action);
        return new ResponseEntity<>(new ResponseDTO("Job restored successfully"), HttpStatus.OK);
    }

    @DeleteMapping("/jobs/{id}")
    public ResponseEntity<ResponseDTO> deleteJob(@PathVariable Long id, @RequestBody AdminActionDTO action) throws JobPortalException {
        action.setTargetId(id);
        action.setAction("DELETE");
        action.setTargetType("JOB");
        adminService.deleteJob(action);
        return new ResponseEntity<>(new ResponseDTO("Job deleted successfully"), HttpStatus.OK);
    }

    // ==================== Company Management ====================
    
    @GetMapping("/companies")
    public ResponseEntity<List<CompanyStatsDTO>> getAllCompanies() throws JobPortalException {
        return new ResponseEntity<>(adminService.getAllCompanies(), HttpStatus.OK);
    }

    @GetMapping("/companies/{name}")
    public ResponseEntity<CompanyStatsDTO> getCompanyDetails(@PathVariable String name) throws JobPortalException {
        return new ResponseEntity<>(adminService.getCompanyDetails(name), HttpStatus.OK);
    }

    // ==================== Profile Management ====================
    
    @GetMapping("/profiles")
    public ResponseEntity<List<ProfileDTO>> getAllProfiles() throws JobPortalException {
        return new ResponseEntity<>(adminService.getAllProfiles(), HttpStatus.OK);
    }

    @GetMapping("/profiles/{id}")
    public ResponseEntity<ProfileDTO> getProfileDetails(@PathVariable Long id) throws JobPortalException {
        return new ResponseEntity<>(adminService.getProfileDetails(id), HttpStatus.OK);
    }

    // ==================== Action Logs ====================
    
    @GetMapping("/logs")
    public ResponseEntity<List<AdminActionLog>> getActionLogs() throws JobPortalException {
        return new ResponseEntity<>(adminService.getActionLogs(), HttpStatus.OK);
    }

    @GetMapping("/logs/admin/{adminId}")
    public ResponseEntity<List<AdminActionLog>> getActionLogsByAdmin(@PathVariable Long adminId) throws JobPortalException {
        return new ResponseEntity<>(adminService.getActionLogsByAdmin(adminId), HttpStatus.OK);
    }

    // ==================== Admin Account Creation ====================
    
    @PostMapping("/create")
    public ResponseEntity<UserDTO> createAdminAccount(@RequestBody @Valid UserDTO userDTO) throws JobPortalException {
        return new ResponseEntity<>(adminService.createAdminAccount(userDTO), HttpStatus.CREATED);
    }
}

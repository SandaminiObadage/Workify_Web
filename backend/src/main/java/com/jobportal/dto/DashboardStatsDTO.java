package com.jobportal.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalApplicants;
    private Long totalEmployers;
    private Long totalJobs;
    private Long totalActiveJobs;
    private Long totalClosedJobs;
    private Long totalApplications;
    private Long totalCompanies;
    private Long newUsersThisMonth;
    private Long newJobsThisMonth;
    private Long lockedAccounts;
}

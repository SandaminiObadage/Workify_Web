package com.jobportal.dto;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyStatsDTO {
    private String companyName;
    private Long totalJobs;
    private Long activeJobs;
    private Long totalApplications;
    private List<JobDTO> jobs;
}

package com.jobportal.service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.jobportal.dto.ApplicantDTO;
import com.jobportal.dto.Application;
import com.jobportal.dto.ApplicationStatus;
import com.jobportal.dto.JobDTO;
import com.jobportal.dto.JobStatus;
import com.jobportal.dto.NotificationDTO;
import com.jobportal.entity.Applicant;
import com.jobportal.entity.Job;
import com.jobportal.exception.JobPortalException;
import com.jobportal.repository.JobRepository;
import com.jobportal.utility.Utilities;

import com.jobportal.dto.ProfileDTO;
import org.springframework.web.client.RestTemplate;
import java.util.Map;
import java.util.HashMap;
import org.springframework.http.ResponseEntity;

@Service("jobService")
public class JobServiceImpl implements JobService {

	@Autowired
	private JobRepository jobRepository;
	@Autowired
	private NotificationService notificationService;

	@Override
	public JobDTO postJob(JobDTO jobDTO) throws JobPortalException {
		if(jobDTO.getId()==0) {
			jobDTO.setId(Utilities.getNextSequenceId("jobs"));
			jobDTO.setPostTime(LocalDateTime.now());
			NotificationDTO notiDto=new NotificationDTO();
			notiDto.setAction("Job Posted");
			notiDto.setMessage("Job Posted Successfully for "+jobDTO.getJobTitle()+" at "+ jobDTO.getCompany());
			
			notiDto.setUserId(jobDTO.getPostedBy());
			notiDto.setRoute("/posted-jobs/"+jobDTO.getId());
				notificationService.sendNotification(notiDto);
		}
		else {
			Job job=jobRepository.findById(jobDTO.getId()).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
			if(job.getJobStatus().equals(JobStatus.DRAFT) || jobDTO.getJobStatus().equals(JobStatus.CLOSED))jobDTO.setPostTime(LocalDateTime.now());
		}
		return jobRepository.save(jobDTO.toEntity()).toDTO();
	}

	
	@Override
	public List<JobDTO> getAllJobs() throws JobPortalException {
		return jobRepository.findAll().stream().map((x) -> x.toDTO()).toList();
	}

	@Override
	public JobDTO getJob(Long id) throws JobPortalException {
		return jobRepository.findById(id).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND")).toDTO();
	}

	@Override
	public void applyJob(Long id, ApplicantDTO applicantDTO) throws JobPortalException {
		Job job = jobRepository.findById(id).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
		List<Applicant> applicants = job.getApplicants();
		if (applicants == null)applicants = new ArrayList<>();
		if (applicants.stream().filter((x) -> x.getApplicantId() == applicantDTO.getApplicantId()).toList().size() > 0)throw new JobPortalException("JOB_APPLIED_ALREADY");
		applicantDTO.setApplicationStatus(ApplicationStatus.APPLIED);
		applicants.add(applicantDTO.toEntity());
		job.setApplicants(applicants);
		jobRepository.save(job);
	}

	@Override
	public List<JobDTO> getHistory(Long id, ApplicationStatus applicationStatus) {
		return jobRepository.findByApplicantIdAndApplicationStatus(id, applicationStatus).stream().map((x) -> x.toDTO())
				.toList();
	}

	@Override
	public List<JobDTO> getJobsPostedBy(Long id) throws JobPortalException {
		return jobRepository.findByPostedBy(id).stream().map((x) -> x.toDTO()).toList();
	}

// ...existing code...
@Autowired
private ProfileService profileService;

// @Override
// public List<JobDTO> recommendJobs(Long profileId) throws JobPortalException {
//     ProfileDTO profile = profileService.getProfile(profileId);
//     List<Job> allJobs = jobRepository.findAll();
//     // Simple matching: score jobs by matching skills and category
//     return allJobs.stream()
//         .map(job -> {
//             int score = 0;
//             if (job.getSkillsRequired() != null && profile.getSkills() != null) {
//                 score += (int) job.getSkillsRequired().stream()
//                     .filter(skill -> profile.getSkills().contains(skill))
//                     .count();
//             }
//             if (job.getJobType() != null && profile.getJobType() != null &&
//                 job.getJobType().equalsIgnoreCase(profile.getJobType())) {
//                 score += 2;
//             }
//             // Add more scoring logic as needed
//             JobDTO dto = job.toDTO();
//             dto.setScore(score); // Add a score field to JobDTO if needed
//             return dto;
//         })
//         .sorted((a, b) -> Integer.compare(b.getScore(), a.getScore()))
//         .limit(10)
//         .toList();
// }
@Override
public List<JobDTO> recommendJobs(Long profileId) throws JobPortalException {
    ProfileDTO profile = profileService.getProfile(profileId);
    // Call Python microservice
    RestTemplate restTemplate = new RestTemplate();
    String url = "http://localhost:5001/recommend";
    Map<String, Object> request = new HashMap<>();
    request.put("profile", profile);
    ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
    List<Integer> jobIds = (List<Integer>) response.getBody().get("job_ids");
    // Convert List<Integer> to List<Long>
    List<Long> jobIdsLong = jobIds.stream().map(Integer::longValue).toList();
    List<JobDTO> jobs = jobRepository.findAllById(jobIdsLong).stream().map(Job::toDTO).toList();
    return jobs;
}
// ...existing code...



	@Override
	public void changeAppStatus(Application application) throws JobPortalException {
		Job job = jobRepository.findById(application.getId()).orElseThrow(() -> new JobPortalException("JOB_NOT_FOUND"));
		List<Applicant> apps = job.getApplicants().stream().map((x) -> {
			if (application.getApplicantId() == x.getApplicantId()) {
				x.setApplicationStatus(application.getApplicationStatus());
				if(application.getApplicationStatus().equals(ApplicationStatus.INTERVIEWING)) {
					x.setInterviewTime(application.getInterviewTime());
					NotificationDTO notiDto=new NotificationDTO();
					notiDto.setAction("Interview Scheduled");
					notiDto.setMessage("Interview scheduled for job id: "+application.getId());
					notiDto.setUserId(application.getApplicantId());
					notiDto.setRoute("/job-history");
					try {
						notificationService.sendNotification(notiDto);
					} catch (JobPortalException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
				}
			}
			return x;
		}).toList();
		job.setApplicants(apps);
		jobRepository.save(job);
		
	}

}

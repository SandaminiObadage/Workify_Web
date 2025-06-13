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
import com.jobportal.dto.Experience;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service("jobService")
public class JobServiceImpl implements JobService {

	@Autowired
	private JobRepository jobRepository;
	@Autowired
	private NotificationService notificationService;

	private static final Logger logger = LoggerFactory.getLogger(JobServiceImpl.class);

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
//     RestTemplate restTemplate = new RestTemplate();
//     String url = "http://localhost:5001/recommend";
//     Map<String, Object> request = new HashMap<>();
//     request.put("profile", profile);
//     ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
//     List<Integer> jobIds = (List<Integer>) response.getBody().get("job_ids");
//     List<Long> jobIdsLong = jobIds.stream().map(Integer::longValue).toList();
//     List<JobDTO> jobs = jobRepository.findAllById(jobIdsLong).stream().map(Job::toDTO).toList();
//     return jobs;
// }
// @Override
// public List<JobDTO> recommendJobs(Long profileId) throws JobPortalException {
//     ProfileDTO profile = profileService.getProfile(profileId);

//     // Prepare experiences as a list of maps (with at least the "title" field)
//     List<Map<String, Object>> experiences = new ArrayList<>();
//     if (profile.getExperiences() != null) {
//         for (Experience exp : profile.getExperiences()) {
//             Map<String, Object> expMap = new HashMap<>();
//             expMap.put("title", exp.getTitle());
//             // Add other fields if needed
//             experiences.add(expMap);
//         }
//     }

//     // Build the request map with only the fields your ML API expects
//     Map<String, Object> request = new HashMap<>();
//     request.put("skills", profile.getSkills());
//     request.put("about", profile.getAbout());
//     request.put("experiences", experiences);

//     RestTemplate restTemplate = new RestTemplate();
//     String url = "http://127.0.0.1:5001/recommend";
//     ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);

//     List<Integer> jobIds = (List<Integer>) response.getBody().get("job_ids");
//     List<Long> jobIdsLong = jobIds.stream().map(Integer::longValue).toList();
//     List<JobDTO> jobs = jobRepository.findAllById(jobIdsLong).stream().map(Job::toDTO).toList();
//     return jobs;
// }

@Override
public List<JobDTO> recommendJobs(Long profileId) throws JobPortalException {
    ProfileDTO profile = profileService.getProfile(profileId);

    List<Map<String, Object>> experiences = new ArrayList<>();
    if (profile.getExperiences() != null) {
        for (Experience exp : profile.getExperiences()) {
            Map<String, Object> expMap = new HashMap<>();
            expMap.put("title", exp.getTitle());
            experiences.add(expMap);
        }
    }

    Map<String, Object> request = new HashMap<>();
    request.put("skills", profile.getSkills());
    request.put("about", profile.getAbout());
    request.put("experiences", experiences);

	logger.info("Preparing recommendation request for profileId {}", profileId);
	logger.info("Request body: {}", request);

    RestTemplate restTemplate = new RestTemplate();
    String url = "http://127.0.0.1:5001/recommend";

    try {
		logger.info("Sending recommendation request for profileId {}", profileId);
        ResponseEntity<Map> response = restTemplate.postForEntity(url, request, Map.class);
		logger.info("Received response for profileId {}: {}", profileId, response.getBody());
        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            List<Integer> jobIds = (List<Integer>) response.getBody().get("job_ids");
            List<Long> jobIdsLong = jobIds.stream().map(Integer::longValue).toList();
			logger.info("Job IDs recommended: {}", jobIdsLong);
			List<JobDTO> jobDTOList = jobRepository.findAllById(jobIdsLong)
					.stream()
					.map(Job::toDTO)
					.toList();

// You can log or process it if needed
			logger.info("Recommended jobs found: {}", jobDTOList.size());

			return jobDTOList;
//            return jobRepository.findAllById(jobIdsLong).stream().map(Job::toDTO).toList();
        } else {
            throw new JobPortalException("ML_SERVICE_ERROR");
        }
    } catch (Exception e) {
		logger.error("Error in recommendJobs: ", e);
        throw new JobPortalException("Failed to get recommended jobs: " + e.getMessage());
    }
}


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

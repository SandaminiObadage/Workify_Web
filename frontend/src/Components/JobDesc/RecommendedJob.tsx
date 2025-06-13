
// import { useEffect, useState } from "react";
// import { jobList } from "../../Data/JobsData";
// import JobCard from "../FindJobs/JobCard";
// import { getAllJobs } from "../../Services/JobService";
// import { useParams } from "react-router-dom";

// const RecommendedJob=()=>{
//     const [jobList, setJobList] = useState([{}]);
//     const {id}=useParams();
//     useEffect(()=>{
//         getAllJobs().then((res)=>{
//             setJobList(res);
//         }).catch((err)=>console.log(err));
//     }, [])
//     return  <div>
//     <div className="text-xl font-semibold mb-5">Recommended Job</div>
//     <div className="flex bs:flex-col   flex-wrap gap-5 justify-between bs-mx:justify-start">
//     {
//         jobList.map((job:any, index:number) =>index<6 && job.id!=id &&<JobCard key={index} {...job}  />)
//     }
// </div>
// </div>
// }
// export default RecommendedJob;


// import { useEffect, useState } from "react";
// import { getRecommendedJobs } from "../../Services/JobService";
// import JobCard from "../FindJobs/JobCard";
// import { useSelector } from "react-redux";

// const RecommendedJob = () => {
//     const profile = useSelector((state: any) => state.profile);
//     const [jobs, setJobs] = useState([]);
//     useEffect(() => {
//         if (profile?.id) {
//             getRecommendedJobs(profile.id).then(setJobs);
//         }
//     }, [profile]);
//     return (
//         <div>
//             <div className="text-xl font-semibold mb-5">Recommended Jobs</div>
//             <div className="flex flex-wrap gap-5">
//                 {jobs.map((job: any, idx: number) => <JobCard key={idx} {...job} />)}
//             </div>
//         </div>
//     );
// };
// export default RecommendedJob;
// export {};


// import { useEffect, useState } from "react";
// import { getRecommendedJobs } from "../../Services/JobService";
// import JobCard from "../FindJobs/JobCard";
// import { useSelector } from "react-redux";

// const RecommendedJob = () => {
//     const profile = useSelector((state: any) => state.profile);
//     const [jobs, setJobs] = useState([]);
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState("");

//     // useEffect(() => {
//     //     if (profile?.id) {
//     //         setLoading(true);
//     //         getRecommendedJobs(profile.id)
//     //             .then(setJobs)
//     //             .catch(() => setError("Failed to load recommendations"))
//     //             .finally(() => setLoading(false));
//     //     }
//     // }, [profile]);
//     // ...existing code...

// useEffect(() => {
//   if (profile?.experiences && profile?.skills && profile?.about) {
//     console.log("Raw SKILLS:", profile.skills);

//     const cleanedSkills = profile.skills
//       .map(skill => skill.replace(/\n+/g, ' ').trim()) // Replace \n\n with space and trim
//       .filter(skill => skill.length > 0); // Remove empty strings

//     console.log("CLEANED SKILLS:", cleanedSkills);

//     setLoading(true);

//     getRecommendedJobs({
//       experiences: profile.experiences.map(exp => ({
//         title: exp.title, // Ensure this matches what backend expects
//       })),
//       skills: cleanedSkills,
//       about: profile.about,
//     })
//       .then((result) => {
//         console.log("Recommended jobs result:", result);
//         setJobs(result);
//       })
//       .catch(() => setError("Failed to load recommendations"))
//       .finally(() => setLoading(false));
//   }
// }, [profile]);



//     if (loading) return <div>Loading recommendations...</div>;
//     if (error) return <div>{error}</div>;

//     return (
//         <div>
//             <div className="text-xl font-semibold mb-5">Recommended Jobs</div>
//             <div className="flex flex-wrap gap-5">
//                 {jobs.length === 0
//                     ? <div>No recommendations found.</div>
//                     : jobs.map((job: any, idx: number) => <JobCard key={idx} {...job} />)}
//             </div>
//         </div>
//     );
// };
// export default RecommendedJob;


// In your RecommendedJob component file


import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getRecommendedJobs } from "../../Services/JobService";
import JobCard from "../FindJobs/JobCard";

// Interfaces
interface Experience {
  title: string;
  company?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: string;
  working?: boolean;
}

interface Profile {
  id: number;
  name: string;
  email: string;
  jobTitle: string;
  company: string;
  experiences: Experience[];
  skills: string[];
  about: string;
}

interface Job {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  [key: string]: any;
}

const RecommendedJob = () => {
  const profile: Profile = useSelector((state: any) => state.profile);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
// In your RecommendedJob component
useEffect(() => {
  if (profile?.id) {
    setLoading(true);
    getRecommendedJobs(profile.id)
      .then((result: Job[]) => {
        setJobs(result);
      })
      .catch(() => setError("Failed to load recommendations"))
      .finally(() => setLoading(false));
  }
}, [profile]);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <div className="text-xl font-semibold mb-5">Recommended Jobs</div>
      <div className="flex flex-wrap gap-5">
        {jobs.length === 0 ? (
          <div>No recommendations found.</div>
        ) : (
          jobs.map((job: Job, idx: number) => <JobCard key={idx} {...job} />)
        )}
      </div>
    </div>
  );
};

export default RecommendedJob;


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


import { useEffect, useState } from "react";
import { getRecommendedJobs } from "../../Services/JobService";
import JobCard from "../FindJobs/JobCard";
import { useSelector } from "react-redux";

const RecommendedJob = () => {
    const profile = useSelector((state: any) => state.profile);
    const [jobs, setJobs] = useState([]);
    useEffect(() => {
        if (profile?.id) {
            getRecommendedJobs(profile.id).then(setJobs);
        }
    }, [profile]);
    return (
        <div>
            <div className="text-xl font-semibold mb-5">Recommended Jobs</div>
            <div className="flex flex-wrap gap-5">
                {jobs.map((job: any, idx: number) => <JobCard key={idx} {...job} />)}
            </div>
        </div>
    );
};
export default RecommendedJob;
export {};
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getRecommendedJobs } from "../../Services/JobService";
import JobCard from "./JobCard";
import { IconSparkles } from "@tabler/icons-react";

const RecommendedJobs = () => {
  const profile = useSelector((state: any) => state.profile);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (profile?.id) {
      setLoading(true);
      getRecommendedJobs(profile.id)
        .then((result: any[]) => {
          setJobs(result);
        })
        .catch((err) => {
          console.log("Failed to load recommendations:", err);
          setJobs([]);
        })
        .finally(() => setLoading(false));
    }
  }, [profile]);

  // Don't render section if user is not logged in or no recommendations
  if (!profile?.id || (!loading && jobs.length === 0)) return null;

  return (
    <div className="px-5 py-5 bg-mine-shaft-900 rounded-lg mb-5">
      <div className="flex items-center gap-2 text-2xl font-semibold mb-5">
        <IconSparkles className="text-bright-sun-400" size={28} stroke={1.5} />
        <span>Recommended For You</span>
      </div>
      
      {loading ? (
        <div className="text-mine-shaft-400">Loading recommendations...</div>
      ) : (
        <div className="flex flex-wrap gap-5">
          {jobs.slice(0, 6).map((job: any, index: number) => (
            <JobCard key={index} {...job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedJobs;

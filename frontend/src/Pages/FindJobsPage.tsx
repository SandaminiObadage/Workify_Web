import { Divider } from "@mantine/core";
import SearchBar from "../Components/FindJobs/SearchBar";
import Jobs from "../Components/FindJobs/Jobs";
import RecommendedJobs from "../Components/FindJobs/RecommendedJobs";

const FindJobsPage = () => {
    return (
        <div className="min-h-[90vh] bg-mine-shaft-950 font-['poppins']">
            <Divider size="xs" mx="md"/>
            <SearchBar/>
            <Divider size="xs" mx="md"/>
            <RecommendedJobs/>
            <Jobs/>
        </div>
    )
}
export default FindJobsPage;
import { Badge, Divider, Tabs } from "@mantine/core";
import Job from "../JobDesc/Job";
import TalentCard from "../FindTalent/TalentCard";
import { useEffect, useState } from "react";
import axios from "axios";
import { getUser } from "../../Services/UserService";
import { getProfile } from "../../Services/ProfileService";

const PostedJobDesc = (props:any) => {
    const [tab, setTab]=useState("overview");
    const [arr, setArr]=useState<any>([]);
    const [loading, setLoading] = useState<boolean>(false);

    // Helper to fetch full profile for each applicant
    const fetchProfiles = async (applicants: any[]) => {
        if (!applicants || applicants.length === 0) return [];
        
        setLoading(true);
        
        // Fetch all profiles in parallel
        const results = await Promise.all(applicants.map(async (applicant) => {
            try {
                console.log("Fetching data for applicant:", applicant.applicantId);
                
                // First get user data using UserService
                const userData = await getUser(applicant.applicantId);
                console.log("User data:", userData);
                
                if (userData.profileId) {
                    try {
                        // Then get profile data using ProfileService
                        const profileData = await getProfile(userData.profileId);
                        console.log("Profile data:", profileData);
                        
                        return { 
                            ...profileData, 
                            ...applicant, // Keep original applicant data (applicationStatus, etc.)
                            email: userData.email, // Ensure email from user data
                            userId: applicant.applicantId,
                            dataComplete: true // Flag to indicate data is complete
                        };
                    } catch (profileError) {
                        console.error("Profile fetch error for:", userData.profileId, profileError);
                        // Fallback to user data if profile fetch fails
                        return { 
                            ...userData, 
                            ...applicant,
                            userId: applicant.applicantId,
                            dataComplete: true,
                            skills: [] // Default empty skills if no profile
                        };
                    }
                } else {
                    console.log("No profileId for user:", applicant.applicantId);
                    // User has no profile, use user data
                    return { 
                        ...userData, 
                        ...applicant,
                        userId: applicant.applicantId,
                        dataComplete: true,
                        skills: [] // Default empty skills
                    };
                }
            } catch (userError) {
                console.error('Error fetching user data for applicant:', applicant.applicantId, userError);
                // Complete fallback to applicant data only
                return { 
                    ...applicant,
                    dataComplete: false,
                    name: `User ${applicant.applicantId}`, // Fallback name
                    email: applicant.email || "No email available",
                    skills: []
                };
            }
        }));
        
        setLoading(false);
        return results;
    };

    const handleTab = async (value: any) => {
        setTab(value);
        let filtered = [];
        
        if (value == "applicants") {
            filtered = props.applicants?.filter((x: any) => x.applicationStatus == "APPLIED");
        } else if (value == "invited") {
            filtered = props.applicants?.filter((x: any) => x.applicationStatus == "INTERVIEWING");
        } else if (value == "offered") {
            filtered = props.applicants?.filter((x: any) => x.applicationStatus == "OFFERED");
        } else if (value == "rejected") {
            filtered = props.applicants?.filter((x: any) => x.applicationStatus == "REJECTED");
        }
        
        if (["applicants", "invited", "offered", "rejected"].includes(value)) {
            console.log("Fetching profiles for tab:", value, "Filtered applicants:", filtered);
            const merged = await fetchProfiles(filtered);
            console.log("Merged data:", merged);
            setArr(merged);
        } else {
            setArr([]);
        }
    }

    useEffect(()=>{
        handleTab("overview");
    }, [props.applicants]); // Depend on props.applicants to refetch when applicants change

    return <div data-aos="zoom-out" className=" w-3/4 md-mx:w-full px-5 md-mx:p-0">
        {props.jobTitle?<><div className="text-2xl xs-mx:text-xl font-semibold flex items-center ">{props?.jobTitle} <Badge variant="light" ml="sm" color="brightSun.4" size="sm">{props?.jobStatus}</Badge></div>
        <div className="font-medium xs-mx:text-sm text-mine-shaft-300 mb-5">{props?.location}</div>
        <div className="">
            <Tabs value={tab} onChange={handleTab} radius="lg" autoContrast variant="outline">
                <Tabs.List className="font-semibold [&_button[data-active='true']]:!border-b-mine-shaft-950 [&_button]:!text-xl sm-mx:[&_button]:!text-lg  xs-mx:[&_button]:!text-base xsm-mx:[&_button]:!text-sm xs-mx:[&_button]:!px-1.5 xs-mx:[&_button]:!py-2 mb-5 [&_button[data-active='true']]:text-bright-sun-400 xs-mx:font-medium">
                    <Tabs.Tab value="overview">Overview</Tabs.Tab>
                    <Tabs.Tab value="applicants">
                        Applicants {props.applicants?.filter((x: any) => x.applicationStatus == "APPLIED")?.length > 0 && `(${props.applicants?.filter((x: any) => x.applicationStatus == "APPLIED")?.length})`}
                    </Tabs.Tab>
                    <Tabs.Tab value="invited">
                        Invited {props.applicants?.filter((x: any) => x.applicationStatus == "INTERVIEWING")?.length > 0 && `(${props.applicants?.filter((x: any) => x.applicationStatus == "INTERVIEWING")?.length})`}
                    </Tabs.Tab>
                    <Tabs.Tab value="offered">
                        Offered {props.applicants?.filter((x: any) => x.applicationStatus == "OFFERED")?.length > 0 && `(${props.applicants?.filter((x: any) => x.applicationStatus == "OFFERED")?.length})`}
                    </Tabs.Tab>
                    <Tabs.Tab value="rejected">
                        Rejected {props.applicants?.filter((x: any) => x.applicationStatus == "REJECTED")?.length > 0 && `(${props.applicants?.filter((x: any) => x.applicationStatus == "REJECTED")?.length})`}
                    </Tabs.Tab>
                </Tabs.List>
                
                <Tabs.Panel value="overview" className="[&>div]:w-full">
                    {props.jobStatus=="CLOSED"?<Job {...props} edit={true} closed />:<Job {...props} edit={true}  />}
                </Tabs.Panel>
                
                <Tabs.Panel value="applicants">
                    <div className="flex mt-10 flex-wrap gap-5 justify-around">
                        {loading ? (
                            <div className="flex items-center justify-center w-full min-h-[200px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bright-sun-400 mx-auto mb-2"></div>
                                    <div className="text-mine-shaft-300">Loading applicants...</div>
                                </div>
                            </div>
                        ) : arr?.length ? arr.map((talent:any, index:any) =>  
                            <TalentCard 
                                key={`applicant-${talent.applicantId || talent.userId}-${index}`} 
                                {...talent} 
                                posted={true}
                            />
                        ) : "No Applicants Yet"}
                    </div>
                </Tabs.Panel>
                
                <Tabs.Panel value="invited">
                    <div className="flex mt-10 flex-wrap gap-5 justify-around">
                        {loading ? (
                            <div className="flex items-center justify-center w-full min-h-[200px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bright-sun-400 mx-auto mb-2"></div>
                                    <div className="text-mine-shaft-300">Loading invited candidates...</div>
                                </div>
                            </div>
                        ) : arr?.length ? arr.map((talent:any, index:any) =>  
                            <TalentCard 
                                key={`invited-${talent.applicantId || talent.userId}-${index}`} 
                                {...talent} 
                                invited
                            />
                        ) : "No Applicants Invited Yet"}
                    </div>
                </Tabs.Panel>
                
                <Tabs.Panel value="offered">
                    <div className="flex mt-10 flex-wrap gap-5 justify-around">
                        {loading ? (
                            <div className="flex items-center justify-center w-full min-h-[200px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bright-sun-400 mx-auto mb-2"></div>
                                    <div className="text-mine-shaft-300">Loading offered candidates...</div>
                                </div>
                            </div>
                        ) : arr?.length ? arr.map((talent:any, index:any) =>  
                            <TalentCard 
                                key={`offered-${talent.applicantId || talent.userId}-${index}`} 
                                {...talent} 
                                offered
                            />
                        ) : "No Applicants Offered Yet"}
                    </div>
                </Tabs.Panel>
                
                <Tabs.Panel value="rejected">
                    <div className="flex mt-10 flex-wrap gap-5 justify-around">
                        {loading ? (
                            <div className="flex items-center justify-center w-full min-h-[200px]">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bright-sun-400 mx-auto mb-2"></div>
                                    <div className="text-mine-shaft-300">Loading rejected candidates...</div>
                                </div>
                            </div>
                        ) : arr?.length ? arr.map((talent:any, index:any) =>  
                            <TalentCard 
                                key={`rejected-${talent.applicantId || talent.userId}-${index}`} 
                                {...talent} 
                                rejected
                            />
                        ) : "No Applicants Rejected Yet"}
                    </div>
                </Tabs.Panel>
                
            </Tabs>
        </div></>:<div className="text-2xl font-semibold flex items-center justify-center min-h-[70vh]">Job Not Found.</div>}
    </div>
}
export default PostedJobDesc;
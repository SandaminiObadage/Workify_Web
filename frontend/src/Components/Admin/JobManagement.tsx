import { useEffect, useState } from "react";
import { 
    IconEye, IconEyeOff, IconTrash, IconSearch, IconFilter,
    IconBriefcase, IconBuilding, IconMapPin, IconCash
} from "@tabler/icons-react";
import { 
    Table, Badge, Button, Group, Text, TextInput, Modal, 
    Textarea, Paper, Title, Loader, Center, Select, ActionIcon,
    Tooltip, Avatar
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getAllJobsAdmin, hideJob, unhideJob, deleteJob } from "../../Services/AdminService";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { useSelector } from "react-redux";

interface Job {
    id: number;
    jobTitle: string;
    company: string;
    location: string;
    experience: string;
    jobType: string;
    packageOffered: number;
    jobStatus: string;
    postedBy: number;
    postTime: string;
    applicants: any[];
}

const JobManagement = () => {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<Job | null>(null);
    const [actionReason, setActionReason] = useState("");
    
    const [hideModalOpened, { open: openHideModal, close: closeHideModal }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
    
    const currentUser = useSelector((state: any) => state.user);

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        filterJobs();
    }, [jobs, search, filterStatus, filterType]);

    const loadJobs = async () => {
        try {
            const data = await getAllJobsAdmin();
            setJobs(data);
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to load jobs");
        } finally {
            setLoading(false);
        }
    };

    const filterJobs = () => {
        let result = [...jobs];
        
        if (search) {
            result = result.filter(j => 
                j.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
                j.company?.toLowerCase().includes(search.toLowerCase()) ||
                j.location?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (filterStatus) {
            result = result.filter(j => j.jobStatus === filterStatus);
        }
        
        if (filterType) {
            result = result.filter(j => j.jobType === filterType);
        }
        
        setFilteredJobs(result);
    };

    const handleHide = async () => {
        if (!selectedJob || !actionReason.trim()) {
            errorNotification("Error", "Please provide a reason for hiding the job");
            return;
        }
        
        try {
            await hideJob({
                targetId: selectedJob.id,
                reason: actionReason,
                adminId: currentUser.id
            });
            successNotification("Success", "Job has been hidden");
            closeHideModal();
            setActionReason("");
            loadJobs();
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to hide job");
        }
    };

    const handleUnhide = async (job: Job) => {
        try {
            await unhideJob({
                targetId: job.id,
                reason: "Job restored by admin",
                adminId: currentUser.id
            });
            successNotification("Success", "Job has been restored");
            loadJobs();
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to restore job");
        }
    };

    const handleDelete = async () => {
        if (!selectedJob || !actionReason.trim()) {
            errorNotification("Error", "Please provide a reason for deleting the job");
            return;
        }
        
        try {
            await deleteJob(selectedJob.id, {
                reason: actionReason,
                adminId: currentUser.id
            });
            successNotification("Success", "Job has been deleted");
            closeDeleteModal();
            setActionReason("");
            loadJobs();
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to delete job");
        }
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: "green",
            CLOSED: "gray",
            DRAFT: "yellow",
            HIDDEN: "red",
            DELETED: "dark"
        };
        return <Badge color={colors[status] || "gray"}>{status}</Badge>;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatSalary = (amount: number) => {
        if (!amount) return "N/A";
        return `₹${(amount / 100000).toFixed(1)}L`;
    };

    if (loading) {
        return (
            <Center h="60vh">
                <Loader color="brightSun.4" size="xl" />
            </Center>
        );
    }

    return (
        <div className="p-6">
            <Title order={2} className="mb-6 text-mine-shaft-100">Job Management</Title>
            
            {/* Filters */}
            <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 mb-6">
                <Group>
                    <TextInput
                        placeholder="Search by title, company, or location"
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        placeholder="Status"
                        data={[
                            { value: "ACTIVE", label: "Active" },
                            { value: "CLOSED", label: "Closed" },
                            { value: "DRAFT", label: "Draft" },
                            { value: "HIDDEN", label: "Hidden" },
                        ]}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        clearable
                        leftSection={<IconFilter size={16} />}
                    />
                    <Select
                        placeholder="Job Type"
                        data={[
                            { value: "Full Time", label: "Full Time" },
                            { value: "Part Time", label: "Part Time" },
                            { value: "Contract", label: "Contract" },
                            { value: "Internship", label: "Internship" },
                        ]}
                        value={filterType}
                        onChange={setFilterType}
                        clearable
                    />
                </Group>
            </Paper>

            {/* Stats Summary */}
            <Group className="mb-4" gap="md">
                <Badge size="lg" variant="light" color="blue">
                    Total: {filteredJobs.length}
                </Badge>
                <Badge size="lg" variant="light" color="green">
                    Active: {filteredJobs.filter(j => j.jobStatus === "ACTIVE").length}
                </Badge>
                <Badge size="lg" variant="light" color="gray">
                    Closed: {filteredJobs.filter(j => j.jobStatus === "CLOSED").length}
                </Badge>
                <Badge size="lg" variant="light" color="red">
                    Hidden: {filteredJobs.filter(j => j.jobStatus === "HIDDEN").length}
                </Badge>
            </Group>

            {/* Jobs Table */}
            <Paper withBorder radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 overflow-hidden">
                <Table striped highlightOnHover>
                    <Table.Thead className="bg-mine-shaft-800">
                        <Table.Tr>
                            <Table.Th className="text-mine-shaft-200">Job Title</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Company</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Location</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Type</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Salary</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Applicants</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Status</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Posted</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredJobs.map((job) => (
                            <Table.Tr key={job.id} className="text-mine-shaft-300">
                                <Table.Td>
                                    <Group gap="sm">
                                        <Avatar size="sm" color="brightSun">
                                            <IconBriefcase size={16} />
                                        </Avatar>
                                        <Text size="sm" lineClamp={1}>{job.jobTitle}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconBuilding size={14} className="text-mine-shaft-400" />
                                        <Text size="sm" lineClamp={1}>{job.company}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconMapPin size={14} className="text-mine-shaft-400" />
                                        <Text size="sm" lineClamp={1}>{job.location || "N/A"}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" size="sm">{job.jobType}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <IconCash size={14} className="text-mine-shaft-400" />
                                        <Text size="sm">{formatSalary(job.packageOffered)}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="filled" color="blue" size="sm">
                                        {job.applicants?.length || 0}
                                    </Badge>
                                </Table.Td>
                                <Table.Td>{getStatusBadge(job.jobStatus)}</Table.Td>
                                <Table.Td>{formatDate(job.postTime)}</Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Tooltip label="View Details">
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="blue"
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    openViewModal();
                                                }}
                                            >
                                                <IconEye size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        
                                        {job.jobStatus === "HIDDEN" ? (
                                            <Tooltip label="Unhide Job">
                                                <ActionIcon 
                                                    variant="subtle" 
                                                    color="green"
                                                    onClick={() => handleUnhide(job)}
                                                >
                                                    <IconEye size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        ) : (
                                            <Tooltip label="Hide Job">
                                                <ActionIcon 
                                                    variant="subtle" 
                                                    color="orange"
                                                    onClick={() => {
                                                        setSelectedJob(job);
                                                        openHideModal();
                                                    }}
                                                >
                                                    <IconEyeOff size={18} />
                                                </ActionIcon>
                                            </Tooltip>
                                        )}
                                        
                                        <Tooltip label="Delete Job">
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="red"
                                                onClick={() => {
                                                    setSelectedJob(job);
                                                    openDeleteModal();
                                                }}
                                            >
                                                <IconTrash size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                
                {filteredJobs.length === 0 && (
                    <Center p="xl">
                        <Text c="dimmed">No jobs found</Text>
                    </Center>
                )}
            </Paper>

            {/* Hide Job Modal */}
            <Modal 
                opened={hideModalOpened} 
                onClose={closeHideModal} 
                title="Hide Job Posting"
                centered
            >
                <Text size="sm" c="dimmed" className="mb-4">
                    Are you sure you want to hide <strong>{selectedJob?.jobTitle}</strong> at <strong>{selectedJob?.company}</strong>?
                    This job will not be visible to applicants.
                </Text>
                <Textarea
                    label="Reason for hiding"
                    placeholder="Enter the reason for hiding this job..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    required
                    minRows={3}
                />
                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={closeHideModal}>Cancel</Button>
                    <Button color="orange" onClick={handleHide}>Hide Job</Button>
                </Group>
            </Modal>

            {/* Delete Job Modal */}
            <Modal 
                opened={deleteModalOpened} 
                onClose={closeDeleteModal} 
                title="Delete Job Posting"
                centered
            >
                <Text size="sm" c="dimmed" className="mb-4">
                    Are you sure you want to <strong className="text-red-500">permanently delete</strong> the job <strong>{selectedJob?.jobTitle}</strong>?
                    This action cannot be undone.
                </Text>
                <Textarea
                    label="Reason for deletion"
                    placeholder="Enter the reason for deleting this job..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    required
                    minRows={3}
                />
                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={closeDeleteModal}>Cancel</Button>
                    <Button color="red" onClick={handleDelete}>Delete Job</Button>
                </Group>
            </Modal>

            {/* View Job Modal */}
            <Modal 
                opened={viewModalOpened} 
                onClose={closeViewModal} 
                title="Job Details"
                size="lg"
                centered
            >
                {selectedJob && (
                    <div className="space-y-4">
                        <div className="flex items-start gap-4 mb-4">
                            <Avatar size="xl" color="brightSun">
                                <IconBriefcase size={24} />
                            </Avatar>
                            <div>
                                <Text size="xl" fw={700}>{selectedJob.jobTitle}</Text>
                                <Text c="dimmed">{selectedJob.company}</Text>
                                <Group gap="xs" mt="xs">
                                    {getStatusBadge(selectedJob.jobStatus)}
                                    <Badge variant="light">{selectedJob.jobType}</Badge>
                                </Group>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text size="xs" c="dimmed">Job ID</Text>
                                <Text>{selectedJob.id}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Posted By (User ID)</Text>
                                <Text>{selectedJob.postedBy}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Location</Text>
                                <Text>{selectedJob.location || "N/A"}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Experience Required</Text>
                                <Text>{selectedJob.experience || "N/A"}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Salary Package</Text>
                                <Text>{formatSalary(selectedJob.packageOffered)}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Posted Date</Text>
                                <Text>{formatDate(selectedJob.postTime)}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Total Applicants</Text>
                                <Text>{selectedJob.applicants?.length || 0}</Text>
                            </div>
                        </div>
                        
                        {selectedJob.applicants && selectedJob.applicants.length > 0 && (
                            <div className="mt-4">
                                <Text fw={600} className="mb-2">Recent Applicants</Text>
                                <div className="space-y-2">
                                    {selectedJob.applicants.slice(0, 5).map((applicant: any, idx: number) => (
                                        <Paper key={idx} withBorder p="sm" className="bg-mine-shaft-800">
                                            <Group justify="space-between">
                                                <Text size="sm">{applicant.name || `Applicant ${applicant.applicantId}`}</Text>
                                                <Badge size="sm" variant="light">{applicant.applicationStatus}</Badge>
                                            </Group>
                                        </Paper>
                                    ))}
                                    {selectedJob.applicants.length > 5 && (
                                        <Text size="sm" c="dimmed" ta="center">
                                            +{selectedJob.applicants.length - 5} more applicants
                                        </Text>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default JobManagement;

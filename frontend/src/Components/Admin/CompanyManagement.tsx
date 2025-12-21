import { useEffect, useState } from "react";
import { 
    IconBuilding, IconBriefcase, IconUsers, IconEye, IconSearch
} from "@tabler/icons-react";
import { 
    Table, Badge, Group, Text, TextInput, Modal, 
    Paper, Title, Loader, Center, ActionIcon, Tooltip, Avatar,
    SimpleGrid
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getAllCompanies } from "../../Services/AdminService";
import { errorNotification } from "../../Services/NotificationService";

interface CompanyStats {
    companyName: string;
    totalJobs: number;
    activeJobs: number;
    totalApplications: number;
    jobs: any[];
}

const CompanyManagement = () => {
    const [companies, setCompanies] = useState<CompanyStats[]>([]);
    const [filteredCompanies, setFilteredCompanies] = useState<CompanyStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedCompany, setSelectedCompany] = useState<CompanyStats | null>(null);
    
    const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    useEffect(() => {
        filterCompanies();
    }, [companies, search]);

    const loadCompanies = async () => {
        try {
            const data = await getAllCompanies();
            setCompanies(data);
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    const filterCompanies = () => {
        let result = [...companies];
        
        if (search) {
            result = result.filter(c => 
                c.companyName?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        // Sort by total jobs descending
        result.sort((a, b) => b.totalJobs - a.totalJobs);
        
        setFilteredCompanies(result);
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: "green",
            CLOSED: "gray",
            DRAFT: "yellow",
            HIDDEN: "red",
        };
        return <Badge color={colors[status] || "gray"} size="xs">{status}</Badge>;
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
            <Title order={2} className="mb-6 text-mine-shaft-100">Company Management</Title>
            
            {/* Search */}
            <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 mb-6">
                <TextInput
                    placeholder="Search by company name"
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </Paper>

            {/* Stats Summary */}
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" className="mb-6">
                <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Companies</Text>
                            <Text fw={700} size="xl" className="text-mine-shaft-100">
                                {filteredCompanies.length}
                            </Text>
                        </div>
                        <IconBuilding size={24} className="text-bright-sun-400" stroke={1.5} />
                    </Group>
                </Paper>
                <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Jobs Posted</Text>
                            <Text fw={700} size="xl" className="text-mine-shaft-100">
                                {filteredCompanies.reduce((acc, c) => acc + c.totalJobs, 0)}
                            </Text>
                        </div>
                        <IconBriefcase size={24} className="text-blue-400" stroke={1.5} />
                    </Group>
                </Paper>
                <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700">
                    <Group justify="space-between">
                        <div>
                            <Text c="dimmed" size="xs" tt="uppercase" fw={700}>Total Applications</Text>
                            <Text fw={700} size="xl" className="text-mine-shaft-100">
                                {filteredCompanies.reduce((acc, c) => acc + c.totalApplications, 0)}
                            </Text>
                        </div>
                        <IconUsers size={24} className="text-green-400" stroke={1.5} />
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Companies Table */}
            <Paper withBorder radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 overflow-hidden">
                <Table striped highlightOnHover>
                    <Table.Thead className="bg-mine-shaft-800">
                        <Table.Tr>
                            <Table.Th className="text-mine-shaft-200">Company Name</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Total Jobs</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Active Jobs</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Total Applications</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Avg Apps/Job</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredCompanies.map((company, index) => (
                            <Table.Tr key={index} className="text-mine-shaft-300">
                                <Table.Td>
                                    <Group gap="sm">
                                        <Avatar size="sm" color="brightSun">
                                            {company.companyName?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Text size="sm" fw={500}>{company.companyName}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color="blue">{company.totalJobs}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color="green">{company.activeJobs}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Badge variant="light" color="violet">{company.totalApplications}</Badge>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm">
                                        {company.totalJobs > 0 
                                            ? (company.totalApplications / company.totalJobs).toFixed(1) 
                                            : 0}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Tooltip label="View Jobs">
                                        <ActionIcon 
                                            variant="subtle" 
                                            color="blue"
                                            onClick={() => {
                                                setSelectedCompany(company);
                                                openViewModal();
                                            }}
                                        >
                                            <IconEye size={18} />
                                        </ActionIcon>
                                    </Tooltip>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                
                {filteredCompanies.length === 0 && (
                    <Center p="xl">
                        <Text c="dimmed">No companies found</Text>
                    </Center>
                )}
            </Paper>

            {/* View Company Jobs Modal */}
            <Modal 
                opened={viewModalOpened} 
                onClose={closeViewModal} 
                title={`Jobs at ${selectedCompany?.companyName}`}
                size="lg"
                centered
            >
                {selectedCompany && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar size="xl" color="brightSun">
                                {selectedCompany.companyName?.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                                <Text size="xl" fw={700}>{selectedCompany.companyName}</Text>
                                <Group gap="xs" mt="xs">
                                    <Badge color="blue">{selectedCompany.totalJobs} Jobs</Badge>
                                    <Badge color="green">{selectedCompany.activeJobs} Active</Badge>
                                    <Badge color="violet">{selectedCompany.totalApplications} Applications</Badge>
                                </Group>
                            </div>
                        </div>
                        
                        <Text fw={600} className="mb-2">Job Listings</Text>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {selectedCompany.jobs?.map((job: any, idx: number) => (
                                <Paper key={idx} withBorder p="sm" className="bg-mine-shaft-800">
                                    <Group justify="space-between">
                                        <div>
                                            <Text size="sm" fw={500}>{job.jobTitle}</Text>
                                            <Text size="xs" c="dimmed">
                                                {job.location} • {job.jobType}
                                            </Text>
                                        </div>
                                        <Group gap="xs">
                                            {getStatusBadge(job.jobStatus)}
                                            <Badge size="xs" variant="light">
                                                {job.applicants?.length || 0} applicants
                                            </Badge>
                                        </Group>
                                    </Group>
                                </Paper>
                            ))}
                            {(!selectedCompany.jobs || selectedCompany.jobs.length === 0) && (
                                <Text size="sm" c="dimmed" ta="center">No jobs found</Text>
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default CompanyManagement;

import { useEffect, useState } from "react";
import { 
    IconUsers, IconBriefcase, IconBuilding, IconLock, 
    IconTrendingUp, IconChartBar, IconUserCheck, IconUserX,
    IconFileDescription, IconActivity 
} from "@tabler/icons-react";
import { Card, Group, RingProgress, SimpleGrid, Text, Title, Paper, Badge, Loader, Center } from "@mantine/core";
import { getDashboardStats } from "../../Services/AdminService";
import { errorNotification } from "../../Services/NotificationService";

interface DashboardStats {
    totalApplicants: number;
    totalEmployers: number;
    totalJobs: number;
    totalActiveJobs: number;
    totalClosedJobs: number;
    totalApplications: number;
    totalCompanies: number;
    newUsersThisMonth: number;
    newJobsThisMonth: number;
    lockedAccounts: number;
}

const AdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await getDashboardStats();
            setStats(data);
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to load dashboard stats");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Center h="60vh">
                <Loader color="brightSun.4" size="xl" />
            </Center>
        );
    }

    if (!stats) {
        return (
            <Center h="60vh">
                <Text c="dimmed">Failed to load dashboard statistics</Text>
            </Center>
        );
    }

    const statCards = [
        { title: "Total Applicants", value: stats.totalApplicants, icon: IconUsers, color: "blue" },
        { title: "Total Employers", value: stats.totalEmployers, icon: IconUserCheck, color: "green" },
        { title: "Total Jobs", value: stats.totalJobs, icon: IconBriefcase, color: "violet" },
        { title: "Active Jobs", value: stats.totalActiveJobs, icon: IconTrendingUp, color: "teal" },
        { title: "Closed Jobs", value: stats.totalClosedJobs, icon: IconFileDescription, color: "gray" },
        { title: "Total Applications", value: stats.totalApplications, icon: IconActivity, color: "orange" },
        { title: "Total Companies", value: stats.totalCompanies, icon: IconBuilding, color: "pink" },
        { title: "New Users This Month", value: stats.newUsersThisMonth, icon: IconChartBar, color: "cyan" },
        { title: "New Jobs This Month", value: stats.newJobsThisMonth, icon: IconBriefcase, color: "lime" },
        { title: "Locked Accounts", value: stats.lockedAccounts, icon: IconLock, color: "red" },
    ];

    return (
        <div className="p-6">
            <Title order={2} className="mb-6 text-mine-shaft-100">Admin Dashboard</Title>
            
            {/* Stats Cards */}
            <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, lg: 5 }} spacing="md" className="mb-8">
                {statCards.map((stat, index) => (
                    <Paper key={index} withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700">
                        <Group justify="space-between">
                            <div>
                                <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                                    {stat.title}
                                </Text>
                                <Text fw={700} size="xl" className="text-mine-shaft-100">
                                    {stat.value}
                                </Text>
                            </div>
                            <stat.icon size={24} className={`text-${stat.color}-400`} stroke={1.5} />
                        </Group>
                    </Paper>
                ))}
            </SimpleGrid>

            {/* Summary Charts */}
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                {/* Users Distribution */}
                <Paper withBorder p="lg" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700">
                    <Title order={4} className="mb-4 text-mine-shaft-100">Users Distribution</Title>
                    <Group justify="center">
                        <RingProgress
                            size={200}
                            thickness={20}
                            roundCaps
                            sections={[
                                { value: (stats.totalApplicants / (stats.totalApplicants + stats.totalEmployers)) * 100, color: 'blue' },
                                { value: (stats.totalEmployers / (stats.totalApplicants + stats.totalEmployers)) * 100, color: 'green' },
                            ]}
                            label={
                                <Text ta="center" fw={700} size="xl" className="text-mine-shaft-100">
                                    {stats.totalApplicants + stats.totalEmployers}
                                </Text>
                            }
                        />
                    </Group>
                    <Group justify="center" mt="md" gap="xl">
                        <Group gap="xs">
                            <div className="w-3 h-3 bg-blue-500 rounded-full" />
                            <Text size="sm" c="dimmed">Applicants ({stats.totalApplicants})</Text>
                        </Group>
                        <Group gap="xs">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <Text size="sm" c="dimmed">Employers ({stats.totalEmployers})</Text>
                        </Group>
                    </Group>
                </Paper>

                {/* Jobs Distribution */}
                <Paper withBorder p="lg" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700">
                    <Title order={4} className="mb-4 text-mine-shaft-100">Jobs Distribution</Title>
                    <Group justify="center">
                        <RingProgress
                            size={200}
                            thickness={20}
                            roundCaps
                            sections={[
                                { value: (stats.totalActiveJobs / stats.totalJobs) * 100 || 0, color: 'teal' },
                                { value: (stats.totalClosedJobs / stats.totalJobs) * 100 || 0, color: 'gray' },
                            ]}
                            label={
                                <Text ta="center" fw={700} size="xl" className="text-mine-shaft-100">
                                    {stats.totalJobs}
                                </Text>
                            }
                        />
                    </Group>
                    <Group justify="center" mt="md" gap="xl">
                        <Group gap="xs">
                            <div className="w-3 h-3 bg-teal-500 rounded-full" />
                            <Text size="sm" c="dimmed">Active ({stats.totalActiveJobs})</Text>
                        </Group>
                        <Group gap="xs">
                            <div className="w-3 h-3 bg-gray-500 rounded-full" />
                            <Text size="sm" c="dimmed">Closed ({stats.totalClosedJobs})</Text>
                        </Group>
                    </Group>
                </Paper>
            </SimpleGrid>

            {/* Quick Stats Summary */}
            <Paper withBorder p="lg" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 mt-6">
                <Title order={4} className="mb-4 text-mine-shaft-100">Quick Summary</Title>
                <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                    <div className="text-center p-4 rounded-lg bg-mine-shaft-800">
                        <Text size="sm" c="dimmed">Avg Applications per Job</Text>
                        <Text size="xl" fw={700} className="text-bright-sun-400">
                            {stats.totalJobs > 0 ? (stats.totalApplications / stats.totalJobs).toFixed(1) : 0}
                        </Text>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-mine-shaft-800">
                        <Text size="sm" c="dimmed">Avg Jobs per Company</Text>
                        <Text size="xl" fw={700} className="text-bright-sun-400">
                            {stats.totalCompanies > 0 ? (stats.totalJobs / stats.totalCompanies).toFixed(1) : 0}
                        </Text>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-mine-shaft-800">
                        <Text size="sm" c="dimmed">Job Fill Rate</Text>
                        <Text size="xl" fw={700} className="text-bright-sun-400">
                            {stats.totalJobs > 0 ? ((stats.totalClosedJobs / stats.totalJobs) * 100).toFixed(1) : 0}%
                        </Text>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-mine-shaft-800">
                        <Text size="sm" c="dimmed">Account Lock Rate</Text>
                        <Text size="xl" fw={700} className={stats.lockedAccounts > 0 ? "text-red-400" : "text-green-400"}>
                            {(stats.totalApplicants + stats.totalEmployers) > 0 
                                ? ((stats.lockedAccounts / (stats.totalApplicants + stats.totalEmployers)) * 100).toFixed(2) 
                                : 0}%
                        </Text>
                    </div>
                </SimpleGrid>
            </Paper>
        </div>
    );
};

export default AdminDashboard;

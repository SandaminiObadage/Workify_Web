import { useState } from "react";
import { Tabs, Paper, Title, Group, Badge } from "@mantine/core";
import { 
    IconDashboard, IconUsers, IconBriefcase, IconBuilding, 
    IconHistory, IconUserPlus, IconShieldCheck
} from "@tabler/icons-react";
import AdminDashboard from "../Components/Admin/AdminDashboard";
import UserManagement from "../Components/Admin/UserManagement";
import JobManagement from "../Components/Admin/JobManagement";
import ActionLogs from "../Components/Admin/ActionLogs";
import CreateAdmin from "../Components/Admin/CreateAdmin";
import CompanyManagement from "../Components/Admin/CompanyManagement";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState<string | null>("dashboard");

    return (
        <div className="min-h-screen bg-mine-shaft-950 pt-4">
            <div className="max-w-[1400px] mx-auto px-4">
                {/* Header */}
                <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 mb-6">
                    <Group justify="space-between">
                        <Group>
                            <IconShieldCheck size={32} className="text-bright-sun-400" />
                            <div>
                                <Title order={3} className="text-mine-shaft-100">Admin Panel</Title>
                                <p className="text-mine-shaft-400 text-sm">Manage users, jobs, and platform settings</p>
                            </div>
                        </Group>
                        <Badge size="lg" variant="filled" color="brightSun.4">
                            Administrator
                        </Badge>
                    </Group>
                </Paper>

                {/* Tabs Navigation */}
                <Tabs value={activeTab} onChange={setActiveTab} variant="pills" radius="md">
                    <Tabs.List className="mb-4 bg-mine-shaft-900 p-2 rounded-lg">
                        <Tabs.Tab 
                            value="dashboard" 
                            leftSection={<IconDashboard size={16} />}
                            className="text-mine-shaft-200 data-[active=true]:bg-bright-sun-400 data-[active=true]:text-mine-shaft-900"
                        >
                            Dashboard
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="users" 
                            leftSection={<IconUsers size={16} />}
                            className="text-mine-shaft-200 data-[active=true]:bg-bright-sun-400 data-[active=true]:text-mine-shaft-900"
                        >
                            Users
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="jobs" 
                            leftSection={<IconBriefcase size={16} />}
                            className="text-mine-shaft-200 data-[active=true]:bg-bright-sun-400 data-[active=true]:text-mine-shaft-900"
                        >
                            Jobs
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="companies" 
                            leftSection={<IconBuilding size={16} />}
                            className="text-mine-shaft-200 data-[active=true]:bg-bright-sun-400 data-[active=true]:text-mine-shaft-900"
                        >
                            Companies
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="logs" 
                            leftSection={<IconHistory size={16} />}
                            className="text-mine-shaft-200 data-[active=true]:bg-bright-sun-400 data-[active=true]:text-mine-shaft-900"
                        >
                            Action Logs
                        </Tabs.Tab>
                        <Tabs.Tab 
                            value="create-admin" 
                            leftSection={<IconUserPlus size={16} />}
                            className="text-mine-shaft-200 data-[active=true]:bg-bright-sun-400 data-[active=true]:text-mine-shaft-900"
                        >
                            Create Admin
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="dashboard">
                        <AdminDashboard />
                    </Tabs.Panel>
                    <Tabs.Panel value="users">
                        <UserManagement />
                    </Tabs.Panel>
                    <Tabs.Panel value="jobs">
                        <JobManagement />
                    </Tabs.Panel>
                    <Tabs.Panel value="companies">
                        <CompanyManagement />
                    </Tabs.Panel>
                    <Tabs.Panel value="logs">
                        <ActionLogs />
                    </Tabs.Panel>
                    <Tabs.Panel value="create-admin">
                        <CreateAdmin />
                    </Tabs.Panel>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminPage;

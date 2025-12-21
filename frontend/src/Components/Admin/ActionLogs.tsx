import { useEffect, useState } from "react";
import { 
    IconHistory, IconSearch, IconFilter, IconUser, 
    IconBriefcase, IconBuilding
} from "@tabler/icons-react";
import { 
    Table, Badge, Group, Text, TextInput, Paper, Title, 
    Loader, Center, Select, Avatar
} from "@mantine/core";
import { getActionLogs } from "../../Services/AdminService";
import { errorNotification } from "../../Services/NotificationService";

interface ActionLog {
    id: number;
    targetId: number;
    targetType: string;
    action: string;
    reason: string;
    adminId: number;
    adminName: string;
    targetName: string;
    actionTime: string;
    previousState: string;
    newState: string;
}

const ActionLogs = () => {
    const [logs, setLogs] = useState<ActionLog[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<ActionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterAction, setFilterAction] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string | null>(null);

    useEffect(() => {
        loadLogs();
    }, []);

    useEffect(() => {
        filterLogs();
    }, [logs, search, filterAction, filterType]);

    const loadLogs = async () => {
        try {
            const data = await getActionLogs();
            setLogs(data);
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to load action logs");
        } finally {
            setLoading(false);
        }
    };

    const filterLogs = () => {
        let result = [...logs];
        
        if (search) {
            result = result.filter(l => 
                l.targetName?.toLowerCase().includes(search.toLowerCase()) ||
                l.adminName?.toLowerCase().includes(search.toLowerCase()) ||
                l.reason?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (filterAction) {
            result = result.filter(l => l.action === filterAction);
        }
        
        if (filterType) {
            result = result.filter(l => l.targetType === filterType);
        }
        
        setFilteredLogs(result);
    };

    const getActionBadge = (action: string) => {
        const colors: Record<string, string> = {
            LOCK: "orange",
            UNLOCK: "green",
            HIDE: "yellow",
            UNHIDE: "teal",
            DELETE: "red"
        };
        return <Badge color={colors[action] || "gray"}>{action}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const icons: Record<string, JSX.Element> = {
            USER: <IconUser size={14} />,
            JOB: <IconBriefcase size={14} />,
            COMPANY: <IconBuilding size={14} />
        };
        const colors: Record<string, string> = {
            USER: "blue",
            JOB: "violet",
            COMPANY: "pink"
        };
        return (
            <Badge color={colors[type] || "gray"} leftSection={icons[type]} variant="light">
                {type}
            </Badge>
        );
    };

    const formatDateTime = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <Title order={2} className="mb-6 text-mine-shaft-100">
                <Group gap="sm">
                    <IconHistory size={28} />
                    Action Logs
                </Group>
            </Title>
            
            {/* Filters */}
            <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 mb-6">
                <Group>
                    <TextInput
                        placeholder="Search by target, admin, or reason"
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        placeholder="Action Type"
                        data={[
                            { value: "LOCK", label: "Lock" },
                            { value: "UNLOCK", label: "Unlock" },
                            { value: "HIDE", label: "Hide" },
                            { value: "UNHIDE", label: "Unhide" },
                            { value: "DELETE", label: "Delete" },
                        ]}
                        value={filterAction}
                        onChange={setFilterAction}
                        clearable
                        leftSection={<IconFilter size={16} />}
                    />
                    <Select
                        placeholder="Target Type"
                        data={[
                            { value: "USER", label: "User" },
                            { value: "JOB", label: "Job" },
                            { value: "COMPANY", label: "Company" },
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
                    Total Logs: {filteredLogs.length}
                </Badge>
                <Badge size="lg" variant="light" color="orange">
                    Lock Actions: {filteredLogs.filter(l => l.action === "LOCK").length}
                </Badge>
                <Badge size="lg" variant="light" color="red">
                    Delete Actions: {filteredLogs.filter(l => l.action === "DELETE").length}
                </Badge>
            </Group>

            {/* Logs Table */}
            <Paper withBorder radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 overflow-hidden">
                <Table striped highlightOnHover>
                    <Table.Thead className="bg-mine-shaft-800">
                        <Table.Tr>
                            <Table.Th className="text-mine-shaft-200">Date/Time</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Admin</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Action</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Target Type</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Target</Table.Th>
                            <Table.Th className="text-mine-shaft-200">State Change</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Reason</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredLogs.map((log) => (
                            <Table.Tr key={log.id} className="text-mine-shaft-300">
                                <Table.Td>
                                    <Text size="sm">{formatDateTime(log.actionTime)}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="sm">
                                        <Avatar size="sm" color="brightSun">
                                            {log.adminName?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Text size="sm">{log.adminName}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>{getActionBadge(log.action)}</Table.Td>
                                <Table.Td>{getTypeBadge(log.targetType)}</Table.Td>
                                <Table.Td>
                                    <Text size="sm" lineClamp={1}>{log.targetName}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Badge variant="outline" size="xs" color="gray">{log.previousState}</Badge>
                                        <Text size="xs">→</Text>
                                        <Badge variant="filled" size="xs" color="blue">{log.newState}</Badge>
                                    </Group>
                                </Table.Td>
                                <Table.Td>
                                    <Text size="sm" lineClamp={2} c="dimmed">{log.reason || "N/A"}</Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                
                {filteredLogs.length === 0 && (
                    <Center p="xl">
                        <Text c="dimmed">No action logs found</Text>
                    </Center>
                )}
            </Paper>
        </div>
    );
};

export default ActionLogs;

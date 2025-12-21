import { useEffect, useState } from "react";
import { 
    IconLock, IconLockOpen, IconTrash, IconEye, IconSearch,
    IconUser, IconMail, IconCalendar, IconFilter
} from "@tabler/icons-react";
import { 
    Table, Badge, Button, Group, Text, TextInput, Modal, 
    Textarea, Paper, Title, Loader, Center, Select, ActionIcon,
    Tooltip, Avatar, Tabs
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { getAllUsers, lockUserAccount, unlockUserAccount, deleteUserAccount, getProfileDetails } from "../../Services/AdminService";
import { errorNotification, successNotification } from "../../Services/NotificationService";
import { useSelector } from "react-redux";

interface User {
    id: number;
    name: string;
    email: string;
    accountType: string;
    profileId: number;
    accountStatus: string;
    createdAt: string;
    lastLogin: string;
    lockedReason: string;
}

const UserManagement = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [actionReason, setActionReason] = useState("");
    const [profileData, setProfileData] = useState<any>(null);
    
    const [lockModalOpened, { open: openLockModal, close: closeLockModal }] = useDisclosure(false);
    const [deleteModalOpened, { open: openDeleteModal, close: closeDeleteModal }] = useDisclosure(false);
    const [viewModalOpened, { open: openViewModal, close: closeViewModal }] = useDisclosure(false);
    
    const currentUser = useSelector((state: any) => state.user);

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [users, search, filterType, filterStatus]);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const filterUsers = () => {
        let result = [...users];
        
        if (search) {
            result = result.filter(u => 
                u.name?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase())
            );
        }
        
        if (filterType) {
            result = result.filter(u => u.accountType === filterType);
        }
        
        if (filterStatus) {
            result = result.filter(u => u.accountStatus === filterStatus);
        }
        
        setFilteredUsers(result);
    };

    const handleLock = async () => {
        if (!selectedUser || !actionReason.trim()) {
            errorNotification("Error", "Please provide a reason for locking the account");
            return;
        }
        
        try {
            const response = await lockUserAccount({
                targetId: selectedUser.id,
                reason: actionReason,
                adminId: currentUser.id
            });
            console.log("Lock response:", response);
            successNotification("Success", "User account has been locked");
            closeLockModal();
            setActionReason("");
            await loadUsers();
        } catch (err: any) {
            console.error("Lock error:", err);
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to lock account");
        }
    };

    const handleUnlock = async (user: User) => {
        try {
            const response = await unlockUserAccount({
                targetId: user.id,
                reason: "Account unlocked by admin",
                adminId: currentUser.id
            });
            console.log("Unlock response:", response);
            successNotification("Success", "User account has been unlocked");
            await loadUsers();
        } catch (err: any) {
            console.error("Unlock error:", err);
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to unlock account");
        }
    };

    const handleDelete = async () => {
        if (!selectedUser || !actionReason.trim()) {
            errorNotification("Error", "Please provide a reason for deleting the account");
            return;
        }
        
        try {
            await deleteUserAccount(selectedUser.id, {
                reason: actionReason,
                adminId: currentUser.id
            });
            successNotification("Success", "User account has been deleted");
            closeDeleteModal();
            setActionReason("");
            loadUsers();
        } catch (err: any) {
            errorNotification("Error", err.response?.data?.errorMessage || "Failed to delete account");
        }
    };

    const handleViewProfile = async (user: User) => {
        setSelectedUser(user);
        if (user.profileId) {
            try {
                const profile = await getProfileDetails(user.profileId);
                setProfileData(profile);
            } catch (err) {
                setProfileData(null);
            }
        }
        openViewModal();
    };

    const getStatusBadge = (status: string) => {
        const colors: Record<string, string> = {
            ACTIVE: "green",
            LOCKED: "red",
            SUSPENDED: "orange",
            PENDING_VERIFICATION: "yellow"
        };
        return <Badge color={colors[status] || "gray"}>{status || "ACTIVE"}</Badge>;
    };

    const getTypeBadge = (type: string) => {
        const colors: Record<string, string> = {
            APPLICANT: "blue",
            EMPLOYER: "violet",
            ADMIN: "bright-sun"
        };
        return <Badge color={colors[type] || "gray"}>{type}</Badge>;
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
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
            <Title order={2} className="mb-6 text-mine-shaft-100">User Management</Title>
            
            {/* Filters */}
            <Paper withBorder p="md" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 mb-6">
                <Group>
                    <TextInput
                        placeholder="Search by name or email"
                        leftSection={<IconSearch size={16} />}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="flex-1"
                    />
                    <Select
                        placeholder="Account Type"
                        data={[
                            { value: "APPLICANT", label: "Applicant" },
                            { value: "EMPLOYER", label: "Employer" },
                            { value: "ADMIN", label: "Admin" },
                        ]}
                        value={filterType}
                        onChange={setFilterType}
                        clearable
                        leftSection={<IconFilter size={16} />}
                    />
                    <Select
                        placeholder="Status"
                        data={[
                            { value: "ACTIVE", label: "Active" },
                            { value: "LOCKED", label: "Locked" },
                            { value: "SUSPENDED", label: "Suspended" },
                        ]}
                        value={filterStatus}
                        onChange={setFilterStatus}
                        clearable
                    />
                </Group>
            </Paper>

            {/* Stats Summary */}
            <Group className="mb-4" gap="md">
                <Badge size="lg" variant="light" color="blue">
                    Total: {filteredUsers.length}
                </Badge>
                <Badge size="lg" variant="light" color="green">
                    Active: {filteredUsers.filter(u => u.accountStatus === "ACTIVE" || !u.accountStatus).length}
                </Badge>
                <Badge size="lg" variant="light" color="red">
                    Locked: {filteredUsers.filter(u => u.accountStatus === "LOCKED").length}
                </Badge>
            </Group>

            {/* Users Table */}
            <Paper withBorder radius="md" className="bg-mine-shaft-900 border-mine-shaft-700 overflow-hidden">
                <Table striped highlightOnHover>
                    <Table.Thead className="bg-mine-shaft-800">
                        <Table.Tr>
                            <Table.Th className="text-mine-shaft-200">User</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Email</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Type</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Status</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Joined</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Last Login</Table.Th>
                            <Table.Th className="text-mine-shaft-200">Actions</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {filteredUsers.map((user) => (
                            <Table.Tr key={user.id} className="text-mine-shaft-300">
                                <Table.Td>
                                    <Group gap="sm">
                                        <Avatar size="sm" color="brightSun">
                                            {user.name?.charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Text size="sm">{user.name}</Text>
                                    </Group>
                                </Table.Td>
                                <Table.Td>{user.email}</Table.Td>
                                <Table.Td>{getTypeBadge(user.accountType)}</Table.Td>
                                <Table.Td>{getStatusBadge(user.accountStatus)}</Table.Td>
                                <Table.Td>{formatDate(user.createdAt)}</Table.Td>
                                <Table.Td>{formatDate(user.lastLogin)}</Table.Td>
                                <Table.Td>
                                    <Group gap="xs">
                                        <Tooltip label="View Profile">
                                            <ActionIcon 
                                                variant="subtle" 
                                                color="blue"
                                                onClick={() => handleViewProfile(user)}
                                            >
                                                <IconEye size={18} />
                                            </ActionIcon>
                                        </Tooltip>
                                        
                                        {user.accountType !== "ADMIN" && (
                                            <>
                                                {user.accountStatus === "LOCKED" ? (
                                                    <Tooltip label="Unlock Account">
                                                        <ActionIcon 
                                                            variant="subtle" 
                                                            color="green"
                                                            onClick={() => handleUnlock(user)}
                                                        >
                                                            <IconLockOpen size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip label="Lock Account">
                                                        <ActionIcon 
                                                            variant="subtle" 
                                                            color="orange"
                                                            onClick={() => {
                                                                setSelectedUser(user);
                                                                openLockModal();
                                                            }}
                                                        >
                                                            <IconLock size={18} />
                                                        </ActionIcon>
                                                    </Tooltip>
                                                )}
                                                
                                                <Tooltip label="Delete Account">
                                                    <ActionIcon 
                                                        variant="subtle" 
                                                        color="red"
                                                        onClick={() => {
                                                            setSelectedUser(user);
                                                            openDeleteModal();
                                                        }}
                                                    >
                                                        <IconTrash size={18} />
                                                    </ActionIcon>
                                                </Tooltip>
                                            </>
                                        )}
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
                
                {filteredUsers.length === 0 && (
                    <Center p="xl">
                        <Text c="dimmed">No users found</Text>
                    </Center>
                )}
            </Paper>

            {/* Lock Account Modal */}
            <Modal 
                opened={lockModalOpened} 
                onClose={closeLockModal} 
                title="Lock User Account"
                centered
            >
                <Text size="sm" c="dimmed" className="mb-4">
                    Are you sure you want to lock the account for <strong>{selectedUser?.name}</strong>?
                    The user will not be able to login until unlocked.
                </Text>
                <Textarea
                    label="Reason for locking"
                    placeholder="Enter the reason for locking this account..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    required
                    minRows={3}
                />
                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={closeLockModal}>Cancel</Button>
                    <Button color="orange" onClick={handleLock}>Lock Account</Button>
                </Group>
            </Modal>

            {/* Delete Account Modal */}
            <Modal 
                opened={deleteModalOpened} 
                onClose={closeDeleteModal} 
                title="Delete User Account"
                centered
            >
                <Text size="sm" c="dimmed" className="mb-4">
                    Are you sure you want to <strong className="text-red-500">permanently delete</strong> the account for <strong>{selectedUser?.name}</strong>?
                    This action cannot be undone.
                </Text>
                <Textarea
                    label="Reason for deletion"
                    placeholder="Enter the reason for deleting this account..."
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    required
                    minRows={3}
                />
                <Group justify="flex-end" mt="md">
                    <Button variant="subtle" onClick={closeDeleteModal}>Cancel</Button>
                    <Button color="red" onClick={handleDelete}>Delete Account</Button>
                </Group>
            </Modal>

            {/* View Profile Modal */}
            <Modal 
                opened={viewModalOpened} 
                onClose={() => {
                    closeViewModal();
                    setProfileData(null);
                }} 
                title="User Profile Details"
                size="lg"
                centered
            >
                {selectedUser && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4 mb-4">
                            <Avatar size="xl" color="brightSun">
                                {selectedUser.name?.charAt(0).toUpperCase()}
                            </Avatar>
                            <div>
                                <Text size="xl" fw={700}>{selectedUser.name}</Text>
                                <Text c="dimmed">{selectedUser.email}</Text>
                                <Group gap="xs" mt="xs">
                                    {getTypeBadge(selectedUser.accountType)}
                                    {getStatusBadge(selectedUser.accountStatus)}
                                </Group>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Text size="xs" c="dimmed">User ID</Text>
                                <Text>{selectedUser.id}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Profile ID</Text>
                                <Text>{selectedUser.profileId || "N/A"}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Joined</Text>
                                <Text>{formatDate(selectedUser.createdAt)}</Text>
                            </div>
                            <div>
                                <Text size="xs" c="dimmed">Last Login</Text>
                                <Text>{formatDate(selectedUser.lastLogin)}</Text>
                            </div>
                        </div>
                        
                        {selectedUser.lockedReason && (
                            <Paper withBorder p="md" className="bg-red-900/20 border-red-700">
                                <Text size="sm" c="red">
                                    <strong>Locked Reason:</strong> {selectedUser.lockedReason}
                                </Text>
                            </Paper>
                        )}
                        
                        {profileData && (
                            <div className="mt-4">
                                <Text fw={600} className="mb-2">Profile Information</Text>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Text size="xs" c="dimmed">Job Title</Text>
                                        <Text>{profileData.jobTitle || "N/A"}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Company</Text>
                                        <Text>{profileData.company || "N/A"}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Location</Text>
                                        <Text>{profileData.location || "N/A"}</Text>
                                    </div>
                                    <div>
                                        <Text size="xs" c="dimmed">Total Experience</Text>
                                        <Text>{profileData.totalExp ? `${profileData.totalExp} years` : "N/A"}</Text>
                                    </div>
                                </div>
                                {profileData.skills && profileData.skills.length > 0 && (
                                    <div className="mt-2">
                                        <Text size="xs" c="dimmed">Skills</Text>
                                        <Group gap="xs" mt="xs">
                                            {profileData.skills.map((skill: string, idx: number) => (
                                                <Badge key={idx} variant="light" size="sm">{skill}</Badge>
                                            ))}
                                        </Group>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default UserManagement;

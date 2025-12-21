import { useState } from "react";
import { 
    IconUserPlus, IconMail, IconLock, IconUser, IconCheck
} from "@tabler/icons-react";
import { 
    Paper, Title, TextInput, PasswordInput, Button, 
    Group, Text, Alert
} from "@mantine/core";
import { createAdminAccount } from "../../Services/AdminService";
import { errorNotification, successNotification } from "../../Services/NotificationService";

const CreateAdmin = () => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: ""
    });
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});

    const validateForm = () => {
        const errors: Record<string, string> = {};
        
        if (!formData.name.trim()) {
            errors.name = "Name is required";
        }
        
        if (!formData.email.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = "Invalid email format";
        }
        
        if (!formData.password) {
            errors.password = "Password is required";
        } else if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%^&+=!]).{8,15}$/.test(formData.password)) {
            errors.password = "Password must be 8-15 characters with uppercase, lowercase, number, and special character";
        }
        
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;
        
        setLoading(true);
        try {
            await createAdminAccount({
                name: formData.name,
                email: formData.email,
                password: formData.password
            });
            successNotification("Success", "Admin account created successfully");
            setFormData({
                name: "",
                email: "",
                password: "",
                confirmPassword: ""
            });
        } catch (err: any) {
            const message = err.response?.data?.errorMessage || "Failed to create admin account";
            errorNotification("Error", message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <Title order={2} className="mb-6 text-mine-shaft-100">
                <Group gap="sm">
                    <IconUserPlus size={28} />
                    Create Admin Account
                </Group>
            </Title>
            
            <div className="max-w-lg mx-auto">
                <Paper withBorder p="xl" radius="md" className="bg-mine-shaft-900 border-mine-shaft-700">
                    <Alert 
                        color="yellow" 
                        title="Important" 
                        className="mb-6"
                    >
                        Admin accounts have full access to manage users, jobs, and platform settings. 
                        Only create admin accounts for trusted personnel.
                    </Alert>
                    
                    <div className="space-y-4">
                        <TextInput
                            label="Full Name"
                            placeholder="Enter admin's full name"
                            leftSection={<IconUser size={16} />}
                            value={formData.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                            error={formErrors.name}
                            required
                        />
                        
                        <TextInput
                            label="Email Address"
                            placeholder="Enter admin's email"
                            leftSection={<IconMail size={16} />}
                            value={formData.email}
                            onChange={(e) => handleChange("email", e.target.value)}
                            error={formErrors.email}
                            required
                        />
                        
                        <PasswordInput
                            label="Password"
                            placeholder="Create a strong password"
                            leftSection={<IconLock size={16} />}
                            value={formData.password}
                            onChange={(e) => handleChange("password", e.target.value)}
                            error={formErrors.password}
                            required
                        />
                        
                        <PasswordInput
                            label="Confirm Password"
                            placeholder="Re-enter password"
                            leftSection={<IconLock size={16} />}
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange("confirmPassword", e.target.value)}
                            error={formErrors.confirmPassword}
                            required
                        />
                        
                        <div className="pt-4">
                            <Button 
                                fullWidth 
                                color="brightSun.4"
                                loading={loading}
                                onClick={handleSubmit}
                                leftSection={<IconCheck size={18} />}
                            >
                                Create Admin Account
                            </Button>
                        </div>
                    </div>
                    
                    <Text size="xs" c="dimmed" className="mt-4 text-center">
                        Password Requirements: 8-15 characters, uppercase, lowercase, number, special character (@#$%^&+=!)
                    </Text>
                </Paper>
            </div>
        </div>
    );
};

export default CreateAdmin;

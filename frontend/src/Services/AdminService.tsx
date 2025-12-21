import axiosInstance from "../Interceptor/AxiosInterceptor";

// ==================== Dashboard ====================
const getDashboardStats = async () => {
    return axiosInstance.get('/admin/dashboard/stats')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

// ==================== User Management ====================
const getAllUsers = async () => {
    return axiosInstance.get('/admin/users')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const getAllApplicants = async () => {
    return axiosInstance.get('/admin/users/applicants')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const getAllEmployers = async () => {
    return axiosInstance.get('/admin/users/employers')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const getUserDetails = async (id: number) => {
    return axiosInstance.get(`/admin/users/${id}`)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const lockUserAccount = async (action: any) => {
    return axiosInstance.post('/admin/users/lock', action)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const unlockUserAccount = async (action: any) => {
    return axiosInstance.post('/admin/users/unlock', action)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const deleteUserAccount = async (id: number, action: any) => {
    return axiosInstance.delete(`/admin/users/${id}`, { data: action })
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

// ==================== Job Management ====================
const getAllJobsAdmin = async () => {
    return axiosInstance.get('/admin/jobs')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const getJobDetails = async (id: number) => {
    return axiosInstance.get(`/admin/jobs/${id}`)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const hideJob = async (action: any) => {
    return axiosInstance.post('/admin/jobs/hide', action)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const unhideJob = async (action: any) => {
    return axiosInstance.post('/admin/jobs/unhide', action)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const deleteJob = async (id: number, action: any) => {
    return axiosInstance.delete(`/admin/jobs/${id}`, { data: action })
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

// ==================== Company Management ====================
const getAllCompanies = async () => {
    return axiosInstance.get('/admin/companies')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const getCompanyDetails = async (name: string) => {
    return axiosInstance.get(`/admin/companies/${encodeURIComponent(name)}`)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

// ==================== Profile Management ====================
const getAllProfiles = async () => {
    return axiosInstance.get('/admin/profiles')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const getProfileDetails = async (id: number) => {
    return axiosInstance.get(`/admin/profiles/${id}`)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

// ==================== Action Logs ====================
const getActionLogs = async () => {
    return axiosInstance.get('/admin/logs')
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

const getActionLogsByAdmin = async (adminId: number) => {
    return axiosInstance.get(`/admin/logs/admin/${adminId}`)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

// ==================== Admin Account Creation ====================
const createAdminAccount = async (user: any) => {
    return axiosInstance.post('/admin/create', user)
        .then((result: any) => result.data)
        .catch((error: any) => { throw error; });
}

export {
    getDashboardStats,
    getAllUsers,
    getAllApplicants,
    getAllEmployers,
    getUserDetails,
    lockUserAccount,
    unlockUserAccount,
    deleteUserAccount,
    getAllJobsAdmin,
    getJobDetails,
    hideJob,
    unhideJob,
    deleteJob,
    getAllCompanies,
    getCompanyDetails,
    getAllProfiles,
    getProfileDetails,
    getActionLogs,
    getActionLogsByAdmin,
    createAdminAccount
};

const BASE_URL = 'http://localhost:5000/v1'
// ../utils/api-urls.js
export const ApiUrls = {
    getDrives: `${BASE_URL}/placement-drives`,
    getNotices: `${BASE_URL}/notices`,
    getPlacedStudents: `${BASE_URL}/students/placed`,
    getPrePlacementActivity: `${BASE_URL}/preplacement-activity-drives`,
    getAllStudents: `${BASE_URL}/students`,
    registerDrive: `${BASE_URL}/placement-drives/registration`,
    registerPrePlacementActivity: `${BASE_URL}/preplacement-activity-drives/registration`,
    unRegisterDrive: `${BASE_URL}/placement-drives/unregistration`,
    unRegisterPrePlacementActivity: `${BASE_URL}/preplacement-activity-drives/unregistration`
};
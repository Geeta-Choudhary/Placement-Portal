const BASE_URL = 'http://localhost:5000/v1'
// ../utils/api-urls.js
export const ApiUrls = {
    getDrives: `${BASE_URL}/placement-drives`,
    getNotices: `${BASE_URL}/notices`,
    getPlacedStudents: `${BASE_URL}/students/placed`,
    getPrePlacementActivity: `${BASE_URL}/preplacement-activity-drives`,
    addPrePlacementActivity: `${BASE_URL}/preplacement-activity-drives`,
    removeActivity: (activity_id) => `${BASE_URL}/preplacement-activity-drives/${activity_id}`,
    updateActivity: (activity_id) => `${BASE_URL}/preplacement-activity-drives/${activity_id}`

};
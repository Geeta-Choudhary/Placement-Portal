const BASE_URL = 'http://localhost:5000/v1'
// ../utils/api-urls.js
export const ApiUrls = {
    getDrives: `${BASE_URL}/placement-drives`,
    addDrive: `${BASE_URL}/placement-drives`,
    removeDrive: (drive_id) => `${BASE_URL}/placement-drives/${drive_id}`,
    updateDrive: (drive_id) => `${BASE_URL}/placement-drives/${drive_id}`,
};

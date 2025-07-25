const BASE_URL = 'http://localhost:5000/v1'
// ../utils/api-urls.js
export const ApiUrls = {
    getNotices: `${BASE_URL}/notices`,
    addNotice: `${BASE_URL}/notices`,
    removeNotice: (notice_id) => `${BASE_URL}/notices/${notice_id}`,
    updateNotice: (notice_id) => `${BASE_URL}/notices/${notice_id}`,

};
const BASE_URL = 'http://localhost:5000/v1'
// ../utils/api-urls.js
export const ApiUrls = {
    getProfile: (student_id) => `${BASE_URL}/student/profile?student_id=${student_id}`,
    updateProfile: (student_id) => `${BASE_URL}/student/profile/${student_id}`,
};
const BASE_URL = 'http://localhost:5000/v1'
// ../utils/api-urls.js
export const ApiUrls = {
    getAllStudents: `${BASE_URL}/students`,
    addStudent: `${BASE_URL}/student/add`,
    removeStudent: (roll_no) => `${BASE_URL}/student/remove?student_id=${roll_no}`,
    getDrives: `${BASE_URL}/placement-drives`,
};
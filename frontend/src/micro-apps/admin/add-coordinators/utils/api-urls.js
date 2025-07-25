const BASE_URL = 'http://localhost:5000/v1'
// ../utils/api-urls.js
export const ApiUrls = {
    getAllStudents: `${BASE_URL}/students`,
    getAllCoordinators: `${BASE_URL}/coordinators`,
    addCoordinator: `${BASE_URL}/coordinators`,
    removeCoordinator: (user_name) => `${BASE_URL}/coordinators/${user_name}`,
};
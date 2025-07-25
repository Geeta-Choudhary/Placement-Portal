/* eslint-disable no-useless-catch */
// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import PlacementClient from "../../../../components/authenticator/authenticate";

class ApiService {
    // Fetch drives
    getDrives = async () => {
        return await PlacementClient.get(ApiUrls.getDrives);
    };

    // Fetch notices
    getNotices = async () => {
        return await PlacementClient.get(ApiUrls.getNotices);
    };

    // Fetch placed students
    getPlacedStudents = async () => {
        return await PlacementClient.get(ApiUrls.getPlacedStudents);
    };

    getAllStudents = async () => {
        return PlacementClient.get(ApiUrls.getAllStudents);
    };
}

export const DashboardServices = new ApiService();

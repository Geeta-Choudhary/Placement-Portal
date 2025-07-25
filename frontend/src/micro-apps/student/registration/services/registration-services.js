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

    registerPrePlacementActivity = async (payload) => {
        return await PlacementClient.post(ApiUrls.registerPrePlacementActivity, payload);
    }
    registerDrive = async (payload) => {
        return await PlacementClient.post(ApiUrls.registerDrive, payload);
    }
    unregisterPrePlacementActivity = async (payload) => {
        return await PlacementClient.post(ApiUrls.unRegisterPrePlacementActivity, payload);
    }
    unregisterDrive = async (payload) => {
        return await PlacementClient.post(ApiUrls.unRegisterDrive, payload);
    }
}

export const RegistrationServices = new ApiService();

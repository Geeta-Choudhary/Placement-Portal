/* eslint-disable no-useless-catch */
// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import PlacementClient from "../../../../components/authenticator/authenticate";

class ApiService {
    // Fetch notices
    getNotices = async () => {
        return await PlacementClient.get(ApiUrls.getNotices);
    };

    removeNotice = async (notice_id) => {
        return await PlacementClient.delete(ApiUrls.removeNotice(notice_id));
    };

    addNotice = async (payload) => {
        return await PlacementClient.post(ApiUrls.addNotice, payload)
    };

    updateNotice = async (notice_id, payload) => {
        return await PlacementClient.put(ApiUrls.updateNotice(notice_id), payload);
    }
}

export const NoticeServices = new ApiService();

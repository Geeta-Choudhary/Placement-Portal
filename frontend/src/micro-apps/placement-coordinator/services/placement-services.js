import { ApiUrls } from "../utils/api-urls";
import PlacementClient from '../../../components/authenticator/authenticate';
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
  // Fetch placed students
  getPrePlacementActivity = async () => {
    return await PlacementClient.get(ApiUrls.getPrePlacementActivity);
  };

  addPrePlacementActivity = async (payload) => {
    return await PlacementClient.post(ApiUrls.addPrePlacementActivity, payload);
  }

  updatePrePlacementActivity = async (activity_id,payload) => {
    return await PlacementClient.put(ApiUrls.updateActivity(activity_id), payload);
  }

  removeActivity = async (activity_id) => {
    return await PlacementClient.delete(ApiUrls.removeActivity(activity_id));
  };

}

export const PlacementServices = new ApiService();
// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import PlacementClient from "../../../components/authenticator/authenticate";
class ApiService {
  // Fetch profile
  getProfile = async (student_id) => {
      return await PlacementClient.get(ApiUrls.getProfile(student_id));
  };
  updateProfile = async (student_id , payload) => {
      return await PlacementClient.put(ApiUrls.updateProfile(student_id) , payload);
  };
}

export const ProfileServices = new ApiService();
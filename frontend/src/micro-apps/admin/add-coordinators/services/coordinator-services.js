// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import PlacementClient from "../../../../components/authenticator/authenticate";

class ApiService {
  // Fetch AllStudents
  getAllStudents = async () => {
    return await PlacementClient.get(ApiUrls.getAllStudents)
  };

  getAllCoordinators = async () => {
    return await PlacementClient.get(ApiUrls.getAllCoordinators)
  };

  addCoordinator = async (payload) => {
    return await PlacementClient.post(ApiUrls.addCoordinator, payload);
  };
  
  removeCoordinator = async (user_name) => {
    return await PlacementClient.delete(ApiUrls.removeCoordinator(user_name));
  };
}

export const CoordinatorServices = new ApiService();
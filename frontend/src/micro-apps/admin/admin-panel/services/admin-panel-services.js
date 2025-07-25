// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import PlacementClient from "../../../../components/authenticator/authenticate";

class ApiService {
  getDrives = async () => {
    return await PlacementClient.get(ApiUrls.getDrives);
  };

  getPlacedStudents = async () => {
    return await PlacementClient.get(ApiUrls.getPlacedStudents);
  };

  getAllStudents = async () => {
    return PlacementClient.get(ApiUrls.getAllStudents);
  };
  getAllCoordinators = async () => {
    return await PlacementClient.get(ApiUrls.getAllCoordinators)
  };

}

export const AdminPanelServices = new ApiService();
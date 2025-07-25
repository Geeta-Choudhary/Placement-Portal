// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import PlacementClient from "../../../../components/authenticator/authenticate";
class ApiService {
  getDrives = async () => {
    return await PlacementClient.get(ApiUrls.getDrives);
  };

  removeDrive = async (drive_id) => {
    return await PlacementClient.delete(ApiUrls.removeDrive(drive_id));
  };

  addDrive = async (payload) => {
    return await PlacementClient.post(ApiUrls.addDrive, payload)
  };

  updateDrive = async (drive_id, payload) => {
    return await PlacementClient.put(ApiUrls.updateDrive(drive_id), payload);
  }

}

export const DrivesServices = new ApiService();
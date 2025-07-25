// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import PlacementClient from "../../../../components/authenticator/authenticate";

class ApiService {
  // Fetch AllStudents
  getAllStudents = async () => {
    return await PlacementClient.get(ApiUrls.getAllStudents)
  };

  addStudent = async (payload) => {
    return await PlacementClient.post(ApiUrls.addStudent, payload);
  };

  removeStudent = async (student_id) => {
    return await PlacementClient.delete(ApiUrls.removeStudent(student_id));
  };

  // Fetch drives
  getDrives = async () => {
    return await PlacementClient.get(ApiUrls.getDrives);
  };
}

export const StudentServices = new ApiService();
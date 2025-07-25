// dashboard-services.js
import { ApiUrls } from "../utils/api-urls";
import  PlacementClient  from "../../../components/authenticator/authenticate";
class ApiService {
  // Fetch AllStudents
  getAllStudents = async () => {
      return PlacementClient.get(ApiUrls.getAllStudents) ;
  };

}

export const StudentServices = new ApiService();
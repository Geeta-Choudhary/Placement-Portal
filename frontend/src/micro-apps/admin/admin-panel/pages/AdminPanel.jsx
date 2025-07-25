import { useEffect, useState } from "react";
import OverviewCards from "./OverviewCards";
import { AdminPanelServices } from "../services/admin-panel-services";
import BarChart from "../charts/BarChart";
import LineChart from "../charts/LineChart";
import PieChart from "../charts/PieChart";


function generateRandomLineChartData(labels, min = 10, max = 50) {
  return labels.map(() => Math.floor(Math.random() * (max - min + 1)) + min);
}

const lineChartLabels = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
const lineChartData = generateRandomLineChartData(lineChartLabels);

function AdminPanel() {
  const [drives, setDrives] = useState([]);
  const [overviewData, setOverviewData] = useState({
    total_students: 0,
    placed_students: 0,
    total_drives: 0,
    total_coordinators: 0,
  });

  const [pieChartData, setPieChartData] = useState([]);

  // Fetch Drives
  useEffect(() => {
    const fetchDrives = async () => {
      try {
        const driveData = await AdminPanelServices.getDrives();
        const transformedData = driveData.map((drive) => ({
          company: drive.company,
          registrations: drive.registeredStudents?.length, // Change if needed
        }));
        setDrives(transformedData);
        setOverviewData((prev) => ({
          ...prev,
          total_drives: driveData.length,
        }));
      } catch (error) {
        console.error("Error fetching drives:", error);
      }
    };
    fetchDrives();
  }, []);

  // Fetch Placed Students
  useEffect(() => {
    const fetchAllPlacedStudents = async () => {
      try {
        const placedStudents = await AdminPanelServices.getPlacedStudents();
        setOverviewData((prev) => ({
          ...prev,
          placed_students: placedStudents.length,
        }));
      } catch (error) {
        console.error("Error fetching placed students:", error);
      }
    };
    fetchAllPlacedStudents();
  }, []);

  // Fetch All Students
  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const allStudents = await AdminPanelServices.getAllStudents();
        setOverviewData((prev) => ({
          ...prev,
          total_students: allStudents.length,
        }));
      } catch (error) {
        console.error("Error fetching all students:", error);
      }
    };
    fetchAllStudents();
  }, []);


  useEffect(() => {
    const fetchAllStudents = async () => {
      try {
        const allCoordinators = await AdminPanelServices.getAllCoordinators();
        console.log(allCoordinators);
        setOverviewData((prev) => ({
          ...prev,
          total_coordinators: allCoordinators.length,
        }));
      } catch (error) {
        console.error("Error fetching all students:", error);
      }
    };
    fetchAllStudents();
  }, []);


  // Update Pie Chart data when overviewData changes
  useEffect(() => {
    const { placed_students, total_students } = overviewData;
    setPieChartData([
      {
        value: placed_students,
        name: "Placed",
        itemStyle: { color: "#34D399" },
      },
      {
        value: Math.max(total_students - placed_students, 0),
        name: "Not Placed",
        itemStyle: { color: "#EF4444" },
      },
    ]);
  }, [overviewData]);

  return (
    <div id="adminPanel" className="min-h-screen p-3">
      <OverviewCards {...overviewData} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            Total Registrations per Drive
          </h3>
          <div className="max-h-[350px] overflow-auto">
            <BarChart drives={drives} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 pb-1">
          <h3 className="text-lg font-medium text-gray-800 mb-3">
            Placement Status
          </h3>
          <PieChart data={pieChartData} />
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-1">
            Placement Trend (Last 6 Months)
          </h3>
          <LineChart data={lineChartData} labels={lineChartLabels} />
        </div>
      </div>
    </div>
  );
}

export default AdminPanel;

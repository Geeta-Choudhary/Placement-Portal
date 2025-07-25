import { useState, useEffect } from "react";
import Notch from "../../../components/notch/Notch";
import * as XLSX from "xlsx";
import data from "../../../store/data.json"; // For student data
import { PlacementServices } from "../services/placement-services";
import {formatDate} from "../../../utils/script";
import {convertToDashedDate} from "../../../utils/script"
// Map student data for reference (rollNo as key for tracking)
const studentsMap = data.students.reduce((acc, student) => {
  acc[student.roll_number.toString()] = student.name;
  return acc;
}, {});

function PlacementCoordinator() {
  const [selectedTab, setSelectedTab] = useState("Activity List");
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState({
    title: "",
    date: "",
    status: "Upcoming",
    description: "",
    link: "",
    registeredStudents: [],
  });
  const [updateActivity, setUpdateActivity] = useState(null); // State for update form
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [actionsPerformed, setActionsPerformed] = useState(true);
  useEffect(() => {
    const abortController = new AbortController(); // For cancelling requests

    const fetchPrePlacementActivityData = async () => {
      try {
        let activities = [];
        try {
          activities = await PlacementServices.getPrePlacementActivity({
            signal: abortController.signal,
          });
        } catch (error) {
          console.warn("Drive fetch error", error);
        }
        const transformedPrePlacementActivity = activities.map((activity) => ({
          id: activity.id || 0,
          title: activity.activity || "Untitled Activity",
          company: activity.company || "Unknown",
          date: convertToDashedDate(activity.date) || "N/A", // Format to yyyy-mm-dd
          status: activity.status || "Unknown",
          description: Array.isArray(activity.description)
            ? activity.description.join(", ")
            : activity.description,
          link: activity.link || "#", // Optional: If link is provided in future
          participants: activity.registeredStudents?.length || 0, // Optional: Default to 0 if not in API
          registeredStudents:
            activity.registeredStudents?.map((student) => ({
              id: student.id,
              name: student.full_name,
              rollNo: student.roll_no,
              email: student.email,
            })) || [],
        }));

        setActivities(transformedPrePlacementActivity);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Unexpected error fetching dashboard data:", err);
        }
      }
    };

    fetchPrePlacementActivityData();

    return () => {
      abortController.abort();
    };
  }, [selectedTab,actionsPerformed]);

  // Handle form input changes for Add Activity
  const handleAddInputChange = async (e) => {
    const { name, value } = e.target;
    setNewActivity((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for Update Activity
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateActivity((prev) => ({ ...prev, [name]: value }));
  };

  // Handle registered students input for Add Activity
  const handleAddRegisteredStudentsChange = (e) => {
    const rollNos = e.target.value.split(",").map((roll) => roll.trim());
    const newStudents = rollNos.map((rollNo, index) => ({
      id: activities.length + index + 1, // Temporary ID
      name: studentsMap[rollNo] || "Unknown",
      rollNo: rollNo,
      email: "",
    }));
    setNewActivity((prev) => ({
      ...prev,
      registeredStudents: newStudents,
    }));
  };

  // Handle registered students input for Update Activity
  const handleUpdateRegisteredStudentsChange = (e) => {
    const rollNos = e.target.value.split(",").map((roll) => roll.trim());
    const newStudents = rollNos.map((rollNo) => ({
      id: updateActivity.id , // Temporary ID based on existing activity ID
      name: studentsMap[rollNo] || "Unknown",
      rollNo: rollNo,
      email: "",
    }));
    setUpdateActivity((prev) => ({
      ...prev,
      registeredStudents: newStudents,
    }));
  };

  const addActivityHelper = async (activity) => {
    const formattedDate = formatDate(activity.date);
  
    const payload = {
      activity_name: activity.title,
      company: activity.link || "N/A",
      date: formattedDate,
      details: activity.description,
      status: activity.status || "Upcoming",
      link: activity.link,
      participants: activity.registeredStudents?.length || 0,
    };
  
    await PlacementServices.addPrePlacementActivity(payload);
  };
  const updateActivityHelper = async (activity) => {
    const formattedDate = formatDate(activity.date);
  
    const payload = {
      activity_name: activity.title,
      company: activity.link || "N/A",
      date: formattedDate,
      details: activity.description,
      status: activity.status || "Upcoming",
      link: activity.link,
      participants: activity.registeredStudents?.length || 0,
    };
  
    await PlacementServices.updatePrePlacementActivity(activity.id,payload);
    setActionsPerformed((prev) => !prev);
  };
  
  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = async (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet);
  
      const newActivities = await Promise.all(
        excelData.map(async (row, index) => {
          const rollNos = row["Registered Students"]
            ? row["Registered Students"].split(":").map((roll) => roll.trim())
            : [];
  
          const registeredStudents = rollNos.map((rollNo, idx) => ({
            id: activities.length + index + idx + 1,
            name: studentsMap[rollNo] || "Unknown",
            rollNo: rollNo,
            email: "",
          }));
  
          const activity = {
            title: row.Title || "",
            date: row.Date || "",
            status: row.Status || "Upcoming",
            description: row.Description || "",
            link: row.Link || "",
            registeredStudents,
          };
  
          try {
            await addActivityHelper(activity);
          } catch (error) {
            console.error(`Failed to add activity "${activity.title}" from Excel`, error);
          }
  
          return {
            ...activity,
            participants: registeredStudents.length,
          };
        })
      );
  
      setActivities((prev) => [...prev, ...newActivities]);
      setShowUploadModal(false);
      setSelectedTab("Activity List");
    };
  
    reader.readAsBinaryString(file);
  };
  

  // Handle manual activity addition
  const handleAddActivity = async (e) => {
    e.preventDefault();
  
    if (!newActivity.title || !newActivity.date || !newActivity.description) {
      alert("Please fill in all required fields.");
      return;
    }
  
    try {
      await addActivityHelper(newActivity);
      setActionsPerformed((prev) => !prev);
      setNewActivity({
        title: "",
        date: "",
        status: "Upcoming",
        description: "",
        link: "",
        registeredStudents: [],
      });
      setSelectedTab("Activity List");
    } catch (error) {
      console.error("Failed to add activity:", error);
      alert("There was an error while adding the activity.");
    }
  };
  

  // Handle manual activity update
  const handleUpdateActivitySubmit = async(e) => {
    e.preventDefault();
    if (
      !updateActivity.title ||
      !updateActivity.date ||
      !updateActivity.description
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const updatedActivityData = {
      ...updateActivity,
      participants: updateActivity.registeredStudents.length,
    };
    updateActivityHelper(updatedActivityData);
    setUpdateActivity(null);
    setSelectedTab("Activity List");
  };

  // Handle removing an activity
  const handleRemoveActivity = async (id) => {
    if (window.confirm("Are you sure you want to remove this activity?")) {
      // setActivities(activities.filter((activity) => activity.id !== id));
      try {
         await PlacementServices.removeActivity(id);
        setActionsPerformed((prev) => !prev);
      } catch (err) {
        alert("Failed to remove drive. Check console for details.");
        console.error("Error removing drive:", err);
      }
    }
  };

  // Handle "Add Activity" tab click
  const handleAddActivityTabClick = () => {
    setNewActivity({
      title: "",
      date: "",
      status: "Upcoming",
      description: "",
      link: "",
      registeredStudents: [],
    });
    setUpdateActivity(null); // Ensure update form is hidden
    setSelectedTab("Add Activity");
  };

  // Handle "Update Activity" tab click
  const handleUpdateActivityTabClick = (activity) => {
    console.log(activity);
    setUpdateActivity({ ...activity });
    setNewActivity({
      title: "",
      date: "",
      status: "Upcoming",
      description: "",
      link: "",
      registeredStudents: [],
    }); // Reset add form
    setSelectedTab("Update Activity");
  };

  // Handle showing participants modal
  const handleShowParticipants = (activity) => {
    setSelectedActivity(activity);
    setShowParticipantsModal(true);
  };

  return (
    <>
      <div className="main-page p-2 max-h-[calc(100vh+100px)]">
        {/* Notch Tabs with Upload Button */}
        <div className="header w-full flex flex-row justify-between items-center mb-1">
          <div className="flex items-center">
            <Notch
              text="Activity List"
              selected={selectedTab === "Activity List"}
              onClick={() => setSelectedTab("Activity List")}
            />
            <Notch
              text="Add Activity"
              selected={selectedTab === "Add Activity"}
              onClick={handleAddActivityTabClick}
            />
            {updateActivity && (
              <Notch
                text="Update Activity"
                selected={selectedTab === "Update Activity"}
                onClick={() => setSelectedTab("Update Activity")}
              />
            )}
          </div>
          {selectedTab === "Add Activity" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#2B2B8D] text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Upload Excel
            </button>
          )}
        </div>

        {/* Content */}
        <div className="content mt-2">
          {selectedTab === "Activity List" ? (
            <div className="max-h-[calc(100vh-125px)] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Link
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Participants
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {activity.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {activity.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            activity.status === "Upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : activity.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {activity.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {activity.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <a
                          href={activity.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Link
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleShowParticipants(activity)}
                          className="text-blue-600 hover:text-blue-900 text-xs"
                        >
                          Show Participants (
                          {activity.registeredStudents.length})
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleUpdateActivityTabClick(activity)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleRemoveActivity(activity.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : selectedTab === "Add Activity" ? (
            <div className="bg-white p-6 rounded-lg max-h-[calc(100vh-125px)]">
              {/* Upload Modal/Prompt */}
              {showUploadModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h3 className="text-lg font-semibold mb-4">
                      Add Activities
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload an Excel file or add an activity manually.
                    </p>
                    <div className="mb-4">
                      <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleExcelUpload}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setShowUploadModal(false);
                          setSelectedTab("Activity List");
                        }}
                        className="bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Activity Form */}
              {!showUploadModal && (
                <>
                  <h3 className="text-lg font-semibold mb-4">
                    Add New Pre-Placement Activity
                  </h3>
                  <form onSubmit={handleAddActivity}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Title
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={newActivity.title}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter activity title"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <input
                        type="date"
                        name="date"
                        value={newActivity.date}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={newActivity.status}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        required
                      >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Completed">Completed</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <input
                        type="text"
                        name="description"
                        value={newActivity.description}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter description"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Link
                      </label>
                      <input
                        type="url"
                        name="link"
                        value={newActivity.link}
                        onChange={handleAddInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter event URL (optional)"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Registered Students (Roll Nos, comma-separated)
                      </label>
                      <input
                        type="text"
                        value={newActivity.registeredStudents
                          .map((s) => s.rollNo)
                          .join(", ")}
                        onChange={handleAddRegisteredStudentsChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="e.g., 12345, 12346"
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        type="submit"
                        className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                      >
                        Add Activity
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTab("Activity List")}
                        className="bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          ) : selectedTab === "Update Activity" && updateActivity ? (
            <div className="bg-white p-6 rounded-lg max-h-[calc(100vh-125px)]">
              {/* Update Activity Form */}
              <h3 className="text-lg font-semibold mb-4">
                Update Pre-Placement Activity
              </h3>
              <form onSubmit={handleUpdateActivitySubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={updateActivity.title}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter activity title"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={updateActivity.date}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={updateActivity.status}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Completed">Completed</option>
                    <option value="In Progress">In Progress</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Description
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={updateActivity.description}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter description"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Link
                  </label>
                  <input
                    type="url"
                    name="link"
                    value={updateActivity.link}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter event URL (optional)"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Registered Students (Roll Nos, comma-separated)
                  </label>
                  <input
                    type="text"
                    value={updateActivity.registeredStudents
                      .map((s) => s.rollNo)
                      .join(", ")}
                    onChange={handleUpdateRegisteredStudentsChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="e.g., 12345, 12346"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="submit"
                    className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                  >
                    Update Activity
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateActivity(null);
                      setSelectedTab("Activity List");
                    }}
                    className="bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>

        {/* Participants Modal */}
        {showParticipantsModal && selectedActivity && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 ">
            <div className="bg-white p-6 rounded-lg shadow-lg w-half max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                Participants for {selectedActivity.title}
              </h3>
              <ul className="list-disc pl-5 mb-4">
                {selectedActivity.registeredStudents.length > 0 ? (
                  selectedActivity.registeredStudents.map((student) => (
                    <li key={student.rollNo} className="text-sm text-gray-700">
                      {student.rollNo} - {student.name} (
                      {student.email || "No email"})
                    </li>
                  ))
                ) : (
                  <li className="text-sm text-gray-500">
                    No registered students
                  </li>
                )}
              </ul>
              <div className="flex justify-end">
                <button
                  onClick={() => setShowParticipantsModal(false)}
                  className="bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default PlacementCoordinator;

import { useState, useEffect } from "react";
import Notch from "../../../../components/notch/Notch";
// import driveData from "../../../../store/drives.json"; // Adjust the path as needed
import { DrivesServices } from "../services/drives-services";
import { formatDate,convertToDashedDate } from "../../../../utils/script";

// Transform initial JSON data (used as fallback or initial state)
// const initialDrives = driveData.data.map((drive) => ({
//   id: drive.id,
//   company: drive.name,
//   date: drive.date,
//   status: drive.status,
//   description: drive.description,
//   applications: drive.applications,
//   registeredStudents: drive.registeredStudents.map((student) => ({
//     id: student.id,
//     name: student.name,
//     rollNo: student.rollNo,
//     email: student.email,
//   })),
//   link: drive.link, // From JSON
//   roles: drive.roles, // From JSON
// }));
function AddDrives() {
  const [selectedTab, setSelectedTab] = useState("Drive List");
  const [drives, setDrives] = useState([]);
  const [actionsPerformed, setActionsPerformed] = useState(true);
  const [newDrive, setNewDrive] = useState({
    company: "",
    date: "",
    status: "Scheduled",
    description: "",
    link: "", // Added from JSON
    roles: [], // Added from JSON
  });
  const [updateDrive, setUpdateDrive] = useState(null);
  const [selectedDrive, setSelectedDrive] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPlacementDrives = async () => {
      try {
        const apiDrives = await DrivesServices.getDrives(); // Fetch from API
        // Transform API response to match the desired structure
        const transformedDrives = apiDrives.map((drive) => ({
          id: drive.id,
          company: drive.company, // From API
          date: convertToDashedDate(drive.date), // From API
          status: drive.status, // From API
          description: drive.description || "No description available", // Default if not in API
          applications:drive.applications,
          registeredStudents: drive.registeredStudents,
            // ?.registeredStudents, // drive.registeredStudents || initialDrives Default if not in API
          link: drive.link, // From API
          roles: drive.roles, // From API
        }));
        setDrives(transformedDrives);
      } catch (err) {
        console.error("Error fetching placement drives:", err);
        setDrives([]); // Fallback to JSON data on error
      }
    };

    fetchPlacementDrives();

    return () => {
      abortController.abort();
    };
  }, [actionsPerformed,selectedTab]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewDrive((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateDrive((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddDrive = async (e) => {
    e.preventDefault();
    // if (!newDrive.company || !newDrive.date || !newDrive.status || !newDrive.description || !newDrive.link) {
    if (
      !newDrive.company ||
      !newDrive.date ||
      !newDrive.status ||
      !newDrive.link
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      company: newDrive.company,
      date: newDrive.date,
      status: newDrive.status,
      // description: newDrive.description,
      registration_link: newDrive.link,
      roles:
        newDrive.roles.length > 0
          ? newDrive.roles.split(",")
          : ["General Role"], // Convert comma-separated string to array
    };

    try {
      const res = await DrivesServices.addDrive(payload); // Assume this API exists
      const newDriveData = {
        id: res.id || drives.length + 1, // Use API-provided ID or fallback
        ...payload,
        applications: 0,
        // registeredStudents: [],
      };
      setDrives([...drives, newDriveData]);
      setNewDrive({
        company: "",
        date: "",
        status: "Scheduled",
        description: "",
        link: "",
        roles: [],
      });
      setActionsPerformed((prev) => !prev);
      setSelectedTab("Drive List");
    } catch (err) {
      alert("Failed to add drive. Check console for details.");
      console.error("Error adding drive:", err);
    }
  };

  const handleSelectUpdateDrive = (drive) => {
    setUpdateDrive({
      ...drive,
      roles: drive.roles.join(", "), // Convert array to comma-separated string for input
    });
    setSelectedTab("Update Drive");
  };

  const handleUpdateDrive = async (e) => {
    e.preventDefault();
    if (
      !updateDrive.company ||
      !updateDrive.date ||
      !updateDrive.status ||
      !updateDrive.description ||
      !updateDrive.link
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    const payload = {
      company: updateDrive.company,
      roles: updateDrive.roles.split(",").map((role) => role.trim()), // Convert back to array
      date: formatDate(updateDrive.date),
      registration_link: updateDrive.link,
      status: updateDrive.status,
      // description: updateDrive.description,
    };
    
    try {
      await DrivesServices.updateDrive(updateDrive.id,payload); // Assume this API exists
      setActionsPerformed((prev) => !prev);
      setUpdateDrive(null);
      setActionsPerformed((prev) => !prev);
      setSelectedTab("Drive List");
    } catch (err) {
      alert("Failed to update drive. Check console for details.");
      console.error("Error updating drive:", err);
    }
  };

  const handleRemoveDrive = async (id) => {
    if (window.confirm("Are you sure you want to remove this drive?")) {
      try {
        await DrivesServices.removeDrive(id);
        setActionsPerformed((prev) => !prev);
      } catch (err) {
        alert("Failed to remove drive. Check console for details.");
        console.error("Error removing drive:", err);
      }
    }
  };

  const handleViewDetails = (drive) => {
    setSelectedDrive(drive);
  };

  const closeDetailsModal = () => {
    setSelectedDrive(null);
  };

  return (
    <>
      <div className="main-page p-2 max-h-[calc(100vh+100px)]">
        <div className="header w-15 flex flex-row justify-start items-center">
          <Notch
            text="Drive List"
            selected={selectedTab === "Drive List"}
            onClick={() => setSelectedTab("Drive List")}
          />
          <Notch
            text="Add Drive"
            selected={selectedTab === "Add Drive"}
            onClick={() => setSelectedTab("Add Drive")}
          />
          {updateDrive && (
            <Notch
              text="Update Drive"
              selected={selectedTab === "Update Drive"}
              onClick={() => setSelectedTab("Update Drive")}
            />
          )}
        </div>

        <div className="content mt-2">
          {selectedTab === "Drive List" ? (
            <div className="overflow-x-auto max-h-[calc(100vh-125px)]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Applications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {drives.map((drive) => (
                    <tr key={drive.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {drive.company}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {drive.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {drive.applications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            drive.status === "Scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : drive.status === "ongoing"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {drive.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewDetails(drive)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleSelectUpdateDrive(drive)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleRemoveDrive(drive.id)}
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
          ) : selectedTab === "Add Drive" ? (
            <div className="bg-white p-6 rounded-lg max-h-[calc(100vh-125px)]">
              <h3 className="text-lg font-semibold mb-4">Add New Drive</h3>
              <form onSubmit={handleAddDrive}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={newDrive.company}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter company name"
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
                    value={newDrive.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    // placeholder="e.g., 20th March 2025"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newDrive.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={newDrive.description}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter drive description"
                    rows="3"
                    required
                  />
                </div> */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Link
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={newDrive.link}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter registration link"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Roles (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="roles"
                    value={newDrive.roles}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="e.g., Software Engineer, Data Analyst"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                  >
                    Add Drive
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Update Drive</h3>
              <form onSubmit={handleUpdateDrive}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Company
                  </label>
                  <input
                    type="text"
                    name="company"
                    value={updateDrive.company}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter company name"
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
                    value={updateDrive.date}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    // placeholder="e.g., 20th March 2025"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={updateDrive.status}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={updateDrive.description}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter drive description"
                    rows="3"
                    required
                  />
                </div> */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Registration Link
                  </label>
                  <input
                    type="text"
                    name="link"
                    value={updateDrive.link}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter registration link"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Roles (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="roles"
                    value={updateDrive.roles}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="e.g., Software Engineer, Data Analyst"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateDrive(null);
                      setSelectedTab("Drive List");
                    }}
                    className="bg-gray-500 text-white font-medium py-2 px-6 rounded-md hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                  >
                    Update Drive
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {selectedDrive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={closeDetailsModal}
          ></div>
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedDrive.company} Drive Details
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Date:</strong> {selectedDrive.date}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Status:</strong> {selectedDrive.status}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Applications:</strong> {selectedDrive.applications}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Description:</strong> {selectedDrive.description}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Link:</strong>{" "}
                <a
                  href={selectedDrive.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {selectedDrive.link}
                </a>
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Roles:</strong> {selectedDrive.roles.join(", ")}
              </p>
            </div>
            <h4 className="text-md font-semibold text-gray-800 mb-2">
              Registered Students
            </h4>
            {selectedDrive?.registeredStudents?.length > 0 ? (
              <div className="overflow-x-auto max-h-48">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Roll No
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedDrive?.registeredStudents?.map((student) => (
                      <tr key={student.id}>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          {student.full_name}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {student.roll_no}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                          {student.email}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No students registered yet.
              </p>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={closeDetailsModal}
                className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AddDrives;

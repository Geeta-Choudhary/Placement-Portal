import { useState, useEffect } from "react";
import Notch from "../../../../components/notch/Notch";

import { CoordinatorServices } from "../services/coordinator-services";

function AddPlacementCoordinators() {
  const [selectedTab, setSelectedTab] = useState("Coordinators List");
  const [coordinators, setCoordinators] = useState([]);
  const [students, setStudents] = useState([]); // Full student list for dropdown
  const [newCoordinator, setNewCoordinator] = useState("");
  const [updateCoordinator, setUpdateCoordinator] = useState(null);
  const [selectedCoordinator, setSelectedCoordinator] = useState(null);
  const [actionsPerformed, setActionsPerformed] = useState(true);
  const [loading, setLoading] = useState(true);
  // Handle form input changes for adding a new coordinator
  const handleInputChange = (e) => {
    setNewCoordinator(e.target.value);
  };

  useEffect(() => {
    const abortController = new AbortController();

    const fetchAllStudents = async () => {
      setLoading(true);
      try {
        const students = await CoordinatorServices.getAllStudents({
          signal: abortController.signal,
        });
        const transformData = students.map((student) => ({
          ...student,
          id: student.id,
          name: student.name,
          rollNo: student.roll_number.toString(),
        }));
        setStudents(transformData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Unexpected error fetching students:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();

    return () => {
      abortController.abort();
    };
  }, [selectedTab, actionsPerformed]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAllCoordinators = async () => {
      setLoading(true);

      try {
        const allCoordinator = await CoordinatorServices.getAllCoordinators({
          signal: abortController.signal,
        });
        const initialCoordinators = students.filter(
          (student) =>
            allCoordinator.filter(
              (coordinator) => coordinator.roll_no === student.rollNo
            )?.length > 0
        );

        const transformData = initialCoordinators.map((student) => ({
          id: student.id,
          name: student.name,
          rollNo: student.rollNo,
          email: student.email,
          role: "Placement Coordinator",
        }));
        setCoordinators(transformData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Unexpected error fetching students:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllCoordinators();

    return () => {
      abortController.abort();
    };
  }, [selectedTab, actionsPerformed, students.length]);

  // Handle form input changes for updating a coordinator
  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateCoordinator((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new placement coordinator
  const handleAddCoordinator = async (e) => {
    e.preventDefault();
    if (!newCoordinator) {
      alert("Please select a student to assign as a placement coordinator.");
      return;
    }

    const selectedStudent = students.find(
      (student) => student.id === parseInt(newCoordinator)
    );
    if (!selectedStudent) {
      alert("Selected student not found.");
      return;
    }

    const payload = {
      password: "test",
      roll_no: selectedStudent.rollNo,
      username: selectedStudent.name,
    };
    try {
      await CoordinatorServices.addCoordinator(payload);
      setActionsPerformed((prev) => !prev);
      setSelectedTab("Coordinators List"); // Switch back to the coordinators list after adding
    } catch (err) {
      alert("Failed to add student. Check console for details.");
      console.error("Error adding student:", err);
    }
  };

  // Handle selecting a coordinator to update
  // const handleSelectUpdateCoordinator = (coordinator) => {
  //   setUpdateCoordinator(coordinator);
  //   setSelectedTab("Update Coordinator");
  // };

  // Handle updating a coordinator
  const handleUpdateCoordinator = (e) => {
    e.preventDefault();
    if (
      !updateCoordinator.name ||
      !updateCoordinator.email ||
      !updateCoordinator.rollNo ||
      !updateCoordinator.branch
    ) {
      alert("Please fill in all fields.");
      return;
    }

    // Update the coordinator in both coordinators and students lists
    setCoordinators(
      coordinators.map((coord) =>
        coord.id === updateCoordinator.id ? updateCoordinator : coord
      )
    );
    setStudents(
      students.map((student) =>
        student.id === updateCoordinator.id ? updateCoordinator : student
      )
    );
    setUpdateCoordinator(null);
    setSelectedTab("Coordinators List"); // Switch back to the coordinators list after updating
  };

  // Handle removing a coordinator
  const handleRemoveCoordinator = async (user_name) => {
    if (
      window.confirm(
        "Are you sure you want to remove this placement coordinator?"
      )
    ) {
      try {
        await CoordinatorServices.removeCoordinator(user_name);
        setActionsPerformed((prev) => !prev);
      } catch (err) {
        alert("Failed to remove student. Check console for details.");
        console.error("Error removing student:", err);
      }
    }
  };

  // Handle viewing coordinator details
  const handleViewDetails = (coordinator) => {
    setSelectedCoordinator(coordinator);
  };

  // Close the details modal
  const closeDetailsModal = () => {
    setSelectedCoordinator(null);
  };

  // Filter students who are not already placement coordinators for the dropdown
  const availableStudents = students.filter(
    (student) =>
      !coordinators?.filter(
        (coordinator) => coordinator.rollNo === student.rollNo
      )?.length > 0
  );

  return (
    <>
      <div className="main-page p-2">
        {/* Notch Tabs */}
        <div className="header w-15 flex flex-row justify-start items-center">
          <Notch
            text="Coordinators List"
            selected={selectedTab === "Coordinators List"}
            onClick={() => setSelectedTab("Coordinators List")}
          />
          <Notch
            text="Add Coordinator"
            selected={selectedTab === "Add Coordinator"}
            onClick={() => setSelectedTab("Add Coordinator")}
          />
          {updateCoordinator && (
            <Notch
              text="Update Coordinator"
              selected={selectedTab === "Update Coordinator"}
              onClick={() => setSelectedTab("Update Coordinator")}
            />
          )}
        </div>

        {loading ? (
          <h1>loading</h1>
        ) : (
          <div className="content mt-2">
            {selectedTab === "Coordinators List" ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {coordinators.map((coordinator) => (
                      <tr key={coordinator.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {coordinator.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coordinator.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coordinator.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <button
                            onClick={() => handleViewDetails(coordinator)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            View Details
                          </button>
                          {/* <button
                          onClick={() =>
                            handleSelectUpdateCoordinator(coordinator)
                          }
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Update
                        </button> */}
                          <button
                            onClick={() =>
                              handleRemoveCoordinator(coordinator.name)
                            }
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
            ) : selectedTab === "Add Coordinator" ? (
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Add New Placement Coordinator
                </h3>
                <form onSubmit={handleAddCoordinator}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Select Student
                    </label>
                    <select
                      name="student"
                      value={newCoordinator}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                      required
                    >
                      <option value="">Select a student</option>
                      {availableStudents.map((student) => (
                        <option key={student.id} value={student.id}>
                          {student.name} ({student.rollNo})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                    >
                      Add Coordinator
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="bg-white p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">
                  Update Placement Coordinator
                </h3>
                <form onSubmit={handleUpdateCoordinator}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={updateCoordinator.name}
                      onChange={handleUpdateInputChange}
                      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                      placeholder="Enter name"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={updateCoordinator.email}
                      onChange={handleUpdateInputChange}
                      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                      placeholder="Enter email"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Roll No
                    </label>
                    <input
                      type="text"
                      name="rollNo"
                      value={updateCoordinator.rollNo}
                      onChange={handleUpdateInputChange}
                      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                      placeholder="Enter roll number"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Branch
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={updateCoordinator.branch}
                      onChange={handleUpdateInputChange}
                      className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                      placeholder="Enter branch"
                      required
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setUpdateCoordinator(null);
                        setSelectedTab("Coordinators List");
                      }}
                      className="bg-gray-500 text-white font-medium py-2 px-6 rounded-md hover:bg-gray-600 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                    >
                      Update Coordinator
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Coordinator Details Modal */}
      {selectedCoordinator && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={closeDetailsModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {`${selectedCoordinator.name}'s Details`}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Email:</strong> {selectedCoordinator.email}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Roll No:</strong> {selectedCoordinator.rollNo}
              </p>
              {/* <p className="text-sm text-gray-600 mb-1">
                <strong>Branch:</strong> {selectedCoordinator.branch}
              </p> */}
              <p className="text-sm text-gray-600 mb-4">
                <strong>Role:</strong> {selectedCoordinator.role}
              </p>
            </div>
            <div className="flex justify-end">
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

export default AddPlacementCoordinators;

import { useState, useEffect } from "react";
import Notch from "../../../../components/notch/Notch";
// import driveData from "../../../../store/drives.json";
import { PiEye, PiEyeSlash } from "react-icons/pi";
// import prePlacementData from "../../../../store/pre-placement-events.json";
import { DashboardServices } from "../../dashboard/services/dashboard-services.js";
import { PlacementServices } from "../../../placement-coordinator/services/placement-services.js";
import { convertToDashedDate } from "../../../../utils/script.js";
import { RegistrationServices } from "../services/registration-services.js";

// Replace this with your actual student ID from auth context
function Registrations() {
  const [selectedTab, setSelectedTab] = useState("Pre-Placement");
  const [prePlacementRegistrations, setPrePlacementRegistrations] = useState([]);
  const [driveRegistrations, setDriveRegistrations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegisteredEvents, setShowRegisteredEvents] = useState(false);
  const [drives, setDrivesData] = useState([]);
  const [prePlacementEvents, setPrePlacementEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [ STUDENT_ID ] = useState(localStorage.getItem("id"));

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPrePlacementActivityData = async () => {
      try {
        let activities = [];
        try {
          activities = await PlacementServices.getPrePlacementActivity({
            signal: abortController.signal,
          });
        } catch (error) {
          console.warn("Pre-placement fetch error", error);
        }

        const transformedPrePlacementActivity = activities.map((activity) => ({
          id: activity.id || 0,
          title: activity.activity || "Untitled Activity",
          company: activity.company || "Unknown",
          date: convertToDashedDate(activity.date) || "N/A",
          status: activity.status || "Unknown",
          description: Array.isArray(activity.description)
            ? activity.description.join(", ")
            :activity.description,
          link: activity.link || "#",
          participants: activity.registeredStudents?.length || 0,
          registeredStudents:
            activity.registeredStudents?.map((student) => ({
              id: student.id,
              name: student.full_name,
              rollNo: student.roll_no,
              email: student.email,
            })) || [],
        }));

        setPrePlacementEvents(transformedPrePlacementActivity);

        // Update registrations based on API data
        const registered = transformedPrePlacementActivity.filter((activity) =>
          activity.registeredStudents.some((student) => student.id == STUDENT_ID)
        );
        console.log("register student" , registered);
        setPrePlacementRegistrations(registered);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching pre-placement data:", err);
        }
      }
    };

    const fetchDrivesData = async () => {
      try {
        let drives = [];
        try {
          drives = await DashboardServices.getDrives({
            signal: abortController.signal,
          });
        } catch (error) {
          console.warn("Drive fetch error", error);
        }

        const transformedDrives = drives.map((drive) => ({
          id: drive.id || 0,
          company: drive.company || "Unknown",
          date: convertToDashedDate(drive.date) || "N/A",
          status: drive.status || "Unknown",
          description: Array.isArray(drive.roles)
            ? drive.roles.join(", ")
            : "No roles specified",
          link: drive.link || "#",
          roles: drive.roles || [],
          applications: drive.applications || [],
          registeredStudents: (drive.registeredStudents || []).map(
            (student) => ({
              id: student.id,
              name: student.full_name,
              rollNo: student.roll_no,
              email: student.email,
            })
          ),
        }));

        setDrivesData(transformedDrives);

        // Update registrations based on API data
        const registered = transformedDrives.filter((drive) =>
          drive.registeredStudents.some((student) => student.id == STUDENT_ID)
        );
        setDriveRegistrations(registered);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching drives data:", err);
        }
      }
    };

    fetchDrivesData();
    fetchPrePlacementActivityData();

    return () => {
      abortController.abort();
    };
  }, [selectedTab]);

  // Check if already registered
  const isRegistered = (event) => {
    return event.registeredStudents.some((student) => student.id == STUDENT_ID);
  };

  // Handle search input
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter events/drives based on search query
  const filteredEvents = prePlacementEvents.filter((event) =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDrives = drives.filter((drive) =>
    drive.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle registration click
  const handleRegisterClick = (event) => {
    if (isRegistered(event)) {
      alert("You are already registered for this event/drive.");
      return;
    }
    setSelectedEvent({ ...event, selectedTab });
  };

  // Confirm registration with API
  const confirmRegistration = async () => {
    if (!selectedEvent) return;

    setIsLoading(true);
    try {
      const payload = {
        student_id: STUDENT_ID,
        ...(selectedTab === "Pre-Placement"
          ? { preplacement_activity_id: selectedEvent.id }
          : { drive_id: selectedEvent.id }),
      };

      let response;
      if (selectedTab === "Pre-Placement") {
        response = await RegistrationServices.registerPrePlacementActivity(payload);
        setPrePlacementRegistrations([
          ...prePlacementRegistrations,
          {
            ...selectedEvent,
            registrationDate: new Date().toISOString().split("T")[0],
          },
        ]);
        // Update event's registered students
        setPrePlacementEvents((prev) =>
          prev.map((event) =>
            event.id === selectedEvent.id
              ? {
                  ...event,
                  registeredStudents: [
                    ...event.registeredStudents,
                    {
                      id: STUDENT_ID,
                      name: "Student Name", // Replace with actual student name if available
                      rollNo: "Unknown", // Replace with actual roll number if available
                      email: "student@example.com", // Replace with actual email if available
                    },
                  ],
                }
              : event
          )
        );
      } else {
        response = await RegistrationServices.registerDrive(payload);
        setDriveRegistrations([
          ...driveRegistrations,
          {
            ...selectedEvent,
            registrationDate: new Date().toISOString().split("T")[0],
          },
        ]);
        // Update drive's registered students
        setDrivesData((prev) =>
          prev.map((drive) =>
            drive.id === selectedEvent.id
              ? {
                  ...drive,
                  registeredStudents: [
                    ...drive.registeredStudents,
                    {
                      id: STUDENT_ID,
                      name: "Student Name", // Replace with actual student name if available
                      rollNo: "Unknown", // Replace with actual roll number if available
                      email: "student@example.com", // Replace with actual email if available
                    },
                  ],
                }
              : drive
          )
        );
      }

      if (response) {
        // alert("Registration successful!");
      }
    } catch (error) {
      console.error("Registration failed:", error);
      // alert("Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
      setSelectedEvent(null);
    }
  };

  // Cancel registration modal
  const cancelRegistrationModal = () => {
    setSelectedEvent(null);
  };

  // Handle unregistration
  const handleUnregister = async (id) => {
    // if (
    //   !window.confirm("Are you sure you want to unregister from this event/drive?")
    // ) {
    //   return;
    // }

    setIsLoading(true);
    try {
      if (selectedTab === "Pre-Placement") {
        await RegistrationServices.unregisterPrePlacementActivity({
          student_id: STUDENT_ID,
          preplacement_activity_id: id,
        });
        setPrePlacementRegistrations(
          prePlacementRegistrations.filter((reg) => reg.id !== id)
        );
        setPrePlacementEvents((prev) =>
          prev.map((event) =>
            event.id === id
              ? {
                  ...event,
                  registeredStudents: event.registeredStudents.filter(
                    (student) => student.id != STUDENT_ID
                  ),
                }
              : event
          )
        );
      } else {
        await RegistrationServices.unregisterDrive({
          student_id: STUDENT_ID,
          drive_id: id,
        });
        setDriveRegistrations(
          driveRegistrations.filter((reg) => reg.id !== id)
        );
        setDrivesData((prev) =>
          prev.map((drive) =>
            drive.id === id
              ? {
                  ...drive,
                  registeredStudents: drive.registeredStudents.filter(
                    (student) => student.id != STUDENT_ID
                  ),
                }
              : drive
          )
        );
      }
    } catch (error) {
      console.error("Unregistration failed:", error);
      alert("Unregistration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle registered events section
  const toggleRegisteredEvents = () => {
    setShowRegisteredEvents(!showRegisteredEvents);
  };

  // Get current registrations based on tab
  const currentRegistrations =
    selectedTab === "Pre-Placement"
      ? prePlacementRegistrations
      : driveRegistrations;

  return (
    <>
      <div className="main-page p-4">
        <div className="w-full flex flex-row justify-between items-center mb-3">
          <div className="flex items-center space-x-6">
            <div className="flex flex-row">
              <Notch
                text="Pre-Placement"
                selected={selectedTab === "Pre-Placement"}
                onClick={() => setSelectedTab("Pre-Placement")}
              />
              <Notch
                text="Drive"
                selected={selectedTab === "Drive"}
                onClick={() => setSelectedTab("Drive")}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex justify-center items-center">
              <input
                type="text"
                placeholder={`Search ${
                  selectedTab === "Pre-Placement" ? "events" : "drives"
                }...`}
                value={searchQuery}
                onChange={handleSearch}
                className="px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent w-64"
              />
            </div>

            <button
              onClick={toggleRegisteredEvents}
              className="text-gray-600 hover:text-blue-600 transition p-2"
              title={
                showRegisteredEvents
                  ? "Hide Registered Events"
                  : "Show Registered Events"
              }
            >
              {showRegisteredEvents ? (
                <PiEyeSlash size={20} />
              ) : (
                <PiEye size={20} />
              )}
            </button>
          </div>
        </div>

        <div className="flex space-x-4 h-[calc(100vh-150px)] overflow-x-auto">
          <div
            className={`content flex-1 ${
              showRegisteredEvents ? "w-3/4" : "w-full"
            } transition-all duration-300`}
          >
            {selectedTab === "Pre-Placement" ? (
              <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`}>
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
                        isRegistered(event) && "border-b-2 border-[#2B2B8D]"
                      } `}
                    >
                      <h3 className="text-lg font-semibold text-gray-800">
                        {event.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Date:</strong> {event.date}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            event.status === "Upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : event.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {event.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {event.description}
                      </p>
                      <button
                        onClick={() => handleRegisterClick(event)}
                        className={`mt-4 font-medium py-2 px-4 rounded-md transition ${
                          isRegistered(event) || event.status === "Completed"
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-[#2B2B8D] text-white hover:bg-blue-700"
                        }`}
                        disabled={ event.status === "Completed" || isRegistered(event) || isLoading }
                      >
                        {isRegistered(event)
                          ? "Registered"
                          : "Register"}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">
                    No pre-placement events found.
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredDrives.length > 0 ? (
                  filteredDrives.map((drive) => (
                    <div
                      key={drive.id}
                      className={`bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 ${
                        isRegistered(drive) && "border-b-2 border-[#2B2B8D]"
                      }`}
                    >
                      <h3 className="text-lg font-semibold text-gray-800">
                        {drive.company}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Date:</strong> {drive.date}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            drive.status === "Scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : drive.status === "In Progress"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {drive.status}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        {drive.description}
                      </p>
                      <button
                        onClick={() => handleRegisterClick(drive)}
                        className={`mt-4 font-medium py-2 px-4 rounded-md transition ${
                          isRegistered(drive)
                            ? "bg-gray-400 text-white cursor-not-allowed"
                            : "bg-[#2B2B8D] text-white hover:bg-blue-700"
                        }`}
                        disabled={isRegistered(drive) || isLoading}
                      >
                        {isRegistered(drive)
                          ? "Registered"
                          : "Register"}
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No drives found.</p>
                )}
              </div>
            )}
          </div>

          {showRegisteredEvents && (
            <div className="sticky top-0 w-1/4 bg-white p-4 rounded-lg shadow-md transition-all duration-300 mr-10 max-h-[calc(60vh)]">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Registered{" "}
                {selectedTab === "Pre-Placement" ? "Events" : "Drives"}
              </h3>
              {currentRegistrations.length > 0 ? (
                <div className="space-y-4 max-h-[calc(70vh-150px)] overflow-y-auto">
                  {currentRegistrations.map((reg) => (
                    <div key={reg.id} className="p-3 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-800">
                        {selectedTab === "Pre-Placement"
                          ? reg.title
                          : reg.company}
                      </h4>
                      <p className="text-xs text-gray-600">
                        <strong>Date:</strong> {reg.date}
                      </p>
                      <p className="text-xs text-gray-600">
                        <strong>Registered On:</strong> {reg.registrationDate}
                      </p>
                      <button
                        onClick={() => handleUnregister(reg.id)}
                        className="mt-2 text-red-600 hover:text-red-900 text-sm"
                        disabled={isLoading}
                      >
                        Unregister
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  No registered{" "}
                  {selectedTab === "Pre-Placement" ? "events" : "drives"}.
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={cancelRegistrationModal}
          ></div>

          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Registration
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              <strong>
                {selectedTab === "Pre-Placement" ? "Event" : "Company"}:
              </strong>{" "}
              {selectedTab === "Pre-Placement"
                ? selectedEvent.title
                : selectedEvent.company}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Date:</strong> {selectedEvent.date}
            </p>
            <p className="text-sm text-gray-600 mb-4">
              <strong>Description:</strong> {selectedEvent.description}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={cancelRegistrationModal}
                className="bg-gray-500 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-600 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={confirmRegistration}
                className="bg-[#2B2B8D] text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Registrations;
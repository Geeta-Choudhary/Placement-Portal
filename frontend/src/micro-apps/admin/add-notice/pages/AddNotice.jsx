import { useState, useEffect } from "react";
import Notch from "../../../../components/notch/Notch";
import { NoticeServices } from "../services/notice-services";

// Sample initial notice data (this would typically come from a backend)
const initialNotices = [
  {
    id: 1,
    title: "Placement Drive Schedule",
    date: "2025-03-28",
    status: "Published",
    content:
      "The placement drive schedule for TechCorp has been updated. Please check the details on the portal.",
  },
  {
    id: 2,
    title: "Resume Submission Deadline",
    date: "2025-03-30",
    status: "Draft",
    content:
      "All students are required to submit their resumes by April 5th for the upcoming placement drives.",
  },
];

function AddNotice() {
  const [selectedTab, setSelectedTab] = useState("Notice List");
  const [notices, setNotices] = useState(initialNotices);
  const [newNotice, setNewNotice] = useState({
    title: "",
    date: "",
    status: "Draft",
    content: "",
  });
  const [updateNotice, setUpdateNotice] = useState(null);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [actionsPerformed, setActionsPerformed] = useState(true);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchDashboardData = async () => {
      try {
        // Fetch Notices (only after drives completes)
        let notices = [];
        try {
          notices = await NoticeServices.getNotices({
            signal: abortController.signal,
          });
        } catch (err) {
          if (err.name !== "AbortError") {
            // setErrors((prev) => ({ ...prev, notices: 'Failed to load notices' }));
          }
        }
        const transformedNotices = notices.map((notice) => ({
          id: notice.id || 0,
          title: notice.title || "Untitled",
          date: notice.date || "N/A",
          description: notice.description || "No description",
          read: notice.read === "true",
          type: notice.type || "general",
        }));

        setNotices(transformedNotices);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Unexpected error fetching dashboard data:", err);
          // setErrors((prev) => ({ ...prev, general: 'Unexpected error occurred' }));
        }
      } finally {
        // setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      abortController.abort();
    };
  }, [actionsPerformed, setSelectedTab]);

  // Handle form input changes for adding a new notice
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewNotice((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form input changes for updating a notice
  const handleUpdateInputChange = async (e) => {
    const { name, value } = e.target;
    setUpdateNotice((prev) => ({ ...prev, [name]: value }));
  };

  // Handle adding a new notice
  const handleAddNotice = async (e) => {
    e.preventDefault();
    if (
      !newNotice.title ||
      // !newNotice.date ||
      // !newNotice.status ||
      !newNotice.content
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      content: newNotice.content,
      drive_id: 0,
      is_read: 0,
      title: newNotice.title,
    };
    try {
      await NoticeServices.addNotice(payload); // Assume this API exists

      setActionsPerformed((prev) => !prev);
      setSelectedTab("Notice List");
      setNewNotice((prev)=>({...prev, title:"" , content:""}));
    } catch (err) {
      alert("Failed to add drive. Check console for details.");
      console.error("Error adding drive:", err);
    }
  };

  // Handle selecting a notice to update
  const handleSelectUpdateNotice = (notice) => {
    setUpdateNotice(notice);
    setSelectedTab("Update Notice");
  };

  // Handle updating a notice
  const handleUpdateNotice = async (e) => {
    e.preventDefault();
    if (
      !updateNotice.title ||
      // !updateNotice.date ||
      // !updateNotice.status ||
      !updateNotice.content
    ) {
      alert("Please fill in all fields.");
      return;
    }

    const payload = {
      content: updateNotice.content,
      drive_id: 0,
      is_read: 0,
      title: updateNotice.title,
    };
    try {
      await NoticeServices.updateNotice(updateNotice.id,payload); // Assume this API exists
      setActionsPerformed((prev) => !prev);
      setSelectedTab("Notice List");
      setUpdateNotice(null);
    } catch (err) {
      alert("Failed to update notice. Check console for details.");
      console.error("Error in updating", err);
    }
  };

  // Handle removing a notice
  const handleRemoveNotice = async (id) => {
    if (window.confirm("Are you sure you want to remove this notice?")) {
      // setNotices(notices.filter((notice) => notice.id !== id));
      try {
        await NoticeServices.removeNotice(id);
        setActionsPerformed((prev) => !prev);
      } catch (err) {
        alert("Failed to remove notice. Check console for details.");
        console.error("Error removing drive:", err);
      }
    }
  };

  // Handle viewing notice details
  // const handleViewDetails = (notice) => {
  //   setSelectedNotice(notice);
  // };

  // Close the details modal
  const closeDetailsModal = () => {
    setSelectedNotice(null);
  };

  return (
    <>
      <div className="main-page p-2 max-h-[calc(100vh+100px)]">
        {/* Notch Tabs */}
        <div className="header w-15 flex flex-row justify-start items-center">
          <Notch
            text="Notice List"
            selected={selectedTab === "Notice List"}
            onClick={() => setSelectedTab("Notice List")}
          />
          <Notch
            text="Add Notice"
            selected={selectedTab === "Add Notice"}
            onClick={() => setSelectedTab("Add Notice")}
          />
          {updateNotice && (
            <Notch
              text="Update Notice"
              selected={selectedTab === "Update Notice"}
              onClick={() => setSelectedTab("Update Notice")}
            />
          )}
        </div>

        {/* Conditional Rendering */}
        <div className="content mt-2">
          {selectedTab === "Notice List" ? (
            <div className="overflow-x-auto max-h-[calc(100vh-125px)]">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notices.map((notice) => (
                    <tr key={notice.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {notice.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {notice.date}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            notice.status === "Published"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {notice.status}
                        </span>
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* <button
                          onClick={() => handleViewDetails(notice)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Details
                        </button> */}
                        <button
                          onClick={() => handleSelectUpdateNotice(notice)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Update
                        </button>
                        <button
                          onClick={() => handleRemoveNotice(notice.id)}
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
          ) : selectedTab === "Add Notice" ? (
            <div className="bg-white p-6 rounded-lg max-h-[calc(100vh-125px)]">
              <h3 className="text-lg font-semibold mb-4">Add New Notice</h3>
              <form onSubmit={handleAddNotice}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newNotice.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter notice title"
                    required
                  />
                </div>
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newNotice.date}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  />
                </div> */}
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newNotice.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div> */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={newNotice.content}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter notice content"
                    rows="5"
                    required
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                  >
                    Add Notice
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Update Notice</h3>
              <form onSubmit={handleUpdateNotice}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={updateNotice.title}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter notice title"
                    required
                  />
                </div>
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={updateNotice.date}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  />
                </div> */}
                {/* <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    name="status"
                    value={updateNotice.status}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    required
                  >
                    <option value="Draft">Draft</option>
                    <option value="Published">Published</option>
                  </select>
                </div> */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={updateNotice.content}
                    onChange={handleUpdateInputChange}
                    className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                    placeholder="Enter notice content"
                    rows="5"
                    required
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUpdateNotice(null);
                      setSelectedTab("Notice List");
                    }}
                    className="bg-gray-500 text-white font-medium py-2 px-6 rounded-md hover:bg-gray-600 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                  >
                    Update Notice
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Notice Details Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={closeDetailsModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg p-6 z-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {selectedNotice.title}
            </h3>
            <div className="mb-4">
              {/* <p className="text-sm text-gray-600 mb-1">
                <strong>Date:</strong> {selectedNotice.date}
              </p> */}
              <p className="text-sm text-gray-600 mb-1">
                <strong>Status:</strong> {selectedNotice.status}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Content:</strong> {selectedNotice.content}
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

export default AddNotice;

import { useState, useEffect } from "react";
// import data from "../../store/data.json";
import StudentCard from "../components/StudentCard";
import { Link } from "react-router-dom";
import { FaTimes } from "react-icons/fa"; // Import icon options
import { StudentServices } from "../services/student-services";
import Loader from "../../loader/Loader";
function StudentDirectory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [batchYear, setBatchYear] = useState("");
  const [placementStatus, setPlacementStatus] = useState("");
  const [sortBy, setSortBy] = useState("roll_number"); // Default sort by roll number
  const [sortOrder, setSortOrder] = useState("asc"); // Default sort order: ascending
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [studentsPerPage] = useState(8); // Number of students per page
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uniqueBatches, setUniqueBatches] = useState([]);
  // const [errors, setErrors] = useState({ students: null, notices: null, placedStudents: null, general: null });

  useEffect(() => {
    const abortController = new AbortController(); // For cancelling requests

    const fetchAllStudents = async () => {
      setLoading(true);
      // setErrors({ students: null, notices: null, placedStudents: null, general: null }); // Reset errors

      try {
        // Fetch students
        let students = [];
        try {
          students = await StudentServices.getAllStudents({
            signal: abortController.signal,
          });
        } catch {
          // setErrors((prev) => ({ ...prev, students: 'Failed to load students' }));
        }

        const batchSet = new Set();
        students.forEach((student) => {
          batchSet.add(student.acadamic_details.year);
        });

        setUniqueBatches(Array.from(batchSet).sort());

        setStudents(students);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Unexpected error fetching dashboard data:", err);
          // setErrors((prev) => ({ ...prev, general: 'Unexpected error occurred' }));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAllStudents();

    // Cleanup: Abort requests if component unmounts
    return () => {
      abortController.abort();
    };
  }, []);

  // Filter students
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      searchTerm.length === 0 ||
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.roll_number.toString().includes(searchTerm);

    const matchesBatch =
      batchYear === "" ||
      student.acadamic_details.year.toString() === batchYear;

    const matchesStatus =
      placementStatus === "" ||
      (placementStatus === "Placed" &&
        student.placement_details.status === "Placed") ||
      (placementStatus === "Not Placed" &&
        student.placement_details.status !== "Placed");

    return matchesSearch && matchesBatch && matchesStatus;
  });

  // Sort students
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    let comparison = 0;
    if (sortBy === "name") {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === "roll_number") {
      comparison = a.roll_number - b.roll_number;
    } else if (sortBy === "cgpa") {
      comparison = a.acadamic_details.CGPA - b.acadamic_details.CGPA;
    }
    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination logic
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = sortedStudents.slice(
    indexOfFirstStudent,
    indexOfLastStudent
  );
  const totalPages = Math.ceil(sortedStudents.length / studentsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top on page change
  };

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setBatchYear("");
    setPlacementStatus("");
    setSortBy("roll_number");
    setSortOrder("asc");
    setCurrentPage(1);
  };

  // Open student details modal
  const handleViewDetails = (student) => {
    setSelectedStudent(student);
  };

  // Close student details modal
  const closeDetailsModal = () => {
    setSelectedStudent(null);
  };

  return (
    <div id="studentDirectory" className="min-h-[calc(100vh-80px)] p-3">
      {/* Filters Section */}
      <div className=" p-2 rounded-lg mb-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search students by name, roll number..."
              className="w-full pl-10 pr-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </div>
          <div className="flex gap-4 items-center">
            <select
              className="px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
              value={batchYear}
              onChange={(e) => setBatchYear(e.target.value)}
            >
              <option value="">Batch Year</option>
              {uniqueBatches.map((batch) => (
                <option value={batch} key={batch}>
                  {batch}
                </option>
              ))}
            </select>
            <select
              className="px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
              value={placementStatus}
              onChange={(e) => setPlacementStatus(e.target.value)}
            >
              <option value="">Placement Status</option>
              <option value="Placed">Placed</option>
              <option value="Not Placed">Not Placed</option>
            </select>
            <select
              className="px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="roll_number">Sort by Roll Number</option>
              <option value="name">Sort by Name</option>
              <option value="cgpa">Sort by CGPA</option>
            </select>
            <select
              className="px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
            <div className="flex items-center space-x-4">
              {/* Other elements like search input could go here */}
              <button
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-600 transition p-1 pt-0 rounded-md"
                title="Clear Filters"
              >
                <FaTimes size={20} className="mt-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ">
        {loading ? (
          <Loader />
        ) : currentStudents.length > 0 ? (
          currentStudents.map((student) => (
            <StudentCard
              {...student}
              key={student.roll_number}
              onViewDetails={() => handleViewDetails(student)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-64 col-span-full">
            <p className="text-gray-500 text-lg font-semibold">
              No Student Details Found
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <nav className="flex space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-3 py-2 border border-gray-200 rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 border border-gray-200 rounded-md ${
                    currentPage === page
                      ? "bg-[#2B2B8D] text-white"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-3 py-2 border border-gray-200 rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 cursor-not-allowed"
                  : "hover:bg-gray-50"
              }`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Student Details Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={closeDetailsModal}
          ></div>

          {/* Modal Content */}
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md p-6 z-50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {`${selectedStudent.name}'s Details`}
            </h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">
                <strong>Roll No:</strong> {selectedStudent.roll_number}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Batch Year:</strong>{" "}
                {selectedStudent.acadamic_details.year}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Semester:</strong>{" "}
                {selectedStudent.acadamic_details.current_semester}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>CGPA:</strong> {selectedStudent.acadamic_details.CGPA}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Placement Status:</strong>{" "}
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    selectedStudent.placement_status === "placed"
                      ? "bg-green-100 text-green-800"
                      : selectedStudent.placement_status === "internship"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedStudent.placement_status}
                </span>
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Skills:</strong>{" "}
                {selectedStudent.skills.length > 0
                  ? selectedStudent.skills.join(", ")
                  : "None"}
              </p>
            </div>
            <div className="flex justify-end space-x-4">
              <button
                onClick={closeDetailsModal}
                className="bg-gray-500 text-white font-medium py-2 px-4 rounded-md hover:bg-gray-600 transition"
              >
                Close
              </button>
              <Link
                to={`/student/profile?roll_no=${selectedStudent.roll_number}`}
              >
                <button className="bg-[#2B2B8D] text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition">
                  View Full Profile
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentDirectory;

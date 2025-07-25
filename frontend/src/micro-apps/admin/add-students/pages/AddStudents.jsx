import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Notch from "../../../../components/notch/Notch";
import user from "../../../../assets/user.png";
import * as XLSX from "xlsx";
import { StudentServices } from "../services/student-services";

function AddStudent() {
  const [selectedTab, setSelectedTab] = useState("Student List");
  const [students, setStudents] = useState([]);
  const [actionsPerformed, setActionsPerformed] = useState(true);
  const [newStudent, setNewStudent] = useState({
    name: "",
    rollNo: "",
    email: "",
    branch: "",
    password: "",
    status: "Not Placed",
    package: "",
    placement_date: "",
    placement_drive_id: "",
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [placementDrives, setPlacementDrives] = useState([]); // To store fetched drives
  const navigate = useNavigate();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchAllStudents = async () => {
      try {
        const students = await StudentServices.getAllStudents({
          signal: abortController.signal,
        });
        const transformData = students.map((student, index) => ({
          id: student.id,
          name: student.name,
          rollNo: student.roll_number.toString(),
          email: student.email,
          branch: "Not specified",
          password: `password${index + 1}23`,
          status: student.placement_details?.status || "Not specified",
          phone_number: student.phone_number || "",
          profiles: {
            leetcode: `${
              student.profiles?.find((p) => p.platform === "leetcode")
                ?.base_url || ""
            }${
              student.profiles?.find((p) => p.platform === "leetcode")
                ?.username || ""
            }`,
            hackerrank: `${
              student.profiles?.find((p) => p.platform === "hackerrank")
                ?.base_url || ""
            }${
              student.profiles?.find((p) => p.platform === "hackerrank")
                ?.username || ""
            }`,
            linkedin: `${
              student.profiles?.find((p) => p.platform === "linkedin")
                ?.base_url || ""
            }${
              student.profiles?.find((p) => p.platform === "linkedin")
                ?.username || ""
            }`,
            github: `${
              student.profiles?.find((p) => p.platform === "github")
                ?.base_url || ""
            }${
              student.profiles?.find((p) => p.platform === "github")
                ?.username || ""
            }`,
          },
          skills: student.skills || [],
          academic_details: {
            CGPA: student.acadamic_details?.CGPA ?? "N/A",
            year: student.acadamic_details?.year ?? "N/A",
            current_semester:
              student.acadamic_details?.current_semester ?? "N/A",
          },
          placement_details: {
            company: student.placement_details?.company || "",
            package: student.placement_details?.package || "",
            status: student.placement_details?.status || "Not specified",
          },
        }));
        setStudents(transformData);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Unexpected error fetching students:", err);
        }
      }
    };

    const fetchPlacementDrives = async () => {
      try {
        const drives = await StudentServices.getDrives(); // Assume this API exists
        setPlacementDrives(drives);
      } catch (err) {
        console.error("Error fetching placement drives:", err);
      }
    };

    fetchAllStudents();
    fetchPlacementDrives();

    return () => {
      abortController.abort();
    };
  }, [selectedTab, students.length, actionsPerformed]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({ ...prev, [name]: value }));
  };

  const addOneStudent = async (newStudent) => {
    const payload = {
      full_name: newStudent.name,
      roll_no: newStudent.rollNo,
      email: newStudent.email,
      phone_number: newStudent.phone_number || "1234567890",
      placement_status: newStudent.status || "Not Placed",
      batch_year: newStudent.batch_year || new Date().getFullYear().toString(),
      password:newStudent.password,
      certifications: [],
      placement_drives: [],
      preplacement_activities: [],
      profile_link: "",
      profile_platform_name: "",
      soft_skills: [],
      technical_skills: (newStudent.skills || []).map((skill) => ({
        skill_name: skill,
        proficiency_level: "Beginner",
      })),
      ...(newStudent.status === "Placed" && {
        package: newStudent.package,
        placement_date: newStudent.placement_date,
        placement_drive_id: newStudent.placement_drive_id,
      }),
    };

    try {
      const res = await StudentServices.addStudent(payload);
      return res;
    } catch (err) {
      // alert("Failed to add student. Check console for details.");
      console.error("Error adding student:", err);
    }
  };

  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(sheet);

      const newStudents = excelData.map((row, index) => ({
        id: students.length + index + 1,
        name: row["Name"] || "",
        rollNo: row["Roll No"] || "",
        email: row["Email"] || "",
        branch: row["Branch"] || "Not specified",
        password: row["Password"] || `test${row["Roll No"]}`,
        status: row["Status"] || "Not Placed",
        package: row["Package"] || "", // New field for Placed students
        placement_date: row["Placement Date"] || "", // New field for Placed students
        placement_drive_id: row["Placement Drive ID"] || "", // New field for Placed students
      }));

      // Validate and add students
      newStudents.forEach((student) => {
        if (
          student.status === "Placed" &&
          (!student.package ||
            !student.placement_date ||
            !student.placement_drive_id)
        ) {
          console.warn(
            `Missing required fields for Placed student: ${student.name}`
          );
          return; // Skip this student if required fields are missing
        }

        if (addOneStudent(student)) {
          console.log(`Student ${student.name} added to DB`);
        }
      });

      setStudents((prev) => [
        ...prev,
        ...newStudents.filter(
          (student) =>
            student.status !== "Placed" ||
            (student.package &&
              student.placement_date &&
              student.placement_drive_id)
        ),
      ]);
      setActionsPerformed((prev) => !prev);
      setShowUploadModal(false);
      setSelectedTab("Student List");
    };
    reader.readAsBinaryString(file);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    if (
      !newStudent.name ||
      !newStudent.rollNo ||
      !newStudent.email ||
      !newStudent.branch ||
      !newStudent.password ||
      !newStudent.status
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (
      newStudent.status === "Placed" &&
      (!newStudent.package ||
        !newStudent.placement_date ||
        !newStudent.placement_drive_id)
    ) {
      alert(
        "Please fill in package, placement date, and placement drive for a placed student."
      );
      return;
    }

    try {
      if (addOneStudent(newStudent)) {
        console.log("Student added to DB:");
      }

      const newStudentData = {
        ...newStudent,
        id: `render_id${students.length + 1}`,
      };

      setStudents([...students, newStudentData]);
      setNewStudent({
        name: "",
        rollNo: "",
        email: "",
        branch: "",
        password: "",
        status: "Not Placed",
        package: "",
        placement_date: "",
        placement_drive_id: "",
      });
      setSelectedTab("Student List");
    } catch (err) {
      // alert("Failed to add student. Check console for details.");
      console.error("Error adding student:", err);
    }
  };

  const handleRemoveStudent = async (id) => {
    if (window.confirm("Are you sure you want to remove this student?")) {
      try {
         await StudentServices.removeStudent(id);
        setActionsPerformed((prev) => !prev);
      } catch (err) {
        alert("Failed to remove student. Check console for details.");
        console.error("Error removing student:", err);
      }
    }
  };

  const handleViewProfile = (student) => {
    navigate(`/student/profile?roll_no=${student.rollNo}`, {
      state: { student },
    });
  };

  const handleAddStudentTabClick = () => {
    setSelectedTab("Add Student");
  };

  return (
    <>
      <div className="main-page p-2 max-h-[calc(100vh+100px)]">
        <div className="header w-full flex flex-row justify-between items-center mb-1">
          <div className="flex items-center">
            <Notch
              text="Student List"
              selected={selectedTab === "Student List"}
              onClick={() => setSelectedTab("Student List")}
            />
            <Notch
              text="Add Student"
              selected={selectedTab === "Add Student"}
              onClick={handleAddStudentTabClick}
            />
          </div>
          {selectedTab === "Add Student" && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-[#2B2B8D] text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Upload Excel
            </button>
          )}
        </div>

        <div className="content mt-2">
          {selectedTab === "Student List" ? (
            <div className="max-h-[calc(100vh-125px)] overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Roll No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Branch
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
                  {students.map((student) => (
                    <tr key={student.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={user}
                            alt={student.name}
                            className="w-8 h-8 rounded-full transition-opacity duration-300 opacity-100"
                            loading="lazy"
                          />
                          <div className="ml-4">
                            <button
                              onClick={() => handleViewProfile(student)}
                              className="text-sm font-medium text-blue-600 hover:text-blue-900"
                            >
                              {student.name}
                            </button>
                            <div className="text-sm text-gray-500">
                              {student.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.rollNo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {student.branch}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            student.status === "Placed"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleViewProfile(student)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          View Profile
                        </button>
                        <button
                          onClick={() => handleRemoveStudent(student.id)}
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
          ) : (
            <div
              className={`bg-white p-6 rounded-lg ${
                newStudent.status === "Placed"
                  ? "max-h-[calc(100vh-10px)]"
                  : "max-h-[calc(100vh-125px)]"
              } `}
            >
              {showUploadModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                    <h3 className="text-lg font-semibold mb-4">Add Students</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Upload an Excel file or add a student manually.
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
                          setSelectedTab("Student List");
                        }}
                        className="bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {!showUploadModal && (
                <>
                  <h3 className="text-lg font-semibold mb-4">
                    Add New Student
                  </h3>
                  <form onSubmit={handleAddStudent}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={newStudent.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter student's name"
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
                        value={newStudent.rollNo}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter roll number"
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
                        value={newStudent.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter email"
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
                        value={newStudent.branch}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter branch (e.g., CSE)"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        name="status"
                        value={newStudent.status}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        required
                      >
                        <option value="Not Placed">Not Placed</option>
                        <option value="Placed">Placed</option>
                      </select>
                    </div>

                    {newStudent.status === "Placed" && (
                      <>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Package
                          </label>
                          <input
                            type="text"
                            name="package"
                            value={newStudent.package}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                            placeholder="Enter package (e.g., 60000)"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Placement Date
                          </label>
                          <input
                            type="date"
                            name="placement_date"
                            value={newStudent.placement_date}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                            required
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">
                            Placement Drive
                          </label>
                          <select
                            name="placement_drive_id"
                            value={newStudent.placement_drive_id}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                            required
                          >
                            <option value="">Select a Placement Drive</option>
                            {placementDrives.map((drive) => (
                              <option key={drive.id} value={drive.id}>
                                {drive.company}
                              </option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <input
                        type="password"
                        name="password"
                        value={newStudent.password}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
                        placeholder="Enter password"
                        required
                      />
                    </div>
                    <div className="flex justify-end space-x-4">
                      <button
                        type="submit"
                        className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                      >
                        Add Student
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedTab("Student List")}
                        className="bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-400 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AddStudent;

import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import SocialLinks from "../components/SocialLinks";
import ActivityAnalysis from "../components/ActivityAnalysis";
import ActivitiesAttended from "../components/ActiveAttendance";
import { ProfileServices } from "../services/profile-services";
import Loader from "../../loader/Loader";
import { StudentServices } from "../../../micro-apps/admin/add-students/services/student-services";

function formatToInputDate(dateStr) {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function canAdminEdit() {
  return localStorage.getItem("userRole") === "Admin";
}
function ProfilePage() {
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    userProfile: {
      name: "",
      email: "",
      batch: "",
      cgpa: "",
      degree: "",
      semester: "",
      skills: [],
      status: "",
      academics: [
        { label: "10th", value: "" },
        { label: "12th", value: "" },
        { label: "Graduation", value: "" },
      ],
      profileImage: "",
      package: "",
      placement_date: "",
      placement_drive_id: "",
      resume:""
    },
    profiles: [],
  });
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [placementDrives, setPlacementDrives] = useState([]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchPlacementDrives = async () => {
      try {
        const drives = await StudentServices.getDrives(); // Assume this API exists
        setPlacementDrives(drives);
      } catch (err) {
        console.error("Error fetching placement drives:", err);
      }
    };

    fetchPlacementDrives();

    return () => {
      abortController.abort();
    };
  }, []);

  // Extract roll_no from URL query params
  const queryParams = new URLSearchParams(location.search);
  const rollNo = queryParams.get("roll_no") || localStorage.getItem("rollNo");

  useEffect(() => {
    const fetchStudentProfile = async () => {
      setLoading(true);
      try {
        const student = await ProfileServices.getProfile(rollNo);
        setProfile({ ...student });
        setEditedProfile({
          userProfile: {
            ...student.userProfile,
            placement_date:formatToInputDate(student.userProfile.placement_date),
            skills: [...student.userProfile.skills],
            academics: [...student.userProfile.academics],
          },
          profiles: student.socialLinks.map((link) => ({
            profilePlatform: link.name,
            profileLink: link.url,
          })),
        });
        setLoading(false);
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentProfile();
  }, [rollNo]);

  // Handle edit toggle
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // Handle input changes in edit form
  const handleInputChange = (e, section, index) => {
    const { name, value } = e.target;

    if (section === "userProfile") {
      setEditedProfile((prev) => ({
        ...prev,
        userProfile: { ...prev.userProfile, [name]: value },
      }));
    } else if (section === "academics") {
      setEditedProfile((prev) => {
        const updatedAcademics = [...prev.userProfile.academics];
        updatedAcademics[index] = { ...updatedAcademics[index], value };
        return {
          ...prev,
          userProfile: { ...prev.userProfile, academics: updatedAcademics },
        };
      });
    } else if (section === "skills") {
      setEditedProfile((prev) => {
        const updatedSkills = [...prev.userProfile.skills];
        updatedSkills[index] = value;
        return {
          ...prev,
          userProfile: { ...prev.userProfile, skills: updatedSkills },
        };
      });
    } else if (section === "profiles") {
      setEditedProfile((prev) => {
        const updatedProfiles = [...prev.profiles];
        updatedProfiles[index] = {
          ...updatedProfiles[index],
          [name]: value,
        };
        return { ...prev, profiles: updatedProfiles };
      });
    }
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setEditedProfile((prev) => ({
        ...prev,
        userProfile: { ...prev.userProfile, profileImage: imageUrl },
      }));
    }
  };

  // Add new skill or profile
  const addItem = (section) => {
    setEditedProfile((prev) => {
      if (section === "skills") {
        return {
          ...prev,
          userProfile: {
            ...prev.userProfile,
            skills: [...prev.userProfile.skills, ""],
          },
        };
      } else if (section === "profiles") {
        return {
          ...prev,
          profiles: [
            ...prev.profiles,
            { profileLink: "", profilePlatform: "" },
          ],
        };
      }
      return prev;
    });
  };

  // Remove skill or profile
  const removeItem = (section, index) => {
    setEditedProfile((prev) => {
      if (section === "skills") {
        return {
          ...prev,
          userProfile: {
            ...prev.userProfile,
            skills: prev.userProfile.skills.filter((_, i) => i !== index),
          },
        };
      } else if (section === "profiles") {
        return {
          ...prev,
          profiles: prev.profiles.filter((_, i) => i !== index),
        };
      }
      return prev;
    });
  };

  // Handle save
  const handleSave = async () => {
    try {
      const payload = {
        skills: {
          technical: editedProfile.userProfile.skills.map((skill) => ({
            name: skill,
            proficiency: "medium", // Default proficiency, as not provided in editedProfile.skills
          })),
          soft: [], // Empty, as soft skills are not in editedProfile
        },
        userProfile: {
          autoRegister: true, // Default from PUT response, as not in editedProfile
          batch: editedProfile.userProfile.batch,
          email: editedProfile.userProfile.email,
          name: editedProfile.userProfile.name,
          phone: editedProfile.userProfile.phone_number,
          resume: editedProfile.userProfile.resume, // Not in editedProfile, default to empty
          rollNo: editedProfile.userProfile.roll_number,
          status: editedProfile.userProfile.status,
          package: editedProfile.userProfile?.package,
          placement_date: editedProfile.userProfile?.placement_date,
          placement_drive_id: editedProfile.userProfile?.placement_drive_id,
        },
        profiles: editedProfile.profiles.map((profile) => ({
          profileLink: profile.profileLink,
          profilePlatform: profile.profilePlatform,
        })),
        certifications: [], // Empty, as certifications are not in editedProfile
      };

      await ProfileServices.updateProfile(rollNo, payload);
      setProfile((prev) => ({
        ...prev,
        userProfile: { ...editedProfile.userProfile },
        socialLinks: editedProfile.profiles.map((profile) => ({
          name: profile.profilePlatform,
          url: profile.profileLink,
          username: profile.profilePlatform,
        })),
      }));
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (!profile && !loading) {
    return (
      <div className="p-4">Student not found for roll number: {rollNo}</div>
    );
  }

  if (profile && !loading) {
    var { userProfile, socialLinks, pieData, barData, activities } = profile;
  }

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="p-2 flex flex-col lg:flex-row gap-2">
          <div className="flex flex-col gap-4">
            <ProfileCard
              {...userProfile}
              current_profile_roll_no={rollNo}
              onEdit={handleEditToggle}
              isEditing={isEditing}
              editedProfile={editedProfile.userProfile}
              onInputChange={handleInputChange}
              onImageUpload={handleImageUpload}
              onSave={handleSave}
            />
          </div>

          <div className="flex flex-col gap-1 flex-grow px-1">
            <SocialLinks socialLinks={socialLinks} />
            <ActivityAnalysis pieData={pieData} barData={barData} />
            {activities?.length > 0 && (
              <ActivitiesAttended activities={activities} />
            )}
          </div>

          {/* Edit Modal */}
          {isEditing && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto flex-col">
              <div className=" rounded-lg shadow-lg w-full max-w-2xl  h-[650px]">
                <h3 className=" bg-white text-lg font-semibold p-4 pb-2 rounded-tl-lg rounded-tr-lg ">
                  Edit Profile
                </h3>

                <div className="inputs bg-white px-6  shadow-lg w-full max-w-2xl  h-[550px] overflow-y-auto">
                  {/* User Profile */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2">
                      Personal Information
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={editedProfile.userProfile.name || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={editedProfile.userProfile.email || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Phone Number
                        </label>
                        <input
                          type="phone"
                          name="phone"
                          value={editedProfile.userProfile.phone_number || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Batch
                        </label>
                        <input
                          type="number"
                          name="batch"
                          value={editedProfile.userProfile.batch || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Degree
                        </label>
                        <input
                          type="text"
                          name="degree"
                          value={editedProfile.userProfile.degree || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Semester
                        </label>
                        <input
                          type="text"
                          name="semester"
                          value={editedProfile.userProfile.semester || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          CGPA
                        </label>
                        <input
                          type="text"
                          name="cgpa"
                          value={editedProfile.userProfile.cgpa || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Resume or CV 
                        </label>
                        <input
                          type="text"
                          name="resume"
                          placeholder="Enter resume link"
                          value={editedProfile.userProfile.resume || ""}
                          onChange={(e) => handleInputChange(e, "userProfile")}
                          className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                      </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Status
                          </label>
                          <select
                            name="status"
                            value={editedProfile.userProfile.status || ""}
                            onChange={(e) =>
                              handleInputChange(e, "userProfile")
                            }
                            disabled={!canAdminEdit()}
                            className={`w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 ${!canAdminEdit() && 'cursor-not-allowed'}`}
                          >
                            <option value="Placed">Placed</option>
                            <option value="Not Placed">Not Placed</option>
                          </select>
                        </div>

                      {editedProfile.userProfile.status === "Placed" && (
                        <>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Package
                            </label>
                            <input
                              type="text"
                              name="package"
                              value={editedProfile.userProfile.package}
                              onChange={(e) =>
                                handleInputChange(e, "userProfile")
                              }
                              disabled={!canAdminEdit()}
                              className={`w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent ${!canAdminEdit() && 'cursor-not-allowed'}`}
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
                              value={editedProfile.userProfile.placement_date}
                              onChange={(e) =>
                                handleInputChange(e, "userProfile")
                              }
                              disabled={!canAdminEdit()}
                              className={`w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent ${!canAdminEdit() && 'cursor-not-allowed'}`}
                              required
                            />
                          </div>
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">
                              Placement Drive
                            </label>
                            <select
                              name="placement_drive_id"
                              value={editedProfile.userProfile.placement_drive_id}
                              onChange={(e) =>
                                handleInputChange(e, "userProfile")
                              }
                              disabled={!canAdminEdit()}
                              className={`w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent ${!canAdminEdit() && 'cursor-not-allowed'}`}
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

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Profile Image
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="w-full px-4 py-2 border-b border-gray-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Academic Scores */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2">
                      Academic Information
                    </h4>
                    {editedProfile.userProfile.academics.map(
                      (academic, index) => (
                        <div key={index} className="mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            {academic.label}
                          </label>
                          <input
                            type="text"
                            value={academic.value || ""}
                            onChange={(e) =>
                              handleInputChange(e, "academics", index)
                            }
                            className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                          />
                        </div>
                      )
                    )}
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2">Skills</h4>
                    {editedProfile.userProfile.skills.map((skill, index) => (
                      <div key={index} className="flex gap-4 mb-2 items-center">
                        <input
                          type="text"
                          value={skill}
                          onChange={(e) =>
                            handleInputChange(e, "skills", index)
                          }
                          placeholder="Skill Name"
                          className="flex-1 px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                        <button
                          onClick={() => removeItem("skills", index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addItem("skills")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      + Add Skill
                    </button>
                  </div>

                  {/* Profiles */}
                  <div className="mb-6">
                    <h4 className="text-md font-medium mb-2">Profiles</h4>
                    {editedProfile.profiles.map((profile, index) => (
                      <div key={index} className="flex gap-4 mb-2 items-center">
                        <input
                          type="text"
                          name="profilePlatform"
                          value={profile.profilePlatform}
                          onChange={(e) =>
                            handleInputChange(e, "profiles", index)
                          }
                          placeholder="Platform (e.g., leetcode)"
                          className="flex-1 px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                        <input
                          type="text"
                          name="profileLink"
                          value={profile.profileLink}
                          onChange={(e) =>
                            handleInputChange(e, "profiles", index)
                          }
                          placeholder="Profile URL"
                          className="flex-1 px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600"
                        />
                        <button
                          onClick={() => removeItem("profiles", index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => addItem("profiles")}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      + Add Profile
                    </button>
                  </div>
                </div>
                {/* Save/Cancel Buttons */}
                <div className="flex justify-end space-x-4 bg-white text-lg font-semibold p-2 px-4 rounded-bl-lg rounded-br-lg border-1 border-t">
                  <button
                    onClick={handleSave}
                    className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleEditToggle}
                    className="bg-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-400 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ProfilePage;

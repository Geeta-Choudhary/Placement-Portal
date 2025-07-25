/* eslint-disable react/prop-types */
import { FaEdit } from "react-icons/fa";
import profileImageLocal from "../../../assets/user.png";

function canStudentEdit(rollNo){
  return (localStorage.getItem("userRole") ==="Student" && 
           localStorage.getItem("rollNo") == rollNo )
}
function canAdminEdit(){
  return localStorage.getItem("userRole") === "Admin" 
}

function ProfileCard({
  name,
  degree,
  profileImage,
  status,
  skills,
  email,
  cgpa,
  batch,
  semester,
  academics,
  onEdit,
  phone_number,
  current_profile_roll_no,
  resume
}) {
  return (
    <div className="bg-white shadow-md rounded-lg p-0 w-80 overflow-auto h-auto min-h-[89vh]">
      {/* Status Badge */}
      <div className="flex justify-between px-2 items-center py-1">
        <span
          className={`px-3 py-1 rounded text-sm text-white ${
            status === "Placed" ? "bg-green-600" : "bg-red-500"
          }`}
        >
          {status}
        </span>
        { (canStudentEdit(current_profile_roll_no) || canAdminEdit() )  && <FaEdit
          className="text-gray-400 cursor-pointer hover:text-gray-600"
          onClick={onEdit}
        />}
      </div>

      {/* Profile Image */}
      <div className="bg-gray-100 py-6 px-4 pb-4">
        <div className="flex justify-center mt-4">
          <img
            src={profileImage === "profileImage" ? profileImageLocal : profileImage}
            alt="User Profile"
            className="w-48 h-48 rounded-full border object-cover"
          />
        </div>

        {/* User Info */}
        <div className="text-center mt-4">
          <h2 className="text-xl font-semibold">{name}</h2>
          <p className="text-gray-500">{degree}</p>
        </div>

        {/* Skill Tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="bg-gray-200 text-gray-700 px-3 py-1 text-xs rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 text-sm">
        <p className="m-4">
          <strong>Email: </strong> {email}
        </p>
        <p className="m-4">
          <strong>Phone Number: </strong> {phone_number}
        </p>
        <p className="m-4">
          <strong>Current CGPA: </strong> {cgpa}
        </p>
        <p className="m-4">
          <strong>Batch: </strong> {batch}
        </p>
        <p className="m-4">
          <strong>Current Semester: </strong> {semester}
        </p>
        {academics.map((item, index) => (
          <p key={index} className="m-4">
            <strong>{item.label}: </strong> {item.value}
          </p>
        ))}
        {resume && <p className="m-4 mt-1">
          <strong>Resume/CV:</strong> <a href={resume} target="_blank" className="text-blue-500">View</a>
        </p>}
     
      </div>
    </div>
  );
}

export default ProfileCard;
import { FaBuilding, FaCalendarAlt, FaBriefcase, FaBookmark } from "react-icons/fa";

/* eslint-disable react/prop-types */
function PlacementCard({ company, role, package: pkg, lastDate, branches, skills, status }) {
  return (
    <div className="w-72 bg-white  rounded-[3px] p-4 border border-gray-200 flex flex-col h-full hover:shadow-md">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <FaBuilding className="text-blue-600 text-xl" />
          <div>
            <h2 className="font-semibold text-lg">{company}</h2>
            <p className="text-sm text-gray-500">{role}</p>
          </div>
        </div>
        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
          {status}
        </span>
      </div>

      {/* Job Details */}
      <div className="mt-3 space-y-2 text-sm text-gray-600 flex-grow">
        <div className="flex items-center gap-2">
          <FaBriefcase className="text-gray-500" />
          <p>Package: <span className="font-medium">{pkg}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <FaCalendarAlt className="text-gray-500" />
          <p>Last Date: <span className="font-medium">{lastDate}</span></p>
        </div>
        <div className="flex items-center gap-2">
          <FaBookmark className="text-gray-500" />
          <p>Eligible Branches: <span className="font-medium">{branches.join(", ")}</span></p>
        </div>
      </div>

      {/* Skills Section */}
      <div className="mt-3 flex flex-wrap gap-2 flex-grow mb-4">
        {skills.map((skill, index) => (
          <span 
            key={index} 
            className="text-blue-600 bg-blue-100 px-3 py-1 text-xs font-medium rounded-md"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="mt-auto w-full">
  <button 
    className="flex items-center justify-center gap-2 border border-[#0052CC] text-[#0052CC] 
               px-5 py-2 rounded-[3px] text-sm font-medium hover:bg-[#0052CC] hover:text-white 
               transition duration-200 shadow-md focus:ring-2 focus:ring-[#0052CC] 
               focus:ring-opacity-50 w-full"
  >
    <div className="flex justify-center items-center w-full p-0">
      <div>Register</div>   
    </div>
  </button>
</div>

    </div>
  );
}

export default PlacementCard;

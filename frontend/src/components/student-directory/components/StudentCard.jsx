/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import user from "../../../assets/user1.png";

function StudentCard({ name, acadamic_details, skills, placement_status, onViewDetails }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
      <div className="p-3">
        <div className="flex items-center space-x-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
            <p className="text-sm text-gray-500">{acadamic_details.year} Batch</p>
          </div>
        </div>
        <div className="mt-2">
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              ></path>
            </svg>
            {acadamic_details.current_semester} Semester
          </div>
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              ></path>
            </svg>
            CGPA: {acadamic_details.CGPA}
          </div>
          {/* <div className="flex items-center text-sm text-gray-500">
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${
                placement_status === "placed"
                  ? "bg-green-100 text-green-800"
                  : placement_status === "internship"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {placement_status}
            </span>
          </div> */}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.slice(0, 4).map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-gray-500">No skills listed</span>
          )}
        </div>
        <button
          onClick={onViewDetails}
          className="mt-4 w-full px-4 py-2 bg-[#2B2B8D] text-white rounded-md hover:bg-blue-700 transition duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
}

export default StudentCard;
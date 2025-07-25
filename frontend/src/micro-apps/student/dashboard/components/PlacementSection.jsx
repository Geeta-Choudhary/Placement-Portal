/* eslint-disable react/prop-types */
// import React from 'react'
import user from "../../../../assets/user.png";
function PlacementSection({ students }) {
  return (
    <div>
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Placements
          </h2>
        </div>
        <div className="p-4 h-72 overflow-auto">
          <div className="space-y-4">
            {students &&
              students.length > 0 &&
              students.map((student) => (
                <div className="flex items-center space-x-4" key={student.id}>
                  <img
                    src={user}
                    alt="Student"
                    className="w-10 h-10 rounded-full transition-opacity duration-300 opacity-100"
                    loading="lazy"
                  />
                  <div>
                    <h3 className="text-sm font-medium text-gray-800">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {student.position} at {student.company}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlacementSection;

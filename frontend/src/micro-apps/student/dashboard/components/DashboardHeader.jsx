/* eslint-disable react/prop-types */
// import DashboardHeaderCard from "./DashboardHeaderCard"
// import headerCard01 from "../../assets/dashboard/header-card-01.svg"
// import headerCard02 from "../../assets/dashboard/header-card-02.svg"
function DashboardHeader({
  totalStudents,
  totalPlaced,
  runningDrives,
  totalNotice,
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Students</p>
            <h3 className="text-xl font-semibold text-gray-800">
              {totalStudents}
            </h3>
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100">
            <svg
              className="w-6 h-6 text-green-600"
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
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Placed Students</p>
            <h3 className="text-xl font-semibold text-gray-800">
              {totalPlaced}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-yellow-100">
            <svg
              className="w-6 h-6 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Drives</p>
            <h3 className="text-xl font-semibold text-gray-800">
              {runningDrives}
            </h3>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100">
            <svg
              className="w-6 h-6 text-purple-600"
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
          </div>
          <div className="ml-4">
            <p className="text-sm text-gray-500">Total Notices</p>
            <h3 className="text-xl font-semibold text-gray-800">
              {totalNotice}
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardHeader;

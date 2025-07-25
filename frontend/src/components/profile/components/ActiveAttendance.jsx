/* eslint-disable react/prop-types */
import { FaBell, FaCheckCircle } from "react-icons/fa";

const iconMap = {
  "preplacement": <FaBell className="text-blue-500" />,
  "drive": <FaCheckCircle className="text-green-500" />
};
function ActivitiesAttended({activities}) {
  return (
    <div className="bg-white shadow-md rounded-lg  ">
      <h3 className="text-lg font-semibold border-gray-200 border-b px-4 py-2">Activities</h3>
      <div className="p-4 space-y-4 overflow-auto h-[220px] mb-2">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="text-xl">{iconMap[activity.category]}</div>
            <div>
              <p className="font-semibold">{activity.title}</p>
              <p className="text-sm text-gray-600">{activity.description}</p>
              <p className="text-xs text-gray-400">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ActivitiesAttended;

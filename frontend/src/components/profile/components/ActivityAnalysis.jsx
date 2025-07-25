/* eslint-disable react/prop-types */
import PieChart from "./PieChart";
import BarChart from "./BarChart";

function ActivityAnalysis({pieData,barData}) {

  return (
    <div className="bg-white  shadow-md rounded-lg h-50 px-0">
      <h2 className="text-lg font-semibold mb-2 border-gray-200 border-b px-4 py-2">Activity Analysis</h2>
      <div className="flex flex-col lg:flex-row justify-between gap-6">
        {/* Pie Chart */}
        <div className="w-full lg:w-1/2">
          <PieChart data={pieData}/>
        </div>

        {/* Bar Chart */}
        <div className="w-full lg:w-1/2">
          <BarChart data={barData} />
        </div>
      </div>
    </div>
  );
}

export default ActivityAnalysis;




// import { PieChart, Pie, Cell, Legend, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

// const pieData = [
//   { name: "Coding", value: 40, color: "#2B6CB0" },
//   { name: "Aptitude", value: 35, color: "#48BB78" },
//   { name: "Communication", value: 25, color: "#ED8936" }
// ];

// const barData = [
//   { name: "Mon", value: 100 },
//   { name: "Tue", value: 200 },
//   { name: "Wed", value: 170 },
//   { name: "Thu", value: 70 },
//   { name: "Fri", value: 60 },
//   { name: "Sat", value: 120 },
//   { name: "Sun", value: 140 }
// ];

// function ActivityAnalysis() {
//   return (
//     <div className="bg-white shadow-md rounded-lg p-4 h-80">
//       <h3 className="text-lg font-semibold">Pre-Placement Activity Analysis</h3>
//       <div className="flex justify-between mt-4">
//         {/* Pie Chart */}
//         <PieChart width={150} height={150}>
//           <Pie data={pieData} dataKey="value" outerRadius={50}>
//             {pieData.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Legend />
//         </PieChart>

//         {/* Bar Chart */}
//         <BarChart width={200} height={150} data={barData}>
//           <XAxis dataKey="name" />
//           <YAxis />
//           <Tooltip />
//           <Bar dataKey="value" fill="#2B6CB0" />
//         </BarChart>
//       </div>
//     </div>
//   );
// }

// export default ActivityAnalysis;

// import PieChart from "./PieChart";

// const activityData = [
//   { value: 1048, name: "Coding" },
//   { value: 735, name: "Aptitude" },
//   { value: 580, name: "Communication" },
// ];

// function ActivityAnalysis() {
//   return (
//     <div className="bg-white shadow-md rounded-lg p-4">
//       <h3 className="text-lg font-semibold">Pre-Placement Activity Analysis</h3>
//       <PieChart data={activityData} />
//     </div>
//   );
// }

// export default ActivityAnalysis;

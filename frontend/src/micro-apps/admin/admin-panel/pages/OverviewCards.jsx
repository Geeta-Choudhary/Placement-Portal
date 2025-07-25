/* eslint-disable react/prop-types */
// src/components/admin/OverviewCards.jsx
const OverviewCards = ({total_students,placed_students,total_drives,total_coordinators}) => {
    const cards = [
      {
        title: "Total Students",
        value: total_students,
        icon: (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        ),
        bgColor: "bg-blue-100",
      },
      {
        title: "Placed Students",
        value: placed_students,
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        ),
        bgColor: "bg-green-100",
      },
      {
        title: "Drives",
        value: total_drives,
        icon: (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path>
          </svg>
        ),
        bgColor: "bg-yellow-100",
      },
      {
        title: "Total Coordinators",
        value: total_coordinators,
        icon: (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        ),
        bgColor: "bg-purple-100",
      },
    ];
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-white p-6 rounded-lg border border-gray-200 ">
            <div className="flex items-center">
              <div className={`p-3 rounded-full ${card.bgColor} mr-4`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.title}</p>
                <h3 className="text-xl font-semibold text-gray-800">{card.value}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default OverviewCards;
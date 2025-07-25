/* eslint-disable react/prop-types */

const infoImage = () => {
  return (
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
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
      ></path>
    </svg>
  );
};
const successImage = () => {
  return (
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
  );
};
const getNoticeImage = (type) => {
  switch (type) {
    case "info":
      return infoImage();
    case "success":
      return successImage();
    case "general":
      return infoImage();
  }
};

function NoticesSections({ notices }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 ">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Recent Notices</h2>
      </div>
      <div className="p-4 max-h-72 overflow-auto">
        <div className="space-y-4">
          {notices &&
            notices.length > 0 &&
            notices.map((notice) => (
              <div className="flex items-center space-x-4" key={notice.id}>
                <div className="p-2 bg-blue-100 rounded-lg">
                  {getNoticeImage(notice.type)}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800">
                    {notice.title}
                  </h3>
                  <p className="text-sm text-gray-500">{notice.description}</p>
                  <p className="text-xs text-gray-400">{notice.date_time}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

export default NoticesSections;

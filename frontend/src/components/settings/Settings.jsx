import { useState } from "react";

function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "password", label: "Password" },
    { id: "notifications", label: "Notifications" },
  ];

  return (
    <div id="settings" className="min-h-screen p-6">
      {/* Settings Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Settings</h2>
        </div>
        <nav className="flex flex-col sm:flex-row">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-6 py-3 font-medium ${
                activeTab === tab.id
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === "profile" && (
          <>
            {/* Profile Photo */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Profile Photo</h3>
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 bg-gray-200 rounded-full" /> {/* Placeholder */}
                <div className="flex space-x-3">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    Upload New
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                    Remove
                  </button>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Personal Information</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      defaultValue="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="john.doe@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="+1 234 567 890"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {activeTab === "password" && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Password</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="lg:col-span-2 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Notification Preferences</h3>
            <div className="space-y-4">
              {[
                { title: "Email Notifications", desc: "Receive notifications about new placement drives" },
                { title: "SMS Notifications", desc: "Receive important updates via SMS" },
                { title: "Browser Notifications", desc: "Receive desktop notifications" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-800">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked={index % 2 === 0} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
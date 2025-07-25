/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { FaRegBell } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";
function Header({ isAuthenticated, onLogout, userName, userRole }) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    onLogout();
    setIsModalOpen(false);
    navigate("/");
  };

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  return (
    <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-3">
        <div className="flex items-center justify-between h-12">
          <div className="flex items-center justify-start h-16">
            <img src={logo} alt="logo" className="h-9 px-2" />
            <h1 className="text-xl text-gray-800">Fergusson</h1>
          </div>
          <div className="flex items-center space-x-4">
            <button
              className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Notifications"
            >
              <FaRegBell />
            </button>

            {isAuthenticated && (
              <button
                onClick={toggleModal}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="User Profile"
              >
                <FaRegUser />
              </button>
            )}
          </div>
        </div>
      </div>

      {isModalOpen && isAuthenticated && (
  <div className="fixed inset-0 z-50 flex items-start justify-end p-4">
    {/* Background Overlay */}
    <div
      className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm"
      onClick={toggleModal}
    ></div>

    {/* Modal Content */}
    <div className="relative bg-white rounded-xl shadow-lg w-72 p-6 z-50 mr-4 mt-16 border border-gray-300">
      <div className="flex flex-col items-center text-center">

        {/* User Icon */}
        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-8 h-8 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>

        {/* User Info */}
        <p className="text-base font-semibold text-gray-800">{userName}</p>
        <p className="text-sm text-gray-500 mt-1">{userRole}</p>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="mt-5 bg-[#2B2B8D] hover:bg-[#1f1f6d] text-white font-semibold text-sm py-2 px-6 rounded-full shadow transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default Header;

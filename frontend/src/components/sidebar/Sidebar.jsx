/* eslint-disable react/prop-types */
import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setHeaderTitle } from '../../store/headerSlice';

function Sidebar({ role }) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [activePath, setActivePath] = useState(localStorage.getItem('activePath') || location.pathname);

  const dispatch = useDispatch();

  // Update localStorage and activePath when location changes
  useEffect(() => {
    setActivePath(location.pathname);
    localStorage.setItem('activePath', location.pathname);
  }, [location.pathname]);

  const isActive = (path) => activePath === path;

  const handleOnClick = (name, path) => {
    dispatch(setHeaderTitle(name));
    setActivePath(path);
    localStorage.setItem('activePath', path);
  };

  // Define links for each role
  const adminLinks = [
    { to: "/admin/dashboard", name: "Dashboard" },
    { to: "/admin/manage-students", name: "Students" },
    { to: "/admin/manage-drive", name: "Drives" },
    { to: "/admin/notice", name: "Notices" },
    { to: "/admin/manage-coordinators", name: "Coordinators" },
    { to: "/admin/directory", name: "Directory" },
  ];

  const studentLinks = [
    { to: "/student/dashboard", name: "Dashboard" },
    { to: "/student/registrations", name: "Registrations" },
    { to: "/student/directory", name: "Directory" },
    { to: "/student/profile", name: "Profile" },
  ];

  const placementCoordinatorsLinks = [
    { to: "/pc/manage-activity", name: "Activity" },
    { to: "/pc/directory", name: "Directory" },
    { to: "/pc/profile", name: "Profile" },
  ];

  function getRoleLinks(role) {
    if (role === "Admin") {
      return adminLinks;
    } else if (role === "Student") {
      return studentLinks;
    } else {
      return placementCoordinatorsLinks;
    }
  }

  const links = getRoleLinks(role);

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden lg:flex flex-col w-60 bg-white fixed my-16">
        <div className="flex-1 space-y-2 p-4 pt-0 px-0 pl-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => handleOnClick(link.name, link.to)}
              className={`block px-3 py-2 text-sm transition-colors duration-200 ${
                isActive(link.to)
                  ? 'bg-[#2B2B8D] text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 right-4 z-20">
        <button
          type="button"
          className="w-10 h-10 flex items-center justify-center bg-[#2B2B8D] text-white rounded-md hover:bg-blue-700 transition focus:outline-none"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className={`w-6 h-6 ${isOpen ? 'hidden' : 'block'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
          <svg
            className={`w-6 h-6 ${isOpen ? 'block' : 'hidden'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-10">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsOpen(false)}
          />
          <nav className="relative bg-white w-64 h-full flex flex-col border-2 border-gray-300 shadow-lg polygon-border">
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
              <h1 className="text-xl font-bold text-gray-800">CS Placements</h1>
            </div>
            <div className="flex-1 px-4 py-6 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block px-3 py-2 text-sm transition-colors duration-200 ${
                    isActive(link.to)
                      ? 'bg-[#2B2B8D] text-white font-medium rounded-md'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => {
                    handleOnClick(link.name, link.to);
                    setIsOpen(false);
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

export default Sidebar;
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Notch from "../notch/Notch"; // Adjust the path based on your project structure
import logo from "../../assets/logo.png";

const Login = ({ onLogin  , loading }) => {
  const [role, setRole] = useState("Student");
  const [identifier, setIdentifier] = useState(""); // Can be rollNo or email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Check if already logged in on component mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedRole = localStorage.getItem("userRole");
    if (storedAuth === "true" && storedRole) {
      if (storedRole === "Coordinator") {
        navigate("/pc/manage-activity");
      } else if (storedRole === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = onLogin(identifier, password, role);
    if (success) {
      if (role === "Coordinator") {
        navigate("/pc/manage-activity");
      } else if (role === "Admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/student/dashboard");
      }
    } else {
      setError("Invalid credentials or role");
    }
  };

  return (
    <div className="flex h-screen font-sans">
      {/* Left Section */}
      <div className="w-1/2 bg-white flex flex-col justify-start pl-10">
        <div className="flex items-center mb-4 py-24 px-10 pb-10 border-gray-300 shadow-sm">
          <div className="w-48 h-48 rounded-full flex items-center justify-center mr-4">
            <img src={logo} alt="" />
          </div>
          <div>
            <h1 className="text-3xl font-bold space-y-4 text-gray-700 font-trykker">
              {"Deccan Education Society's"}
            </h1>
            <h1 className="text-3xl font-bold text-pink-600 space-y-4 font-trykker">
              Fergusson College
            </h1>
            <p className="text-sm text-gray-600">(Autonomous)</p>
          </div>
        </div>

        <ul className="space-y-4 text-gray-700 px-10 pt-10">
          <li className="flex items-center">
            <span className="w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
            Explore the latest placement opportunities.
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
            Track your applications effortlessly
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
            Stay updated with schedules and event
          </li>
          <li className="flex items-center">
            <span className="w-2 h-2 bg-pink-600 rounded-full mr-2"></span>
            Monitor your pre-placement activity performance
          </li>
        </ul>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-1/2 bg-blue-50 flex flex-col justify-center items-center p-5">
        <h2 className="text-lg font-semibold text-gray-800 mb-6">
          Log in to Fergusson College Placement Portal
        </h2>

        {!loading && error && <p className="text-red-500 mb-4">{error}</p>}
        {/* {loading ? <p className="text-red-500 mb-4">{"Authentication in progress"}</p> : <p className="text-red-500 mb-4">{""}</p> } */}

        {/* Notch Tabs for Role Selection */}
        <div className="w-full max-w-sm flex flex-row justify-start items-center mb-6">
          <Notch
            text="Student"
            selected={role === "Student"}
            onClick={() => setRole("Student")}
          />
          <Notch
            text="Admin"
            selected={role === "Admin"}
            onClick={() => setRole("Admin")}
          />
          <Notch
            text="Coordinators"
            selected={role === "Coordinator"}
            onClick={() => setRole("Coordinator")}
          />
        </div>

        <form className="w-full max-w-sm" onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type={role === "Admin" ? "email" : "text"}
              placeholder={role === "Admin" ? "Enter Email" : "Enter Roll No."}
              className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
              value={identifier}
              onChange={(e) => { setIdentifier(e.target.value) , setError("")}}
              required
            />
          </div>
          <div className="mb-6">
            <input
              type="password"
              placeholder="Enter Password"
              className="w-full px-4 py-2 border-b border-gray-300 focus:outline-none focus:border-blue-600 bg-transparent"
              value={password}
              onChange={(e) => { setPassword(e.target.value) , setError("")}}
              required
            />
          </div>
          <div className="w-full flex flex-row justify-end items-center">
            <button
              type="submit"
              className="bg-[#2B2B8D] text-white font-medium py-2 px-6 rounded-md hover:bg-blue-700 transition ml-auto"
            >
              Login
            </button>
          </div>
        </form>

        <p className="text-sm text-gray-600 mt-10">
          Made with <span className="text-red-500">❤️</span> by Computer Science
          department
        </p>
      </div>
    </div>
  );
};

export default Login;

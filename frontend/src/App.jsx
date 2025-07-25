/* eslint-disable react/prop-types */
import "./App.css";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Dashboard from "./micro-apps/student/dashboard/pages/Dashboard";
import Sidebar from "./components/sidebar/Sidebar";
import StudentDirectory from "./components/student-directory/pages/StudentDirectory";
import ProfilePage from "./components/profile/pages/ProfilePage";
import AdminPanel from "./micro-apps/admin/admin-panel/pages/AdminPanel";
import Settings from "./components/settings/Settings";
import Header from "./components/header/Header";
import Registrations from "./micro-apps/student/registration/pages/Registrations";
import Login from "./components/login/Login";
import AddStudent from "./micro-apps/admin/add-students/pages/AddStudents";
import AddDrives from "./micro-apps/admin/add-drives/pages/AddDrives";
import AddNotice from "./micro-apps/admin/add-notice/pages/AddNotice";
import AddPlacementCoordinators from "./micro-apps/admin/add-coordinators/pages/AddPlacementCoordinators";
import PlacementCoordinator from "./micro-apps/placement-coordinator/pages/PlacementCoordinator";
import PlacementClient from "./components/authenticator/authenticate";

const getLogin = async (payload) => {
    return await PlacementClient.post("http://localhost:5000/v1/auth/login", payload);
};

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLogin] = useState(false);
  const navigate = useNavigate();

  // Check localStorage only once on initial mount
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedRole = localStorage.getItem("userRole");
    const storedName = localStorage.getItem("userName");

    if (storedAuth === "true" && storedRole) {
      setIsAuthenticated(true);
      setUserRole(storedRole);
      setUserName(storedName);
    }
  }, []); // Empty dependency array to run only on mount

  const handleLogin = (identifier, password, role) => {
    const payload = {
      "password": password,
      "role":role
  }
  if(role == "Admin")
    payload["email"] = identifier
  else 
    payload["roll_no"] = identifier

    try{
    setLogin(true);

      getLogin(payload).then((user)=>{
        if (user && user.role) {
          setIsAuthenticated(true);
          setUserRole(user.role);
          setUserName(user.name);
    
          // Store in localStorage
          localStorage.setItem("isAuthenticated", "true");
          localStorage.setItem("userRole", user.role);
          localStorage.setItem("userName", user.name);
          localStorage.setItem("id", user.id);
          if(user.rollNo)
            localStorage.setItem("rollNo", user.rollNo);
          else
            localStorage.setItem("rollNo", user.email);
    
    
          // Redirect based on role only on login
          if (user.role === "Admin") {
            navigate("/admin/dashboard");
          } else if (user.role === "Coordinator") {
            navigate("/pc/manage-activity");
          } else {
            navigate("/student/dashboard");
          }
          return true;
        }
        setLogin(false);
        return false;
      });
    }
    catch {
      setLogin(false);
      console.log("loin failed");
    }
  
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserName(null);

    // Clear localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    navigate("/"); // Redirect to login page on logout
  };

  const ProtectedRoute = ({ element, allowedRoles }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      // Redirect to the appropriate role-specific dashboard only if accessing unauthorized route
      if (userRole === "Admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else if (userRole === "Coordinator") {
        return <Navigate to="/pc/manage-activity" replace />;
      } else {
        return <Navigate to="/student/dashboard" replace />;
      }
    }
    return element;
  };

  // Default route logic
  const getDefaultRoute = () => {
    if (!isAuthenticated) return <Login onLogin={handleLogin} loading={loading} />;
    if (userRole === "Admin") return <Navigate to="/admin/dashboard" replace />;
    if (userRole === "Coordinator")
      return <Navigate to="/pc/manage-activity" replace />;
    return <Navigate to="/student/dashboard" replace />;
  };

  return (
    <div className="app-container">
      {isAuthenticated && (
        <Header
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          userName={userName}
          userRole={userRole}
        />
      )}
      {isAuthenticated && <Sidebar role={userRole} />}

      <div className="flex flex-1">
        <main
          className={`main-content ${
            isAuthenticated ? "ml-0 lg:ml-60" : "ml-0"
          }`}
        >
          <Routes>
            {/* Default Route */}
            <Route path="/" element={getDefaultRoute()} />

            {/* Student Routes */}
            <Route
              path="/student/dashboard"
              element={
                <ProtectedRoute
                  element={<Dashboard />}
                  allowedRoles={["Student", "Coordinator"]}
                />
              }
            />
            <Route
              path="/student/registrations"
              element={
                <ProtectedRoute
                  element={<Registrations />}
                  allowedRoles={["Student", "Coordinator"]}
                />
              }
            />
            <Route
              path="/student/directory"
              element={
                <ProtectedRoute
                  element={<StudentDirectory />}
                  allowedRoles={["Student", "Coordinator"]}
                />
              }
            />
            <Route
              path="/student/profile"
              element={
                <ProtectedRoute
                  element={<ProfilePage />}
                  allowedRoles={["Student", "Coordinator", "Admin"]}
                />
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute
                  element={<AdminPanel />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-students"
              element={
                <ProtectedRoute
                  element={<AddStudent />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-drive"
              element={
                <ProtectedRoute
                  element={<AddDrives />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/notice"
              element={
                <ProtectedRoute
                  element={<AddNotice />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/student-profile/:id"
              element={
                <ProtectedRoute
                  element={<ProfilePage />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/manage-coordinators"
              element={
                <ProtectedRoute
                  element={<AddPlacementCoordinators />}
                  allowedRoles={["Admin"]}
                />
              }
            />
            <Route
              path="/admin/directory"
              element={
                <ProtectedRoute
                  element={<StudentDirectory />}
                  allowedRoles={["Student", "Coordinator", "Admin"]}
                />
              }
            />

            {/* Coordinator Routes */}
            <Route
              path="/pc/manage-activity"
              element={
                <ProtectedRoute
                  element={<PlacementCoordinator />}
                  allowedRoles={["Coordinator"]}
                />
              }
            />
            <Route
              path="/pc/directory"
              element={
                <ProtectedRoute
                  element={<StudentDirectory />}
                  allowedRoles={["Student", "Coordinator"]}
                />
              }
            />
            <Route
              path="/pc/profile"
              element={
                <ProtectedRoute
                  element={<ProfilePage />}
                  allowedRoles={["Student", "Coordinator", "Admin"]}
                />
              }
            />

            {/* Shared Route for All Roles */}
            <Route
              path="/admin/setting"
              element={
                <ProtectedRoute
                  element={<Settings />}
                  allowedRoles={["Student", "Coordinator", "Admin"]}
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;

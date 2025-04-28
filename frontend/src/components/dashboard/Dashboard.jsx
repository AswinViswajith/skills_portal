import { Outlet, Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState } from "react";
import { Home, Briefcase, FileText, Users, LogOut } from "lucide-react";
import logo from "../../assets/images/logo.png";

const Dashboard = () => {
  const userRole = useSelector((state) => state.persisted.user.role);
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);
  

  const isActive = (path) => location.pathname.includes(path);

  const menuByRole = {
    admin: [
      { name: "Master Data", icon: <FileText size={20} />, path: "/master" },
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Skills", icon: <FileText size={20} />, path: "/skills" },
      { name: "Requests", icon: <Briefcase size={20} />, path: "/requests" },
      { name: "Profile", icon: <Users size={20} />, path: "/profile" },
      { name: "Logout", icon: <LogOut size={20} />, path: "/logout" },
    ],
    faculty: [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Skills", icon: <FileText size={20} />, path: "/skills" },
      { name: "Requests", icon: <Briefcase size={20} />, path: "/requests" },
      { name: "Profile", icon: <Users size={20} />, path: "/profile" },
      { name: "Logout", icon: <LogOut size={20} />, path: "/logout" },
    ],
    student: [
      { name: "Dashboard", icon: <Home size={20} />, path: "/dashboard" },
      { name: "Profile", icon: <Users size={20} />, path: "/profile" },
      { name: "Logout", icon: <LogOut size={20} />, path: "/logout" },
    ],
  };

  const menuItems = menuByRole[userRole] || [];

  return (
    <div className={`flex min-h-screen transition-all duration-300 ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-100 text-gray-800"}`}>
      {/* Sidebar */}
      <aside className={`w-64 h-screen bg-white shadow-lg flex flex-col justify-between p-4 fixed`}>
        {/* Logo */}
        <div className="flex items-center space-x-2 mb-8">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-lg font-semibold">Skills BIT</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <ul className="space-y-4">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition duration-200 ${
                    isActive(item.path)
                      ? "bg-green-500 text-white"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Upgrade Section */}
        <div className="bg-green-100 text-center p-4 rounded-lg">
          {/* <h3 className="text-green-700 font-semibold">Upgrade to Premium</h3> */}
          <p className="text-sm text-gray-600">⚙️ Logged in as {userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-6 w-full overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Dashboard;

import FacultyDashboard from "./FacultyDashboard";
import AdminDashboard from "./AdminDashboard";
import { useSelector } from 'react-redux';
import StudentDashboard from "./StudentDashboard";


function MainDashboard() {
    const userRole = useSelector((state) => state.persisted.user.role);
    return (
    <div>
        {userRole === "faculty" && <FacultyDashboard />}
        {userRole === "admin" && <AdminDashboard />}
        {userRole === "student" && <StudentDashboard />}
    </div>
    )
}

export default MainDashboard

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store, persistor } from "./store/store";
import Login from "./components/LoginPage";
import ProtectedRoute from "./components/ProtectedRoutes";
import { PersistGate } from "redux-persist/integration/react";
import Logout from "./components/Logout";
import Dashboard from "./components/dashboard/Dashboard";
import MasterDataPage from "./components/masterData/MasterDataPage";
import Profile from "./components/Profile";
import MainDashboard from "./components/dashboard/MainDashboard";
import General from "./components/general/General";
import Skills from "./components/Skills/Skills";
import Request from "./components/request/Request";
import CoursePage from "./components/course/CoursePage";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            {/* <Route path="/forms/:formId" element={<Form1 />} /> */}

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Dashboard />}>
                <Route path="/master" element={<MasterDataPage />} />
                <Route index element={<Navigate to="/dashboard" />} />
                <Route path="/general" element={<General />} />
                <Route path="/skills" element={<Skills />} />
                <Route path="/course/:skillId" element={<CoursePage/>} />
                <Route path="/requests" element={<Request/>} />
                <Route path="/profile" element={<Profile />} /> 
                <Route path="/dashboard" element={<MainDashboard />} />
                <Route path="logout" element={<Logout />} />
                <Route path="*" element={<h2>404 Not Found</h2>} />
              </Route>
            </Route>

            {/* Redirect unmatched routes */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </PersistGate>
    </Provider>
  );
}

export default App;

import React, { useEffect } from "react";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { message } from "antd";
import axiosInstance from "../config/axios";
import logo from "../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/reducers/userReducer";
import { setBatchYearState,setDepartmentState } from "../store/reducers/classReducer";

const Login = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const clientId = import.meta.env.VITE_SSO_CLIENT_ID
  
    const validateToken = async () => {
      const token = localStorage.getItem("authToken");
  
      if (token) {
        try {
          // Validate token with backend
          const response = await axiosInstance.post("/auth/validate-token", { token });
          const { valid, user } = response.data;
  
          if (valid) {
            // Dispatch user details to Redux store
            dispatch(setUser({ user, token, role: user.userType }));
            dispatch(setBatchYearState({ batchYear: user.batchYear }));
            dispatch(setDepartmentState({ department: user.department }));
            navigate("/dashboard"); // Redirect to dashboard if token is valid
          } else {
            localStorage.removeItem("authToken");
            dispatch(clearUser());
          }
        } catch (error) {
          console.error("Token validation failed:", error);
          message.error("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          dispatch(clearUser());
        }
      }
    };
  
    useEffect(() => {
      validateToken();
    }, );
  
    const handleGoogleLoginSuccess = async (credentialResponse) => {
      const { credential } = credentialResponse;
  
      try {
        const response = await axiosInstance.post("/auth/google", { token: credential });
        const { token, user } = response.data;
  
        // Save token and user in Redux store
        dispatch(setUser({ user, token, role: user.userType }));
        dispatch(setBatchYearState({ batchYear: user.batchYear }));
        dispatch(setDepartmentState({ department: user.department }));
  
        localStorage.setItem("authToken", token);
  
        message.success(`Welcome ${user.name}!`);
        navigate("/dashboard"); // Redirect to dashboard
      } catch {
        message.error("Failed to log in with Google.");
      }
    };
  
    const handleGoogleLoginFailure = () => {
      message.error("Google Sign-In failed. Please try again.");
    };
  
    return (
      <GoogleOAuthProvider clientId={clientId}>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <div className="bg-white shadow-lg rounded-lg p-8 max-w-md w-full text-center">
            {/* Logo */}
            <img
              src={logo}
              alt="Logo"
              className="mx-auto w-50 h-50"
            />
            <h1 className="text-2xl font-semibold mb-6 text-gray-800">Login to Your Account</h1>
            {/* Google Login Button */}
            <GoogleLogin
              onSuccess={handleGoogleLoginSuccess}
              onError={handleGoogleLoginFailure}
              useOneTap
              text="signin_with"
            />
            <div className="flex justify-center">
            <p className="text-gray-500 text-sm mt-4">
              By logging in, you agree to our <a href="#" className="text-blue-500 underline">Terms of Service</a> and <a href="#" className="text-blue-500 underline">Privacy Policy</a>.
            </p>
            </div>
          </div>
        </div>
      </GoogleOAuthProvider>
    );
};
  
  export default Login;

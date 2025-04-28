import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ConfigProvider } from "antd";
import '@ant-design/v5-patch-for-react-19';
 
const theme = {
  token: {
    colorPrimary: "#16a34a", // Tailwind green-600
  },
};
 
createRoot(document.getElementById("root")).render(
    <ConfigProvider theme={theme}>
       <App />  
    </ConfigProvider>
);

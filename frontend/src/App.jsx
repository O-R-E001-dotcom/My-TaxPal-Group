
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";  
import ChatBox from "./components/ChatBox";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <div >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chatbox" element={<ProtectedRoute><ChatBox /></ProtectedRoute>} />
          <Route path="/logout" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="*" element={<div>404 Not Found</div>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}



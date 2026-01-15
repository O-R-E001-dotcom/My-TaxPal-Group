

import { useState, useEffect } from "react";
import { useNavigate , Link} from "react-router-dom";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Login successful!");
        localStorage.setItem("access_token", data.access_token);  
        localStorage.setItem("user", JSON.stringify(data.user)); 
        navigate("/chatbox"); 
      } else {
        setMessage(data.detail || 'Invalid credentials');
      }

    } catch (err) {
      setMessage("Error connecting to server");
    }

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (token) {
        navigate("/chatbox");
      }
    }, []);
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 pr-6 md:pr-20 lg:pr-32">
      
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700 z-0"
        style={{ 
          backgroundImage: "url('https://media.licdn.com/dms/image/v2/D4D12AQE_KrnWl2OJZg/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1733254247305?e=2147483647&v=beta&t=fC4AapA15xfyVSiyfYFBUyZyE2ydDDRaCJ9UzEo2ryc')",
          backgroundSize: '80%',
        }}
      >
        <div className="absolute inset-0 bg-black/40 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
        </div>

        {/* 3. CONTENT CARD: Centered and sitting on top */}
        <div className="relative z-10 flex flex-col items-center justify-center gap-5 bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-2xl max-w-[450px] w-full border border-white/20 mx-auto">

        <h2 className="font-bold text-2xl text-green-900">Login</h2>
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <label htmlFor="email" >Email:</label>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-600 outline-none"
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            placeholder="Password"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-600 outline-none"
          />
          <button type="submit" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-green-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-600 ">Login</button>
        </form>
        <p>{message}</p>

        <div>
          Don't have an account? <Link to="/Signup" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-green-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-green-600">Sign up</Link>
        </div>
      </div>
  </div>
  );
}

export default Login;

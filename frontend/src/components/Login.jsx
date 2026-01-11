
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
    <div className="flex flex-col items-center justify-center gap-5 bg-purple-100 p-6 rounded-md shadow-md mt-15 max-w-[700px] mx-auto my-6">
      <h2 className="font-bold">Login</h2>
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <label htmlFor="email" >Email:</label>
        <input
          type="email"
          placeholder="Email"
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="border border-2 p-1 rounded-md"
        />
        <label htmlFor="password">Password:</label>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="border border-2 p-1 rounded-md"
        />
        <button type="submit" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-purple-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 ">Login</button>
      </form>
      <p>{message}</p>

      <div>
        Don't have an account? <Link to="/Signup" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-purple-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600">Sign up</Link>
      </div>
    </div>
  );
}

export default Login;

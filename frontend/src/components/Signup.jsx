
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  const navigate = useNavigate(); 

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Signup successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 1500); 
      } else {
        setMessage(data.detail || 'Signup failed');
      }

    } catch (err) {
      setMessage('Error connecting to server');
    }
  }

  return (
    <div className='flex flex-col items-center justify-center gap-5 bg-purple-100 p-6 rounded-md shadow-md mt-15 max-w-[700px] mx-auto my-6'>
      <h2 className='font-bold'>Signup</h2>
      <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
        <label htmlFor="Name">Name:</label>
        <input type="text"
               placeholder="Name"
               onChange={(e) => setForm({ ...form, full_name: e.target.value })}
               className="border border-2 p-1 rounded-md"
        />
        <label htmlFor="email">Email:</label>
        <input type="email"
               placeholder="Email"
               onChange={(e) => setForm({ ...form, email: e.target.value })}
               className="border border-2 p-1 rounded-md"
        />
        <label htmlFor="password">Password:</label>
        <input type="password"
               placeholder="Password"
               onChange={(e) => setForm({ ...form, password: e.target.value })}
               className="border border-2 p-1 rounded-md"
        />
        <button type="submit" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-purple-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 ">Signup</button>
      </form>
      <p>{message}</p>

      <div>
        Already have an account? <Link to="/login" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-purple-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600">Login here</Link>
      </div>
    </div>
  );
}

export default Signup;

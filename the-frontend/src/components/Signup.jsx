
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

  // return (
  //   <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950 flex flex-col gap-5 p-6 rounded-md shadow-md mt-15 max-w-[700px] mx-auto my-6">
  //     <div 
  //       className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
  //       style={{ 
  //         backgroundImage: "url('https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgt4_zRGoIe3ApEHjcY6NGluszxnfI3vzOldh4MCA2EiR1PLn2X4vwg_ovi9Bf9Ng5LBqtwbTcgmOcSeRQA0Kk6W5hpIAm22714B6diNqpkzd523d25BT2b7W-9xrjao1-0cBrbc4qA-so0k0qNHZV7awYUKfEz6CdsDCaFR6Su_l2SD96V3XL6a1M2jkU/s400/547528661_122230872818255308_8474042282474995184_n.jpg')" 
  //       }}
  //     >
  //       {/* 2. Dark Overlay & Global Blur */}
  //       <div className="absolute inset-0 bg-black/10 bg-gradient-to-b from-black/70 via-transparent to-black/70 backdrop-blur-[1px]" />
  //     </div>

  //     <div className='flex flex-col items-center justify-center gap-5 bg-purple-100 p-6 rounded-md shadow-md mt-15 max-w-[700px] mx-auto my-6'>
  //       <h2 className='font-bold'>Signup</h2>
  //       <form onSubmit={handleSubmit} className='flex flex-col gap-2'>
  //         <label htmlFor="Name">Name:</label>
  //         <input type="text"
  //               placeholder="Name"
  //               onChange={(e) => setForm({ ...form, full_name: e.target.value })}
  //               className="border border-2 p-1 rounded-md"
  //         />
  //         <label htmlFor="email">Email:</label>
  //         <input type="email"
  //               placeholder="Email"
  //               onChange={(e) => setForm({ ...form, email: e.target.value })}
  //               className="border border-2 p-1 rounded-md"
  //         />
  //         <label htmlFor="password">Password:</label>
  //         <input type="password"
  //               placeholder="Password"
  //               onChange={(e) => setForm({ ...form, password: e.target.value })}
  //               className="border border-2 p-1 rounded-md"
  //         />
  //         <button type="submit" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-purple-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600 ">Signup</button>
  //       </form>
  //       <p>{message}</p>

  //       <div>
  //         Already have an account? <Link to="/login" className="cursor-pointer border px-4 py-1 rounded-2xl bg-white hover:bg-purple-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600">Login here</Link>
  //       </div>
  //     </div>
  //   </div>
  // );

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
        <h2 className='font-bold text-2xl text-green-900'>Signup</h2>
        
        <form onSubmit={handleSubmit} className='flex flex-col gap-4 w-full'>
          <div className="flex flex-col gap-1">
            <label htmlFor="Name" className="text-sm font-semibold text-gray-700">Name:</label>
            <input type="text"
                  placeholder="Name"
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email" className="text-sm font-semibold text-gray-700">Email:</label>
            <input type="email"
                  placeholder="Email"
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="password">Password:</label>
            <input type="password"
                  placeholder="Password"
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="border border-gray-300 p-2 rounded-md focus:ring-2 focus:ring-green-600 outline-none"
            />
          </div>

          <button type="submit" className="mt-2 cursor-pointer border px-4 py-2 rounded-xl bg-green-700 text-white hover:bg-green-800 transition-colors shadow-md">
            Signup
          </button>
        </form>

        {message && <p className="text-sm text-red-500 font-medium">{message}</p>}

        <div className="text-sm text-gray-600">
          Already have an account? 
          <Link to="/login" className="ml-2 text-green-700 font-bold hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Signup;

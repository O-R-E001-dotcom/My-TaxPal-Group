

// import { Link } from 'react-router-dom';
// import { motion } from "framer-motion";
// import { TypeAnimation } from "react-type-animation";

// const Home = () => {
//   return (
    
//     <motion.div
//       initial={{ opacity: 0, y: 50 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//       viewport={{ once: true }}
//       className='flex items-center justify-center gap-0 mt-30 md:flex-row maw-w-3xl w-full'>

//         {/* === Background Glows === */}
//         <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-black blur-[150px] rounded-full pointer-events-none"></div>
        
//         {/* === Content Card (Glassmorphism) === */}
//         <div className="relative z-10 backdrop-blur-md bg-black/30 p-8 rounded-2xl shadow-lg border border-white/20 mx-4 md:w-1/2 w-full h-70 ">
//           <h1 className="text-4xl font-bold mb-2 mt-10">Hello, I’m <span className="text-white">My-Tax-Pal</span> </h1>

//           <TypeAnimation
//             sequence={[
//               "Your AI Tax Assistant",
//               2000,
//               "Ask me anything about tax reforms!",
//               2000,
//               "I am here to help you!",
//               2000
//             ]}
//             wrapper="span"
//             speed={50}
//             repeat={Infinity}
//             className="text-2xl font-semibold text-white block mb-4"
//           />
//         </div>
    
//         <div className="relative z-10 backdrop-blur-md bg-black/30 p-8 rounded-2xl shadow-lg border border-white/20 mx-4 md:w-1/2 w-full h-70 flex flex-col items-center gap-2 mt-0 ">
//           <p className='font-bold mt-10 text-3xl'>Get started</p>
//           <div className='flex flex-row gap-2 text-sm font-medium '>
//             <p className='cursor-pointer border px-10 py-1 rounded-2xl bg-white hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600'>
//               <Link to= {'/Signup'}>Signup</Link>
//             </p>

//             <p className='cursor-pointer border px-10 py-1 bg-white rounded-2xl hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600'>
              
//                 <Link to= {'/Login'}> Login</Link>
//             </p>
//           </div>
        
//         </div>
//     </motion.div>
  
    
//   )
// }

// export default Home;

import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

const Home = () => {
  return (
    /* 1. Main Wrapper with Background Image */
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-zinc-950">
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-700"
        style={{ 
          backgroundImage: "url('https://enterprisengr.com/wp-content/uploads/2025/03/The-Nigerian-Tax-Bill-2024-An-Intricate-Interrogation.jpg')" 
        }}
      >
        {/* 2. Dark Overlay & Global Blur */}
        <div className="absolute inset-0 bg-black/10 bg-gradient-to-b from-black/70 via-transparent to-black/70 backdrop-blur-[1px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className='relative z-10 flex flex-col md:flex-row items-center justify-center gap-6 max-w-6xl w-full px-4'
      >
        
        {/* === Background Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        {/* === Left Card: Intro === */}
        <div className="backdrop-blur-sm bg-white/5 p-8 rounded-3xl shadow-2xl border border-white/10 w-full md:w-1/2 h-72 flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-2">
            Hello, I’m <span className="text-purple-400">My-TaxPal</span> 
          </h1>

          <TypeAnimation
            sequence={[
              "Your AI Tax Assistant", 2000,
              "Ask me anything about tax reforms!", 2000,
              "I am here to help you!", 2000
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="text-xl font-medium text-zinc-300 block mb-4"
          />
        </div>
    
        {/* === Right Card: Auth === */}
        <div className="backdrop-blur-sm bg-white/5 p-8 rounded-3xl shadow-2xl border border-white/10 w-full md:w-1/2 h-72 flex flex-col items-center justify-center gap-6">
          <p className='font-bold text-3xl text-white'>Get started</p>
          <div className='flex flex-row gap-4 w-full justify-center'>
            <Link 
              to='/Signup' 
              className='flex-1 max-w-[140px] text-center font-semibold border border-white/20 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white hover:text-black transition-all duration-300'
            >
              Signup
            </Link>

            <Link 
              to='/Login' 
              className='flex-1 max-w-[140px] text-center font-semibold border border-white/20 px-6 py-3 rounded-xl bg-white/10 text-white hover:bg-white hover:text-black transition-all duration-300'
            >
               Login
            </Link>
          </div>
        </div>

      </motion.div>
    </div>
  );
}

export default Home;
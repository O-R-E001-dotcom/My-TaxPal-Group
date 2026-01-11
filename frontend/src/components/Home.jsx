

import { Link } from 'react-router-dom';
import { motion } from "framer-motion";
import { TypeAnimation } from "react-type-animation";

const Home = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className='flex items-center justify-center gap-0 mt-30 md:flex-row maw-w-3xl w-full'>

        {/* === Background Glows === */}
        <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[650px] h-[650px] bg-black blur-[150px] rounded-full pointer-events-none"></div>
        
        {/* === Content Card (Glassmorphism) === */}
        <div className="relative z-10 backdrop-blur-md bg-black/30 p-8 rounded-2xl shadow-lg border border-white/20 mx-4 md:w-1/2 w-full h-70 ">
          <h1 className="text-4xl font-bold mb-2 mt-10">Hello, I’m <span className="text-white">My-Tax-Pal</span> </h1>

          <TypeAnimation
            sequence={[
              "Your AI Tax Assistant",
              2000,
              "Ask me anything about tax reforms!",
              2000,
              "I am here to help you!",
              2000
            ]}
            wrapper="span"
            speed={50}
            repeat={Infinity}
            className="text-2xl font-semibold text-white block mb-4"
          />
        </div>
    
        <div className="relative z-10 backdrop-blur-md bg-black/30 p-8 rounded-2xl shadow-lg border border-white/20 mx-4 md:w-1/2 w-full h-70 flex flex-col items-center gap-2 mt-0 ">
          <p className='font-bold mt-10 text-3xl'>Get started</p>
          <div className='flex flex-row gap-2 text-sm font-medium '>
            <p className='cursor-pointer border px-10 py-1 rounded-2xl bg-white hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600'>
              <Link to= {'/Signup'}>Signup</Link>
            </p>

            <p className='cursor-pointer border px-10 py-1 bg-white rounded-2xl hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-purple-600'>
              
                <Link to= {'/Login'}> Login</Link>
            </p>
          </div>
        
        </div>
    </motion.div>
  
    
  )
}

export default Home;
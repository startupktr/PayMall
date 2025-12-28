
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SplashScreen = () => {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-paymall-primary to-paymall-secondary">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center"
      >
        <div className="h-32 w-32 bg-white rounded-2xl shadow-xl flex items-center justify-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
          >
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M64 16H16C14.4087 16 12.8826 16.6321 11.7574 17.7574C10.6321 18.8826 10 20.4087 10 22V58C10 59.5913 10.6321 61.1174 11.7574 62.2426C12.8826 63.3679 14.4087 64 16 64H64C65.5913 64 67.1174 63.3679 68.2426 62.2426C69.3679 61.1174 70 59.5913 70 58V22C70 20.4087 69.3679 18.8826 68.2426 17.7574C67.1174 16.6321 65.5913 16 64 16Z" 
                fill="#4A4DE7" 
                stroke="#FFF" 
                strokeWidth="4" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
              <path d="M24 40H56M40 24V56" 
                stroke="#FFFFFF" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="text-4xl font-bold text-white"
        >
          PayMall
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="text-white text-opacity-80 mt-3"
        >
          Scan. Shop. Go.
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SplashScreen;

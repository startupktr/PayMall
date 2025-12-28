import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { FcGoogle } from 'react-icons/fc';

const Login = () => {
  const { login, register } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (isSignup) {
      register({"username": email, "email":email, "password":password, "password2":password})
    }
    
    login(email, password);

    // Simulate login/signup success
    // In a real app, this would call your backend authentication API
    toast({
      title: isSignup ? "Account created" : "Welcome back!",
      description: isSignup 
        ? "Your account has been created successfully." 
        : "You have been logged in successfully.",
    });
    
    // For demo, let's navigate to the home page
    navigate('/home');
  };

  const handleGoogleLogin = () => {
    toast({
      title: "Google login",
      description: "Google authentication would happen here in a real app.",
    });
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col bg-paymall-light">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8"
      >
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="h-24 w-24 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-8">
            <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          </div>
          <h2 className="mt-8 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Email address
              </label>
              <div className="mt-2">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                  Password
                </label>
                <div className="text-sm">
                  <a href="#" className="font-semibold text-paymall-primary hover:text-paymall-secondary">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-2">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={isSignup ? 'new-password' : 'current-password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <Button
                type="submit"
                className="w-full bg-paymall-primary hover:bg-paymall-secondary text-white rounded-md py-2"
              >
                {isSignup ? 'Sign up' : 'Sign in'}
              </Button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-paymall-light px-2 text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white px-3 py-2.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <FcGoogle className="h-5 w-5" />
                <span>{isSignup ? 'Sign up with Google' : 'Sign in with Google'}</span>
              </button>
            </div>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="font-semibold leading-6 text-paymall-primary hover:text-paymall-secondary"
            >
              {isSignup ? 'Sign in' : 'Sign up'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;

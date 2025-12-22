import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { GraduationCap, Mail, Lock, User, BookOpen, Building2, ChevronRight, Check } from 'lucide-react';
import Squares from '../../components/reactbits/Squares/Squares';
import Stepper, { Step } from '../../components/reactbits/Stepper/Stepper';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    school: 'Temasek Polytechnic',
    major: '',
    yearOfStudy: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateStep = async (step) => {
    if (step === 1) {
      if (!formData.username) {
        toast.error('Username is required');
        return false;
      }
      if (formData.username.length < 3) {
        toast.error('Username must be at least 3 characters');
        return false;
      }
      if (!formData.email) {
        toast.error('Email is required');
        return false;
      }
      if (!formData.email.includes('@')) {
        toast.error('Please enter a valid email address');
        return false;
      }
    }
    
    if (step === 2) {
      if (!formData.school) {
        toast.error('School is required');
        return false;
      }
      if (!formData.major) {
        toast.error('Major / Course is required');
        return false;
      }
      if (!formData.yearOfStudy) {
         toast.error('Year of study is required');
         return false;
      }
    }

    if (step === 3) {
       if (!formData.password) {
        toast.error('Password is required');
        return false;
      }
      if (formData.password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return false;
      }
      
      return await handleRegistration();
    }
    
    return true;
  };

  const handleRegistration = async () => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registrationData } = formData;
      await register(registrationData);
      toast.success('Account created successfully! Welcome to Tu2tor!');
      navigate('/app/dashboard');
      return true;
    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      toast.error(errorMessage);
      console.error('Registration error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-12 bg-[#0a0a0a] overflow-hidden font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 w-full h-full z-0">
        <Squares 
          direction="diagonal"
          speed={0.3}
          squareSize={50}
          borderColor="#262626" 
          hoverFillColor="#171717"
        />
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] pointer-events-none" />
      </div>

      <div className="w-full max-w-4xl relative z-10 flex flex-col items-center">
        {/* Header Section */}
        <div className="text-center mb-10 animate-fadeInUp">
          <Link to="/" className="inline-flex items-center justify-center space-x-3 mb-4 group">
            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/30 transition-all duration-300">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">Tu2tor</span>
          </Link>
          <h2 className="text-xl text-gray-400 font-medium">Start your learning journey</h2>
        </div>

        {/* Stepper Card */}
        <div className="w-full animate-fadeInUp" style={{animationDelay: '0.1s'}}>
          <Stepper
            stepCircleContainerClassName="bg-[#121212]/80 backdrop-blur-2xl border border-white/5 shadow-2xl ring-1 ring-white/5 rounded-3xl overflow-hidden"
            stepContainerClassName="border-b border-white/5 bg-white/[0.02] py-8"
            contentClassName="text-white min-h-[320px] flex flex-col justify-center"
            footerClassName="border-t border-white/5 bg-white/[0.02] py-6 px-8"
            nextButtonText={
              <span className="flex items-center gap-2">
                Continue <ChevronRight className="w-4 h-4" />
              </span>
            }
            completeButtonText={
              <span className="flex items-center gap-2">
                Create Account <Check className="w-4 h-4" />
              </span>
            }
            backButtonText="Back"
            nextButtonProps={{
              className: "bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center min-w-[140px]"
            }}
            backButtonProps={{
              className: "text-gray-400 hover:text-white px-6 py-3 font-medium transition-colors"
            }}
            onBeforeNext={validateStep}
          >
            {/* Step 1: Account Info */}
            <Step>
              <div className="max-w-xl mx-auto w-full space-y-8 py-4">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Create your account</h3>
                  <p className="text-gray-400">Enter your details to get started with Tu2tor</p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-300 ml-1">
                      Username
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        value={formData.username}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-black/60 transition-all duration-300"
                        placeholder="Choose a unique username"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300 ml-1">
                      Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-500 group-focus-within:text-blue-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 focus:bg-black/60 transition-all duration-300"
                        placeholder="student@tp.edu.sg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 2: Academic Info */}
            <Step>
              <div className="max-w-xl mx-auto w-full space-y-8 py-4">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Academic Profile</h3>
                  <p className="text-gray-400">Help us personalize your learning experience</p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label htmlFor="school" className="text-sm font-medium text-gray-300 ml-1">
                      School
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Building2 className="h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="school"
                        name="school"
                        type="text"
                        value={formData.school}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 focus:bg-black/60 transition-all duration-300"
                        placeholder="Enter your institution"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="major" className="text-sm font-medium text-gray-300 ml-1">
                        Major / Course
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <BookOpen className="h-5 w-5 text-gray-500 group-focus-within:text-purple-500 transition-colors duration-300" />
                        </div>
                        <input
                          id="major"
                          name="major"
                          type="text"
                          value={formData.major}
                          onChange={handleChange}
                          className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 focus:bg-black/60 transition-all duration-300"
                          placeholder="e.g. IT"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="yearOfStudy" className="text-sm font-medium text-gray-300 ml-1">
                        Year of Study
                      </label>
                      <div className="relative">
                        <select
                          id="yearOfStudy"
                          name="yearOfStudy"
                          value={formData.yearOfStudy}
                          onChange={handleChange}
                          className="block w-full pl-4 pr-10 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white focus:border-purple-500/50 focus:ring-4 focus:ring-purple-500/10 focus:bg-black/60 transition-all duration-300 appearance-none cursor-pointer"
                        >
                          <option value={1} className="bg-gray-900">Year 1</option>
                          <option value={2} className="bg-gray-900">Year 2</option>
                          <option value={3} className="bg-gray-900">Year 3</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                          <ChevronRight className="h-4 w-4 text-gray-500 rotate-90" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Step>

            {/* Step 3: Security */}
            <Step>
              <div className="max-w-xl mx-auto w-full space-y-8 py-4">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-white tracking-tight">Secure your account</h3>
                  <p className="text-gray-400">Create a strong password to protect your profile</p>
                </div>

                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-300 ml-1">
                      Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 focus:bg-black/60 transition-all duration-300"
                        placeholder="At least 6 characters"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-300 ml-1">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Check className="h-5 w-5 text-gray-500 group-focus-within:text-green-500 transition-colors duration-300" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-11 pr-4 py-3.5 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 focus:bg-black/60 transition-all duration-300"
                        placeholder="Re-enter your password"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Step>
          </Stepper>

          {/* Login Link */}
          <div className="text-center mt-8 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white hover:text-blue-400 font-semibold transition-colors duration-200">
                Log in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
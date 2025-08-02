import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  const validate = () => {
    const newErrors = {};
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Invalid email address.';
    if (!form.password) newErrors.password = 'Password is required.';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
    setErrors({ ...errors, [name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    
    if (Object.keys(validation).length === 0) {
      setIsLoading(true);
      try {
        const result = await login(form.email, form.password);
        if (result.success) {
          navigate('/'); // redirect to home
        } else {
          setErrors({ api: result.error });
        }
      } catch {
        setErrors({ api: 'An unexpected error occurred. Please try again.' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleLogin = () => {
    // Google login logic (redirect or popup)
    alert('Google login (Demo only)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 flex flex-col justify-center">
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl font-['Pacifico'] text-primary mb-2">HeartThreads</span>
          <span className="text-xs text-gray-400 tracking-wide uppercase font-semibold">Welcome back</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 font-serif text-center">Log In</h2>
        <p className="text-gray-500 text-center mb-6">Welcome back! Log in to your account</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.api && <div className="text-xs text-red-500 mb-2 bg-red-50 p-2 rounded">{errors.api}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all`}
              placeholder="you@email.com"
              autoComplete="email"
              disabled={isLoading}
            />
            {errors.email && <div className="text-xs text-red-500 mt-1">{errors.email}</div>}
          </div>
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.password ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm pr-12 transition-all`}
              placeholder="Password"
              autoComplete="current-password"
              aria-label="Password"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-11 transform -translate-y-1/2 text-gray-400 hover:text-primary focus:outline-none p-1"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={isLoading}
            >
              <i className={`ri-eye${showPassword ? '-off' : ''}-line text-lg`}></i>
            </button>
            {errors.password && <div className="text-xs text-red-500 mt-1">{errors.password}</div>}
          </div>
          <div className="flex items-center justify-between mt-2">
            <label className="flex items-center text-sm text-gray-600 select-none cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={handleChange}
                className="mr-2 rounded border-gray-300 focus:ring-primary accent-primary"
                disabled={isLoading}
              />
              Remember me
            </label>
            <a href="#" className="text-primary text-sm font-semibold hover:underline focus:outline-none">Forgot password?</a>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-primary/30 transition-all duration-200 mt-2 shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-3 text-gray-400 text-xs">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-primary/10 focus:ring-2 focus:ring-primary/30 transition-all duration-200 shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Log in with Google
        </button>
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have an account? <a href="/signup" className="text-primary font-semibold hover:underline focus:outline-none">Sign up</a>
        </div>
      </div>
    </div>
  );
};

export default Login; 
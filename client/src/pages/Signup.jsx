import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const Signup = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signup } = useUser();

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required.';
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Invalid email address.';
    if (!form.password) newErrors.password = 'Password is required.';
    else if (form.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (form.confirmPassword !== form.password) newErrors.confirmPassword = 'Passwords do not match.';
    return newErrors;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validate();
    setErrors(validation);
    
    if (Object.keys(validation).length === 0) {
      setIsLoading(true);
      try {
        const result = await signup(form.name, form.email, form.password);
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

  const handleGoogleSignup = () => {
    // Google signup logic (redirect or popup)
    alert('Google signup (Demo only)');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-white py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 flex flex-col justify-center">
        <div className="flex flex-col items-center mb-6">
          <span className="text-4xl font-['Pacifico'] text-primary mb-2">HeartThreads</span>
          <span className="text-xs text-gray-400 tracking-wide uppercase font-semibold">Join the community</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-2 font-serif text-center">Create Account</h2>
        <p className="text-gray-500 text-center mb-6">Sign up to start your story journey</p>
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors.api && <div className="text-xs text-red-500 mb-2 bg-red-50 p-2 rounded">{errors.api}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.name ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm transition-all`}
              placeholder="Your name"
              autoComplete="name"
              disabled={isLoading}
            />
            {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
          </div>
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
              autoComplete="new-password"
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
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2.5 rounded-lg border ${errors.confirmPassword ? 'border-red-400' : 'border-gray-200'} focus:ring-2 focus:ring-primary/30 focus:border-primary text-sm pr-12 transition-all`}
              placeholder="Confirm password"
              autoComplete="new-password"
              aria-label="Confirm Password"
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
            {errors.confirmPassword && <div className="text-xs text-red-500 mt-1">{errors.confirmPassword}</div>}
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold hover:bg-primary/90 focus:ring-2 focus:ring-primary/30 transition-all duration-200 mt-2 shadow-md text-base disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="mx-3 text-gray-400 text-xs">or</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>
        <button
          onClick={handleGoogleSignup}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 py-2.5 rounded-lg font-semibold text-gray-700 hover:bg-primary/10 focus:ring-2 focus:ring-primary/30 transition-all duration-200 shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
          Sign up with Google
        </button>
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account? <a href="/login" className="text-primary font-semibold hover:underline focus:outline-none">Log in</a>
        </div>
      </div>
    </div>
  );
};

export default Signup; 
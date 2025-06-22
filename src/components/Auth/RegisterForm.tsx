import React, { useState } from 'react';
import { Eye, EyeOff, Heart, Mail, Lock, User, ArrowRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSignUp } from '@clerk/clerk-react';
import axios from 'axios';



const RegisterForm = () => {
  const { signUp, setActive } = useSignUp();
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Please agree to the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    // Simulate API call
    try {

      await signUp?.create({
        username: formData.name,
        emailAddress: formData.email,
        password: formData.password
      })

      await signUp?.prepareEmailAddressVerification({ strategy: "email_code" })
      setPendingVerification(true)
      await axios.post("/create-user", {name: formData.name, email: formData.email}).then((res)=>{
        console.log(res.data)
      }).catch((err)=>{
        console.log("error during storing data", err)
      })

      setTimeout(() => {
        setIsLoading(false);
        console.log(formData)
      }, 2000);

    } catch (error) {
      alert("some thing went worng")
      console.log(error);
      setIsLoading(false)
    }






  };

  const handleVerification = async () => {
    if (!signUp || !setActive) return;

    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp })
      console.log(result)

      if ((await result).status == "complete") {
        await setActive({ session: (await result).createdSessionId })
        navigate("/")
      }


    } catch (error) {
      alert("Something went wrong during verification");
      console.log("verfication error", error)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    return strength;
  };

  const getStrengthColor = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'bg-red-500';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    const strength = getPasswordStrength();
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-500 via-primary-600 to-accent-500 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Join Lone Town</h1>
          <p className="text-primary-100">Begin your mindful dating journey</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.name
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  placeholder="Your full name"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.email
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.password
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(getPasswordStrength() / 5) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium text-gray-600">{getStrengthText()}</span>
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200 ${errors.confirmPassword
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-primary-500 focus:border-primary-500'
                    }`}
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms Agreement */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className="relative flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => {
                      setAgreedToTerms(e.target.checked);
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: '' }));
                      }
                    }}
                    className="sr-only"
                  />
                  <div className={`w-5 h-5 border-2 rounded transition-all duration-200 ${agreedToTerms
                    ? 'bg-primary-600 border-primary-600'
                    : 'border-gray-300 hover:border-primary-400'
                    }`}>
                    {agreedToTerms && (
                      <Check className="w-3 h-3 text-white m-0.5" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-600 leading-relaxed">
                  I agree to the{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>
              {errors.terms && (
                <p className="mt-1 text-sm text-red-600 animate-fade-in">{errors.terms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${isLoading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'
                }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* verfication of email */}

          {
            pendingVerification &&
            <div className='my-3'>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 transition-all duration-200`}
                placeholder="Confirm your password"
              />
              <button
              type="submit"
              onClick={handleVerification}
              className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 my-3 bg-primary-600 hover:bg-primary-700 shadow-lg hover:shadow-xl'`}
            >Create Account <ArrowRight size={18} /></button>
            </div>
          }

          {/* Switch to Login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <button
                className="text-primary-600 hover:text-primary-700 font-medium transition-colors duration-200"
              >
                Sign in
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-primary-100 text-sm">
            Join thousands finding meaningful connections
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterForm;
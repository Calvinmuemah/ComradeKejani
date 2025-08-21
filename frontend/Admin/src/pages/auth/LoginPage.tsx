
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err?.message || "Invalid credentials. Please try again.");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <>
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          box-shadow: 0 0 0 1000px transparent inset !important;
          background-color: transparent !important;
          color: #fff !important;
          caret-color: #fff !important;
        }
        input[type="email"],
        input[type="password"] {
          background-color: transparent !important;
        }
      `}</style>
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
          <div className="flex flex-col items-center">
            <svg className="animate-spin h-12 w-12 text-[#0270ff] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4"></circle>
              <path className="opacity-75" fill="#0270ff" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            <span className="text-white text-lg font-semibold">Signing in...</span>
          </div>
        </div>
      )}
      <div
        className="min-h-screen w-full flex items-center justify-end bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/background.jpeg)' }}
      >
        <div className="absolute inset-0 bg-black/90" />
      <div className="relative z-10 flex flex-col items-end justify-center h-full pr-[25rem] w-full">
        <div className="w-full max-w-sm bg-transparent border-0 shadow-none relative">
          <div className="p-8 relative z-10 bg-transparent rounded-2xl">
            <div className="mb-8 flex justify-center">
              <div className="h-16 w-16 overflow-hidden rounded-lg">
                <img src="/johnny.png" alt="Logo" className="h-full w-full object-cover" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Log in to your account</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="relative mt-2">
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    className="peer block w-full h-12 px-4 pt-4 bg-transparent border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#0270ff] focus:shadow-[0_0_8px_2px_#0270ff99] transition-all"
                    style={{ borderWidth: '2px' }}
                  />
                  <span
                    className="absolute left-4 -top-3 px-2 text-gray-400 text-sm font-medium pointer-events-none select-none transition-all bg-transparent"
                    style={{
                      zIndex: 2,
                      background: '#18181b', 
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      left: '1rem',
                      top: '-0.9rem',
                    }}
                  >
                    Email
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span></span>
                  <a href="#" className="text-xs text-white/60 hover:underline">Forgot password?</a>
                </div>
                <div className="relative mt-2">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    required
                    className="peer block w-full h-12 px-4 pt-4 pr-10 bg-transparent border border-gray-700 rounded-lg text-white focus:outline-none focus:border-[#0270ff] focus:shadow-[0_0_8px_2px_#0270ff99] transition-all"
                    style={{ borderWidth: '2px' }}
                  />
                  <span
                    className="absolute left-4 -top-3 px-2 text-gray-400 text-sm font-medium pointer-events-none select-none transition-all bg-transparent"
                    style={{
                      zIndex: 2,
                      background: '#18181b', 
                      paddingLeft: '0.5rem',
                      paddingRight: '0.5rem',
                      left: '1rem',
                      top: '-0.9rem',
                    }}
                  >
                    Password
                  </span>
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    onClick={togglePasswordVisibility}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                type="submit"
                className="w-full h-12 mt-4 bg-gradient-to-r from-[#0270ff] to-[#013a87] hover:from-[#18144F] hover:to-[#0270ff] text-white font-semibold rounded-lg shadow-[0_0_16px_2px_rgba(2,80,186,0.25)] relative overflow-hidden"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center w-full h-full">
                    <svg className="animate-spin mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="#fff" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="#0270ff" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default LoginPage;
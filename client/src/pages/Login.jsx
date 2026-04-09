import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { login as loginApi } from '../services/api';

const Login = () => {
  const [role, setRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    degree: '',
    course: 'CSE',
    year: '',
    section: '',
    batch: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoggingIn(true);

    try {
      const response = await loginApi({ ...formData, role });
      if (response.success) {
        login({ ...formData, role });
        navigate('/timetable');
      } else {
        setError(response.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <div className="glass-card-strong w-full max-w-md overflow-hidden p-8 relative">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-honolulu-500 via-amethyst-500 to-honolulu-500" />
        
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-honolulu-500 to-amethyst-500 text-xl font-black text-white shadow-lg shadow-honolulu-500/20">
            CF
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
            Welcome to <span className="bg-gradient-to-r from-honolulu-500 to-amethyst-500 bg-clip-text text-transparent">CampusFlow</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">Secure access to your academic schedules</p>
        </div>

        {error && (
          <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold animate-in fade-in zoom-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                role === 'student' 
                ? 'bg-white text-honolulu-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setRole('faculty')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                role === 'faculty' 
                ? 'bg-white text-amethyst-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Faculty
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all duration-300 ${
                role === 'admin' 
                ? 'bg-white text-emerald-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Admin
            </button>
          </div>

          <div className="space-y-4">
            {role !== 'admin' && (
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Full Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={role === 'faculty' ? "Dr. Name / Prof. Name" : "Enter your name"}
                  className="input-glass w-full"
                />
              </div>
            )}

            {(role === 'faculty' || role === 'admin') && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">
                    {role === 'admin' ? 'Admin Username' : 'Faculty Email'}
                  </label>
                  <input
                    required
                    type={role === 'admin' ? 'text' : 'email'}
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder={role === 'admin' ? "Enter admin ID" : "name@university.edu"}
                    className="input-glass w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Password</label>
                  <input
                    required
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="input-glass w-full text-sm"
                  />
                </div>
              </div>
            )}

            {role === 'student' && (
              <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Degree</label>
                  <input
                    required
                    name="degree"
                    value={formData.degree}
                    onChange={handleInputChange}
                    placeholder="B.Tech, M.Tech..."
                    className="input-glass w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Course</label>
                  <select
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    className="input-glass w-full text-sm"
                  >
                    <option value="CSE">CSE</option>
                    <option value="ICT">ICT</option>
                    <option value="ECE">ECE</option>
                    <option value="Mechanical">ME</option>
                    <option value="Civil">CE</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Year</label>
                  <input
                    required
                    name="year"
                    value={formData.year}
                    onChange={handleInputChange}
                    placeholder="1, 2, 3..."
                    className="input-glass w-full text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Section</label>
                  <input
                    required
                    name="section"
                    value={formData.section}
                    onChange={handleInputChange}
                    placeholder="A, B, C..."
                    className="input-glass w-full text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1.5 ml-1">Lab Batch</label>
                  <input
                    required
                    name="batch"
                    value={formData.batch}
                    onChange={handleInputChange}
                    placeholder="A1, A2, A3..."
                    className="input-glass w-full text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="group relative w-full overflow-hidden rounded-2xl bg-slate-900 px-6 py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-slate-800 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <div className={`absolute inset-0 bg-gradient-to-r from-honolulu-500 to-amethyst-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isLoggingIn ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Start Session
                  <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

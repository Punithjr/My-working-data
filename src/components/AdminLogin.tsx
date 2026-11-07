import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Building2, 
  KeyRound, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight,
  FileText,
  FolderGit2,
  Users,
  UserPlus,
  LogIn
} from 'lucide-react';
import { AdminAuthUser } from '../types';
import { 
  MAX_OFFICE_USERS, 
  INITIAL_5_OFFICE_USERS, 
  getRegisteredOfficeUsers, 
  registerOfficeUserWithLimit, 
  signInWithGoogleAuth 
} from '../lib/firebase';

interface AdminLoginProps {
  onLoginSuccess: (user: AdminAuthUser, token: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('zero0');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<AdminAuthUser[]>(INITIAL_5_OFFICE_USERS);

  // Registration Form State
  const [regData, setRegData] = useState({
    displayName: '',
    username: '',
    email: '',
    password: '',
    designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
    role: 'Case Worker' as AdminAuthUser['role'],
    section: 'ಆ2'
  });

  // Load registered users on mount
  useEffect(() => {
    async function loadUsers() {
      try {
        const list = await getRegisteredOfficeUsers();
        if (list && list.length > 0) {
          setRegisteredUsers(list);
        }
      } catch (err) {
        console.warn('Could not load users on login screen:', err);
      }
    }
    loadUsers();
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password;

    try {
      // 1. Check matching registered user
      const foundUser = registeredUsers.find(
        u => u.username.toLowerCase() === cleanUser || (u.email && u.email.toLowerCase() === cleanUser)
      );

      // Verify credentials: match custom password if set, or accept 'zero0'
      const isPasswordValid = foundUser 
        ? (!foundUser.password || foundUser.password === cleanPass || cleanPass === 'zero0')
        : (cleanUser === 'admin' && cleanPass === 'zero0');

      if (foundUser && isPasswordValid) {
        const activeUser: AdminAuthUser = {
          ...foundUser,
          loginTime: new Date().toISOString()
        };

        const token = `edu-auth-session-${activeUser.username}-${Date.now()}`;
        if (rememberMe) {
          localStorage.setItem('edu_efms_auth_user', JSON.stringify(activeUser));
          localStorage.setItem('edu_efms_auth_token', token);
        } else {
          sessionStorage.setItem('edu_efms_auth_user', JSON.stringify(activeUser));
          sessionStorage.setItem('edu_efms_auth_token', token);
        }

        onLoginSuccess(activeUser, token);
        return;
      }

      if (cleanUser === 'admin' && cleanPass === 'zero0') {
        const activeUser: AdminAuthUser = {
          id: 'user-admin',
          username: 'admin',
          role: 'Administrator',
          displayName: 'ಶ್ರೀ ಬಿ.ಎನ್. ರಮೇಶ್, KES',
          designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ (BEO & FAA)',
          loginTime: new Date().toISOString(),
          authProvider: 'system'
        };

        const token = `edu-auth-session-${activeUser.username}-${Date.now()}`;
        if (rememberMe) {
          localStorage.setItem('edu_efms_auth_user', JSON.stringify(activeUser));
          localStorage.setItem('edu_efms_auth_token', token);
        } else {
          sessionStorage.setItem('edu_efms_auth_user', JSON.stringify(activeUser));
          sessionStorage.setItem('edu_efms_auth_token', token);
        }

        onLoginSuccess(activeUser, token);
        return;
      }

      // Check server API fallback
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: cleanUser, password: cleanPass }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const token = data.token || 'edu-auth-session';
        if (rememberMe) {
          localStorage.setItem('edu_efms_auth_user', JSON.stringify(data.user));
          localStorage.setItem('edu_efms_auth_token', token);
        } else {
          sessionStorage.setItem('edu_efms_auth_user', JSON.stringify(data.user));
          sessionStorage.setItem('edu_efms_auth_token', token);
        }
        onLoginSuccess(data.user, token);
      } else {
        setErrorMessage(
          'ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ (Invalid credentials). ಅಧಿಕೃತ 5 ಬಳಕೆದಾರರ ಪಟ್ಟಿಯಿಂದ ಆಯ್ಕೆಮಾಡಿ ಅಥವಾ ಲಾಗಿನ್ ಆಗಿ.'
        );
      }
    } catch {
      // Offline fallback for admin
      if (cleanUser === 'admin') {
        const fallbackUser: AdminAuthUser = INITIAL_5_OFFICE_USERS[0];
        const token = 'admin-auth-session-zero0';
        if (rememberMe) {
          localStorage.setItem('edu_efms_auth_user', JSON.stringify(fallbackUser));
          localStorage.setItem('edu_efms_auth_token', token);
        }
        onLoginSuccess(fallbackUser, token);
      } else {
        setErrorMessage('ದೃಢೀಕರಣ ವಿಫಲವಾಗಿದೆ. ಅಧಿಕೃತ ಬಳಕೆದಾರರ ಖಾತೆಯನ್ನು ಬಳಸಿ.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google Sign-In with Firebase Auth
  const handleGoogleLogin = async () => {
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const res = await signInWithGoogleAuth();
      if (res.success && res.user) {
        const token = `edu-auth-session-google-${Date.now()}`;
        if (rememberMe) {
          localStorage.setItem('edu_efms_auth_user', JSON.stringify(res.user));
          localStorage.setItem('edu_efms_auth_token', token);
        } else {
          sessionStorage.setItem('edu_efms_auth_user', JSON.stringify(res.user));
          sessionStorage.setItem('edu_efms_auth_token', token);
        }
        onLoginSuccess(res.user, token);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google ಸೈನ್-ಇನ್ ವಿಫಲವಾಗಿದೆ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register New User (Case Worker & Staff)
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!regData.displayName || !regData.username) {
      setErrorMessage('ದಯವಿಟ್ಟು ಹೆಸರು ಮತ್ತು ಬಳಕೆದಾರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registerOfficeUserWithLimit({
        displayName: regData.displayName,
        username: regData.username.trim(),
        email: regData.email.trim(),
        password: regData.password || undefined,
        designation: regData.designation,
        role: regData.role,
        section: regData.section,
        authProvider: regData.password ? 'password' : 'system'
      });

      if (res.success && res.user) {
        setSuccessMessage(res.message);
        const updated = await getRegisteredOfficeUsers();
        setRegisteredUsers(updated);
        // Reset form
        setRegData({
          displayName: '',
          username: '',
          email: '',
          password: '',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
          role: 'Case Worker',
          section: 'ಆ2'
        });
        // Switch to login tab and prefill
        setTimeout(() => {
          setAuthMode('login');
          setUsername(res.user?.username || '');
          setPassword(res.user?.authProvider === 'system' || !regData.password ? 'zero0' : (regData.password || 'zero0'));
        }, 1200);
      } else {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'ಬಳಕೆದಾರರ ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isQuotaFull = false;

  return (
    <div className="min-h-screen bg-[#fffbf2] flex flex-col items-center justify-center p-4 selection:bg-[#f59e0b] selection:text-[#2b2b2b] font-kannada">
      <div className="w-full max-w-xl">
        {/* Department Emblem & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#f59e0b] text-[#2b2b2b] border-2 border-[#2b2b2b] shadow-[4px_4px_0px_#2b2b2b] mb-3">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-[#2b2b2b]/70 font-mono-code">
            ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಶಾಲಾ ಶಿಕ್ಷಣ ಮತ್ತು ಸಾಕ್ಷರತಾ ಇಲಾಖೆ
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#2b2b2b] mt-1">
            ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ
          </h1>
          <p className="text-xs text-[#2b2b2b]/80 mt-1 max-w-md mx-auto">
            ಪಿಂಚಣಿ, ನೌಕರರ ಸೇವಾ ಬಡ್ತಿ (ಪ್ರಪತ್ರ-28), ಮಾಹಿತಿ ಹಕ್ಕು (RTI) ಹಾಗೂ ಕಡತಗಳ ನಿರ್ವಹಣಾ ತಂತ್ರಾಂಶ
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border-2 border-[#2b2b2b] shadow-[6px_6px_0px_#2b2b2b] p-6 sm:p-8 relative overflow-hidden">
          {/* Top Tabs: Login vs Register (Max 5 Users) */}
          <div className="flex items-center justify-between border-b-2 border-stone-800 pb-3 mb-5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 border-stone-800 cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-stone-900 text-amber-300 shadow-[2px_2px_0px_#f59e0b]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                1. ಲಾಗಿನ್ (Sign In)
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setErrorMessage(null);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 border-stone-800 cursor-pointer flex items-center gap-1.5 ${
                  authMode === 'register'
                    ? 'bg-stone-900 text-amber-300 shadow-[2px_2px_0px_#f59e0b]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>2. ನೂತನ ಬಳಕೆದಾರರ ನೋಂದಣಿ</span>
              </button>
            </div>

            <div className="text-[10px] font-mono-code font-bold bg-amber-100 text-amber-950 px-2 py-1 rounded border border-amber-300">
              ಬಳಕೆದಾರರ ಕೋಟಾ: {registeredUsers.length} / 2
            </div>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border-2 border-rose-500 rounded-xl text-rose-900 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-900 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>{successMessage}</div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 1: LOGIN MODE                                                         */}
          {/* ========================================================================= */}
          {authMode === 'login' ? (
            <div className="space-y-4">
              {/* Google Sign-in with Firebase Auth */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-white hover:bg-stone-50 text-stone-800 text-xs font-bold rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#2b2b2b] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Google ಮೂಲಕ ಸೈನ್-ಇನ್ (Sign in with Google - Firebase)</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-stone-300"></div>
                <span className="flex-shrink mx-3 text-stone-500 text-[10px] font-mono-code uppercase font-bold">
                  ಅಥವಾ ಅಧಿಕೃತ ಖಾತೆ ಆಯ್ಕೆಮಾಡಿ
                </span>
                <div className="flex-grow border-t border-stone-300"></div>
              </div>

              {/* Quick Select of Authorized Users */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-stone-700 flex justify-between">
                  <span>ಅಧಿಕೃತ ಬಳಕೆದಾರರು (Authorized Users): ಪುನೀತ್ ಜೆ.ಆರ್ & admin</span>
                  <span className="text-stone-500 font-mono-code">1-ಕ್ಲಿಕ್ ಲಾಗಿನ್</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {registeredUsers.map((u, idx) => (
                    <button
                      key={u.id || u.username}
                      type="button"
                      onClick={() => {
                        setUsername(u.username);
                        setPassword('zero0');
                      }}
                      className={`p-2 rounded-lg border text-left cursor-pointer transition-all ${
                        username.toLowerCase() === u.username.toLowerCase()
                          ? 'bg-amber-100 border-amber-600 font-bold text-stone-900 shadow-xs'
                          : 'bg-stone-50 border-stone-300 hover:bg-stone-100 text-stone-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[11px] truncate">{u.displayName}</span>
                        <span className="text-[9px] bg-stone-200 px-1 rounded font-mono-code">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 truncate mt-0.5">{u.designation}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#2b2b2b] mb-1">
                    ಬಳಕೆದಾರರ ಹೆಸರು ಅಥವಾ ಇಮೇಲ್ (Username / Email)*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder="ಉದಾ: admin ಅಥವಾ punithjr"
                      className="w-full pl-9 pr-3 py-2 border-2 border-[#2b2b2b] rounded-lg text-xs font-mono-code focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2b2b2b] mb-1">
                    ಗುಪ್ತಪದ (Password)*
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="ಗುಪ್ತಪದ ನಮೂದಿಸಿ (Default: zero0)"
                      className="w-full pl-9 pr-10 py-2 border-2 border-[#2b2b2b] rounded-lg text-xs font-mono-code focus:outline-none focus:ring-2 focus:ring-[#f59e0b]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-500 hover:text-[#2b2b2b] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-stone-700">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-[#2b2b2b] text-[#f59e0b] focus:ring-[#f59e0b] cursor-pointer"
                    />
                    <span>ನೆನಪಿನಲ್ಲಿಡು (Remember me)</span>
                  </label>
                  <span className="text-[10px] text-stone-500 font-mono-code">Default: admin / zero0</span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 bg-[#f59e0b] hover:bg-[#e08e0b] text-[#2b2b2b] font-bold text-xs rounded-xl border-2 border-[#2b2b2b] shadow-[3px_3px_0px_#2b2b2b] hover:shadow-[4px_4px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{isSubmitting ? 'ದೃಢೀಕರಿಸಲಾಗುತ್ತಿದೆ...' : 'ಸುರಕ್ಷಿತವಾಗಿ ಪ್ರವೇಶಿಸಿ (Secure Sign In)'}</span>
                </button>
              </form>
            </div>
          ) : (
            /* ========================================================================= */
            /* TAB 2: REGISTER NEW USER (Case Worker & Authorized Staff)                 */
            /* ========================================================================= */
            <div className="space-y-4">
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div className="text-xs text-stone-700 bg-amber-50/80 p-3 rounded-xl border border-amber-300 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>ನೂತನ ಬಳಕೆದಾರರ ನೋಂದಣಿ (New User Registration):</strong> ನೌಕರರು/ವಿಷಯ ನಿರ್ವಾಹಕರ (Case Worker) ಖಾತೆಯನ್ನು ಸೃಜಿಸಿ. ಎಲ್ಲಾ ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು ತಮ್ಮ ಶಾಖೆಯ ಕಡತಗಳು ಹಾಗೂ ತಂತ್ರಾಂಶದ ಎಲ್ಲಾ ಸವಲತ್ತುಗಳನ್ನು ಬಳಸಬಹುದು.
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">ಪೂರ್ಣ ಹೆಸರು (Full Name)*</label>
                  <input
                    type="text"
                    required
                    placeholder="ಶ್ರೀ / ಶ್ರೀಮತಿ (ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್)..."
                    value={regData.displayName}
                    onChange={e => setRegData({ ...regData, displayName: e.target.value })}
                    className="w-full p-2 border-2 border-stone-800 rounded-lg text-xs font-bold bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">ಬಳಕೆದಾರರ ಹೆಸರು (Username)*</label>
                    <input
                      type="text"
                      required
                      placeholder="ಉದಾ: caseworker_edn"
                      value={regData.username}
                      onChange={e => setRegData({ ...regData, username: e.target.value })}
                      className="w-full p-2 border-2 border-stone-800 rounded-lg text-xs font-mono-code bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">ಇಮೇಲ್ (Email)</label>
                    <input
                      type="email"
                      placeholder="user@karnataka.gov.in"
                      value={regData.email}
                      onChange={e => setRegData({ ...regData, email: e.target.value })}
                      className="w-full p-2 border-2 border-stone-800 rounded-lg text-xs font-mono-code bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">ಗುಪ್ತಪದ (Password)</label>
                    <input
                      type="password"
                      placeholder="ಕನಿಷ್ಠ 6 ಅಕ್ಷರಗಳು (Default: zero0)"
                      value={regData.password}
                      onChange={e => setRegData({ ...regData, password: e.target.value })}
                      className="w-full p-2 border-2 border-stone-800 rounded-lg text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">ಪಾತ್ರ / ಅಧಿಕಾರ (Role)*</label>
                    <select
                      value={regData.role}
                      onChange={e => setRegData({ ...regData, role: e.target.value as any })}
                      className="w-full p-2 border-2 border-stone-800 rounded-lg text-xs bg-white font-bold"
                    >
                      <option value="Case Worker">Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು - Case Worker)</option>
                      <option value="Administrator">Administrator (ಮುಖ್ಯಸ್ಥರು / BEO)</option>
                      <option value="Officer">Officer (ಅಧಿಕಾರಿಗಳು / AAO / SI)</option>
                      <option value="Superintendent">Superintendent (ಕಛೇರಿ ಅಧೀಕ್ಷಕರು)</option>
                      <option value="FDA / Nodal">FDA / Nodal (RTI & ಪಿಂಚಣಿ ನೋಡಲ್)</option>
                      <option value="Data Entry Operator">Data Entry Operator (ಡೇಟಾ ಎಂಟ್ರಿ)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">ಶಾಖೆ (Section)*</label>
                    <select
                      value={regData.section}
                      onChange={e => setRegData({ ...regData, section: e.target.value })}
                      className="w-full p-2 border-2 border-stone-800 rounded-lg text-xs bg-white font-bold"
                    >
                      <option value="ಆ1">ಆ1 - ಅನುದಾನ & ಲೆಕ್ಕ ಶಾಖೆ</option>
                      <option value="ಆ2">ಆ2 - ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ & ಸೇವಾ ಶಾಖೆ</option>
                      <option value="ಆ3">ಆ3 - ಪ್ರೌಢ ಶಿಕ್ಷಣ, ಪರೀಕ್ಷೆ & ಮಾನ್ಯತೆ ಶಾಖೆ</option>
                      <option value="ಆ4">ಆ4 - RTI, ಪಿಂಚಣಿ & ನೋಡಲ್ ಶಾಖೆ</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-800 mb-1">ಹುದ್ದೆ (Designation)*</label>
                    <input
                      type="text"
                      required
                      placeholder="ಉದಾ: ವಿಷಯ ನಿರ್ವಾಹಕರು / SDA / FDA"
                      value={regData.designation}
                      onChange={e => setRegData({ ...regData, designation: e.target.value })}
                      className="w-full p-2 border-2 border-stone-800 rounded-lg text-xs bg-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-3 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl border-2 border-stone-800 shadow-[3px_3px_0px_#000] cursor-pointer flex items-center justify-center gap-2 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{isSubmitting ? 'ನೋಂದಾಯಿಸಲಾಗುತ್ತಿದೆ...' : 'ಬಳಕೆದಾರರನ್ನು ನೋಂದಾಯಿಸಿ (Complete Registration)'}</span>
                </button>
              </form>
            </div>
          )}

          {/* Security Footer Note */}
          <div className="mt-6 pt-4 border-t border-stone-200 text-center">
            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500 font-mono-code font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>FIREBASE AUTH • CLOUD FIRESTORE PERSISTENCE • MAX 5 USERS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

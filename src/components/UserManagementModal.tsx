import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  Trash2, 
  Check, 
  X, 
  Lock, 
  Mail, 
  Phone,
  User, 
  Building2, 
  Award, 
  AlertCircle,
  LogIn,
  Edit2, 
  Save, 
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Search,
  BadgeCheck,
  Shield,
  HelpCircle,
  RefreshCw
} from 'lucide-react';
import { AdminAuthUser } from '../types';
import { 
  MAX_OFFICE_USERS, 
  getRegisteredOfficeUsers, 
  registerOfficeUserWithLimit, 
  updateOfficeUser,
  deleteOfficeUser,
  resetOfficeUserPassword,
  signInWithGoogleAuth 
} from '../lib/firebase';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AdminAuthUser | null;
  onSelectUser: (user: AdminAuthUser) => void;
  showToast: (msg: string) => void;
  onOpenFullView?: () => void;
}

export const UserManagementModal: React.FC<UserManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  showToast,
  onOpenFullView
}) => {
  const [users, setUsers] = useState<AdminAuthUser[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'register' | 'edit'>('list');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [quickResetUserId, setQuickResetUserId] = useState<string | null>(null);
  const [quickResetPassword, setQuickResetPassword] = useState('');

  // Form State for User Creator
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
    role: 'Case Worker' as AdminAuthUser['role'],
    section: 'ಆ2',
    kgidNumber: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
    permissions: ['dak_read', 'letter_draft', 'file_read']
  });

  // Form State for User Modifier
  const [editFormData, setEditFormData] = useState({
    id: '',
    displayName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    designation: '',
    role: 'Case Worker' as AdminAuthUser['role'],
    section: 'ಆ2',
    kgidNumber: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
    permissions: ['dak_read', 'letter_draft', 'file_read']
  });

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const list = await getRegisteredOfficeUsers();
      setUsers(list);
    } catch (err) {
      console.warn('Load users error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      setActiveTab('list');
      setEditingUserId(null);
      setQuickResetUserId(null);
    }
  }, [isOpen]);

  // Apply Quick Preset in User Creator
  const applyPreset = (preset: 'beo' | 'os' | 'fda' | 'cw1' | 'cw2' | 'cw3' | 'cw4' | 'deo') => {
    switch (preset) {
      case 'beo':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಬಿ.ಎನ್. ರಮೇಶ್, KES',
          username: 'beo_admin',
          designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ (BEO & FAA)',
          role: 'Administrator',
          section: 'ಆಡಳಿತ',
          email: 'beo.bhadravathi@karnataka.gov.in',
          permissions: ['admin_all', 'dak_read', 'dak_write', 'letter_draft', 'pension_sanction', 'rti_reply']
        }));
        break;
      case 'os':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಎಂ. ಶಿವಕುಮಾರ್',
          username: 'os_superintendent',
          designation: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (Office Superintendent)',
          role: 'Superintendent',
          section: 'ಆ2',
          email: 'os.bhadravathi@karnataka.gov.in',
          permissions: ['dak_read', 'dak_write', 'letter_draft', 'hrms_read']
        }));
        break;
      case 'fda':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಪುನೀತ್ ಜೆ.ಆರ್.',
          username: 'punith_fda',
          designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು & ನೋಡಲ್ ಅಧಿಕಾರಿ (FDA & Nodal)',
          role: 'FDA / Nodal',
          section: 'ಆ4',
          email: 'punithjr2@gmail.com',
          permissions: ['dak_read', 'dak_write', 'pension_sanction', 'rti_reply']
        }));
        break;
      case 'cw1':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀಮತಿ ಎಸ್. ಗೀತಾ',
          username: 'cw_accounts',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ1 ಅನುದಾನ & ಲೆಕ್ಕ ಶಾಖೆ',
          role: 'Case Worker',
          section: 'ಆ1'
        }));
        break;
      case 'cw2':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಕೆ. ರಾಮಮೂರ್ತಿ',
          username: 'cw_primary',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ2 ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ ಶಾಖೆ',
          role: 'Case Worker',
          section: 'ಆ2'
        }));
        break;
      case 'cw3':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಕೆ.ಎಸ್. ಮಂಜುನಾಥ್',
          username: 'cw_highschool',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ3 ಪ್ರೌಢ ಶಿಕ್ಷಣ ಶಾಖೆ',
          role: 'Case Worker',
          section: 'ಆ3'
        }));
        break;
      case 'cw4':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಆನಂದ್ ಕುಮಾರ್',
          username: 'cw_rti_pension',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ4 RTI & ಪಿಂಚಣಿ ಶಾಖೆ',
          role: 'Case Worker',
          section: 'ಆ4'
        }));
        break;
      case 'deo':
        setFormData(prev => ({
          ...prev,
          displayName: 'ಕುಮಾರಿ ದಿವ್ಯಾ',
          username: 'deo_operator',
          designation: 'ಡೇಟಾ ಎಂಟ್ರಿ ಆಪರೇಟರ್ (Data Entry Operator)',
          role: 'Data Entry Operator',
          section: 'ಆ2'
        }));
        break;
    }
    showToast('ಪೂರ್ವನಿರ್ಧರಿತ ಪ್ರೊಫೈಲ್ ಭರ್ತಿ ಮಾಡಲಾಗಿದೆ.');
  };

  // Generate strong random password
  const generateStrongPassword = (target: 'create' | 'edit' | 'quick') => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (target === 'create') {
      setFormData(prev => ({ ...prev, password: res }));
    } else if (target === 'edit') {
      setEditFormData(prev => ({ ...prev, password: res }));
    } else {
      setQuickResetPassword(res);
    }
    showToast(`ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ಸೃಜಿಸಲಾಗಿದೆ: ${res}`);
  };

  const handleStartEditUser = (user: AdminAuthUser) => {
    setEditingUserId(user.id || user.username);
    setEditFormData({
      id: user.id || user.username,
      displayName: user.displayName || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      designation: user.designation || 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
      role: user.role || 'Case Worker',
      section: user.section || 'ಆ2',
      kgidNumber: user.kgidNumber || '',
      status: user.status || 'Active',
      permissions: user.permissions || ['dak_read', 'letter_draft', 'file_read']
    });
    setActiveTab('edit');
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editFormData.displayName.trim() || !editFormData.username.trim()) {
      showToast('ದಯವಿಟ್ಟು ಹೆಸರು ಮತ್ತು ಬಳಕೆದಾರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setIsLoading(true);
    const updatePayload: Partial<AdminAuthUser> & { password?: string } = {
      displayName: editFormData.displayName.trim(),
      username: editFormData.username.trim(),
      email: editFormData.email.trim(),
      phone: editFormData.phone.trim(),
      designation: editFormData.designation.trim(),
      role: editFormData.role,
      section: editFormData.section,
      kgidNumber: editFormData.kgidNumber.trim(),
      status: editFormData.status,
      permissions: editFormData.permissions
    };

    if (editFormData.password && editFormData.password.trim().length > 0) {
      updatePayload.password = editFormData.password.trim();
      updatePayload.authProvider = 'password';
    }

    const targetId = editingUserId || editFormData.id || editFormData.username;
    const result = await updateOfficeUser(targetId, updatePayload);
    setIsLoading(false);

    if (result.success && result.user) {
      showToast(result.message);
      if (
        currentUser && 
        (currentUser.id === targetId || currentUser.username === targetId || currentUser.username === editFormData.username)
      ) {
        onSelectUser(result.user);
      }
      setActiveTab('list');
      setEditingUserId(null);
      await loadUsers();
    } else {
      showToast(result.message);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.displayName.trim() || !formData.username.trim()) {
      showToast('ದಯವಿಟ್ಟು ಹೆಸರು ಮತ್ತು ಬಳಕೆದಾರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setIsLoading(true);
    const result = await registerOfficeUserWithLimit({
      displayName: formData.displayName.trim(),
      username: formData.username.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password ? formData.password.trim() : 'zero0',
      designation: formData.designation.trim(),
      role: formData.role,
      section: formData.section,
      kgidNumber: formData.kgidNumber.trim(),
      status: formData.status,
      permissions: formData.permissions,
      authProvider: formData.password ? 'password' : 'system'
    });

    setIsLoading(false);
    if (result.success && result.user) {
      showToast(result.message);
      setActiveTab('list');
      setFormData({
        displayName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
        role: 'Case Worker',
        section: 'ಆ2',
        kgidNumber: '',
        status: 'Active',
        permissions: ['dak_read', 'letter_draft', 'file_read']
      });
      await loadUsers();
    } else {
      showToast(result.message);
    }
  };

  const handleQuickResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickResetUserId || !quickResetPassword || quickResetPassword.length < 4) {
      showToast('ಗುಪ್ತಪದ ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳಿರಬೇಕು.');
      return;
    }

    setIsLoading(true);
    const res = await resetOfficeUserPassword(quickResetUserId, quickResetPassword);
    setIsLoading(false);
    if (res.success) {
      showToast(res.message);
      setQuickResetUserId(null);
      setQuickResetPassword('');
      await loadUsers();
    } else {
      showToast(res.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const res = await signInWithGoogleAuth();
    setIsLoading(false);
    if (res.success && res.user) {
      showToast(res.message);
      onSelectUser(res.user);
      await loadUsers();
      onClose();
    } else {
      showToast(res.message);
    }
  };

  const handleDeleteUser = async (user: AdminAuthUser) => {
    if (users.length <= 1) {
      showToast('ಕನಿಷ್ಠ ಒಬ್ಬ ಬಳಕೆದಾರರು ಕಡ್ಡಾಯವಾಗಿ ಇರಬೇಕು.');
      return;
    }
    if (window.confirm(`ಖಂಡಿತವಾಗಿ "${user.displayName}" (${user.username}) ಬಳಕೆದಾರರನ್ನು ತೆಗೆದುಹಾಕಬೇಕೆ?`)) {
      const ok = await deleteOfficeUser(user.id || user.username);
      if (ok) {
        showToast('ಬಳಕೆದಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.');
        await loadUsers();
      }
    }
  };

  if (!isOpen) return null;

  const filteredList = users.filter(u => {
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName || '').toLowerCase().includes(q) ||
      (u.username || '').toLowerCase().includes(q) ||
      (u.designation || '').toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.section || '').toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[8px_8px_0px_#2b2b2b] max-w-2xl w-full overflow-hidden text-xs font-kannada flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-white">
                  ಅಧಿಕೃತ ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ (Authorized User Management)
                </h3>
                <span className="text-[10px] bg-amber-400 text-stone-950 px-2 py-0.5 rounded font-mono-code font-bold">
                  {users.length} ಬಳಕೆದಾರರು
                </span>
              </div>
              <p className="text-[11px] text-stone-300 mt-0.5">
                ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ — ಬಳಕೆದಾರರ ಸೃಜನೆ (Creator) ಹಾಗೂ ತಿದ್ದುಪಡಿ (Modifier)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs Bar */}
        <div className="bg-stone-100 px-4 py-2 border-b border-stone-300 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all border cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-stone-900 text-amber-300 border-stone-800 shadow-xs'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              ನೋಂದಾಯಿತ ಬಳಕೆದಾರರು ({users.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'register'
                  ? 'bg-emerald-700 text-white border-emerald-800 shadow-xs'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ ಬಳಕೆದಾರರ ಸೃಜನೆ (User Creator)</span>
            </button>

            {activeTab === 'edit' && (
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg font-bold transition-all border bg-blue-700 text-white border-blue-800 shadow-xs flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>ಬಳಕೆದಾರರ ತಿದ್ದುಪಡಿ (Modifier)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullView && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullView();
                }}
                className="text-[11px] font-bold text-stone-700 hover:text-stone-950 underline cursor-pointer"
              >
                ಪೂರ್ಣ ಪರದೆ (Full Screen View)
              </button>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="px-2.5 py-1.2 bg-white hover:bg-stone-50 text-stone-800 border border-stone-400 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer text-[11px]"
              title="Google Sign-In with Firebase Auth"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google</span>
            </button>
          </div>
        </div>

        {/* Modal Body Container */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {/* TAB 1: LIST REGISTERED USERS */}
          {activeTab === 'list' && (
            <div className="space-y-3">
              {/* Search filter in modal */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ಬಳಕೆದಾರರ ಹೆಸರು, ಹುದ್ದೆ ಅಥವಾ ಶಾಖೆ ಮೂಲಕ ಹುಡುಕಿ..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 border border-stone-300 rounded-lg text-xs bg-stone-50 focus:bg-white"
                />
              </div>

              {/* Quick Reset Password Form inline if opened */}
              {quickResetUserId && (
                <form onSubmit={handleQuickResetPassword} className="bg-amber-50 border-2 border-amber-300 p-3 rounded-xl flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <KeyRound className="w-4 h-4 text-amber-800 shrink-0" />
                    <span className="font-bold text-amber-950 text-xs">ಹೊಸ ಗುಪ್ತಪದ:</span>
                    <input
                      type="text"
                      required
                      placeholder="ಹೊಸ ಪಾಸ್‌ವರ್ಡ್..."
                      value={quickResetPassword}
                      onChange={e => setQuickResetPassword(e.target.value)}
                      className="p-1 border border-amber-400 rounded bg-white text-xs font-mono-code flex-1"
                    />
                    <button
                      type="button"
                      onClick={() => generateStrongPassword('quick')}
                      className="text-[10px] bg-amber-200 px-2 py-1 rounded font-bold text-amber-900 cursor-pointer"
                    >
                      ಆಟೋ
                    </button>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-3 py-1 bg-amber-700 text-white rounded font-bold hover:bg-amber-800 cursor-pointer text-xs"
                    >
                      ಉಳಿಸಿ
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickResetUserId(null)}
                      className="px-2 py-1 border border-stone-300 rounded text-stone-700 cursor-pointer"
                    >
                      ರದ್ದು
                    </button>
                  </div>
                </form>
              )}

              {/* Users Cards List */}
              <div className="space-y-2">
                {filteredList.map((u, idx) => {
                  const isCurrent = currentUser?.username === u.username || currentUser?.email === u.email;

                  return (
                    <div
                      key={u.id || u.username || idx}
                      className={`p-3 rounded-xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isCurrent
                          ? 'bg-amber-50/90 border-amber-500 shadow-xs'
                          : 'bg-stone-50 border-stone-300 hover:border-stone-400'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-900 text-amber-300 flex items-center justify-center font-bold text-xs font-mono-code border border-stone-700 shrink-0">
                          {u.displayName ? u.displayName.charAt(0) : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-stone-900 text-xs">{u.displayName}</span>
                            <span className="text-[10px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.2 rounded font-mono-code">
                              {u.role}
                            </span>
                            <span className="text-[10px] bg-sky-100 text-sky-900 font-bold px-1.5 py-0.2 rounded">
                              {u.section || 'ಆ2'}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded">
                                ಸಕ್ರಿಯ ಲಾಗಿನ್ (Active)
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-stone-600 mt-0.5">{u.designation}</div>
                          <div className="text-[10px] text-stone-500 font-mono-code flex items-center gap-2 mt-0.5 flex-wrap">
                            <span>ಬಳಕೆದಾರ: <strong>@{u.username}</strong></span>
                            {u.email && <span>• {u.email}</span>}
                            {u.phone && <span>• 📞 {u.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        {/* Modify / Edit User Button */}
                        <button
                          type="button"
                          onClick={() => handleStartEditUser(u)}
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold rounded-lg text-xs transition-all border border-blue-300 flex items-center gap-1 cursor-pointer"
                          title="ಬಳಕೆದಾರರ ತಿದ್ದುಪಡಿ (User Modifier)"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-700" />
                          <span>ತಿದ್ದುಪಡಿ</span>
                        </button>

                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setQuickResetUserId(u.id || u.username);
                            setQuickResetPassword('');
                          }}
                          className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg text-xs cursor-pointer"
                          title="ಗುಪ್ತಪದ ಬದಲಿಸಿ (Password)"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Login Switch */}
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectUser(u);
                              showToast(`ಲಾಗಿನ್ ಬದಲಾಯಿಸಲಾಗಿದೆ: ${u.displayName}`);
                              onClose();
                            }}
                            className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <LogIn className="w-3.5 h-3.5 text-amber-400" />
                            <span>ಲಾಗಿನ್</span>
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs flex items-center gap-1 mr-1 px-2 py-1 bg-emerald-50 rounded border border-emerald-200">
                            <Check className="w-3.5 h-3.5" />
                            <span>ಸಕ್ರಿಯ</span>
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="ತೆಗೆದುಹಾಕಿ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: USER CREATOR (ಹೊಸ ಬಳಕೆದಾರರ ಸೃಜನೆ) */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 bg-stone-50 p-4 rounded-xl border-2 border-stone-300">
              {/* Role Presets */}
              <div className="bg-white border border-stone-200 p-2.5 rounded-lg space-y-1.5">
                <div className="text-[11px] font-bold text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>ತ್ವರಿತ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆ (Presets):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => applyPreset('beo')}
                    className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded text-[11px] font-bold text-amber-900 cursor-pointer"
                  >
                    🏛️ BEO Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('os')}
                    className="px-2 py-0.5 bg-purple-50 hover:bg-purple-100 border border-purple-300 rounded text-[11px] font-bold text-purple-900 cursor-pointer"
                  >
                    📋 OS ಅಧೀಕ್ಷಕರು
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('fda')}
                    className="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 border border-sky-300 rounded text-[11px] font-bold text-sky-900 cursor-pointer"
                  >
                    📜 FDA ನೋಡಲ್
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw1')}
                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-[11px] font-bold text-stone-800 cursor-pointer"
                  >
                    📁 CW ಆ1
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw2')}
                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-[11px] font-bold text-stone-800 cursor-pointer"
                  >
                    📁 CW ಆ2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw3')}
                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-[11px] font-bold text-stone-800 cursor-pointer"
                  >
                    📁 CW ಆ3
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw4')}
                    className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded text-[11px] font-bold text-stone-800 cursor-pointer"
                  >
                    📁 CW ಆ4
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪೂರ್ಣ ಹೆಸರು (Full Name)*</label>
                  <input
                    type="text"
                    required
                    placeholder="ಶ್ರೀ / ಶ್ರೀಮತಿ..."
                    value={formData.displayName}
                    onChange={e => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಬಳಕೆದಾರರ ಹೆಸರು (Username)*</label>
                  <input
                    type="text"
                    required
                    placeholder="ಉದಾ: punith_fda"
                    value={formData.username}
                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-700 font-bold">ಗುಪ್ತಪದ (Password)</label>
                    <button
                      type="button"
                      onClick={() => generateStrongPassword('create')}
                      className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>ಆಟೋ ಪಾಸ್‌ವರ್ಡ್</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳು"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full p-2 pr-8 border border-stone-300 rounded bg-white font-mono-code"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಹುದ್ದೆ (Designation)*</label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={e => setFormData({ ...formData, designation: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪಾತ್ರ / ಅಧಿಕಾರ (Role)*</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full p-2 border border-stone-300 rounded bg-white font-bold"
                  >
                    <option value="Case Worker">Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು)</option>
                    <option value="Administrator">Administrator (ಮುಖ್ಯಸ್ಥರು / BEO)</option>
                    <option value="Superintendent">Superintendent (ಕಛೇರಿ ಅಧೀಕ್ಷಕರು)</option>
                    <option value="FDA / Nodal">FDA / Nodal (RTI & ಪಿಂಚಣಿ ನೋಡಲ್)</option>
                    <option value="Officer">Officer (ಅಧಿಕಾರಿಗಳು / AAO / SI)</option>
                    <option value="Data Entry Operator">Data Entry Operator (ಡೇಟಾ ಎಂಟ್ರಿ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಶಾಖೆ (Section / Branch)*</label>
                  <select
                    value={formData.section}
                    onChange={e => setFormData({ ...formData, section: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded bg-white font-bold"
                  >
                    <option value="ಆ1">ಆ1 - ಅನುದಾನ & ಲೆಕ್ಕ ಶಾಖೆ</option>
                    <option value="ಆ2">ಆ2 - ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ & ಸೇವಾ ಶಾಖೆ</option>
                    <option value="ಆ3">ಆ3 - ಪ್ರೌಢ ಶಿಕ್ಷಣ, ಪರೀಕ್ಷೆ & ಮಾನ್ಯತೆ ಶಾಖೆ</option>
                    <option value="ಆ4">ಆ4 - RTI, ಪಿಂಚಣಿ & ನೋಡಲ್ ಶಾಖೆ</option>
                    <option value="ಆಡಳಿತ">ಆಡಳಿತ ಶಾಖೆ (General Administration)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಇಮೇಲ್ ವಿಳಾಸ (Email)</label>
                  <input
                    type="email"
                    placeholder="user@karnataka.gov.in"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3 py-1.5 border border-stone-300 rounded text-stone-700 font-bold hover:bg-stone-100 cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded font-bold transition-all border border-emerald-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>ಬಳಕೆದಾರರನ್ನು ಸೃಜಿಸಿ (Create User)</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: USER MODIFIER (ಬಳಕೆದಾರರ ತಿದ್ದುಪಡಿ) */}
          {activeTab === 'edit' && (
            <form onSubmit={handleEditSubmit} className="space-y-3 bg-blue-50/70 p-4 rounded-xl border-2 border-blue-400">
              <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                <div className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                  <Edit2 className="w-4 h-4 text-blue-700" />
                  <span>ಬಳಕೆದಾರರ ವಿವರ ತಿದ್ದುಪಡಿ & ಬದಲಾವಣೆ (User Modifier)</span>
                </div>
                <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-mono-code font-bold">
                  @{editFormData.username}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪೂರ್ಣ ಹೆಸರು (Full Name)*</label>
                  <input
                    type="text"
                    required
                    value={editFormData.displayName}
                    onChange={e => setEditFormData({ ...editFormData, displayName: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಬಳಕೆದಾರರ ಹೆಸರು (Username)*</label>
                  <input
                    type="text"
                    required
                    value={editFormData.username}
                    onChange={e => setEditFormData({ ...editFormData, username: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-700 font-bold">ಹೊಸ ಗುಪ್ತಪದ (Password)</label>
                    <button
                      type="button"
                      onClick={() => generateStrongPassword('edit')}
                      className="text-[10px] text-blue-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>ಆಟೋ</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="ಖಾಲಿ ಬಿಟ್ಟರೆ ಹಳೆಯದೇ ಮುಂದುವರಿಯುತ್ತದೆ"
                    value={editFormData.password}
                    onChange={e => setEditFormData({ ...editFormData, password: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಹುದ್ದೆ (Designation)*</label>
                  <input
                    type="text"
                    required
                    value={editFormData.designation}
                    onChange={e => setEditFormData({ ...editFormData, designation: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪಾತ್ರ / ಅಧಿಕಾರ (Role)*</label>
                  <select
                    value={editFormData.role}
                    onChange={e => setEditFormData({ ...editFormData, role: e.target.value as any })}
                    className="w-full p-2 border border-stone-300 rounded bg-white font-bold"
                  >
                    <option value="Case Worker">Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು)</option>
                    <option value="Administrator">Administrator (ಮುಖ್ಯಸ್ಥರು / BEO)</option>
                    <option value="Superintendent">Superintendent (ಕಛೇರಿ ಅಧೀಕ್ಷಕರು)</option>
                    <option value="FDA / Nodal">FDA / Nodal (RTI & ಪಿಂಚಣಿ ನೋಡಲ್)</option>
                    <option value="Officer">Officer (ಅಧಿಕಾರಿಗಳು / AAO / SI)</option>
                    <option value="Data Entry Operator">Data Entry Operator (ಡೇಟಾ ಎಂಟ್ರಿ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಶಾಖೆ (Section / Branch)*</label>
                  <select
                    value={editFormData.section}
                    onChange={e => setEditFormData({ ...editFormData, section: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded bg-white font-bold"
                  >
                    <option value="ಆ1">ಆ1 - ಅನುದಾನ & ಲೆಕ್ಕ ಶಾಖೆ</option>
                    <option value="ಆ2">ಆ2 - ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ & ಸೇವಾ ಶಾಖೆ</option>
                    <option value="ಆ3">ಆ3 - ಪ್ರೌಢ ಶಿಕ್ಷಣ, ಪರೀಕ್ಷೆ & ಮಾನ್ಯತೆ ಶಾಖೆ</option>
                    <option value="ಆ4">ಆ4 - RTI, ಪಿಂಚಣಿ & ನೋಡಲ್ ಶಾಖೆ</option>
                    <option value="ಆಡಳಿತ">ಆಡಳಿತ ಶಾಖೆ (General Administration)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಇಮೇಲ್ ವಿಳಾಸ (Email)</label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={e => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone)</label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded font-mono-code bg-white"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-blue-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-3 py-1.5 border border-stone-300 rounded text-stone-700 font-bold hover:bg-stone-100 cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-blue-700 hover:bg-blue-600 text-white rounded font-bold transition-all border border-blue-800 cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ (Save Modifications)</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-stone-100 p-3 border-t-2 border-stone-800 flex items-center justify-between text-[11px] text-stone-600">
          <span>ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ ತಾಲ್ಲೂಕು</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-900 text-white font-bold rounded-lg hover:bg-stone-800 cursor-pointer"
          >
            ಮುಚ್ಚಿ (Close)
          </button>
        </div>
      </div>
    </div>
  );
};

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
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  FileText,
  BadgeCheck,
  Briefcase,
  Layers,
  ChevronRight,
  Shield,
  HelpCircle,
  Clock,
  CheckSquare
} from 'lucide-react';
import { AdminAuthUser, Employee } from '../types';
import { 
  MAX_OFFICE_USERS, 
  INITIAL_5_OFFICE_USERS,
  getRegisteredOfficeUsers, 
  registerOfficeUserWithLimit, 
  updateOfficeUser,
  deleteOfficeUser,
  resetOfficeUserPassword,
  resetOfficeUsersToStrictTwo,
  signInWithGoogleAuth 
} from '../lib/firebase';

export const AVAILABLE_ROLES_LIST: { id: AdminAuthUser['role']; labelKannada: string; labelEn: string; icon: string; desc: string }[] = [
  { id: 'Administrator', labelKannada: 'ಮುಖ್ಯಸ್ಥರು / BEO', labelEn: 'Administrator / BEO', icon: '👑', desc: 'ಪೂರ್ಣ ಆಡಳಿತಾತ್ಮಕ ಅಧಿಕಾರ & ಆದೇಶ ಮಂಜೂರಾತಿ' },
  { id: 'Superintendent', labelKannada: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (OS)', labelEn: 'Office Superintendent', icon: '📑', desc: 'ಕಡತ ಪರಿಶೀಲನೆ & ಆಡಳಿತಾತ್ಮಕ ಟಿಪ್ಪಣಿ' },
  { id: 'FDA / Nodal', labelKannada: 'FDA / ನೋಡಲ್ ಅಧಿಕಾರಿ', labelEn: 'FDA / Nodal Officer', icon: '⚖️', desc: 'RTI, ಸಾರ್ವಜನಿಕ ಕುಂದುಕೊರತೆ & ಪಿಂಚಣಿ' },
  { id: 'Case Worker', labelKannada: 'ವಿಷಯ ನಿರ್ವಾಹಕರು (CW)', labelEn: 'Case Worker', icon: '✍️', desc: 'ಶಾಖೆಯ ತಪಾಲ, ಕಡತ ಡ್ರಾಫ್ಟಿಂಗ್ & ಜ್ಞಾಪನಾ' },
  { id: 'Officer', labelKannada: 'ಅಧಿಕಾರಿಗಳು (AAO / SI)', labelEn: 'Supervisory Officer', icon: '🏛️', desc: 'ಇಲಾಖಾ ತಪಾಸಣೆ & ಶಾಲಾ ಪರಿಶೀಲನೆ' },
  { id: 'Data Entry Operator', labelKannada: 'ಡೇಟಾ ಎಂಟ್ರಿ (DEO)', labelEn: 'Data Entry Operator', icon: '💻', desc: 'ಆವಕ-ಜಾವಕ ಇ-ತಪಾಲ ಎಂಟ್ರಿ & ಸ್ಕ್ಯಾನಿಂಗ್' }
];

interface UserManagementViewProps {
  currentUser: AdminAuthUser | null;
  onSelectUser: (user: AdminAuthUser) => void;
  showToast: (msg: string) => void;
  employees?: Employee[];
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  onSelectUser,
  showToast,
  employees = []
}) => {
  const [users, setUsers] = useState<AdminAuthUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sectionFilter, setSectionFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Creator & Modifier Modal / Form Mode: null | 'create' | 'edit' | 'reset-pwd'
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [pwdResetUser, setPwdResetUser] = useState<AdminAuthUser | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // User Creator Form State with Multiple Role Mapping
  const [creatorData, setCreatorData] = useState({
    displayName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
    role: 'Case Worker' as AdminAuthUser['role'],
    roles: ['Case Worker'] as AdminAuthUser['role'][],
    hasAllRoles: false,
    section: 'ಆ2',
    kgidNumber: '',
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended',
    permissions: ['dak_read', 'letter_draft', 'file_read']
  });

  // User Modifier Form State with Multiple Role Mapping
  const [modifierData, setModifierData] = useState({
    id: '',
    displayName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    designation: '',
    role: 'Case Worker' as AdminAuthUser['role'],
    roles: ['Case Worker'] as AdminAuthUser['role'][],
    hasAllRoles: false,
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
    loadUsers();
  }, []);

  const handleResetToPunithAndAdmin = async () => {
    if (window.confirm('ಬಳಕೆದಾರರ ಪಟ್ಟಿಯನ್ನು ಕೇವಲ "ಪುನೀತ್ ಜೆ.ಆರ್" ಮತ್ತು "admin" ಇವರಿಬ್ಬರಿಗೆ ಮಾತ್ರ ಸೀಮಿತಗೊಳಿಸಿ ರಿಸೆಟ್ ಮಾಡಬೇಕೆ?')) {
      setIsLoading(true);
      const list = await resetOfficeUsersToStrictTwo();
      setUsers(list);
      setIsLoading(false);
      showToast('ಬಳಕೆದಾರರ ಪಟ್ಟಿಯನ್ನು ಕೇವಲ "ಪುನೀತ್ ಜೆ.ಆರ್" ಮತ್ತು "admin" ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಸೀಮಿತಗೊಳಿಸಲಾಗಿದೆ!');
    }
  };

  // Preset role applicator for User Creator
  const applyPreset = (preset: 'all' | 'beo' | 'os' | 'fda' | 'cw1' | 'cw2' | 'cw3' | 'cw4' | 'deo') => {
    switch (preset) {
      case 'all':
        setCreatorData(prev => ({
          ...prev,
          displayName: prev.displayName || 'ಶ್ರೀ/ಶ್ರೀಮತಿ ಅಧಿಕೃತ ಬಳಕೆದಾರರು',
          username: prev.username || 'master_user',
          designation: 'ಮುಖ್ಯಸ್ಥರು / ಎಲ್ಲಾ ಅಧಿಕಾರಗಳು (All Roles & Full Access)',
          role: 'Administrator',
          roles: AVAILABLE_ROLES_LIST.map(r => r.id),
          hasAllRoles: true,
          section: 'ಆಡಳಿತ',
          permissions: [
            'admin_all', 'dak_read', 'dak_write', 'dak_register', 'dak_dispatch',
            'letter_draft', 'letter_review', 'letter_approve', 'letter_sign',
            'file_read', 'file_create', 'file_move',
            'pension_sanction', 'rti_reply', 'hrms_read', 'hrms_edit'
          ]
        }));
        showToast('ಒಬ್ಬರಿಗೆ ಎಲ್ಲಾ ಪಾತ್ರಗಳನ್ನು (All Roles Mapped) ಆಯ್ಕೆ ಮಾಡಲಾಗಿದೆ!');
        return;
      case 'beo':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಬಿ.ಎನ್. ರಮೇಶ್, KES',
          username: 'beo_admin',
          designation: 'ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು & ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ (BEO & FAA)',
          role: 'Administrator',
          roles: ['Administrator'],
          hasAllRoles: false,
          section: 'ಆಡಳಿತ',
          email: 'beo.bhadravathi@karnataka.gov.in',
          permissions: ['admin_all', 'dak_read', 'dak_write', 'letter_draft', 'letter_approve', 'pension_sanction', 'rti_reply']
        }));
        break;
      case 'os':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಎಂ. ಶಿವಕುಮಾರ್',
          username: 'os_superintendent',
          designation: 'ಕಛೇರಿ ಅಧೀಕ್ಷಕರು (Office Superintendent)',
          role: 'Superintendent',
          roles: ['Superintendent'],
          hasAllRoles: false,
          section: 'ಆ2',
          email: 'os.bhadravathi@karnataka.gov.in',
          permissions: ['dak_read', 'dak_write', 'letter_draft', 'letter_review', 'hrms_read']
        }));
        break;
      case 'fda':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಪುನೀತ್ ಜೆ.ಆರ್.',
          username: 'punith_fda',
          designation: 'ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು & ನೋಡಲ್ ಅಧಿಕಾರಿ (FDA & Nodal)',
          role: 'FDA / Nodal',
          roles: ['FDA / Nodal'],
          hasAllRoles: false,
          section: 'ಆ4',
          email: 'punithjr2@gmail.com',
          permissions: ['dak_read', 'dak_write', 'pension_sanction', 'rti_reply', 'letter_draft']
        }));
        break;
      case 'cw1':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀಮತಿ ಎಸ್. ಗೀತಾ',
          username: 'cw_accounts',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ1 ಅನುದಾನ & ಲೆಕ್ಕ ಶಾಖೆ',
          role: 'Case Worker',
          roles: ['Case Worker'],
          hasAllRoles: false,
          section: 'ಆ1',
          permissions: ['dak_read', 'dak_write', 'letter_draft']
        }));
        break;
      case 'cw2':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಕೆ. ರಾಮಮೂರ್ತಿ',
          username: 'cw_primary',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ2 ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ ಶಾಖೆ',
          role: 'Case Worker',
          roles: ['Case Worker'],
          hasAllRoles: false,
          section: 'ಆ2',
          permissions: ['dak_read', 'dak_write', 'letter_draft', 'hrms_read']
        }));
        break;
      case 'cw3':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಕೆ.ಎಸ್. ಮಂಜುನಾಥ್',
          username: 'cw_highschool',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ3 ಪ್ರೌಢ ಶಿಕ್ಷಣ ಶಾಖೆ',
          role: 'Case Worker',
          roles: ['Case Worker'],
          hasAllRoles: false,
          section: 'ಆ3',
          permissions: ['dak_read', 'dak_write', 'letter_draft']
        }));
        break;
      case 'cw4':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಶ್ರೀ ಆನಂದ್ ಕುಮಾರ್',
          username: 'cw_rti_pension',
          designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು - ಆ4 RTI & ಪಿಂಚಣಿ ಶಾಖೆ',
          role: 'Case Worker',
          roles: ['Case Worker'],
          hasAllRoles: false,
          section: 'ಆ4',
          permissions: ['dak_read', 'dak_write', 'pension_sanction', 'rti_reply']
        }));
        break;
      case 'deo':
        setCreatorData(prev => ({
          ...prev,
          displayName: 'ಕುಮಾರಿ ದಿವ್ಯಾ',
          username: 'deo_operator',
          designation: 'ಡೇಟಾ ಎಂಟ್ರಿ ಆಪರೇಟರ್ (Data Entry Operator)',
          role: 'Data Entry Operator',
          roles: ['Data Entry Operator'],
          hasAllRoles: false,
          section: 'ಆ2',
          permissions: ['dak_read', 'dak_write']
        }));
        break;
    }
    showToast('ಪೂರ್ವನಿರ್ಧರಿತ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಲಾಗಿದೆ (Preset loaded).');
  };

  // Generate strong random password
  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = '';
    for (let i = 0; i < 8; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (formMode === 'create') {
      setCreatorData(prev => ({ ...prev, password: res }));
    } else if (formMode === 'edit') {
      setModifierData(prev => ({ ...prev, password: res }));
    } else if (pwdResetUser) {
      setNewPasswordVal(res);
    }
    showToast(`ಸುರಕ್ಷಿತ ಗುಪ್ತಪದ ಸೃಜಿಸಲಾಗಿದೆ: ${res}`);
  };

  // Open User Modifier
  const handleOpenEdit = (user: AdminAuthUser) => {
    const userRoles = Array.isArray(user.roles) && user.roles.length > 0 
      ? user.roles 
      : [user.role || 'Case Worker'];
    const hasAll = Boolean(user.hasAllRoles || userRoles.length >= AVAILABLE_ROLES_LIST.length);

    setModifierData({
      id: user.id || user.username,
      displayName: user.displayName || '',
      username: user.username || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      designation: user.designation || 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
      role: user.role || 'Case Worker',
      roles: hasAll ? AVAILABLE_ROLES_LIST.map(r => r.id) : userRoles,
      hasAllRoles: hasAll,
      section: user.section || 'ಆ2',
      kgidNumber: user.kgidNumber || '',
      status: user.status || 'Active',
      permissions: user.permissions || ['dak_read', 'letter_draft', 'file_read']
    });
    setFormMode('edit');
  };

  // Submit User Creator
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creatorData.displayName.trim() || !creatorData.username.trim()) {
      showToast('ದಯವಿಟ್ಟು ಹೆಸರು ಮತ್ತು ಬಳಕೆದಾರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setIsLoading(true);
    const resolvedRoles = creatorData.hasAllRoles 
      ? AVAILABLE_ROLES_LIST.map(r => r.id) 
      : (creatorData.roles.length > 0 ? creatorData.roles : [creatorData.role]);

    const result = await registerOfficeUserWithLimit({
      displayName: creatorData.displayName.trim(),
      username: creatorData.username.trim(),
      email: creatorData.email.trim(),
      phone: creatorData.phone.trim(),
      password: creatorData.password ? creatorData.password.trim() : 'zero0',
      designation: creatorData.designation.trim(),
      role: creatorData.role,
      roles: resolvedRoles,
      hasAllRoles: creatorData.hasAllRoles,
      section: creatorData.section,
      kgidNumber: creatorData.kgidNumber.trim(),
      status: creatorData.status,
      permissions: creatorData.permissions,
      authProvider: creatorData.password ? 'password' : 'system'
    });
    setIsLoading(false);

    if (result.success && result.user) {
      showToast(result.message);
      setFormMode(null);
      setCreatorData({
        displayName: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        designation: 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
        role: 'Case Worker',
        roles: ['Case Worker'],
        hasAllRoles: false,
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

  // Submit User Modifier
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifierData.displayName.trim() || !modifierData.username.trim()) {
      showToast('ದಯವಿಟ್ಟು ಹೆಸರು ಮತ್ತು ಬಳಕೆದಾರರ ಹೆಸರನ್ನು ನಮೂದಿಸಿ.');
      return;
    }

    setIsLoading(true);
    const targetId = modifierData.id || modifierData.username;
    const resolvedRoles = modifierData.hasAllRoles 
      ? AVAILABLE_ROLES_LIST.map(r => r.id) 
      : (modifierData.roles.length > 0 ? modifierData.roles : [modifierData.role]);

    const payload: Partial<AdminAuthUser> & { password?: string } = {
      displayName: modifierData.displayName.trim(),
      username: modifierData.username.trim(),
      email: modifierData.email.trim(),
      phone: modifierData.phone.trim(),
      designation: modifierData.designation.trim(),
      role: modifierData.role,
      roles: resolvedRoles,
      hasAllRoles: modifierData.hasAllRoles,
      section: modifierData.section,
      kgidNumber: modifierData.kgidNumber.trim(),
      status: modifierData.status,
      permissions: modifierData.permissions
    };

    if (modifierData.password && modifierData.password.trim().length > 0) {
      payload.password = modifierData.password.trim();
      payload.authProvider = 'password';
    }

    const result = await updateOfficeUser(targetId, payload);
    setIsLoading(false);

    if (result.success && result.user) {
      showToast(result.message);
      // If updating the active user session
      if (
        currentUser && 
        (currentUser.id === targetId || currentUser.username === targetId || currentUser.username === modifierData.username)
      ) {
        onSelectUser(result.user);
      }
      setFormMode(null);
      await loadUsers();
    } else {
      showToast(result.message);
    }
  };

  // Quick Map All Roles to a User (1-click Action)
  const handleQuickMapAllRoles = async (user: AdminAuthUser) => {
    const allRoleIds = AVAILABLE_ROLES_LIST.map(r => r.id);
    const targetId = user.id || user.username;
    setIsLoading(true);
    const result = await updateOfficeUser(targetId, {
      hasAllRoles: true,
      roles: allRoleIds,
      permissions: [
        'admin_all', 'dak_read', 'dak_write', 'dak_register', 'dak_dispatch',
        'letter_draft', 'letter_review', 'letter_approve', 'letter_sign',
        'file_read', 'file_create', 'file_move',
        'pension_sanction', 'rti_reply', 'hrms_read', 'hrms_edit'
      ]
    });
    setIsLoading(false);
    if (result.success) {
      showToast(`"${user.displayName}" ಅವರಿಗೆ ಎಲ್ಲಾ 6 ಪಾತ್ರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮ್ಯಾಪ್ ಮಾಡಲಾಗಿದೆ (All Roles Mapped)!`);
      if (currentUser && (currentUser.id === targetId || currentUser.username === targetId || currentUser.username === user.username)) {
        onSelectUser({ ...user, hasAllRoles: true, roles: allRoleIds });
      }
      await loadUsers();
    } else {
      showToast(result.message);
    }
  };

  // Quick Password Reset
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwdResetUser) return;
    if (!newPasswordVal || newPasswordVal.length < 4) {
      showToast('ಗುಪ್ತಪದ ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳಿರಬೇಕು.');
      return;
    }

    setIsLoading(true);
    const res = await resetOfficeUserPassword(pwdResetUser.id || pwdResetUser.username, newPasswordVal);
    setIsLoading(false);
    if (res.success) {
      showToast(res.message);
      setPwdResetUser(null);
      setNewPasswordVal('');
      await loadUsers();
    } else {
      showToast(res.message);
    }
  };

  // Toggle user status (Active vs Suspended)
  const handleToggleStatus = async (user: AdminAuthUser) => {
    const nextStatus = user.status === 'Suspended' ? 'Active' : 'Suspended';
    const res = await updateOfficeUser(user.id || user.username, { status: nextStatus });
    if (res.success) {
      showToast(`ಬಳಕೆದಾರ ಸ್ಥಿತಿ ಬದಲಾಯಿಸಲಾಗಿದೆ: ${nextStatus === 'Active' ? 'ಸಕ್ರಿಯ (Active)' : 'ಅಮಾನತು (Suspended)'}`);
      await loadUsers();
    }
  };

  // Delete User
  const handleDeleteUser = async (user: AdminAuthUser) => {
    if (users.length <= 1) {
      showToast('ಕನಿಷ್ಠ ಒಬ್ಬ ಅಧಿಕೃತ ಬಳಕೆದಾರರು ಕಡ್ಡಾಯವಾಗಿ ಇರಬೇಕು.');
      return;
    }
    if (window.confirm(`ಖಂಡಿತವಾಗಿ "${user.displayName}" (${user.username}) ಬಳಕೆದಾರರನ್ನು ಸಿಸ್ಟಮ್‌ನಿಂದ ತೆಗೆದುಹಾಕಬೇಕೆ?`)) {
      const ok = await deleteOfficeUser(user.id || user.username);
      if (ok) {
        showToast('ಬಳಕೆದಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.');
        await loadUsers();
      }
    }
  };

  // Filtered users list
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.displayName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.designation || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.phone || '').includes(searchQuery) ||
      (u.kgidNumber || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesSection = sectionFilter === 'all' || u.section === sectionFilter;
    const matchesStatus = statusFilter === 'all' || (u.status || 'Active') === statusFilter;

    return matchesSearch && matchesRole && matchesSection && matchesStatus;
  });

  // Calculate statistics
  const totalCount = users.length;
  const activeCount = users.filter(u => (u.status || 'Active') === 'Active').length;
  const adminOfficersCount = users.filter(u => u.role === 'Administrator' || u.role === 'Admin' || u.role === 'Officer').length;
  const caseWorkersCount = users.filter(u => u.role === 'Case Worker' || u.role === 'FDA / Nodal' || u.role === 'Superintendent').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-kannada pb-12 animate-in fade-in duration-300">
      {/* Top Directorate Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-2 border-stone-800 rounded-2xl p-6 text-white shadow-[6px_6px_0px_#2b2b2b] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-48 h-48 text-amber-300" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>ಕರ್ನಾಟಕ ಸರ್ಕಾರ • ಸಾರ್ವಜನಿಕ ಶಿಕ್ಷಣ ಇಲಾಖೆ</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <span>ಅಧಿಕೃತ ಬಳಕೆದಾರರ ನಿರ್ವಹಣೆ</span>
              <span className="text-xs bg-amber-400 text-stone-950 px-2.5 py-1 rounded-md font-mono-code font-bold">
                User Management
              </span>
            </h1>
            <p className="text-stone-300 text-xs sm:text-sm max-w-2xl">
              ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳ ಕಾರ್ಯಾಲಯ, ಭದ್ರಾವತಿ — ಇ-ಕಛೇರಿ, ತಪಾಲ ಹಾಗೂ ನೌಕರರ ದಾಖಲೆ ನಿರ್ವಹಣೆಗೆ ಅಧಿಕೃತ ಕಛೇರಿ ಬಳಕೆದಾರರ ಸೃಜನೆ, ತಿದ್ದುಪಡಿ ಹಾಗೂ ಲಾಗಿನ್ ಅಧಿಕಾರಗಳ ವ್ಯವಸ್ಥೆ.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setFormMode('create');
                setCreatorData({
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
              }}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold rounded-xl border-2 border-emerald-400 shadow-[3px_3px_0px_#064e3b] transition-all flex items-center gap-2 cursor-pointer text-xs"
            >
              <UserPlus className="w-4 h-4 text-emerald-200" />
              <span>+ ಹೊಸ ಬಳಕೆದಾರರ ಸೃಜನೆ (User Creator)</span>
            </button>

            <button
              onClick={handleResetToPunithAndAdmin}
              disabled={isLoading}
              className="px-3.5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl border-2 border-amber-300 shadow-[3px_3px_0px_#78350f] transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              title="ಕೇವಲ ಪುನೀತ್ ಜೆ.ಆರ್ ಮತ್ತು admin ಇವರಿಬ್ಬರಿಗೆ ಮಾತ್ರ ಸೀಮಿತಗೊಳಿಸಿ"
            >
              <ShieldCheck className="w-4 h-4 text-stone-950" />
              <span>ಪುನೀತ್ & admin ರಿಸೆಟ್</span>
            </button>

            <button
              onClick={loadUsers}
              disabled={isLoading}
              className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl border border-stone-700 transition-all flex items-center gap-1.5 cursor-pointer text-xs"
              title="ರಿಫ್ರೆಶ್ ಮಾಡಿ"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">ನವೀಕರಿಸಿ</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-bold">ಒಟ್ಟು ಬಳಕೆದಾರರು (Total)</div>
            <div className="text-xl font-black text-stone-900 font-mono-code">{totalCount}</div>
            <div className="text-[10px] text-stone-500">ಕಛೇರಿ ಖಾತೆಗಳು</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold">
            <BadgeCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-bold">ಸಕ್ರಿಯ ಖಾತೆಗಳು (Active)</div>
            <div className="text-xl font-black text-emerald-700 font-mono-code">{activeCount}</div>
            <div className="text-[10px] text-stone-500">ಪೂರ್ಣ ಪ್ರವೇಶಾವಕಾಶ</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-bold">ಮುಖ್ಯಸ್ಥರು & ಅಧಿಕಾರಿಗಳು</div>
            <div className="text-xl font-black text-amber-800 font-mono-code">{adminOfficersCount}</div>
            <div className="text-[10px] text-stone-500">BEO & ಆಡಳಿತಾಧಿಕಾರಿಗಳು</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-purple-100 border border-purple-300 text-purple-800 flex items-center justify-center font-bold">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] text-stone-500 font-bold">ವಿಷಯ ನಿರ್ವಾಹಕರು & FDA</div>
            <div className="text-xl font-black text-purple-800 font-mono-code">{caseWorkersCount}</div>
            <div className="text-[10px] text-stone-500">ಆ1, ಆ2, ಆ3, ಆ4 ಶಾಖೆಗಳು</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ಹೆಸರು, ಬಳಕೆದಾರರ ಐಡಿ, ಹುದ್ದೆ, ಇಮೇಲ್ ಅಥವಾ ಮೊಬೈಲ್ ಮೂಲಕ ಹುಡುಕಿ..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={e => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 font-bold"
          >
            <option value="all">ಎಲ್ಲಾ ಪಾತ್ರಗಳು (All Roles)</option>
            <option value="Administrator">Administrator (ಮುಖ್ಯಸ್ಥರು)</option>
            <option value="Superintendent">Superintendent (ಅಧೀಕ್ಷಕರು)</option>
            <option value="FDA / Nodal">FDA / Nodal (ನೋಡಲ್ ಅಧಿಕಾರಿ)</option>
            <option value="Case Worker">Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು)</option>
            <option value="Officer">Officer (ಅಧಿಕಾರಿಗಳು)</option>
            <option value="Data Entry Operator">Data Entry Operator</option>
          </select>

          {/* Section Filter */}
          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 font-bold"
          >
            <option value="all">ಎಲ್ಲಾ ಶಾಖೆಗಳು (All Sections)</option>
            <option value="ಆ1">ಆ1 - ಅನುದಾನ & ಲೆಕ್ಕ ಶಾಖೆ</option>
            <option value="ಆ2">ಆ2 - ಪ್ರಾಥಮಿಕ ಶಿಕ್ಷಣ ಶಾಖೆ</option>
            <option value="ಆ3">ಆ3 - ಪ್ರೌಢ ಶಿಕ್ಷಣ ಶಾಖೆ</option>
            <option value="ಆ4">ಆ4 - RTI & ಪಿಂಚಣಿ ಶಾಖೆ</option>
            <option value="ಆಡಳಿತ">ಆಡಳಿತ ಶಾಖೆ (General Admin)</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-lg text-xs bg-stone-50 font-bold"
          >
            <option value="all">ಸ್ಥಿತಿ: ಎಲ್ಲಾ (All Status)</option>
            <option value="Active">ಸಕ್ರಿಯ (Active)</option>
            <option value="Suspended">ಅಮಾನತು (Suspended)</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1.5 text-xs font-bold ${viewMode === 'cards' ? 'bg-stone-900 text-amber-300' : 'bg-stone-100 text-stone-600'}`}
              title="ಕಾರ್ಡ್ ನೋಟ"
            >
              ಕಾರ್ಡ್
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1.5 text-xs font-bold ${viewMode === 'table' ? 'bg-stone-900 text-amber-300' : 'bg-stone-100 text-stone-600'}`}
              title="ಕೋಷ್ಟಕ ನೋಟ"
            >
              ಕೋಷ್ಟಕ
            </button>
          </div>
        </div>
      </div>

      {/* USER LIST CARDS VIEW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((u, idx) => {
            const isCurrent = currentUser?.username === u.username || currentUser?.email === u.email;
            const isSuspended = u.status === 'Suspended';

            return (
              <div
                key={u.id || u.username || idx}
                className={`bg-white rounded-xl border-2 transition-all p-4 flex flex-col justify-between gap-3 relative ${
                  isCurrent
                    ? 'border-amber-500 shadow-[5px_5px_0px_#d97706] ring-2 ring-amber-400/30'
                    : isSuspended
                    ? 'border-stone-400 bg-stone-50 opacity-75'
                    : 'border-stone-800 shadow-[4px_4px_0px_#2b2b2b] hover:shadow-[6px_6px_0px_#2b2b2b] hover:-translate-x-0.5 hover:-translate-y-0.5'
                }`}
              >
                {/* Active Session Indicator Ribbon */}
                {isCurrent && (
                  <div className="absolute -top-3 -right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 font-bold px-3 py-0.5 rounded-full text-[10px] border border-amber-300 shadow-xs flex items-center gap-1 font-mono-code">
                    <CheckCircle2 className="w-3 h-3 text-stone-950" />
                    <span>ACTIVE SESSION</span>
                  </div>
                )}

                <div>
                  {/* Top user header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-stone-900 to-stone-800 text-amber-300 border border-stone-700 flex items-center justify-center font-bold text-sm shrink-0 shadow-xs">
                        {u.displayName ? u.displayName.charAt(0) : 'U'}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-stone-900 leading-tight">
                          {u.displayName}
                        </h3>
                        <div className="text-[11px] text-stone-500 font-mono-code flex items-center gap-1.5 mt-0.5">
                          <span>@{u.username}</span>
                          {u.kgidNumber && (
                            <span className="text-[10px] bg-stone-100 text-stone-700 px-1 py-0.2 rounded border border-stone-200">
                              KGID: {u.kgidNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isSuspended
                        ? 'bg-rose-100 text-rose-800 border-rose-300'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      {isSuspended ? 'ಅಮಾನತು' : 'ಸಕ್ರಿಯ'}
                    </span>
                  </div>

                  {/* Designation & Section */}
                  <div className="mt-3 bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-1.5 text-xs">
                    <div className="text-stone-800 font-medium flex items-start gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-stone-500 shrink-0 mt-0.5" />
                      <span>{u.designation}</span>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1 border-t border-stone-200 text-[11px]">
                      <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-bold">
                        ಶಾಖೆ: {u.section || 'ಆ2'}
                      </span>
                      {u.hasAllRoles || (Array.isArray(u.roles) && u.roles.length >= AVAILABLE_ROLES_LIST.length) ? (
                        <span className="bg-gradient-to-r from-amber-400 to-amber-300 text-stone-950 border border-amber-500 px-2 py-0.5 rounded font-bold text-[10px] shadow-2xs flex items-center gap-1">
                          <span>🌟</span>
                          <span>ಎಲ್ಲಾ Role ಮ್ಯಾಪ್ (All Roles Mapped)</span>
                        </span>
                      ) : (
                        <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold">
                          ಪಾತ್ರ: {u.role}
                        </span>
                      )}
                      {Array.isArray(u.roles) && !u.hasAllRoles && u.roles.length > 1 && (
                        <span className="bg-stone-100 text-stone-700 px-1.5 py-0.5 rounded text-[10px] font-semibold border border-stone-300">
                          +{u.roles.length - 1} Roles
                        </span>
                      )}
                      <span className="bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-mono-code text-[10px]">
                        Auth: {u.authProvider || 'system'}
                      </span>
                    </div>

                    {(u.email || u.phone) && (
                      <div className="pt-1 text-[11px] text-stone-600 space-y-0.5">
                        {u.email && (
                          <div className="flex items-center gap-1.5 truncate">
                            <Mail className="w-3 h-3 text-stone-400 shrink-0" />
                            <span className="truncate">{u.email}</span>
                          </div>
                        )}
                        {u.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-stone-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-1.5 flex-wrap">
                  <div className="flex items-center gap-1 flex-wrap">
                    {/* Modify User */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(u)}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-300 font-bold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer"
                      title="ಬಳಕೆದಾರರ ತಿದ್ದುಪಡಿ & ಪಾತ್ರ ಮ್ಯಾಪಿಂಗ್ (Modify User & Role Mapping)"
                    >
                      <Edit2 className="w-3 h-3 text-blue-700" />
                      <span>ತಿದ್ದುಪಡಿ</span>
                    </button>

                    {/* Quick Map All Roles Button */}
                    <button
                      type="button"
                      onClick={() => handleQuickMapAllRoles(u)}
                      className={`px-2 py-1.5 font-bold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                        u.hasAllRoles || (Array.isArray(u.roles) && u.roles.length >= AVAILABLE_ROLES_LIST.length)
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-400'
                      }`}
                      title="ಈ ಬಳಕೆದಾರರಿಗೆ ಎಲ್ಲಾ ಪಾತ್ರಗಳನ್ನು ಮ್ಯಾಪ್ ಮಾಡಿ (Map All Roles to This User)"
                    >
                      <Sparkles className="w-3 h-3 text-amber-600" />
                      <span>{u.hasAllRoles || (Array.isArray(u.roles) && u.roles.length >= AVAILABLE_ROLES_LIST.length) ? 'All Roles ✓' : 'Role ಮ್ಯಾಪ್'}</span>
                    </button>

                    {/* Reset Password */}
                    <button
                      type="button"
                      onClick={() => {
                        setPwdResetUser(u);
                        setNewPasswordVal('');
                      }}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg text-xs transition-all cursor-pointer"
                      title="ಗುಪ್ತಪದ ಬದಲಾವಣೆ (Reset Password)"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle Status */}
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(u)}
                      className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 rounded-lg text-xs transition-all cursor-pointer"
                      title={isSuspended ? 'ಸಕ್ರಿಯಗೊಳಿಸಿ' : 'ಅಮಾನತುಗೊಳಿಸಿ'}
                    >
                      <Shield className={`w-3.5 h-3.5 ${isSuspended ? 'text-rose-600' : 'text-emerald-600'}`} />
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u)}
                      className="p-1.5 hover:bg-rose-50 text-stone-400 hover:text-rose-600 border border-transparent hover:border-rose-200 rounded-lg text-xs transition-all cursor-pointer"
                      title="ತೆಗೆದುಹಾಕಿ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Switch / Login User */}
                  {!isCurrent ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectUser(u);
                        showToast(`ಲಾಗಿನ್ ಬದಲಾಯಿಸಲಾಗಿದೆ: ${u.displayName}`);
                      }}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold rounded-lg text-xs transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                    >
                      <LogIn className="w-3 h-3" />
                      <span>ಲಾಗಿನ್</span>
                    </button>
                  ) : (
                    <span className="px-2 py-1 bg-emerald-50 text-emerald-800 font-bold text-xs rounded border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>ಸಕ್ರಿಯ</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* USER LIST TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-xl border-2 border-stone-800 shadow-[4px_4px_0px_#2b2b2b] overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-900 text-white border-b-2 border-stone-800 font-bold">
                <th className="p-3">#</th>
                <th className="p-3">ಪೂರ್ಣ ಹೆಸರು & ಐಡಿ</th>
                <th className="p-3">ಹುದ್ದೆ (Designation)</th>
                <th className="p-3">ಶಾಖೆ (Section)</th>
                <th className="p-3">ಪಾತ್ರಗಳು (Roles Mapping)</th>
                <th className="p-3">ಸಂಪರ್ಕ ವಿವರ</th>
                <th className="p-3">ಸ್ಥಿತಿ</th>
                <th className="p-3 text-right">ಕ್ರಮಗಳು (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {filteredUsers.map((u, idx) => {
                const isCurrent = currentUser?.username === u.username || currentUser?.email === u.email;

                return (
                  <tr 
                    key={u.id || u.username || idx}
                    className={`hover:bg-stone-50 transition-colors ${isCurrent ? 'bg-amber-50/70 font-semibold' : ''}`}
                  >
                    <td className="p-3 font-mono-code text-stone-500">{idx + 1}</td>
                    <td className="p-3">
                      <div className="font-bold text-stone-900">{u.displayName}</div>
                      <div className="text-[10px] text-stone-500 font-mono-code">@{u.username}</div>
                    </td>
                    <td className="p-3 text-stone-700">{u.designation}</td>
                    <td className="p-3">
                      <span className="bg-sky-100 text-sky-900 px-2 py-0.5 rounded font-bold text-[11px]">
                        {u.section || 'ಆ2'}
                      </span>
                    </td>
                    <td className="p-3">
                      {u.hasAllRoles || (Array.isArray(u.roles) && u.roles.length >= AVAILABLE_ROLES_LIST.length) ? (
                        <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-950 border border-amber-400 px-2 py-0.5 rounded font-bold text-[10px] shadow-2xs">
                          <span>🌟</span>
                          <span>ಎಲ್ಲಾ Role ಮ್ಯಾಪ್ (All Roles)</span>
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          <span className="bg-purple-100 text-purple-900 px-2 py-0.5 rounded font-bold text-[11px]">
                            {u.role}
                          </span>
                          {Array.isArray(u.roles) && u.roles.filter(r => r !== u.role).map(extra => (
                            <span key={extra} className="bg-stone-100 text-stone-700 border border-stone-200 px-1 py-0.2 rounded text-[10px]">
                              +{extra}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-stone-600">
                      <div>{u.email || '-'}</div>
                      <div className="text-stone-500">{u.phone || '-'}</div>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        u.status === 'Suspended'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      }`}>
                        {u.status === 'Suspended' ? 'ಅಮಾನತು' : 'ಸಕ್ರಿಯ'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleQuickMapAllRoles(u)}
                          className={`px-2 py-1 rounded font-bold text-xs border flex items-center gap-1 cursor-pointer transition-colors ${
                            u.hasAllRoles || (Array.isArray(u.roles) && u.roles.length >= AVAILABLE_ROLES_LIST.length)
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300'
                          }`}
                          title="ಎಲ್ಲಾ ಪಾತ್ರಗಳನ್ನು ಮ್ಯಾಪ್ ಮಾಡಿ"
                        >
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Role ಮ್ಯಾಪ್</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded font-bold text-xs cursor-pointer"
                          title="ತಿದ್ದುಪಡಿ"
                        >
                          ತಿದ್ದುಪಡಿ
                        </button>
                        {!isCurrent ? (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectUser(u);
                              showToast(`ಲಾಗಿನ್ ಬದಲಾಯಿಸಲಾಗಿದೆ: ${u.displayName}`);
                            }}
                            className="px-2.5 py-1 bg-stone-900 text-amber-300 rounded font-bold text-xs cursor-pointer"
                          >
                            ಲಾಗಿನ್
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold text-xs px-2">ಸಕ್ರಿಯ</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="p-1 hover:text-rose-600 text-stone-400 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL 1: USER CREATOR (ಹೊಸ ಬಳಕೆದಾರರ ಸೃಜನೆ) */}
      {formMode === 'create' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[8px_8px_0px_#2b2b2b] max-w-2xl w-full overflow-hidden text-xs font-kannada flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>ಹೊಸ ಅಧಿಕೃತ ಕಛೇರಿ ಬಳಕೆದಾರರ ಸೃಜನೆ</span>
                    <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded font-mono-code font-bold">
                      USER CREATOR
                    </span>
                  </h3>
                  <p className="text-[11px] text-emerald-200">
                    ಭದ್ರಾವತಿ BEO ಕಛೇರಿಯ ಇ-ಫೈಲ್ ಮತ್ತು ತಪಾಲ ನಿರ್ವಹಣೆಗೆ ಅಧಿಕೃತ ಖಾತೆ ಸೃಜಿಸಿ
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFormMode(null)}
                className="p-1.5 text-emerald-200 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* Quick Presets Buttons */}
              <div className="bg-amber-50/70 border border-amber-300 p-3 rounded-xl space-y-2">
                <div className="text-[11px] font-bold text-amber-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                  <span>ತ್ವರಿತ ಪೂರ್ವನಿರ್ಧರಿತ ಪ್ರೊಫೈಲ್ ಆಯ್ಕೆ (Quick Role Presets):</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => applyPreset('all')}
                    className="px-2.5 py-1 bg-amber-400 hover:bg-amber-500 text-stone-950 border border-amber-600 rounded font-bold text-[11px] cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    🌟 ಒಬ್ಬರಿಗೆ ಎಲ್ಲಾ Role ಮ್ಯಾಪ್ (All Roles Mapped)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('beo')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    🏛️ BEO Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('os')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    📋 OS ಅಧೀಕ್ಷಕರು
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('fda')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    📜 FDA ನೋಡಲ್
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw1')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    📁 Case Worker ಆ1
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw2')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    📁 Case Worker ಆ2
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw3')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    📁 Case Worker ಆ3
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('cw4')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    📁 Case Worker ಆ4
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('deo')}
                    className="px-2.5 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded font-bold text-[11px] text-amber-950 cursor-pointer shadow-2xs"
                  >
                    💻 DEO ಆಪರೇಟರ್
                  </button>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪೂರ್ಣ ಹೆಸರು (Full Name)*</label>
                  <input
                    type="text"
                    required
                    placeholder="ಶ್ರೀ / ಶ್ರೀಮತಿ..."
                    value={creatorData.displayName}
                    onChange={e => setCreatorData({ ...creatorData, displayName: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-bold bg-white focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಬಳಕೆದಾರರ ಹೆಸರು (Username / Login ID)*</label>
                  <input
                    type="text"
                    required
                    placeholder="ಉದಾ: punith_fda ಅಥವಾ beo_admin"
                    value={creatorData.username}
                    onChange={e => setCreatorData({ ...creatorData, username: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-700 font-bold">ಗುಪ್ತಪದ (Password)</label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[10px] text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>ಸುರಕ್ಷಿತ ಪಾಸ್‌ವರ್ಡ್ ಸೃಜಿಸಿ</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳು (Default: zero0)"
                      value={creatorData.password}
                      onChange={e => setCreatorData({ ...creatorData, password: e.target.value })}
                      className="w-full p-2 pr-9 border border-stone-300 rounded-lg bg-white font-mono-code focus:ring-2 focus:ring-emerald-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಹುದ್ದೆ (Designation)*</label>
                  <input
                    type="text"
                    required
                    placeholder="ವಿಷಯ ನಿರ್ವಾಹಕರು / FDA / ಅಧೀಕ್ಷಕರು"
                    value={creatorData.designation}
                    onChange={e => setCreatorData({ ...creatorData, designation: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪ್ರಾಥಮಿಕ ಪಾತ್ರ (Primary Role)*</label>
                  <select
                    value={creatorData.role}
                    onChange={e => setCreatorData({ ...creatorData, role: e.target.value as any })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-bold focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="Case Worker">Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು - Case Worker)</option>
                    <option value="Administrator">Administrator (ಮುಖ್ಯಸ್ಥರು / BEO)</option>
                    <option value="Superintendent">Superintendent (ಕಛೇರಿ ಅಧೀಕ್ಷಕರು)</option>
                    <option value="FDA / Nodal">FDA / Nodal (RTI & ಪಿಂಚಣಿ ನೋಡಲ್ ಅಧಿಕಾರಿ)</option>
                    <option value="Officer">Officer (ಅಧಿಕಾರಿಗಳು / AAO / SI)</option>
                    <option value="Data Entry Operator">Data Entry Operator (ಡೇಟಾ ಎಂಟ್ರಿ)</option>
                  </select>
                </div>

                {/* ROLE MAPPING ENGINE: ಒಬ್ಬರಿಗೆ ಎಲ್ಲಾ ಪಾತ್ರಗಳನ್ನು ಮ್ಯಾಪ್ ಮಾಡುವ ವ್ಯವಸ್ಥೆ */}
                <div className="sm:col-span-2 bg-gradient-to-br from-amber-50 via-orange-50/40 to-amber-100/50 p-3.5 rounded-xl border-2 border-amber-400 shadow-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-amber-950">
                        <Sparkles className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>ಒಬ್ಬರಿಗೆ ಎಲ್ಲಾ Role ಮ್ಯಾಪ್ ಮಾಡುವ ವ್ಯವಸ್ಥೆ (Role Mapping Engine)</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        ಕಛೇರಿಯ ಒಬ್ಬರೇ ಅಧಿಕೃತ ಬಳಕೆದಾರರಿಗೆ ಎಲ್ಲಾ 6 ಪಾತ್ರಗಳನ್ನು ಅಥವಾ ನಿರ್ದಿಷ್ಟ ಬಹು-ಪಾತ್ರಗಳನ್ನು (Multi-Roles) ಮ್ಯಾಪ್ ಮಾಡಿ.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !creatorData.hasAllRoles;
                        setCreatorData(prev => ({
                          ...prev,
                          hasAllRoles: nextVal,
                          roles: nextVal ? AVAILABLE_ROLES_LIST.map(r => r.id) : [prev.role],
                        }));
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        creatorData.hasAllRoles
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-amber-100 text-amber-950 border-amber-400 shadow-2xs'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{creatorData.hasAllRoles ? '✓ ಎಲ್ಲಾ ಪಾತ್ರಗಳು ಮ್ಯಾಪ್ ಆಗಿವೆ' : '🌟 ಎಲ್ಲಾ Role ಮ್ಯಾಪ್ ಮಾಡಿ (Select All)'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {AVAILABLE_ROLES_LIST.map(r => {
                      const isSelected = creatorData.hasAllRoles || creatorData.roles.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                            isSelected
                              ? 'bg-white border-amber-500 text-stone-900 shadow-xs font-bold ring-1 ring-amber-400'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (creatorData.hasAllRoles) {
                                const remaining = AVAILABLE_ROLES_LIST.map(x => x.id).filter(x => x !== r.id);
                                setCreatorData(prev => ({
                                  ...prev,
                                  hasAllRoles: false,
                                  roles: remaining
                                }));
                              } else {
                                const nextRoles = e.target.checked
                                  ? [...creatorData.roles, r.id]
                                  : creatorData.roles.filter(x => x !== r.id);
                                setCreatorData(prev => ({
                                  ...prev,
                                  roles: nextRoles,
                                  hasAllRoles: nextRoles.length >= AVAILABLE_ROLES_LIST.length
                                }));
                              }
                            }}
                            className="mt-0.5 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <div className="leading-tight">
                            <div className="flex items-center gap-1">
                              <span>{r.icon}</span>
                              <span className="font-bold">{r.labelKannada}</span>
                            </div>
                            <div className="text-[10px] text-stone-500 font-normal mt-0.5">{r.labelEn}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಶಾಖೆ (Section / Branch)*</label>
                  <select
                    value={creatorData.section}
                    onChange={e => setCreatorData({ ...creatorData, section: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-bold focus:ring-2 focus:ring-emerald-400"
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
                    value={creatorData.email}
                    onChange={e => setCreatorData({ ...creatorData, email: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone / Mobile)</label>
                  <input
                    type="tel"
                    placeholder="9876543210"
                    value={creatorData.phone}
                    onChange={e => setCreatorData({ ...creatorData, phone: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಕೆಜಿಐಡಿ / ನೌಕರರ ಸಂಖ್ಯೆ (KGID / Emp ID)</label>
                  <input
                    type="text"
                    placeholder="KGID-108420"
                    value={creatorData.kgidNumber}
                    onChange={e => setCreatorData({ ...creatorData, kgidNumber: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಖಾತೆ ಸ್ಥಿತಿ (Status)*</label>
                  <select
                    value={creatorData.status}
                    onChange={e => setCreatorData({ ...creatorData, status: e.target.value as any })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-bold focus:ring-2 focus:ring-emerald-400"
                  >
                    <option value="Active">ಸಕ್ರಿಯ (Active)</option>
                    <option value="Suspended">ಅಮಾನತು (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Permission Capabilities Preview */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block text-stone-700 font-bold mb-1.5">ಅನುಮತಿ ಕಾರ್ಯವ್ಯಾಪ್ತಿ (Permissions):</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creatorData.permissions.includes('dak_read')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setCreatorData(prev => ({
                          ...prev,
                          permissions: checked 
                            ? [...prev.permissions, 'dak_read']
                            : prev.permissions.filter(p => p !== 'dak_read')
                        }));
                      }}
                      className="rounded text-emerald-600"
                    />
                    <span>ತಪಾಲ ವೀಕ್ಷಣೆ (Dak Read)</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creatorData.permissions.includes('letter_draft')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setCreatorData(prev => ({
                          ...prev,
                          permissions: checked 
                            ? [...prev.permissions, 'letter_draft']
                            : prev.permissions.filter(p => p !== 'letter_draft')
                        }));
                      }}
                      className="rounded text-emerald-600"
                    />
                    <span>ಪತ್ರ ಕರಡು ರಚನೆ (Draft Letters)</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creatorData.permissions.includes('pension_sanction')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setCreatorData(prev => ({
                          ...prev,
                          permissions: checked 
                            ? [...prev.permissions, 'pension_sanction']
                            : prev.permissions.filter(p => p !== 'pension_sanction')
                        }));
                      }}
                      className="rounded text-emerald-600"
                    />
                    <span>ಪಿಂಚಣಿ ಪ್ರಸ್ತಾವನೆ (Pension Studio)</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creatorData.permissions.includes('rti_reply')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setCreatorData(prev => ({
                          ...prev,
                          permissions: checked 
                            ? [...prev.permissions, 'rti_reply']
                            : prev.permissions.filter(p => p !== 'rti_reply')
                        }));
                      }}
                      className="rounded text-emerald-600"
                    />
                    <span>RTI ಉತ್ತರ & ನಿರ್ವಹಣೆ (RTI)</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creatorData.permissions.includes('hrms_read')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setCreatorData(prev => ({
                          ...prev,
                          permissions: checked 
                            ? [...prev.permissions, 'hrms_read']
                            : prev.permissions.filter(p => p !== 'hrms_read')
                        }));
                      }}
                      className="rounded text-emerald-600"
                    />
                    <span>HRMS ಸೇವಾ ಪುಸ್ತಕ (HRMS)</span>
                  </label>
                  <label className="flex items-center gap-1.5 bg-stone-50 p-2 rounded border border-stone-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={creatorData.permissions.includes('admin_all')}
                      onChange={e => {
                        const checked = e.target.checked;
                        setCreatorData(prev => ({
                          ...prev,
                          permissions: checked 
                            ? [...prev.permissions, 'admin_all']
                            : prev.permissions.filter(p => p !== 'admin_all')
                        }));
                      }}
                      className="rounded text-emerald-600"
                    />
                    <span>ಸಂಪೂರ್ಣ ಆಡಳಿತ (Super Admin)</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-bold hover:bg-stone-100 cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg font-bold transition-all border border-emerald-800 cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Check className="w-4 h-4" />
                  <span>ಬಳಕೆದಾರರನ್ನು ಸೃಜಿಸಿ (Create User Now)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: USER MODIFIER (ಬಳಕೆದಾರರ ತಿದ್ದುಪಡಿ) */}
      {formMode === 'edit' && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[8px_8px_0px_#2b2b2b] max-w-2xl w-full overflow-hidden text-xs font-kannada flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-stone-950 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white flex items-center gap-2">
                    <span>ಬಳಕೆದಾರರ ವಿವರ ತಿದ್ದುಪಡಿ & ಬದಲಾವಣೆ</span>
                    <span className="text-[10px] bg-blue-500 text-white px-2 py-0.5 rounded font-mono-code font-bold">
                      USER MODIFIER
                    </span>
                  </h3>
                  <p className="text-[11px] text-blue-200">
                    ಬಳಕೆದಾರ: <strong>{modifierData.displayName}</strong> (@{modifierData.username})
                  </p>
                </div>
              </div>

              <button
                onClick={() => setFormMode(null)}
                className="p-1.5 text-blue-200 hover:text-white rounded transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleEditSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪೂರ್ಣ ಹೆಸರು (Full Name)*</label>
                  <input
                    type="text"
                    required
                    value={modifierData.displayName}
                    onChange={e => setModifierData({ ...modifierData, displayName: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-bold bg-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಬಳಕೆದಾರರ ಹೆಸರು (Username)*</label>
                  <input
                    type="text"
                    required
                    value={modifierData.username}
                    onChange={e => setModifierData({ ...modifierData, username: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-stone-700 font-bold">ಹೊಸ ಗುಪ್ತಪದ (New Password)</label>
                    <button
                      type="button"
                      onClick={generateStrongPassword}
                      className="text-[10px] text-blue-700 hover:text-blue-900 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>ಪಾಸ್‌ವರ್ಡ್ ಸೃಜಿಸಿ</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="ಖಾಲಿ ಬಿಟ್ಟರೆ ಹಳೆಯ ಪಾಸ್‌ವರ್ಡ್ ಮುಂದುವರಿಯುತ್ತದೆ"
                      value={modifierData.password}
                      onChange={e => setModifierData({ ...modifierData, password: e.target.value })}
                      className="w-full p-2 pr-9 border border-stone-300 rounded-lg bg-white font-mono-code focus:ring-2 focus:ring-blue-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಹುದ್ದೆ (Designation)*</label>
                  <input
                    type="text"
                    required
                    value={modifierData.designation}
                    onChange={e => setModifierData({ ...modifierData, designation: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಪ್ರಾಥಮಿಕ ಪಾತ್ರ (Primary Role)*</label>
                  <select
                    value={modifierData.role}
                    onChange={e => setModifierData({ ...modifierData, role: e.target.value as any })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-bold focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Case Worker">Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು - Case Worker)</option>
                    <option value="Administrator">Administrator (ಮುಖ್ಯಸ್ಥರು / BEO)</option>
                    <option value="Superintendent">Superintendent (ಕಛೇರಿ ಅಧೀಕ್ಷಕರು)</option>
                    <option value="FDA / Nodal">FDA / Nodal (RTI & ಪಿಂಚಣಿ ನೋಡಲ್ ಅಧಿಕಾರಿ)</option>
                    <option value="Officer">Officer (ಅಧಿಕಾರಿಗಳು / AAO / SI)</option>
                    <option value="Data Entry Operator">Data Entry Operator (ಡೇಟಾ ಎಂಟ್ರಿ)</option>
                  </select>
                </div>

                {/* ROLE MAPPING ENGINE: ಒಬ್ಬರಿಗೆ ಎಲ್ಲಾ ಪಾತ್ರಗಳನ್ನು ಮ್ಯಾಪ್ ಮಾಡುವ ವ್ಯವಸ್ಥೆ */}
                <div className="sm:col-span-2 bg-gradient-to-br from-blue-50 via-sky-50/40 to-blue-100/50 p-3.5 rounded-xl border-2 border-blue-400 shadow-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5 font-bold text-xs text-blue-950">
                        <Sparkles className="w-4 h-4 text-blue-700 shrink-0" />
                        <span>ಒಬ್ಬರಿಗೆ ಎಲ್ಲಾ Role ಮ್ಯಾಪ್ ಮಾಡುವ ವ್ಯವಸ್ಥೆ (Role Mapping Engine)</span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        ಈ ಬಳಕೆದಾರರಿಗೆ ಕಛೇರಿಯ ಎಲ್ಲಾ 6 ಅಧಿಕೃತ ಪಾತ್ರಗಳನ್ನು ಅಥವಾ ಆಯ್ದ ಬಹು-ಪಾತ್ರಗಳನ್ನು (Multi-Roles) ಮ್ಯಾಪ್ ಮಾಡಿ.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextVal = !modifierData.hasAllRoles;
                        setModifierData(prev => ({
                          ...prev,
                          hasAllRoles: nextVal,
                          roles: nextVal ? AVAILABLE_ROLES_LIST.map(r => r.id) : [prev.role],
                        }));
                      }}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border-2 transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        modifierData.hasAllRoles
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-sm'
                          : 'bg-white hover:bg-blue-100 text-blue-950 border-blue-400 shadow-2xs'
                      }`}
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>{modifierData.hasAllRoles ? '✓ ಎಲ್ಲಾ ಪಾತ್ರಗಳು ಮ್ಯಾಪ್ ಆಗಿವೆ' : '🌟 ಎಲ್ಲಾ Role ಮ್ಯಾಪ್ ಮಾಡಿ (Select All)'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                    {AVAILABLE_ROLES_LIST.map(r => {
                      const isSelected = modifierData.hasAllRoles || modifierData.roles.includes(r.id);
                      return (
                        <label
                          key={r.id}
                          className={`flex items-start gap-2 p-2.5 rounded-lg border text-xs cursor-pointer select-none transition-all ${
                            isSelected
                              ? 'bg-white border-blue-500 text-stone-900 shadow-xs font-bold ring-1 ring-blue-400'
                              : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-white'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (modifierData.hasAllRoles) {
                                const remaining = AVAILABLE_ROLES_LIST.map(x => x.id).filter(x => x !== r.id);
                                setModifierData(prev => ({
                                  ...prev,
                                  hasAllRoles: false,
                                  roles: remaining
                                }));
                              } else {
                                const nextRoles = e.target.checked
                                  ? [...modifierData.roles, r.id]
                                  : modifierData.roles.filter(x => x !== r.id);
                                setModifierData(prev => ({
                                  ...prev,
                                  roles: nextRoles,
                                  hasAllRoles: nextRoles.length >= AVAILABLE_ROLES_LIST.length
                                }));
                              }
                            }}
                            className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                          <div className="leading-tight">
                            <div className="flex items-center gap-1">
                              <span>{r.icon}</span>
                              <span className="font-bold">{r.labelKannada}</span>
                            </div>
                            <div className="text-[10px] text-stone-500 font-normal mt-0.5">{r.labelEn}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಶಾಖೆ (Section / Branch)*</label>
                  <select
                    value={modifierData.section}
                    onChange={e => setModifierData({ ...modifierData, section: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-bold focus:ring-2 focus:ring-blue-400"
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
                    value={modifierData.email}
                    onChange={e => setModifierData({ ...modifierData, email: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಮೊಬೈಲ್ ಸಂಖ್ಯೆ (Phone / Mobile)</label>
                  <input
                    type="tel"
                    value={modifierData.phone}
                    onChange={e => setModifierData({ ...modifierData, phone: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಕೆಜಿಐಡಿ / ನೌಕರರ ಸಂಖ್ಯೆ (KGID / Emp ID)</label>
                  <input
                    type="text"
                    value={modifierData.kgidNumber}
                    onChange={e => setModifierData({ ...modifierData, kgidNumber: e.target.value })}
                    className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white focus:ring-2 focus:ring-blue-400"
                  />
                </div>

                <div>
                  <label className="block text-stone-700 font-bold mb-1">ಖಾತೆ ಸ್ಥಿತಿ (Status)*</label>
                  <select
                    value={modifierData.status}
                    onChange={e => setModifierData({ ...modifierData, status: e.target.value as any })}
                    className="w-full p-2 border border-stone-300 rounded-lg bg-white font-bold focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="Active">ಸಕ್ರಿಯ (Active)</option>
                    <option value="Suspended">ಅಮಾನತು (Suspended)</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setFormMode(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg text-stone-700 font-bold hover:bg-stone-100 cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-bold transition-all border border-blue-800 cursor-pointer flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ (Save Modifications)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK PASSWORD RESET */}
      {pwdResetUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border-2 border-stone-800 shadow-[8px_8px_0px_#2b2b2b] max-w-md w-full overflow-hidden text-xs font-kannada">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between border-b-2 border-stone-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">ಗುಪ್ತಪದ ಮರುಹೊಂದಿಸಿ (Reset Password)</h3>
              </div>
              <button onClick={() => setPwdResetUser(null)} className="text-stone-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-5 space-y-4">
              <div className="text-stone-700">
                ಬಳಕೆದಾರ: <strong>{pwdResetUser.displayName}</strong> (@{pwdResetUser.username})
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-stone-700 font-bold">ಹೊಸ ಗುಪ್ತಪದ (New Password)*</label>
                  <button
                    type="button"
                    onClick={generateStrongPassword}
                    className="text-[10px] text-amber-700 hover:text-amber-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>ಪಾಸ್‌ವರ್ಡ್ ಸೃಜಿಸಿ</span>
                  </button>
                </div>
                <input
                  type="text"
                  required
                  placeholder="ಕನಿಷ್ಠ 4 ಅಕ್ಷರಗಳು"
                  value={newPasswordVal}
                  onChange={e => setNewPasswordVal(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-lg font-mono-code bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdResetUser(null)}
                  className="px-3 py-1.5 border border-stone-300 rounded font-bold hover:bg-stone-100 cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-1.5 bg-stone-900 text-amber-300 rounded font-bold hover:bg-stone-800 cursor-pointer"
                >
                  ಗುಪ್ತಪದ ಬದಲಾಯಿಸಿ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Guidelines & Role Hierarchy Card */}
      <div className="bg-stone-50 border-2 border-stone-800 rounded-xl p-5 shadow-[4px_4px_0px_#2b2b2b] space-y-3">
        <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>ಕಛೇರಿ ಪಾತ್ರಗಳು & ಕಾರ್ಯವ್ಯಾಪ್ತಿ ಮಾರ್ಗದರ್ಶಿ (BEO Office Role Hierarchy):</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-stone-300 space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Administrator (ಕ್ಷೇತ್ರ ಶಿಕ್ಷಣಾಧಿಕಾರಿಗಳು)</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              ಕಛೇರಿಯ ಮುಖ್ಯಸ್ಥರು, ಪ್ರಥಮ ಮೇಲ್ಮನವಿ ಪ್ರಾಧಿಕಾರ, ಅಂತಿಮ ಪತ್ರ/ಆದೇಶ ಅನುಮೋದನೆ ಮತ್ತು ನಿವೃತ್ತಿ ಪಿಂಚಣಿ ಮಂಜೂರಾತಿ ಅಧಿಕಾರ.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-stone-300 space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>Superintendent (ಕಛೇರಿ ಅಧೀಕ್ಷಕರು)</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              ಶಾಖಾ ತಪಾಸಣೆ, ಕಡತಗಳ ಮೇಲ್ವಿಚಾರಣೆ, ಸೇವಾ ಪುಸ್ತಕಗಳ ಪರಿಶೀಲನೆ ಹಾಗೂ ವಿಷಯ ನಿರ್ವಾಹಕರ ಕಡತಗಳ ಪರಿಶೀಲನಾ ಅಧಿಕಾರ.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-stone-300 space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>FDA / Nodal (ಪ್ರಥಮ ದರ್ಜೆ ಸಹಾಯಕರು)</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              ಆ4 ಶಾಖೆ, RTI ಅರ್ಜಿಗಳ ನಿರ್ವಹಣೆ, ಪಿಂಚಣಿ ಪ್ರಸ್ತಾವನೆ ಸಿದ್ಧತೆ, ಶಾಸನಬದ್ಧ ಸುತ್ತೋಲೆಗಳು ಹಾಗೂ ಇಲಾಖಾ ತಪಾಸಣೆ.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-stone-300 space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Case Worker (ವಿಷಯ ನಿರ್ವಾಹಕರು)</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              ಆ1/ಆ2/ಆ3/ಆ4 ಶಾಖೆಗಳಲ್ಲಿ ಆವಕ-ಜಾವಕ ತಪಾಲ ನೋಂದಣಿ, ಟಿಪ್ಪಣಿ ಹಾಳೆ (Note sheet) ಸೃಜನೆ ಮತ್ತು ಅಧಿಕೃತ ಪತ್ರ ಕರಡು ರಚನೆ.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-stone-300 space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              <span>Officer (ಸಹಾಯಕ ಆಡಳಿತಾಧಿಕಾರಿಗಳು / SI)</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              ಶಾಲಾ ತಪಾಸಣೆ, ಶೈಕ್ಷಣಿಕ ವರದಿಗಳ ಪರಿಶೀಲನೆ, ವೇತನ ಅನುದಾನ ತಪಾಸಣೆ ಹಾಗೂ ಕ್ಷೇತ್ರ ಭೇಟಿ ಪರಿಶೀಲನೆ.
            </p>
          </div>

          <div className="bg-white p-3 rounded-lg border border-stone-300 space-y-1">
            <div className="font-bold text-stone-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-stone-500"></span>
              <span>Data Entry Operator (ಡೇಟಾ ಎಂಟ್ರಿ)</span>
            </div>
            <p className="text-stone-600 text-[11px]">
              ದೈನಂದಿನ ತಪಾಲ ಸ್ಕ್ಯಾನಿಂಗ್, ಆವಕ ದಾಖಲಾತಿ, ಪತ್ರ ಪ್ರಿಂಟಿಂಗ್ ಹಾಗೂ ಇ-ಆಡಳಿತ ಪೋರ್ಟಲ್‌ನಲ್ಲಿ ಡೇಟಾ ನಮೂದು.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

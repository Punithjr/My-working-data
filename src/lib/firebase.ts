import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDocFromServer, 
  collection, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { AdminAuthUser, RtiCaseRecord, PensionCaseRecord } from '../types';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

const cfg = firebaseConfig as any;
export const db = cfg.firestoreDatabaseId 
  ? getFirestore(app, cfg.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const MAX_OFFICE_USERS = 25;

// The Official Government Department User Profiles - Strictly Punith J.R. and Admin
export const INITIAL_5_OFFICE_USERS: AdminAuthUser[] = [
  {
    id: 'user-punith-01',
    username: 'punithjr',
    email: 'punithjr2@gmail.com',
    phone: '9448000001',
    role: 'Administrator',
    roles: ['Administrator', 'Superintendent', 'FDA / Nodal', 'Case Worker', 'Officer', 'Data Entry Operator'],
    hasAllRoles: true,
    displayName: 'ಪುನೀತ್ ಜೆ.ಆರ್',
    designation: 'ಮುಖ್ಯಸ್ಥರು / ಆಡಳಿತಾಧಿಕಾರಿಗಳು (BEO / Head of Office)',
    section: 'ಆಡಳಿತ ಶಾಖೆ',
    status: 'Active',
    loginTime: new Date().toISOString(),
    authProvider: 'google',
    permissions: ['all', 'admin', 'dak_read', 'letter_draft', 'file_read', 'sanctions_approve']
  },
  {
    id: 'user-admin-02',
    username: 'admin',
    email: 'admin.edn.bhd@karnataka.gov.in',
    phone: '9448000002',
    role: 'Administrator',
    roles: ['Administrator'],
    hasAllRoles: true,
    displayName: 'admin',
    designation: 'ಸಿಸ್ಟಮ್ ಅಡ್ಮಿನಿಸ್ಟ್ರೇಟರ್ (System Administrator)',
    section: 'ಕೇಂದ್ರ ಆಡಳಿತ',
    status: 'Active',
    loginTime: new Date().toISOString(),
    authProvider: 'system',
    permissions: ['all', 'admin']
  }
];

export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase connection verified successfully.');
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase connection is operating in offline mode or awaiting Cloud Firestore API activation.');
    } else {
      console.warn('Firebase status:', error);
    }
  }
}

// Automatically verify connection on initialization
testConnection();

// ==================== USER MANAGEMENT & FIREBASE AUTH ====================

// Helper to filter only Punith J.R. and Admin
function filterStrictAuthorizedUsers(rawList: AdminAuthUser[]): AdminAuthUser[] {
  if (!Array.isArray(rawList)) return INITIAL_5_OFFICE_USERS;
  
  const matches = rawList.filter(u => {
    const uname = (u.username || '').toLowerCase().trim();
    const name = (u.displayName || '').toLowerCase().trim();
    const email = (u.email || '').toLowerCase().trim();
    return (
      uname === 'admin' ||
      uname === 'punithjr' ||
      uname === 'punith' ||
      name.includes('ಪುನೀತ್') ||
      name.includes('punith') ||
      name === 'admin' ||
      email === 'punithjr2@gmail.com'
    );
  });

  const hasPunith = matches.some(u => (u.displayName || '').includes('ಪುನೀತ್') || u.username === 'punithjr' || u.email === 'punithjr2@gmail.com');
  const hasAdmin = matches.some(u => u.username === 'admin');

  const finalUsers: AdminAuthUser[] = [...matches];
  if (!hasPunith) finalUsers.unshift(INITIAL_5_OFFICE_USERS[0]);
  if (!hasAdmin) finalUsers.push(INITIAL_5_OFFICE_USERS[1]);

  return finalUsers;
}

/**
 * Fetch all registered users from Firestore and local server - strictly Punith J.R and Admin.
 */
export async function getRegisteredOfficeUsers(): Promise<AdminAuthUser[]> {
  try {
    // 1. Try Firestore first
    const snap = await getDocs(collection(db, 'users'));
    if (!snap.empty) {
      const rawUsers: AdminAuthUser[] = [];
      snap.forEach(docSnap => {
        rawUsers.push(docSnap.data() as AdminAuthUser);
      });
      const authorized = filterStrictAuthorizedUsers(rawUsers);
      localStorage.setItem('edu_registered_5_users', JSON.stringify(authorized));
      return authorized;
    }
  } catch (err) {
    console.warn('Firestore getRegisteredOfficeUsers fallback:', err);
  }

  // 2. Try LocalStorage
  const local = localStorage.getItem('edu_registered_5_users');
  if (local) {
    try {
      const parsed = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const authorized = filterStrictAuthorizedUsers(parsed);
        localStorage.setItem('edu_registered_5_users', JSON.stringify(authorized));
        return authorized;
      }
    } catch (e) {
      // ignore
    }
  }

  // 3. Fallback to Initial 2 Users
  try {
    for (const u of INITIAL_5_OFFICE_USERS) {
      await setDoc(doc(db, 'users', u.id || u.username), u);
    }
  } catch (seedErr) {
    console.warn('Firestore seeding note:', seedErr);
  }
  localStorage.setItem('edu_registered_5_users', JSON.stringify(INITIAL_5_OFFICE_USERS));
  return INITIAL_5_OFFICE_USERS;
}

/**
 * Registers a new office user (allows registering case workers and administrative staff).
 */
export async function registerOfficeUserWithLimit(params: {
  email: string;
  phone?: string;
  password?: string;
  username: string;
  displayName: string;
  designation: string;
  role: AdminAuthUser['role'];
  roles?: AdminAuthUser['role'][];
  hasAllRoles?: boolean;
  authProvider: 'google' | 'password' | 'system';
  section?: string;
  kgidNumber?: string;
  status?: 'Active' | 'Inactive' | 'Suspended';
  permissions?: string[];
}): Promise<{ success: boolean; user?: AdminAuthUser; message: string }> {
  try {
    const currentUsers = await getRegisteredOfficeUsers();

    // Check for duplicate username or email
    const exists = currentUsers.some(
      u => u.username.toLowerCase() === params.username.toLowerCase() || 
           (params.email && u.email && u.email.toLowerCase() === params.email.toLowerCase())
    );
    if (exists) {
      return {
        success: false,
        message: 'ಈ ಬಳಕೆದಾರರ ಹೆಸರು ಅಥವಾ ಇಮೇಲ್ ಈಗಾಗಲೇ ನೋಂದಾಯಿಸಲ್ಪಟ್ಟಿದೆ (User with this username/email already exists).'
      };
    }

    let firebaseUid = `user-${Date.now()}`;

    // If password provided and email provided, attempt creation in Firebase Auth
    if (params.password && params.email && params.authProvider === 'password') {
      try {
        const userCred = await createUserWithEmailAndPassword(auth, params.email, params.password);
        firebaseUid = userCred.user.uid;
      } catch (authErr: any) {
        console.warn('Firebase Auth registration note:', authErr?.message);
      }
    }

    const newUser: AdminAuthUser = {
      id: firebaseUid,
      username: params.username,
      email: params.email || '',
      phone: params.phone || '',
      role: params.role || 'Case Worker',
      roles: params.roles || [params.role || 'Case Worker'],
      hasAllRoles: Boolean(params.hasAllRoles || (params.roles && params.roles.length >= 6)),
      displayName: params.displayName,
      designation: params.designation || 'ವಿಷಯ ನಿರ್ವಾಹಕರು (Case Worker)',
      section: params.section || 'ಆ2',
      kgidNumber: params.kgidNumber || '',
      status: params.status || 'Active',
      permissions: params.permissions || ['dak_read', 'letter_draft', 'file_read'],
      loginTime: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      authProvider: params.authProvider || 'system'
    };

    // Save to Firestore
    try {
      await setDoc(doc(db, 'users', firebaseUid), newUser);
    } catch (dbErr) {
      console.warn('Firestore write user note:', dbErr);
    }

    // Save to Server API
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: newUser.username,
          displayName: newUser.displayName,
          email: newUser.email,
          phone: newUser.phone,
          password: params.password || 'zero0',
          designation: newUser.designation,
          role: newUser.role,
          roles: newUser.roles,
          hasAllRoles: newUser.hasAllRoles,
          section: newUser.section,
          kgidNumber: newUser.kgidNumber,
          status: newUser.status,
          permissions: newUser.permissions
        })
      });
    } catch (apiErr) {
      console.warn('API sync note:', apiErr);
    }

    // Update local cache
    const updatedList = [...currentUsers, newUser];
    localStorage.setItem('edu_registered_5_users', JSON.stringify(updatedList));

    return {
      success: true,
      user: newUser,
      message: `ನೂತನ ಬಳಕೆದಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನೋಂದಾಯಿಸಲಾಗಿದೆ: ${newUser.displayName} (${newUser.role}).`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'ಬಳಕೆದಾರರ ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ (User registration failed).'
    };
  }
}

export const registerOfficeUser = registerOfficeUserWithLimit;

/**
 * Sign in with Google Popup and match or register into the 5 authorized user slots.
 */
export async function signInWithGoogleAuth(): Promise<{ success: boolean; user?: AdminAuthUser; message: string }> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const fbUser = result.user;
    
    // Check if user is already registered in the 5 slots
    const currentUsers = await getRegisteredOfficeUsers();
    let matchingUser = currentUsers.find(
      u => u.email?.toLowerCase() === fbUser.email?.toLowerCase()
    );

    if (matchingUser) {
      const updated: AdminAuthUser = {
        ...matchingUser,
        photoURL: fbUser.photoURL || undefined,
        loginTime: new Date().toISOString(),
        authProvider: 'google'
      };
      await setDoc(doc(db, 'users', matchingUser.id || fbUser.uid), updated, { merge: true });
      return { success: true, user: updated, message: 'Google ಸೈನ್-ಇನ್ ಯಶಸ್ವಿಯಾಗಿದೆ.' };
    }

    // If not existing, check if we have space under the 5 limit
    if (currentUsers.length >= MAX_OFFICE_USERS) {
      // If the email is punithjr2@gmail.com, map to slot 5 (FDA Nodal)
      if (fbUser.email?.toLowerCase() === 'punithjr2@gmail.com') {
        const slot5 = currentUsers[4] || INITIAL_5_OFFICE_USERS[4];
        const updated: AdminAuthUser = {
          ...slot5,
          email: fbUser.email,
          displayName: fbUser.displayName || slot5.displayName,
          photoURL: fbUser.photoURL || undefined,
          loginTime: new Date().toISOString(),
          authProvider: 'google'
        };
        await setDoc(doc(db, 'users', slot5.id || fbUser.uid), updated, { merge: true });
        return { success: true, user: updated, message: 'Google ಸೈನ್-ಇನ್ ಯಶಸ್ವಿಯಾಗಿದೆ (FDA / ನೋಡಲ್ ಅಧಿಕಾರಿ).' };
      }

      return {
        success: false,
        message: `ಗರಿಷ್ಠ 5 ಬಳಕೆದಾರರ ಮಿತಿ ಮೀರಿದೆ (${currentUsers.length}/${MAX_OFFICE_USERS}). ದಯವಿಟ್ಟು ನೋಂದಾಯಿತ ಖಾತೆಯೊಂದಿಗೆ ಲಾಗಿನ್ ಆಗಿ.`
      };
    }

    // Register as new user
    const newUser: AdminAuthUser = {
      id: fbUser.uid,
      username: fbUser.email?.split('@')[0] || `user_${Date.now()}`,
      email: fbUser.email || '',
      role: 'Officer',
      displayName: fbUser.displayName || 'ಅಧಿಕೃತ ನೌಕರರು',
      designation: 'ಸರ್ಕಾರಿ ಕಛೇರಿ ನೌಕರರು (Office Executive)',
      loginTime: new Date().toISOString(),
      photoURL: fbUser.photoURL || undefined,
      authProvider: 'google'
    };

    await setDoc(doc(db, 'users', fbUser.uid), newUser);
    return { success: true, user: newUser, message: 'Google ಮೂಲಕ ನೋಂದಣಿ & ಸೈನ್-ಇನ್ ಯಶಸ್ವಿಯಾಗಿದೆ.' };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Google ಸೈನ್-ಇನ್ ವಿಫಲವಾಗಿದೆ.'
    };
  }
}

/**
 * Remove an office user from Firestore so a new user can be registered (keeping <= 5).
 */
export async function deleteOfficeUser(userId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'users', userId));
  } catch (e) {
    console.warn('Firestore delete note:', e);
  }

  try {
    await fetch(`/api/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE'
    });
  } catch (apiErr) {
    console.warn('API delete note:', apiErr);
  }

  const current = await getRegisteredOfficeUsers();
  const updated = current.filter(u => u.id !== userId && u.username !== userId);
  localStorage.setItem('edu_registered_5_users', JSON.stringify(updated));
  return true;
}

/**
 * Update and modify an existing office user's credentials and profile (user login modify).
 */
export async function updateOfficeUser(
  userId: string,
  updatedFields: Partial<AdminAuthUser> & { password?: string }
): Promise<{ success: boolean; user?: AdminAuthUser; message: string }> {
  try {
    const currentUsers = await getRegisteredOfficeUsers();
    const existingIndex = currentUsers.findIndex(u => (u.id === userId || u.username === userId));
    if (existingIndex === -1) {
      return { success: false, message: 'ಬಳಕೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ (User not found).' };
    }

    const mergedUser: AdminAuthUser = {
      ...currentUsers[existingIndex],
      ...updatedFields,
      id: currentUsers[existingIndex].id || userId
    };

    // 1. Sync to backend API
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          Object.assign(mergedUser, data.user);
        }
      }
    } catch (apiErr) {
      console.warn('Backend user PUT fallback:', apiErr);
    }

    // 2. Sync to Firestore
    try {
      await setDoc(doc(db, 'users', mergedUser.id || userId), mergedUser, { merge: true });
    } catch (e) {
      console.warn('Firestore user update fallback to localStorage:', e);
    }

    currentUsers[existingIndex] = mergedUser;
    localStorage.setItem('edu_registered_5_users', JSON.stringify(currentUsers));
    return { 
      success: true, 
      user: mergedUser, 
      message: `ಬಳಕೆದಾರ "${mergedUser.displayName}" ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ (User modified successfully).` 
    };
  } catch (err: any) {
    return { 
      success: false, 
      message: err?.message || 'ಬಳಕೆದಾರರ ವಿವರ ಬದಲಾವಣೆ ವಿಫಲವಾಗಿದೆ (User modification failed).' 
    };
  }
}

/**
 * Quick password reset for an office user.
 */
export async function resetOfficeUserPassword(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      await updateOfficeUser(userId, { password: newPassword });
      return { success: true, message: data.message || 'ಗುಪ್ತಪದವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಯಿಸಲಾಗಿದೆ.' };
    }
    return { success: false, message: data.message || 'ಗುಪ್ತಪದ ಬದಲಾವಣೆ ವಿಫಲವಾಗಿದೆ.' };
  } catch (err: any) {
    // Fallback to updateOfficeUser directly
    const res2 = await updateOfficeUser(userId, { password: newPassword });
    return { success: res2.success, message: res2.message };
  }
}

/**
 * Resets the registered office users list strictly to only Punith J.R. and Admin.
 */
export async function resetOfficeUsersToStrictTwo(): Promise<AdminAuthUser[]> {
  localStorage.setItem('edu_registered_5_users', JSON.stringify(INITIAL_5_OFFICE_USERS));
  try {
    for (const u of INITIAL_5_OFFICE_USERS) {
      await setDoc(doc(db, 'users', u.id || u.username), u);
    }
  } catch (err) {
    console.warn('Firestore reset note:', err);
  }
  return INITIAL_5_OFFICE_USERS;
}

// ==================== FIRESTORE RTI CASES PERSISTENCE ====================


export async function fetchRtiCasesFromFirestore(): Promise<RtiCaseRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'rtiCases'));
    if (!snap.empty) {
      const records: RtiCaseRecord[] = [];
      snap.forEach(docSnap => records.push(docSnap.data() as RtiCaseRecord));
      return records;
    }
  } catch (err) {
    console.warn('fetchRtiCasesFromFirestore error:', err);
  }
  return [];
}

export async function saveRtiCaseToFirestore(record: RtiCaseRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'rtiCases', record.id), record, { merge: true });
  } catch (err) {
    console.warn('saveRtiCaseToFirestore error:', err);
  }
}

export async function deleteRtiCaseFromFirestore(caseId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'rtiCases', caseId));
  } catch (err) {
    console.warn('deleteRtiCaseFromFirestore error:', err);
  }
}

// ==================== FIRESTORE PENSION CASES PERSISTENCE ====================

export async function fetchPensionCasesFromFirestore(): Promise<PensionCaseRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'pensionCases'));
    if (!snap.empty) {
      const records: PensionCaseRecord[] = [];
      snap.forEach(docSnap => records.push(docSnap.data() as PensionCaseRecord));
      return records;
    }
  } catch (err) {
    console.warn('fetchPensionCasesFromFirestore error:', err);
  }
  return [];
}

export async function savePensionCaseToFirestore(record: PensionCaseRecord): Promise<void> {
  try {
    await setDoc(doc(db, 'pensionCases', record.id), record, { merge: true });
  } catch (err) {
    console.warn('savePensionCaseToFirestore error:', err);
  }
}

// ==================== FIRESTORE EMPLOYEES ROSTER PERSISTENCE ====================

export async function fetchEmployeesFromFirestore(): Promise<any[]> {
  try {
    const snap = await getDocs(collection(db, 'employees'));
    if (!snap.empty) {
      const records: any[] = [];
      snap.forEach(docSnap => records.push(docSnap.data()));
      return records;
    }
  } catch (err) {
    console.warn('fetchEmployeesFromFirestore note:', err);
  }
  return [];
}

export async function saveSingleEmployeeToFirestore(employee: any): Promise<void> {
  try {
    const docId = employee.id || employee.employeeCode || `emp-${Date.now()}`;
    await setDoc(doc(db, 'employees', docId), employee, { merge: true });
  } catch (err) {
    console.warn('saveSingleEmployeeToFirestore note:', err);
  }
}

export async function saveBatchEmployeesToFirestore(employeesList: any[]): Promise<void> {
  if (!Array.isArray(employeesList) || employeesList.length === 0) return;
  try {
    for (const emp of employeesList) {
      const docId = emp.id || emp.employeeCode || `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      await setDoc(doc(db, 'employees', docId), emp, { merge: true });
    }
  } catch (err) {
    console.warn('saveBatchEmployeesToFirestore note:', err);
  }
}

export async function deleteEmployeeFromFirestore(employeeId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'employees', employeeId));
  } catch (err) {
    console.warn('deleteEmployeeFromFirestore note:', err);
  }
}

export { app };

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import type { SiteUser } from '../vistypes';
import { getUserData, validateUser } from '../db/user';
import { auth } from '~/firebase';

interface AuthContextValue {
  foundUser: boolean;
  user: SiteUser | null;
  loading: boolean;
  setUser: (user: SiteUser | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

function formatUser(firebaseUser: FirebaseUser): SiteUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    photoURL: firebaseUser.photoURL,
    displayName: firebaseUser.displayName,
  };
}

const getToken = async (firebaseUser: FirebaseUser) => {
  try {
    const token = await firebaseUser.getIdToken();
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [foundUser, setFoundUser] = useState<boolean>(false);
  const [user, setUser] = useState<SiteUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Set up Firebase auth state observer
    const establishUser = async (firebaseUser: FirebaseUser): Promise<void> => {
      let siteUser: SiteUser | null = null;
      const formattedUser = formatUser(firebaseUser);
      const token = await getToken(firebaseUser);
      formattedUser.accessToken = token;
      const userData = await validateUser(formattedUser);
      if (userData) {
        // setUser(userData);

        siteUser = {
          accessToken: await firebaseUser.getIdToken(),
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
          uid: firebaseUser.uid,
        };
        const userDBData = await getUserData(siteUser.uid, siteUser.accessToken || '');
        if (userDBData) {
          siteUser.authorizations = userDBData.authorizations;
          siteUser.preferences = userDBData.preferences;
        }
        setUser(siteUser);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // SiteUser is signed in
        setFoundUser(true);
        console.log('found signed-in user!', firebaseUser);
        establishUser(firebaseUser);
      } else {
        // SiteUser is signed out
        setFoundUser(false);
        setUser(null);
      }
      // Initial loading is complete
      setLoading(false);
    });

    // Clean up subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  // Provide sign-out functionality
  const signOut = async () => {
    try {
      await auth.signOut();
      console.warn('Successfully signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ foundUser, user, loading, signOut, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
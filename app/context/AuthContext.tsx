import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User } from '../vistypes';
import { getUserData } from '../db/fetch';
import { auth } from '~/firebase';

// We'll extend our existing AuthContextType to include sign-out functionality
interface AuthContextValue {
  foundUser: boolean;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// This custom hook will help us access the auth context easily
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Convert Firebase user to our app's user type
function formatUser(firebaseUser: FirebaseUser): User {
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const auth = getAuth();

  useEffect(() => {
    // Set up Firebase auth state observer
    const establishUser = async (firebaseUser: FirebaseUser) => {
      const formattedUser = formatUser(firebaseUser);
      const token = await getToken(firebaseUser);
      formattedUser.accessToken = token;
      const userData = await getUserData(formattedUser);
      if (userData) {
        setUser(userData);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        setFoundUser(true);
        console.log('found signed-in user!', firebaseUser);
        establishUser(firebaseUser);
      } else {
        // User is signed out
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
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ foundUser, user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
// AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { User } from '../types';
import { addNewUser, updateUserAuthorizations } from '../db/fetch';

// We'll extend our existing AuthContextType to include sign-out functionality
interface AuthContextValue {
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    // Set up Firebase auth state observer
    const establishUser = async (formattedUser: User) => {
      const userData = await addNewUser(formattedUser);
      if (userData) {
        console.log('user data?', userData)
        console.log('authoriz?', userData.user.authorizations)
        setUser(userData.user);
      }
    };
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        console.log('found signed-in user!', firebaseUser)
        const formattedUser = formatUser(firebaseUser);
        establishUser(formattedUser);
      } else {
        // User is signed out
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
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
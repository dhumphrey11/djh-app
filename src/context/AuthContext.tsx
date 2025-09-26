import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/authService';
import { userService } from '../services/userService';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get the Firestore user data
          const userData = await userService.getUserById(firebaseUser.uid);
          if (userData) {
            setCurrentUser(userData);
          } else {
            // Create new user document if it doesn't exist
            await userService.createUser(firebaseUser.uid, firebaseUser.email || '');
            const newUserData = await userService.getUserById(firebaseUser.uid);
            setCurrentUser(newUserData);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<User> => {
    const { user: firebaseUser } = await authService.signIn(email, password);
    const userData = await userService.getUserById(firebaseUser.uid);
    if (!userData) {
      throw new Error('User data not found');
    }
    return userData;
  };

  const value = {
    currentUser,
    isLoading,
    signIn,
    signOut: authService.signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
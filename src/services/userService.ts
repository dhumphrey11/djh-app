import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { User } from '../types';

class UserService {
  private readonly collectionName = 'react_users';

  // Create a new user document
  async createUser(userId: string, email: string, role: User['role'] = 'user'): Promise<void> {
    const userRef = doc(db, this.collectionName, userId);
    const userData: Omit<User, 'id'> = {
      email,
      role,
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now()
    };

    try {
      await setDoc(userRef, userData);
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        return null;
      }

      return {
        id: userDoc.id,
        ...userDoc.data()
      } as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      throw error;
    }
  }

  // Update user's last login
  async updateLastLogin(userId: string): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating last login:', error);
      throw error;
    }
  }

  // Update user role (admin only operation)
  async updateUserRole(userId: string, role: User['role']): Promise<void> {
    try {
      const userRef = doc(db, this.collectionName, userId);
      await updateDoc(userRef, { role });
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
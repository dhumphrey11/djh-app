import React, { useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase/config';
import './App.css';

function App() {
  useEffect(() => {
    const testFirestore = async () => {
      try {
        // Test writing to Firestore
        await addDoc(collection(db, 'test'), {
          message: 'Hello from djh-app!',
          timestamp: new Date()
        });
        
        // Test reading from Firestore
        const querySnapshot = await getDocs(collection(db, 'test'));
        console.log('Firestore test successful:', querySnapshot.size, 'documents');
      } catch (error) {
        console.error('Firestore test failed:', error);
      }
    };

    testFirestore();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>DJH Portfolio Manager</h1>
        <p>Welcome to your stock portfolio management app!</p>
        <p>Check console for Firebase connection status.</p>
      </header>
    </div>
  );
}

export default App;
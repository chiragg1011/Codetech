import React, { useState, useEffect } from 'react';
import './styles.css';
import Dashboard from './components/Dashboard';
import Editor from './Editor';
import LoginModal from './components/LoginModal';

// Setup API and Socket endpoints (easily adjustable for dev/production)
const SOCKET_URL = 'http://localhost:5005';
const API_URL = 'http://localhost:5005';

export default function App() {
  const [documentId, setDocumentId] = useState(null);
  const [user, setUser] = useState(null);

  // Load username and color from sessionStorage if they exist (convenience on reload)
  useEffect(() => {
    const cachedUser = sessionStorage.getItem('syncquill_user');
    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (e) {
        console.error('Failed to parse cached user info');
      }
    }
  }, []);

  // Lightweight, dependency-free hash routing
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      // Match #/doc/doc-xxx format
      if (hash && hash.startsWith('#/doc/')) {
        const id = hash.replace('#/doc/', '');
        setDocumentId(id);
      } else {
        setDocumentId(null);
      }
    };

    // Run check on initial load
    handleHashChange();

    // Attach listener for dynamic navigation
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Route: Navigate to specific document
  const handleSelectDocument = (id) => {
    window.location.hash = `#/doc/${id}`;
  };

  // Route: Navigate back to dashboard
  const handleBackToDashboard = () => {
    window.location.hash = '';
  };

  // Callback: User enters nickname from modal
  const handleJoinRoom = (userInfo) => {
    setUser(userInfo);
    sessionStorage.setItem('syncquill_user', JSON.stringify(userInfo));
  };

  // Render Logic
  if (documentId) {
    // If we have selected a document but don't have user info (nickname/color), prompt modal
    if (!user) {
      return <LoginModal onJoin={handleJoinRoom} />;
    }

    // Render primary collaborative editor
    return (
      <Editor
        documentId={documentId}
        user={user}
        onBackToDashboard={handleBackToDashboard}
        socketUrl={SOCKET_URL}
      />
    );
  }

  // Render documents dashboard manager
  return (
    <Dashboard 
      onSelectDocument={handleSelectDocument} 
      API_URL={API_URL} 
    />
  );
}

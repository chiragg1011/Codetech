import React, { useState, useEffect, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

import Navbar from './components/Navbar';

// Standard Quill rich-text formatting toolbar options
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  ['bold', 'italic', 'underline', 'strike'],
  [{ color: [] }, { background: [] }],
  [{ script: 'sub' }, { script: 'super' }],
  [{ list: 'ordered' }, { list: 'bullet' }],
  [{ indent: '-1' }, { indent: '+1' }],
  [{ align: [] }],
  ['blockquote', 'code-block'],
  ['link', 'image'],
  ['clean']
];

export default function Editor({ documentId, user, onBackToDashboard, socketUrl }) {
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [docTitle, setDocTitle] = useState('Loading...');
  const [savingStatus, setSavingStatus] = useState('saved'); // 'saved' or 'saving'
  const [collaborators, setCollaborators] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  const saveTimeoutRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    const s = io(socketUrl, {
      transports: ['websocket', 'polling']
    });
    setSocket(s);

    s.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected successfully');
    });

    s.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected from server');
    });

    return () => {
      s.disconnect();
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, [socketUrl]);

  // Robust Quill Editor Mounting (React 18 clean callback-ref approach)
  const editorWrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    // Reset container HTML to prevent multiple editor boxes
    wrapper.innerHTML = '';
    const editorContainer = document.createElement('div');
    wrapper.append(editorContainer);

    const q = new Quill(editorContainer, {
      theme: 'snow',
      modules: {
        toolbar: TOOLBAR_OPTIONS
      }
    });

    q.disable();
    q.setText('Establishing secure sync connection...');
    setQuill(q);
  }, []);

  // Handle Joining Document Room and Loading Document Contents
  useEffect(() => {
    if (socket == null || quill == null) return;

    // Listen once for the loaded document content from Mongoose DB
    socket.once('load-document', ({ data, title }) => {
      quill.setContents(data);
      quill.enable(); // Enable typing
      setDocTitle(title);
      setLoading(false);
    });

    // Request to join the specific room
    socket.emit('join-document', { documentId, user });
  }, [socket, quill, documentId, user]);

  // Listen for text changes from standard user typing -> emit to others
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handleTextChange = (delta, oldDelta, source) => {
      // Synchronize only if the edit was made by the local user
      if (source !== 'user') return;
      socket.emit('send-changes', delta);

      // Trigger Autosave to DB with a comfortable 1.5s debounce
      setSavingStatus('saving');
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      
      saveTimeoutRef.current = setTimeout(() => {
        socket.emit('save-document', quill.getContents());
        setSavingStatus('saved');
      }, 1500);
    };

    quill.on('text-change', handleTextChange);

    return () => {
      quill.off('text-change', handleTextChange);
    };
  }, [socket, quill]);

  // Receive and apply real-time collaborative text changes from other users
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handleReceiveChanges = (delta) => {
      quill.updateContents(delta);
    };

    socket.on('receive-changes', handleReceiveChanges);

    return () => {
      socket.off('receive-changes', handleReceiveChanges);
    };
  }, [socket, quill]);

  // Track real-time list of active collaborators in the room
  useEffect(() => {
    if (socket == null) return;

    const handleCollaboratorsUpdate = (users) => {
      setCollaborators(users);
    };

    socket.on('collaborators-update', handleCollaboratorsUpdate);

    return () => {
      socket.off('collaborators-update', handleCollaboratorsUpdate);
    };
  }, [socket]);

  // Handle document title renaming (initiated locally)
  const handleRename = (newTitle) => {
    setDocTitle(newTitle);
    if (socket) {
      socket.emit('rename-document', newTitle);
    }
  };

  // Receive live document renames made by other collaborators
  useEffect(() => {
    if (socket == null) return;

    const handleReceiveRename = (newTitle) => {
      setDocTitle(newTitle);
    };

    socket.on('receive-rename', handleReceiveRename);

    return () => {
      socket.off('receive-rename', handleReceiveRename);
    };
  }, [socket]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Sleek Top Navbar */}
      <Navbar
        title={docTitle}
        onRename={handleRename}
        savingStatus={savingStatus}
        collaborators={collaborators}
        isConnected={isConnected}
        onBackToDashboard={onBackToDashboard}
      />

      {/* Main Quill Editor Frame */}
      <main className="editor-wrapper">
        {loading && (
          <div className="spinner-container" style={{ margin: 'auto' }}>
            <div className="spinner" />
            <div className="spinner-text">Syncing document history...</div>
          </div>
        )}
        <div 
          className="editor-container" 
          ref={editorWrapperRef}
          style={{ display: loading ? 'none' : 'flex' }}
        />
      </main>
    </div>
  );
}

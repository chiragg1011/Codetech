import React, { useState, useEffect } from 'react';
import { ArrowLeft, Cloud, CloudLightning, FileText } from 'lucide-react';

export default function Navbar({ 
  title, 
  onRename, 
  savingStatus, 
  collaborators = [], 
  isConnected, 
  onBackToDashboard 
}) {
  const [localTitle, setLocalTitle] = useState(title);

  // Sync local title with prop updates from server or other clients
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  const handleChange = (e) => {
    setLocalTitle(e.target.value);
  };

  const handleBlur = () => {
    if (localTitle.trim() && localTitle !== title) {
      onRename(localTitle.trim());
    } else {
      setLocalTitle(title); // revert to original if empty
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.target.blur();
    }
  };

  return (
    <nav className="editor-navbar">
      <div className="nav-left">
        <button 
          className="btn-back" 
          onClick={onBackToDashboard}
          title="Back to Dashboard"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="doc-card-icon" style={{ backgroundColor: '#e0e7ff', padding: '0.4rem', borderRadius: '6px' }}>
          <FileText size={20} style={{ color: '#4f46e5' }} />
        </div>

        <div className="doc-title-container">
          <input
            type="text"
            className="doc-title-input"
            value={localTitle || ''}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            title="Click to rename document"
          />
        </div>

        {/* Save Status Badge */}
        {savingStatus === 'saving' && (
          <span className="save-badge saving">
            <CloudLightning size={12} className="spin" />
            Saving...
          </span>
        )}
        {savingStatus === 'saved' && (
          <span className="save-badge saved">
            <Cloud size={12} />
            Saved
          </span>
        )}
      </div>

      <div className="nav-right">
        {/* Collaborators Stack */}
        <div className="collaborators-container">
          {collaborators.map((user, idx) => {
            const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';
            return (
              <div
                key={user.socketId || idx}
                className="collaborator-avatar"
                style={{ 
                  backgroundColor: user.color || '#6366f1',
                  zIndex: collaborators.length - idx 
                }}
                title={user.name + (user.socketId === 'current' ? ' (You)' : '')}
              >
                {initial}
              </div>
            );
          })}
        </div>

        {/* Connection Status Pulse */}
        <div 
          className={`connection-status ${isConnected ? '' : 'disconnected'}`} 
          title={isConnected ? 'Server Connected' : 'Server Disconnected (Reconnecting)'}
        />
      </div>
    </nav>
  );
}

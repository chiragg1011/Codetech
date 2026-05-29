import React, { useState } from 'react';
import { UserCheck } from 'lucide-react';

const COLORS = [
  '#4f46e5', // Indigo
  '#06b6d4', // Cyan
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#f97316'  // Orange
];

export default function LoginModal({ onJoin }) {
  // Array of fun random default nickname bases
  const defaultNames = ['Creative Owl', 'Drafting Beaver', 'Coding Koala', 'Typing Toucan', 'Scribbling Squirrel', 'Ink Penguin'];
  const randomDefaultName = defaultNames[Math.floor(Math.random() * defaultNames.length)];

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalName = name.trim() || randomDefaultName;
    onJoin({ name: finalName, color: selectedColor });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="modal-icon">
          <UserCheck size={28} />
        </div>
        <h2 className="modal-title">Join Collaborative Room</h2>
        <p className="modal-desc">
          Enter your name and choose a signature color so others can see your real-time edits.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" htmlFor="nickname">Your Nickname</label>
            <input
              type="text"
              id="nickname"
              className="text-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`e.g., ${randomDefaultName}`}
              maxLength={20}
              autoFocus
            />
          </div>

          <div className="input-group" style={{ marginBottom: '1.75rem' }}>
            <label className="input-label">Select Collaborator Color</label>
            <div className="colors-grid">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`color-option ${selectedColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-submit">
            Enter Document
          </button>
        </form>
      </div>
    </div>
  );
}

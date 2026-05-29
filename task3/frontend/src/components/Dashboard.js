import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  FileText, 
  Search, 
  Trash2, 
  ExternalLink, 
  FileSpreadsheet, 
  Briefcase, 
  ClipboardList 
} from 'lucide-react';

export default function Dashboard({ onSelectDocument, API_URL }) {
  const [documents, setDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch list of documents from backend
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      const data = await response.json();
      setDocuments(data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Could not connect to the database. Make sure the server and MongoDB are running.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to generate unique short document ID
  const generateDocId = () => {
    return 'doc-' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36).substring(4);
  };

  // Create a document from a Template
  const handleCreateDocument = async (templateType) => {
    const docId = generateDocId();
    let title = 'Untitled Document';
    let content = '';

    if (templateType === 'resume') {
      title = 'Professional Resume — Template';
      content = `[YOUR NAME]\n[Phone] | [Email] | [LinkedIn] | [GitHub]\n\nPROFESSIONAL SUMMARY\n====================\nResults-driven and collaborative Software Engineer intern with a passion for building high-fidelity real-time web applications. Experienced in React.js, Node.js, Express, and Socket.IO.\n\nWORK EXPERIENCE\n===============\nSoftware Engineer Intern | Tech Innovators Inc. (2026 - Present)\n- Developed a collaborative document editing tool that improved remote team synergy by 40%.\n- Integrated WebSocket connections using Socket.IO for seamless character-by-character live typing synchronization.\n- Designed responsive glassmorphism CSS dashboards supporting dynamic document template boots.\n\nEDUCATION\n=========\nBachelor of Science in Computer Science | Global Tech University (Graduating 2027)\n- Relevant Coursework: Web Engineering, Distributed Systems, Database Management Systems.\n\nTECHNICAL SKILLS\n================\n- Frontend: React.js, HTML5, CSS3, Javascript (ES6), Quill.js\n- Backend & DB: Node.js, Express.js, Socket.IO, MongoDB, Mongoose\n- Tools & DevOps: Git, GitHub, Vite, Postman`;
    } else if (templateType === 'meeting') {
      title = 'Weekly Team Sync — Notes';
      content = `MEETING NOTES: WEEKLY TEAM SYNC\nDate: ${new Date().toLocaleDateString()} | Time: 10:00 AM\n\nATTENDEES\n=========\n- Lead Architect\n- Senior Frontend Developer\n- Database Administrator\n- [Your Name] (Intern Developer)\n\nAGENDA\n======\n1. Reviewing Task-3 (Real-Time Collaborative Document Editor).\n2. Verifying MongoDB auto-save debounce times.\n3. Discussing active collaborator layout animations.\n\nDISCUSSION POINTS\n=================\n- The frontend must use a clean component-based layout and support dynamic creation.\n- Real-time cursor coordinates and avatar stacks look incredibly premium.\n- Verified that Quill Deltas are much safer than transferring raw HTML strings because they prevent overwriting changes.\n\nACTION ITEMS\n============\n[ ] Configure Socket.IO cors headers for production. (Assigned to Backend Team)\n[ ] Refine .gitignore files to avoid uploading node_modules. (Assigned to [Your Name])\n[ ] Optimize styles.css layout responses for mobile viewports. (Assigned to Frontend Team)`;
    } else if (templateType === 'proposal') {
      title = 'Project Proposal — SyncQuill';
      content = `PROJECT PROPOSAL: SYNCQUILL COLLABORATIVE PLATFORM\nAuthor: internship Task-3 | Status: Draft\n\n1. EXECUTIVE SUMMARY\n====================\nSyncQuill is a high-fidelity, cloud-backed collaborative document editor built to enable multiple remote users to co-author and refine rich text documents at the exact same moment.\n\n2. PROBLEM STATEMENT\n====================\nModern remote internships and workspaces require frictionless writing coordination. Emailing documents back-and-forth leads to version control nightmares, misplaced suggestions, and work duplication.\n\n3. PROPOSED SOLUTION & ARCHITECTURE\n===================================\nWe propose a classic MERN stack with double-sided event sockets:\n- Frontend: A lightning-fast Vite-React application hosting Quill.js as the core rich text formatting engine.\n- Real-time: Socket.IO handling rooms, broadcasting fine-grained text deltas, and syncing active attendee statuses.\n- Backend: A Node/Express server serving clean REST endpoints to create, fetch, and delete documents.\n- Database: MongoDB providing schematized document persistence and autosaves.\n\n4. KEY PROJECT MILESTONES\n=========================\n- Milestone 1: Client/Server setup & database integration.\n- Milestone 2: Multi-user Quill delta synchronization.\n- Milestone 3: Polished custom dashboard and templates design.`;
    }

    try {
      const response = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: docId,
          title,
          content
        }),
      });

      if (!response.ok) throw new Error('Could not create template document');
      
      const newDoc = await response.json();
      onSelectDocument(newDoc._id, newDoc.title);
    } catch (err) {
      console.error(err);
      alert('Error creating document. Is the backend running?');
    }
  };

  // Delete a document
  const handleDeleteDocument = async (e, id) => {
    e.stopPropagation(); // Avoid triggering open card click
    
    if (!window.confirm('Are you sure you want to delete this document? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/documents/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete document');
      
      // Update local state
      setDocuments(prev => prev.filter(doc => doc._id !== id));
    } catch (err) {
      console.error(err);
      alert('Could not delete document. Please try again.');
    }
  };

  // Filter documents based on search query
  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard">
      {/* Brand Header */}
      <header className="dashboard-header">
        <div className="brand-section">
          <div className="brand-icon">📝</div>
          <div>
            <h1 className="brand-name">SyncQuill</h1>
            <p className="brand-tagline">Real-Time Collaborative Document Workspace</p>
          </div>
        </div>
        
        <button 
          className="btn-open" 
          onClick={() => handleCreateDocument('blank')}
          style={{ padding: '0.65rem 1.25rem', borderRadius: '10px' }}
        >
          <Plus size={18} />
          Create Document
        </button>
      </header>

      {/* Database Error Banner */}
      {error && (
        <div style={{
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '10px',
          padding: '1rem',
          color: '#b91c1c',
          fontWeight: '500',
          marginBottom: '2rem',
          fontSize: '0.9rem'
        }}>
          {error}
        </div>
      )}

      {/* Templates Section */}
      <section className="templates-container">
        <h2 className="templates-title">
          <ClipboardList size={18} style={{ color: '#4f46e5' }} />
          Start a new document
        </h2>
        <div className="templates-grid">
          <div className="template-card" onClick={() => handleCreateDocument('blank')}>
            <div className="template-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
              <Plus size={20} />
            </div>
            <h3 className="template-name">Blank Document</h3>
            <p className="template-desc">Start from scratch</p>
          </div>

          <div className="template-card" onClick={() => handleCreateDocument('resume')}>
            <div className="template-icon" style={{ backgroundColor: '#ecfdf5', color: '#10b981' }}>
              <Briefcase size={20} />
            </div>
            <h3 className="template-name">Professional Resume</h3>
            <p className="template-desc">Showcase your talents</p>
          </div>

          <div className="template-card" onClick={() => handleCreateDocument('meeting')}>
            <div className="template-icon" style={{ backgroundColor: '#fffbeb', color: '#f59e0b' }}>
              <FileSpreadsheet size={20} />
            </div>
            <h3 className="template-name">Meeting Notes</h3>
            <p className="template-desc">Track agendas & tasks</p>
          </div>

          <div className="template-card" onClick={() => handleCreateDocument('proposal')}>
            <div className="template-icon" style={{ backgroundColor: '#fdf2f8', color: '#ec4899' }}>
              <FileText size={20} />
            </div>
            <h3 className="template-name">Project Proposal</h3>
            <p className="template-desc">Outline plans & solutions</p>
          </div>
        </div>
      </section>

      {/* Filter and Documents List */}
      <section>
        <div className="docs-header">
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>Recent Documents</h2>
          
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search documents by title..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="spinner-container">
            <div className="spinner" />
            <div className="spinner-text">Syncing your workspace...</div>
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3 className="empty-state-title">
              {searchQuery ? 'No matching documents' : 'No documents yet'}
            </h3>
            <p className="empty-state-desc">
              {searchQuery 
                ? 'Try adjusting your search criteria or create a new document using the templates above.'
                : 'Get started by creating a new blank document or using one of the pre-made templates.'}
            </p>
          </div>
        ) : (
          <div className="docs-grid">
            {filteredDocs.map((doc) => (
              <div 
                key={doc._id} 
                className="doc-card"
                onClick={() => onSelectDocument(doc._id, doc.title)}
                style={{ cursor: 'pointer' }}
              >
                <div className="doc-card-top">
                  <div className="doc-card-icon">
                    <FileText size={20} />
                  </div>
                  <div className="doc-card-details">
                    <h3 className="doc-card-title" title={doc.title}>{doc.title}</h3>
                    <div className="doc-card-date">
                      <span>Edited: {new Date(doc.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(doc.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                <div className="doc-card-actions">
                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontFamily: 'monospace' }}>
                    ID: {doc._id.substring(0, 8)}...
                  </span>
                  
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button 
                      className="btn-delete"
                      onClick={(e) => handleDeleteDocument(e, doc._id)}
                      title="Delete Document"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      className="btn-open"
                      style={{ padding: '0.35rem 0.65rem', borderRadius: '6px', fontSize: '0.75rem' }}
                      onClick={() => onSelectDocument(doc._id, doc.title)}
                    >
                      Open
                      <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

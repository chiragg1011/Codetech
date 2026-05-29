require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Document = require('./models/Document');

const app = express();
const server = http.createServer(app);

// Environment variables
const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/collaborative-editor';
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// ==========================================
// Robust Hybrid Database Persistence Layer
// ==========================================
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'documents.json');

// Ensure local persistence fallback folder and file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

let isMongoConnected = false;

// Attempt database connection
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    isMongoConnected = true;
  })
  .catch((err) => {
    console.warn('\n[DATABASE WARNING] MongoDB not detected locally.');
    console.warn('SyncQuill is automatically activating its high-fidelity JSON File Database fallback.');
    console.warn(`All documents will be persisted successfully at: ${DATA_FILE}`);
    console.warn('Note: If MongoDB starts up later, the server can be restarted to switch back to Mongo.\n');
    isMongoConnected = false;
  });

// Hybrid DB: Get all documents
async function getAllDocuments() {
  if (isMongoConnected) {
    return await Document.find({}, '_id title updatedAt').sort({ updatedAt: -1 });
  } else {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const docs = JSON.parse(fileData || '[]');
      return docs
        .map(doc => ({ _id: doc._id, title: doc.title, updatedAt: doc.updatedAt }))
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    } catch (e) {
      console.error('Error reading JSON fallback database:', e);
      return [];
    }
  }
}

// Hybrid DB: Find document or create a default one
async function findOrCreateDocument(id) {
  if (isMongoConnected) {
    const document = await Document.findById(id);
    if (document) return document;
    return await Document.create({
      _id: id,
      title: 'Untitled Document',
      data: { ops: [] }
    });
  } else {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const docs = JSON.parse(fileData || '[]');
      let doc = docs.find(d => d._id === id);
      
      if (!doc) {
        doc = {
          _id: id,
          title: 'Untitled Document',
          data: { ops: [] },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        docs.push(doc);
        fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2));
      }
      return doc;
    } catch (e) {
      console.error('Error in findOrCreate fallback database:', e);
      return { _id: id, title: 'Untitled Document', data: { ops: [] } };
    }
  }
}

// Hybrid DB: Update document rich-text contents
async function updateDocumentData(id, docContent) {
  if (isMongoConnected) {
    await Document.findByIdAndUpdate(id, { data: docContent });
  } else {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const docs = JSON.parse(fileData || '[]');
      const idx = docs.findIndex(d => d._id === id);
      if (idx !== -1) {
        docs[idx].data = docContent;
        docs[idx].updatedAt = new Date();
        fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2));
      }
    } catch (e) {
      console.error('Error autosaving content to fallback database:', e);
    }
  }
}

// Hybrid DB: Update document title
async function updateDocumentTitle(id, newTitle) {
  if (isMongoConnected) {
    await Document.findByIdAndUpdate(id, { title: newTitle });
  } else {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const docs = JSON.parse(fileData || '[]');
      const idx = docs.findIndex(d => d._id === id);
      if (idx !== -1) {
        docs[idx].title = newTitle;
        docs[idx].updatedAt = new Date();
        fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2));
      }
    } catch (e) {
      console.error('Error saving title to fallback database:', e);
    }
  }
}

// Hybrid DB: Delete document
async function deleteDocument(id) {
  if (isMongoConnected) {
    return await Document.findByIdAndDelete(id);
  } else {
    try {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const docs = JSON.parse(fileData || '[]');
      const filtered = docs.filter(d => d._id !== id);
      const deletedDoc = docs.find(d => d._id === id);
      fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
      return deletedDoc;
    } catch (e) {
      console.error('Error deleting from fallback database:', e);
      return null;
    }
  }
}

// ==========================================
// Middleware Setup
// ==========================================
app.use(cors({
  origin: CLIENT_URL,
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  credentials: true
}));
app.use(express.json());

// ==========================================
// REST API Routes
// ==========================================

// 1. Get all documents (for Dashboard listing)
app.get('/api/documents', async (req, res) => {
  try {
    const documents = await getAllDocuments();
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// 2. Create a new document (supporting templates or blank doc)
app.post('/api/documents', async (req, res) => {
  const { id, title, content } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Document ID is required' });
  }

  try {
    const defaultData = content ? { ops: [{ insert: content }] } : { ops: [] };
    
    if (isMongoConnected) {
      const newDoc = new Document({
        _id: id,
        title: title || 'Untitled Document',
        data: defaultData
      });
      await newDoc.save();
      res.status(201).json(newDoc);
    } else {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const docs = JSON.parse(fileData || '[]');
      const newDoc = {
        _id: id,
        title: title || 'Untitled Document',
        data: defaultData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      docs.push(newDoc);
      fs.writeFileSync(DATA_FILE, JSON.stringify(docs, null, 2));
      res.status(201).json(newDoc);
    }
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// 3. Delete a document
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const result = await deleteDocument(req.params.id);
    if (!result) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// 4. Get individual document metadata
app.get('/api/documents/:id', async (req, res) => {
  try {
    if (isMongoConnected) {
      const doc = await Document.findById(req.params.id, '_id title');
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      res.json(doc);
    } else {
      const fileData = fs.readFileSync(DATA_FILE, 'utf8');
      const docs = JSON.parse(fileData || '[]');
      const doc = docs.find(d => d._id === req.params.id);
      if (!doc) return res.status(404).json({ error: 'Document not found' });
      res.json({ _id: doc._id, title: doc.title });
    }
  } catch (error) {
    console.error('Error fetching document metadata:', error);
    res.status(500).json({ error: 'Failed to fetch document metadata' });
  }
});

// ==========================================
// Socket.IO Real-Time Collaboration Setup
// ==========================================

const io = socketIo(server, {
  cors: {
    origin: CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Active collaborators dictionary: { documentId: [ { socketId, name, color } ] }
const activeCollaborators = {};

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  let currentDocId = null;
  let currentUser = null;

  // Event: Join document room
  socket.on('join-document', async ({ documentId, user }) => {
    currentDocId = documentId;
    currentUser = { socketId: socket.id, name: user.name, color: user.color };

    socket.join(documentId);
    console.log(`Socket ${socket.id} (${user.name}) joined document room: ${documentId}`);

    // Load or create document
    const document = await findOrCreateDocument(documentId);
    
    // Send current content of the document back to the client
    socket.emit('load-document', {
      data: document.data,
      title: document.title
    });

    // Add user to active collaborator registry
    if (!activeCollaborators[documentId]) {
      activeCollaborators[documentId] = [];
    }
    
    // Avoid duplicates for the same socket connection
    activeCollaborators[documentId] = activeCollaborators[documentId].filter(
      u => u.socketId !== socket.id
    );
    activeCollaborators[documentId].push(currentUser);

    // Broadcast updated active collaborators list to everyone in the room
    io.in(documentId).emit('collaborators-update', activeCollaborators[documentId]);
  });

  // Event: Real-time rich text changes synchronization
  socket.on('send-changes', (delta) => {
    if (currentDocId) {
      // Broadcast the delta to all other sockets in the room
      socket.to(currentDocId).emit('receive-changes', delta);
    }
  });

  // Event: Document autosave
  socket.on('save-document', async (data) => {
    if (currentDocId) {
      try {
        await updateDocumentData(currentDocId, data);
        console.log(`Document [${currentDocId}] auto-saved successfully.`);
      } catch (error) {
        console.error('Error saving document content:', error);
      }
    }
  });

  // Event: Live renaming of a document
  socket.on('rename-document', async (newTitle) => {
    if (currentDocId) {
      try {
        await updateDocumentTitle(currentDocId, newTitle);
        // Broadcast new title to other collaborators in room
        socket.to(currentDocId).emit('receive-rename', newTitle);
        console.log(`Document [${currentDocId}] renamed to: ${newTitle}`);
      } catch (error) {
        console.error('Error renaming document:', error);
      }
    }
  });

  // Event: User disconnect or leaving document room
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    if (currentDocId && activeCollaborators[currentDocId]) {
      // Remove current user from active collaborators
      activeCollaborators[currentDocId] = activeCollaborators[currentDocId].filter(
        user => user.socketId !== socket.id
      );

      // Broadcast updated list to the remaining users in room
      socket.to(currentDocId).emit('collaborators-update', activeCollaborators[currentDocId]);

      // Clean up empty room memory
      if (activeCollaborators[currentDocId].length === 0) {
        delete activeCollaborators[currentDocId];
      }
    }
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Collab Server is running on port ${PORT}`);
});

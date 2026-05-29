const mongoose = require('mongoose');

// Define Document schema
const documentSchema = new mongoose.Schema({
  // Unique identifier (can be a short UUID or standard MongoDB ID)
  _id: {
    type: String,
    required: true
  },
  // Document title
  title: {
    type: String,
    default: 'Untitled Document',
    trim: true
  },
  // Quill rich text delta data object
  data: {
    type: Object,
    default: { ops: [] } // Default empty Quill delta format
  }
}, {
  // Automatically manage createdAt and updatedAt timestamps
  timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);

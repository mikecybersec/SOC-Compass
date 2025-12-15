import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/json',
      'text/plain',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  }
});

// POST /api/v1/assessments/:assessmentId/files - Upload file
router.post('/assessment/:assessmentId', upload.single('file'), async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded' } });
    }
    
    // Verify assessment exists
    const assessmentCheck = await query(
      'SELECT id FROM assessments WHERE id = $1',
      [assessmentId]
    );
    
    if (assessmentCheck.rows.length === 0) {
      // Clean up uploaded file
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: { message: 'Assessment not found' } });
    }
    
    const result = await query(
      `INSERT INTO uploaded_files 
       (assessment_id, filename, original_name, mime_type, size_bytes, file_path, uploaded_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [
        assessmentId,
        req.file.filename,
        req.file.originalname,
        req.file.mimetype,
        req.file.size,
        req.file.path
      ]
    );
    
    res.status(201).json({ 
      file: {
        id: result.rows[0].id,
        assessmentId: result.rows[0].assessment_id,
        filename: result.rows[0].filename,
        originalName: result.rows[0].original_name,
        mimeType: result.rows[0].mime_type,
        sizeBytes: result.rows[0].size_bytes,
        uploadedAt: result.rows[0].uploaded_at
      }
    });
  } catch (error) {
    // Clean up file if database insert fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

// GET /api/v1/files/:fileId - Download file
router.get('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    const result = await query(
      'SELECT * FROM uploaded_files WHERE id = $1',
      [fileId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'File not found' } });
    }
    
    const file = result.rows[0];
    
    if (!fs.existsSync(file.file_path)) {
      return res.status(404).json({ error: { message: 'File not found on disk' } });
    }
    
    res.setHeader('Content-Type', file.mime_type);
    res.setHeader('Content-Disposition', `attachment; filename="${file.original_name}"`);
    res.sendFile(file.file_path);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/files/assessment/:assessmentId - List files for assessment
router.get('/assessment/:assessmentId', async (req, res, next) => {
  try {
    const { assessmentId } = req.params;
    
    const result = await query(
      'SELECT * FROM uploaded_files WHERE assessment_id = $1 ORDER BY uploaded_at DESC',
      [assessmentId]
    );
    
    res.json({ 
      files: result.rows.map(file => ({
        id: file.id,
        assessmentId: file.assessment_id,
        filename: file.filename,
        originalName: file.original_name,
        mimeType: file.mime_type,
        sizeBytes: file.size_bytes,
        uploadedAt: file.uploaded_at
      }))
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/files/:fileId - Delete file
router.delete('/:fileId', async (req, res, next) => {
  try {
    const { fileId } = req.params;
    
    const result = await query(
      'DELETE FROM uploaded_files WHERE id = $1 RETURNING *',
      [fileId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'File not found' } });
    }
    
    const file = result.rows[0];
    
    // Delete file from disk
    if (fs.existsSync(file.file_path)) {
      fs.unlinkSync(file.file_path);
    }
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;


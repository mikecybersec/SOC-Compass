import express from 'express';
import { query } from '../db/index.js';

const router = express.Router();

// Helper to format assessment from DB row
const formatAssessment = (row) => ({
  id: row.id,
  frameworkId: row.framework_id,
  answers: row.answers,
  notes: row.notes,
  metadata: row.metadata,
  actionPlan: row.action_plan,
  aspectRecommendations: row.aspect_recommendations,
  savedAt: row.saved_at,
  updatedAt: row.updated_at
});

// GET /api/v1/workspaces/:workspaceId/assessments - List assessments in workspace
router.get('/workspace/:workspaceId', async (req, res, next) => {
  try {
    const { workspaceId } = req.params;
    
    const result = await query(
      'SELECT * FROM assessments WHERE workspace_id = $1 ORDER BY saved_at DESC',
      [workspaceId]
    );
    
    res.json({ 
      assessments: result.rows.map(formatAssessment)
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/assessments/:id - Get single assessment
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'SELECT * FROM assessments WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Assessment not found' } });
    }
    
    res.json({ assessment: formatAssessment(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/assessments - Create new assessment
router.post('/', async (req, res, next) => {
  try {
    const {
      id,
      workspaceId,
      frameworkId,
      answers = {},
      notes = {},
      metadata = {},
      actionPlan = {},
      aspectRecommendations = {},
      savedAt
    } = req.body;
    
    if (!id || !workspaceId || !frameworkId) {
      return res.status(400).json({ 
        error: { message: 'id, workspaceId, and frameworkId are required' } 
      });
    }
    
    const result = await query(
      `INSERT INTO assessments 
       (id, workspace_id, framework_id, answers, notes, metadata, 
        action_plan, aspect_recommendations, saved_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING *`,
      [
        id,
        workspaceId,
        frameworkId,
        JSON.stringify(answers),
        JSON.stringify(notes),
        JSON.stringify(metadata),
        JSON.stringify(actionPlan),
        JSON.stringify(aspectRecommendations),
        savedAt || new Date().toISOString()
      ]
    );
    
    // Update workspace updated_at
    await query(
      'UPDATE workspaces SET updated_at = NOW() WHERE id = $1',
      [workspaceId]
    );
    
    res.status(201).json({ assessment: formatAssessment(result.rows[0]) });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ 
        error: { message: 'Assessment with this ID already exists' } 
      });
    }
    if (error.code === '23503') {
      return res.status(404).json({ 
        error: { message: 'Workspace not found' } 
      });
    }
    next(error);
  }
});

// PATCH /api/v1/assessments/:id - Update assessment
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      answers,
      notes,
      metadata,
      actionPlan,
      aspectRecommendations
    } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;
    
    if (answers !== undefined) {
      updates.push(`answers = $${paramCount++}`);
      values.push(JSON.stringify(answers));
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCount++}`);
      values.push(JSON.stringify(notes));
    }
    if (metadata !== undefined) {
      updates.push(`metadata = $${paramCount++}`);
      values.push(JSON.stringify(metadata));
    }
    if (actionPlan !== undefined) {
      updates.push(`action_plan = $${paramCount++}`);
      values.push(JSON.stringify(actionPlan));
    }
    if (aspectRecommendations !== undefined) {
      updates.push(`aspect_recommendations = $${paramCount++}`);
      values.push(JSON.stringify(aspectRecommendations));
    }
    
    if (updates.length === 0) {
      return res.status(400).json({ 
        error: { message: 'No fields to update' } 
      });
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const result = await query(
      `UPDATE assessments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      values
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Assessment not found' } });
    }
    
    // Update workspace updated_at
    const assessment = result.rows[0];
    await query(
      'UPDATE workspaces SET updated_at = NOW() WHERE id = $1',
      [assessment.workspace_id]
    );
    
    res.json({ assessment: formatAssessment(assessment) });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/assessments/:id - Delete assessment
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM assessments WHERE id = $1 RETURNING workspace_id',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Assessment not found' } });
    }
    
    // Update workspace updated_at
    await query(
      'UPDATE workspaces SET updated_at = NOW() WHERE id = $1',
      [result.rows[0].workspace_id]
    );
    
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;


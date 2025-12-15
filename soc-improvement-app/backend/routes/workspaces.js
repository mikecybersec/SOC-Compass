import express from 'express';
import { query, getClient } from '../db/index.js';

const router = express.Router();

// GET /api/v1/workspaces - List all workspaces with their assessments
router.get('/', async (req, res, next) => {
  try {
    const workspacesResult = await query(
      'SELECT * FROM workspaces ORDER BY updated_at DESC'
    );
    
    const workspaces = [];
    
    for (const workspace of workspacesResult.rows) {
      const assessmentsResult = await query(
        'SELECT * FROM assessments WHERE workspace_id = $1 ORDER BY saved_at DESC',
        [workspace.id]
      );
      
      workspaces.push({
        ...workspace,
        assessments: assessmentsResult.rows.map(assessment => ({
          id: assessment.id,
          frameworkId: assessment.framework_id,
          answers: assessment.answers,
          notes: assessment.notes,
          metadata: assessment.metadata,
          actionPlan: assessment.action_plan,
          aspectRecommendations: assessment.aspect_recommendations,
          savedAt: assessment.saved_at,
          updatedAt: assessment.updated_at
        }))
      });
    }
    
    res.json({ workspaces });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/workspaces/:id - Get single workspace
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const workspaceResult = await query(
      'SELECT * FROM workspaces WHERE id = $1',
      [id]
    );
    
    if (workspaceResult.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Workspace not found' } });
    }
    
    const workspace = workspaceResult.rows[0];
    
    const assessmentsResult = await query(
      'SELECT * FROM assessments WHERE workspace_id = $1 ORDER BY saved_at DESC',
      [id]
    );
    
    res.json({
      workspace: {
        ...workspace,
        assessments: assessmentsResult.rows.map(assessment => ({
          id: assessment.id,
          frameworkId: assessment.framework_id,
          answers: assessment.answers,
          notes: assessment.notes,
          metadata: assessment.metadata,
          actionPlan: assessment.action_plan,
          aspectRecommendations: assessment.aspect_recommendations,
          savedAt: assessment.saved_at,
          updatedAt: assessment.updated_at
        }))
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/workspaces - Create new workspace
router.post('/', async (req, res, next) => {
  try {
    const { id, name } = req.body;
    
    if (!id || !name) {
      return res.status(400).json({ 
        error: { message: 'id and name are required' } 
      });
    }
    
    const result = await query(
      `INSERT INTO workspaces (id, name, created_at, updated_at) 
       VALUES ($1, $2, NOW(), NOW()) 
       RETURNING *`,
      [id, name]
    );
    
    res.status(201).json({ workspace: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(409).json({ 
        error: { message: 'Workspace with this ID already exists' } 
      });
    }
    next(error);
  }
});

// PATCH /api/v1/workspaces/:id - Update workspace
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ 
        error: { message: 'name is required' } 
      });
    }
    
    const result = await query(
      `UPDATE workspaces 
       SET name = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Workspace not found' } });
    }
    
    res.json({ workspace: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/workspaces/:id - Delete workspace (cascades to assessments)
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await query(
      'DELETE FROM workspaces WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: { message: 'Workspace not found' } });
    }
    
    res.json({ success: true, workspace: result.rows[0] });
  } catch (error) {
    next(error);
  }
});

export default router;


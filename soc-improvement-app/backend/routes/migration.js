import express from 'express';
import { getClient } from '../db/index.js';

const router = express.Router();

// POST /api/v1/migration/import - Import localStorage data
router.post('/import', async (req, res, next) => {
  const client = await getClient();
  
  try {
    const { workspaces } = req.body;
    
    if (!workspaces || !Array.isArray(workspaces)) {
      return res.status(400).json({ 
        error: { message: 'Invalid data format: workspaces array required' } 
      });
    }
    
    await client.query('BEGIN');
    
    let importedWorkspaces = 0;
    let importedAssessments = 0;
    
    for (const workspace of workspaces) {
      // Validate workspace
      if (!workspace.id || !workspace.name) {
        throw new Error('Invalid workspace: id and name required');
      }
      
      // Insert workspace
      await client.query(
        `INSERT INTO workspaces (id, name, created_at, updated_at) 
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (id) DO UPDATE SET
           name = EXCLUDED.name,
           updated_at = EXCLUDED.updated_at`,
        [
          workspace.id,
          workspace.name,
          workspace.createdAt || new Date().toISOString(),
          workspace.updatedAt || new Date().toISOString()
        ]
      );
      importedWorkspaces++;
      
      // Insert assessments
      if (workspace.assessments && Array.isArray(workspace.assessments)) {
        for (const assessment of workspace.assessments) {
          // Validate assessment
          if (!assessment.id || !assessment.frameworkId) {
            console.warn(`Skipping invalid assessment in workspace ${workspace.id}`);
            continue;
          }
          
          await client.query(
            `INSERT INTO assessments 
             (id, workspace_id, framework_id, answers, notes, metadata, 
              action_plan, aspect_recommendations, saved_at, updated_at) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO UPDATE SET
               framework_id = EXCLUDED.framework_id,
               answers = EXCLUDED.answers,
               notes = EXCLUDED.notes,
               metadata = EXCLUDED.metadata,
               action_plan = EXCLUDED.action_plan,
               aspect_recommendations = EXCLUDED.aspect_recommendations,
               saved_at = EXCLUDED.saved_at,
               updated_at = EXCLUDED.updated_at`,
            [
              assessment.id,
              workspace.id,
              assessment.frameworkId,
              JSON.stringify(assessment.answers || {}),
              JSON.stringify(assessment.notes || {}),
              JSON.stringify(assessment.metadata || {}),
              JSON.stringify(assessment.actionPlan || {}),
              JSON.stringify(assessment.aspectRecommendations || {}),
              assessment.savedAt || new Date().toISOString(),
              assessment.updatedAt || assessment.savedAt || new Date().toISOString()
            ]
          );
          importedAssessments++;
        }
      }
    }
    
    await client.query('COMMIT');
    
    res.json({ 
      success: true,
      imported: {
        workspaces: importedWorkspaces,
        assessments: importedAssessments
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration import failed:', error);
    next(error);
  } finally {
    client.release();
  }
});

// GET /api/v1/migration/status - Check if database has data
router.get('/status', async (req, res, next) => {
  try {
    const client = await getClient();
    
    const workspaceCount = await client.query('SELECT COUNT(*) FROM workspaces');
    const assessmentCount = await client.query('SELECT COUNT(*) FROM assessments');
    
    client.release();
    
    res.json({
      hasData: parseInt(workspaceCount.rows[0].count) > 0,
      counts: {
        workspaces: parseInt(workspaceCount.rows[0].count),
        assessments: parseInt(assessmentCount.rows[0].count)
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;


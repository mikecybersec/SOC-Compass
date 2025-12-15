import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/index.js';

const router = express.Router();

// Helper to map DB row to API shape
const mapAction = (row) => ({
  id: row.id,
  assessmentId: row.assessment_id,
  workspaceId: row.workspace_id,
  title: row.title,
  description: row.description,
  status: row.status,
  priority: row.priority,
  category: row.category,
  owner: row.val_owner,
  dueDate: row.due_date,
  source: row.source,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// Get all actions for an assessment
router.get('/assessments/:assessmentId/actions', async (req, res, next) => {
  const { assessmentId } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.*
       FROM actions a
       WHERE a.assessment_id = $1
       ORDER BY 
         CASE a.status 
           WHEN 'todo' THEN 1 
           WHEN 'doing' THEN 2 
           WHEN 'done' THEN 3 
           ELSE 4 
         END,
         CASE a.priority 
           WHEN 'high' THEN 1
           WHEN 'medium' THEN 2
           WHEN 'low' THEN 3
           ELSE 4
         END,
         a.created_at DESC`,
      [assessmentId]
    );
    res.json(result.rows.map(map as any));
  } catch (error) {
    next(error);
  }
});

// Bulk create actions for an assessment (typically from AI seed)
router.post('/assessments/:assessmentId/actions', async (req, res, next) => {
  const { assessmentId } = req.params;
  const { actions } = req.body || {};

  if (!Array.isArray(actions) || actions.length === 0) {
    return res.status(400).json({ error: { message: 'No actions provided' } });
  }

  if (actions.length > 20) {
    return res.status(400).json({ error: { message: 'Maximum 20 actions per request' } });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Fetch assessment to ensure it exists and get workspace_id
      const assessmentRes = await client.query(
        'SELECT id, workspace_id FROM assessments WHERE id = $1',
        [assessmentId]
      );

      if (assessmentRes.rowCount === 0) {
        await client.release();
        return res.status(404).json({ error: { message: 'Assessment not found' } });
      }

      const { workspace_id } = assessmentRes.rows[0];
      const createdActions = [];

      for (const action of actions) {
        const id = action.id || `action-${uuidv4()}`;
        const title = (action.title || '').toString().slice(0, 255);
        const description = (action.description || '').toString();
        const status = action.status || 'todo';
        const priority = action.priority || 'medium';
        const category = action.category || null;
        const owner = action.owner ? action.owner.toString().slice(0, 255) : null;
        const dueDate =
          typeof action.dueDate === 'string' || action.dueDate instanceof Date
            ? new Date(action.dueDate)
            : null;
        const source = action.source || 'ai';

        const insertRes = await client.query(
          `INSERT INTO actions (
            id, assessment_id, workspace_id, title, description, status, 
            priority, category, owner, due_date, source
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
          ) RETURNING *`,
          [id, assessmentId, workspace_id, title, description, status, priority, category, owner, dueDate, source]
        );

        createdActions.push(mapAction(insertRes.rows[0]));
      }

      await client.query('COMMIT');
      res.status(201).json({ actions: createdActions });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Create single action (manual)
router.post('/actions', async (req, res, next) => {
  const {
    assessmentId,
    workspaceId,
    title,
    description,
    status = 'todo',
    priority = 'medium',
    category = null,
    owner = null,
    dueDate = null,
    source = 'manual',
  } = req.body || {};

  if (!assessmentId) {
    return res.status(400).json({ error: { message: 'assessmentId is required' } });
  }
  if (!title || !title.trim()) {
    return res.status(400).json({ error: { message: 'title is required' } });
  }

  try {
    const client = await pool.connect();
    try {
      // Ensure assessment exists and get workspace_id if not provided
      let finalWorkspaceId = workspaceId;
      if (!finalWorkspaceId) {
        const assessmentRes = await client.query(
          'SELECT workspace_id FROM assessments WHERE id = $1',
          [assessmentId]
        );
        if (assessmentRes.rowCount === 0) {
          await client.release();
          return res.status(404).json({ error: { message: 'Assessment not found' } });
        }
        finalWorkspaceId = assessmentRes.rows[0].workspace_id;
      }

      const id = `action-${uuidv4()}`;
      const insertRes = await client.query(
        `INSERT INTO actions (
          id, assessment_id, workspace_id, title, description, status, 
          priority, category, owner, due_date, source
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        ) RETURNING *`,
        [
          id,
          assessmentId,
          finalWorkspaceId,
          title.toString().trim().slice(0, 255),
          (description || '').toString(),
          status,
          priority,
          category,
          owner ? owner.toString().slice(0, 255) : null,
          dueDate ? new Date(dueDate) : null,
          source,
        ]
      );

      res.status(201).json(mapAction(insertRes.rows[0]));
    } finally {
      client.release();
    }
  } catch (error) {
    next(error);
  }
});

// Update an action
router.patch('/actions/:id', async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    status,
    priority,
    category,
    owner,
    dueDate,
  } = req.body || {};

  if (!id) {
    return res.status(400).json({ error: { message: 'Action id is required' } });
  }

  const fields = [];
  const values = [];
  let idx = 1;

  const addField = (name, value) => {
    fields.push(`${name} = $${idx}`);
    values.push(value);
    idx += 1;
  };
\n  if (typeof title === 'string') addField('title', title.toString().trim().slice(0, 255));\n  if (typeof description === 'string') addField('description', description.toString());\n  if (typeof status === 'string') addField('status', status);\n  if (typeof priority === 'string') addField('priority', priority);\n  if (typeof category === 'string') addField('category', category);\n  if (typeof owner === 'string') addField('owner', owner.toString().slice(0, 255));\n  if (dueDate !== undefined) addField('due_date', dueDate ? new Date(dueDate) : null);\n+\n+  if (fields.length === 0) {\n+    return res.status(400).json({ error: { message: 'No fields to update' } });\n+  }\n+\n+  try {\n+    const result = await pool.query(\n+      `UPDATE actions SET ${fields.join(', ')}, updated_at = NOW() WHERE id = $${idx} RETURNING *`,\n+      [...values, id]\n+    );\n+\n+    if (result.rowCount === 0) {\n+      return res.status(404).json({ error: { message: 'Action not found' } });\n+    }\n+\n+    res.json(mapAction(result.rows[0]));\n+  } catch (error) {\n+    next(error);\n+  }\n+});\n+\n+// Delete an action\n+router.delete('/actions/:id', async (req, res, next) => {\n+  const { id } = req.params;\n+\n+  try {\n+    const result = await pool.query('DELETE FROM actions WHERE id = $1', [id]);\n+    if (result.rowCount === 0) {\n+      return res.status(404).json({ error: { message: 'Action not found' } });\n+    }\n+    res.status(204).send();\n+  } catch (error) {\n+    next(error);\n+  }\n+});\n+\n+export default router;\n+\n*** End Patch"}]} */}


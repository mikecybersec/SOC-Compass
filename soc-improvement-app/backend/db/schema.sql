-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id VARCHAR(255) NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  framework_id VARCHAR(50) NOT NULL,
  answers JSONB DEFAULT '{}',
  notes JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  action_plan JSONB DEFAULT '{}',
  aspect_recommendations JSONB DEFAULT '{}',
  saved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Uploaded files table
CREATE TABLE IF NOT EXISTS uploaded_files (
  id SERIAL PRIMARY KEY,
  assessment_id VARCHAR(255) NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  size_bytes INTEGER,
  file_path TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_assessments_workspace ON assessments(workspace_id);
CREATE INDEX IF NOT EXISTS idx_assessments_updated ON assessments(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_files_assessment ON uploaded_files(assessment_id);


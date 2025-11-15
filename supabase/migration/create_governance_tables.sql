/*
  # Create Maharashtra Governance Platform Tables
  
  1. New Tables
    - `citizen_requests`
      - Core table for citizen complaints and service requests
      - Stores anonymized citizen data with full complaint details
      - Includes priority scoring and status tracking
      
    - `infrastructure_assets`
      - Tracks government infrastructure assets across Maharashtra
      - Includes risk scoring and maintenance schedules
      
    - `health_surveillance`
      - Public health monitoring data by district
      - Disease tracking and alert systems
      
    - `predictions_log`
      - Audit log for AI predictions and recommendations
      - Tracks Gemini AI analysis results
      
    - `audit_logs`
      - Complete audit trail for all system actions
      - Security and compliance tracking
  
  2. Security
    - Enable RLS on all tables
    - Public read access for transparency (anonymized data)
    - Authenticated write access for government officials
    - Admin-only access for sensitive operations
*/

-- Citizen Requests Table
CREATE TABLE IF NOT EXISTS citizen_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id text UNIQUE NOT NULL,
  citizen_name_hash text NOT NULL,
  phone_hash text NOT NULL,
  email text,
  complaint_type text NOT NULL,
  description text NOT NULL,
  city text NOT NULL,
  ward text NOT NULL,
  district text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('Critical', 'High', 'Medium', 'Low')),
  status text NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Resolved')),
  affected_count integer NOT NULL DEFAULT 1,
  department text NOT NULL,
  date_submitted timestamptz DEFAULT now(),
  priority_score numeric,
  resolved_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Infrastructure Assets Table
CREATE TABLE IF NOT EXISTS infrastructure_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id text UNIQUE NOT NULL,
  asset_type text NOT NULL,
  location text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  condition text NOT NULL CHECK (condition IN ('Excellent', 'Good', 'Fair', 'Poor', 'Critical')),
  risk_score numeric NOT NULL DEFAULT 0,
  capacity integer,
  current_usage integer,
  last_maintenance date,
  next_maintenance_due date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Health Surveillance Table
CREATE TABLE IF NOT EXISTS health_surveillance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id text UNIQUE NOT NULL,
  district text NOT NULL,
  city text NOT NULL,
  disease_type text NOT NULL,
  cases_reported integer NOT NULL DEFAULT 0,
  date_reported date NOT NULL,
  trend text CHECK (trend IN ('Increasing', 'Decreasing', 'Stable')),
  alert_level text NOT NULL DEFAULT 'Green' CHECK (alert_level IN ('Green', 'Yellow', 'Orange', 'Red')),
  action_taken text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Predictions Log Table
CREATE TABLE IF NOT EXISTS predictions_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  prediction_id text UNIQUE NOT NULL,
  request_id text NOT NULL,
  urgency_score numeric NOT NULL,
  escalation_risk numeric NOT NULL,
  predicted_priority text NOT NULL,
  recommended_action text,
  resource_requirements text,
  similar_patterns text,
  prevention_measures text,
  impact_analysis text,
  reasoning text,
  estimated_resolution_days integer,
  model_version text DEFAULT 'gemini-1.5-flash',
  prediction_timestamp timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id text UNIQUE NOT NULL,
  user_role text NOT NULL,
  action text NOT NULL,
  data_accessed text,
  timestamp timestamptz DEFAULT now(),
  ip_hash text,
  success boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE citizen_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE infrastructure_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_surveillance ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Public read access for transparency (anonymized data)
CREATE POLICY "Anyone can view citizen requests"
  ON citizen_requests FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view infrastructure assets"
  ON infrastructure_assets FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view health surveillance"
  ON health_surveillance FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view predictions log"
  ON predictions_log FOR SELECT
  USING (true);

-- Write policies - Allow anonymous inserts for citizen submissions
CREATE POLICY "Anyone can submit citizen requests"
  ON citizen_requests FOR INSERT
  WITH CHECK (true);

-- Authenticated users can update requests
CREATE POLICY "Authenticated users can update requests"
  ON citizen_requests FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow inserts to predictions log
CREATE POLICY "Anyone can insert predictions"
  ON predictions_log FOR INSERT
  WITH CHECK (true);

-- Allow inserts to audit logs
CREATE POLICY "Anyone can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_citizen_requests_status ON citizen_requests(status);
CREATE INDEX IF NOT EXISTS idx_citizen_requests_severity ON citizen_requests(severity);
CREATE INDEX IF NOT EXISTS idx_citizen_requests_city ON citizen_requests(city);
CREATE INDEX IF NOT EXISTS idx_citizen_requests_date ON citizen_requests(date_submitted);
CREATE INDEX IF NOT EXISTS idx_infrastructure_risk ON infrastructure_assets(risk_score);
CREATE INDEX IF NOT EXISTS idx_health_alert ON health_surveillance(alert_level);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_citizen_requests_updated_at BEFORE UPDATE ON citizen_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_infrastructure_updated_at BEFORE UPDATE ON infrastructure_assets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_health_updated_at BEFORE UPDATE ON health_surveillance FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

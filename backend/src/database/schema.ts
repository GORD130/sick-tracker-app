import { Generated, Insertable, Selectable, Updateable } from 'kysely'

export interface Database {
  // Core user management
  users: UserTable
  roles: RoleTable
  stations: StationTable
  
  // Absence tracking
  absences: AbsenceTable
  absence_types: AbsenceTypeTable
  mental_health_absences: MentalHealthAbsenceTable
  
  // Question system
  question_templates: QuestionTemplateTable
  absence_questions: AbsenceQuestionTable
  
  // Workflow & management
  workflow_steps: WorkflowStepTable
  duty_assignments: DutyAssignmentTable
  contact_attempts: ContactAttemptTable
  
  // Documentation & forms
  required_documents: RequiredDocumentTable
  communication_log: CommunicationLogTable
  
  // Self-reporting
  self_reporting_eligibility: SelfReportingEligibilityTable
  self_reporting_logs: SelfReportingLogsTable
  
  // Wellness & prevention
  wellness_indicators: WellnessIndicatorTable
  preventive_interventions: PreventiveInterventionTable
  
  // Return-to-work
  return_to_work_plans: ReturnToWorkPlanTable
  rtw_phase_progress: RtwPhaseProgressTable
  
  // Analytics & cost tracking
  cost_calculations: CostCalculationTable
  resource_impact: ResourceImpactTable
  employee_feedback: EmployeeFeedbackTable
}

// Core user management
export interface UserTable {
  id: Generated<number>
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role_id: number
  station_id: number | null
  platoon: 'A' | 'B' | 'C' | 'Admin' | null
  shift_pattern: '24_48' | 'M_F' | null
  password_hash: string | null
  is_active: boolean
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface RoleTable {
  id: Generated<number>
  name: string
  permissions: any // JSON permissions object
  description: string | null
  created_at: Generated<Date>
}

export interface StationTable {
  id: Generated<number>
  name: string
  code: string
  address: string | null
  is_active: boolean
  created_at: Generated<Date>
}

// Absence tracking
export interface AbsenceTable {
  id: Generated<number>
  employee_id: number
  absence_type_id: number
  start_date: Date
  expected_end_date: Date | null
  actual_end_date: Date | null
  reason_category: 'Illness' | 'Injury' | 'Family' | 'Mental Health' | 'Other'
  severity_level: 'Minor' | 'Moderate' | 'Severe' | 'Critical'
  status: 'Reported' | 'Under Review' | 'Active' | 'Follow-up Required' | 'Resolved' | 'Closed'
  reporting_officer_id: number
  assigned_manager_id: number | null
  management_level: 'Monitor Only' | 'Light Management' | 'Active Management' | 'Intensive Management'
  is_self_reported: boolean
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface AbsenceTypeTable {
  id: Generated<number>
  name: string
  requires_note: boolean
  note_requirement_days: number | null
  specific_forms: any // JSON array
  is_active: boolean
  created_at: Generated<Date>
}

export interface MentalHealthAbsenceTable {
  id: Generated<number>
  absence_id: number
  risk_level: 'Low' | 'Moderate' | 'High' | 'Critical'
  suicide_risk_assessment: boolean
  requires_immediate_support: boolean
  eap_referral_made: boolean
  support_resources_provided: any // JSON array
  safety_plan_created: boolean
  follow_up_protocol: 'Standard' | 'Enhanced' | 'Critical'
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

// Question system
export interface QuestionTemplateTable {
  id: Generated<number>
  question_text: string
  question_type: 'text' | 'select' | 'multi-select' | 'boolean'
  options: any // JSON for select types
  depends_on_question_id: number | null
  depends_on_answer: string | null
  is_required: boolean
  category: 'Initial' | 'Follow-up' | 'Medical' | 'Mental Health' | 'Return-to-Work'
  created_at: Generated<Date>
}

export interface AbsenceQuestionTable {
  id: Generated<number>
  absence_id: number
  question_template_id: number
  answer: string
  answered_by_id: number
  answered_at: Generated<Date>
}

// Workflow & management
export interface WorkflowStepTable {
  id: Generated<number>
  absence_id: number
  step_type: 'Initial Report' | 'Manager Assignment' | 'Follow-up Call' | 'Document Review' | 'Return Assessment'
  assigned_to_id: number
  due_date: Date
  completed_at: Date | null
  status: 'Pending' | 'In Progress' | 'Completed' | 'Overdue'
  notes: string | null
  priority: 'Low' | 'Medium' | 'High' | 'Critical'
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface DutyAssignmentTable {
  id: Generated<number>
  officer_id: number
  assignment_type: 'Primary' | 'Backup' | 'Emergency'
  start_date: Date
  end_date: Date
  shift_pattern: '24_48' | 'M_F'
  is_active: boolean
  station_coverage: any // JSON array of station IDs
  created_at: Generated<Date>
}

export interface ContactAttemptTable {
  id: Generated<number>
  absence_id: number
  manager_id: number
  attempt_date: Date
  contact_method: 'Phone' | 'Email' | 'In Person' | 'SMS' | 'App'
  successful: boolean
  notes: string | null
  next_scheduled_contact: Date | null
  follow_up_required: boolean
  created_at: Generated<Date>
}

// Documentation & forms
export interface RequiredDocumentTable {
  id: Generated<number>
  absence_id: number
  document_type: 'Doctor Note' | 'WorkSafe Form' | 'Return-to-Work' | 'Medical Certificate' | 'Incident Report'
  due_date: Date
  submitted_date: Date | null
  status: 'Required' | 'Submitted' | 'Reviewed' | 'Rejected'
  file_path: string | null
  reviewed_by_id: number | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface CommunicationLogTable {
  id: Generated<number>
  absence_id: number
  communication_type: 'Phone' | 'Email' | 'SMS' | 'In-Person' | 'App'
  direction: 'Outbound' | 'Inbound'
  participant_ids: any // JSON array of user IDs
  summary: string
  key_points: any // JSON array
  action_items: any // JSON array
  follow_up_required: boolean
  sentiment_score: number | null
  communication_date: Generated<Date>
}

// Self-reporting
export interface SelfReportingEligibilityTable {
  id: Generated<number>
  employee_id: number
  is_eligible: boolean
  eligibility_reason: string | null
  max_self_report_days: number
  allowed_absence_types: any // JSON array
  requires_manager_approval: boolean
  auto_approval_threshold: number
  eligibility_start_date: Date
  eligibility_end_date: Date | null
  review_frequency_days: number
  last_review_date: Date | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface SelfReportingLogsTable {
  id: Generated<number>
  employee_id: number
  report_date: Date
  absence_type: string
  duration_days: number
  auto_approved: boolean
  manager_review_required: boolean
  manager_reviewed_by: number | null
  review_date: Date | null
  review_notes: string | null
  compliance_score: number | null
  created_at: Generated<Date>
}

// Wellness & prevention
export interface WellnessIndicatorTable {
  id: Generated<number>
  employee_id: number
  indicator_type: 'Fatigue' | 'Stress' | 'Burnout' | 'Physical Strain'
  indicator_level: 'Low' | 'Medium' | 'High' | 'Critical'
  source: 'Self-Report' | 'Manager Observation' | 'System Detection'
  recorded_date: Date
  intervention_recommended: boolean
  intervention_applied: boolean
  follow_up_date: Date | null
  created_at: Generated<Date>
}

export interface PreventiveInterventionTable {
  id: Generated<number>
  employee_id: number
  intervention_type: 'Peer Support' | 'EAP Referral' | 'Light Duty' | 'Time Off' | 'Wellness Program'
  recommended_by: number
  implementation_date: Date
  effectiveness_rating: number | null
  notes: string | null
  follow_up_required: boolean
  created_at: Generated<Date>
}

// Return-to-work
export interface ReturnToWorkPlanTable {
  id: Generated<number>
  absence_id: number
  plan_type: 'Standard' | 'Graduated' | 'Accommodated'
  start_date: Date
  expected_full_duty_date: Date
  current_phase: number
  phase_details: any // JSON object
  medical_restrictions: any // JSON array
  accommodations_required: any // JSON array
  supervisor_approval_required: boolean
  hr_approval_required: boolean
  plan_status: 'Active' | 'Completed' | 'Modified'
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

export interface RtwPhaseProgressTable {
  id: Generated<number>
  plan_id: number
  phase_number: number
  start_date: Date
  end_date: Date | null
  duties_assigned: any // JSON array
  hours_per_shift: number
  restrictions_in_place: any // JSON array
  phase_completed: boolean
  employee_feedback: number | null
  supervisor_assessment: number | null
  created_at: Generated<Date>
  updated_at: Generated<Date>
}

// Analytics & cost tracking
export interface CostCalculationTable {
  id: Generated<number>
  absence_id: number
  salary_cost: number
  overtime_cost: number
  replacement_cost: number
  administrative_cost: number
  total_cost: number
  cost_category: 'Direct' | 'Indirect' | 'Opportunity'
  calculated_date: Date
  notes: string | null
  created_at: Generated<Date>
}

export interface ResourceImpactTable {
  id: Generated<number>
  absence_id: number
  station_id: number
  shift_date: Date
  minimum_staffing_met: boolean
  backup_required: boolean
  overtime_required: boolean
  service_level_impact: 'None' | 'Minor' | 'Moderate' | 'Major'
  response_time_impact: number | null
  notes: string | null
  created_at: Generated<Date>
}

export interface EmployeeFeedbackTable {
  id: Generated<number>
  absence_id: number
  feedback_type: 'Process' | 'Support' | 'Communication' | 'Overall'
  rating: number
  comments: string | null
  submitted_anonymously: boolean
  improvement_suggestions: string | null
  follow_up_required: boolean
  action_taken: any // JSON object
  feedback_date: Generated<Date>
}

// Type helpers for TypeScript
export type User = Selectable<UserTable>
export type NewUser = Insertable<UserTable>
export type UserUpdate = Updateable<UserTable>

export type Absence = Selectable<AbsenceTable>
export type NewAbsence = Insertable<AbsenceTable>
export type AbsenceUpdate = Updateable<AbsenceTable>

export type MentalHealthAbsence = Selectable<MentalHealthAbsenceTable>
export type NewMentalHealthAbsence = Insertable<MentalHealthAbsenceTable>
export type MentalHealthAbsenceUpdate = Updateable<MentalHealthAbsenceTable>
# Sick Leave Management System - Architecture Plan
## For Fire Department with 24/7 Operations

## 1. System Overview

A comprehensive sick leave management system designed specifically for fire departments with mixed shift patterns (24/48 and M-F). The system standardizes sick leave reporting, automates follow-up workflows, and ensures clear responsibility assignment.

## 2. User Roles and Permissions

### Core User Roles:
- **Firefighter/Employee**: Can report own sick leave, view personal history
- **Lieutenant**: Team-level management, initial sick call intake
- **Captain**: Platoon-level oversight, extended absence management
- **Battalion Chief**: Department-wide oversight, complex case management
- **HR Administrator**: System configuration, reporting, compliance
- **Chief Officer**: Executive oversight, policy management

### Permission Matrix:
| Role | Report Sick | View Team | Manage Cases | Configure System | Generate Reports |
|------|-------------|-----------|--------------|------------------|------------------|
| Firefighter | ✅ | ❌ | ❌ | ❌ | ❌ |
| Lieutenant | ✅ | ✅ | ✅ (Team) | ❌ | ❌ |
| Captain | ✅ | ✅ | ✅ (Platoon) | ❌ | ✅ (Platoon) |
| Battalion Chief | ✅ | ✅ | ✅ (Dept) | ❌ | ✅ (Dept) |
| HR Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Chief Officer | ✅ | ✅ | ✅ | ✅ | ✅ |

## 3. Database Schema Design

### Core Tables:

#### Users & Authentication
```sql
users
├── id (PK)
├── employee_id
├── first_name
├── last_name
├── email
├── phone
├── role_id (FK -> roles)
├── station_id (FK -> stations)
├── platoon (A/B/C or Admin)
├── shift_pattern (24/48, M-F)
├── is_active
└── created_at

roles
├── id (PK)
├── name (Firefighter, Lieutenant, Captain, etc.)
├── permissions (JSON)
└── description
```

#### Sick Leave Tracking
```sql
absences
├── id (PK)
├── employee_id (FK -> users)
├── absence_type_id (FK -> absence_types)
├── start_date
├── expected_end_date
├── actual_end_date
├── reason_category (Illness, Injury, Family, Other)
├── severity_level (Minor, Moderate, Severe)
├── status (Reported, Under Review, Active, Resolved, Closed)
├── reporting_officer_id (FK -> users)
├── assigned_manager_id (FK -> users)
├── created_at
└── updated_at

absence_types
├── id (PK)
├── name (Sick Leave, Workplace Injury, Medical Appointment, etc.)
├── requires_note (boolean)
├── note_requirement_days (number)
├── specific_forms (JSON array)
└── is_active
```

#### Conditional Question System
```sql
question_templates
├── id (PK)
├── question_text
├── question_type (text, select, multi-select, boolean)
├── options (JSON for select types)
├── depends_on_question_id (FK -> question_templates)
├── depends_on_answer (value that triggers this question)
├── is_required
└── category (Initial, Follow-up, Medical, etc.)

absence_questions
├── id (PK)
├── absence_id (FK -> absences)
├── question_template_id (FK -> question_templates)
├── answer
├── answered_by_id (FK -> users)
└── answered_at
```

#### Workflow & Duty Management
```sql
workflow_steps
├── id (PK)
├── absence_id (FK -> absences)
├── step_type (Initial Report, Manager Assignment, Follow-up Call, etc.)
├── assigned_to_id (FK -> users)
├── due_date
├── completed_at
├── status (Pending, In Progress, Completed, Overdue)
├── notes
└── priority (Low, Medium, High, Critical)

duty_assignments
├── id (PK)
├── officer_id (FK -> users)
├── assignment_type (Primary, Backup, Emergency)
├── start_date
├── end_date
├── shift_pattern
├── is_active
└── station_coverage
```

#### Documentation & Forms
```sql
required_documents
├── id (PK)
├── absence_id (FK -> absences)
├── document_type (Doctor Note, WorkSafe Form, Return-to-Work, etc.)
├── due_date
├── submitted_date
├── status (Required, Submitted, Reviewed, Rejected)
├── file_path
└── reviewed_by_id (FK -> users)
```

## 4. Workflow State Management

### Absence Lifecycle:
```
Reported → Under Review → Active → Follow-up Required → Resolved → Closed
```

### State Transitions:
1. **Reported**: Initial sick call received
2. **Under Review**: Manager assesses severity and requirements
3. **Active**: Ongoing absence with regular check-ins
4. **Follow-up Required**: Specific actions needed (forms, calls, etc.)
5. **Resolved**: Employee returned to work
6. **Closed**: All documentation complete, case archived

## 5. Conditional Question System

### Question Categories:
- **Initial Intake**: Basic information (symptoms, duration, contact)
- **Severity Assessment**: Impact on duties, contagiousness
- **Documentation Requirements**: Note requirements, forms needed
- **Follow-up Protocol**: Check-in frequency, return-to-work planning

### Example Conditional Flow:
```
Is this a workplace injury?
├── Yes → Trigger WorkSafeBC form requirement
│   └→ Was medical attention required?
│       ├── Yes → Prompt for medical report upload
│       └→ No → Standard injury documentation
└── No → Standard sick leave protocol
    └→ Expected duration > 3 days?
        ├── Yes → Require doctor's note
        └→ No → Basic follow-up only
```

## 6. Notification & Prompting System

### Automated Prompts:
- **Manager Assignment**: Automatically assign based on duty roster
- **Follow-up Calls**: Schedule based on absence duration and severity
- **Documentation Reminders**: Alert when forms/notes are due
- **Return-to-Work**: Prompt for fitness assessment
- **Escalation**: Notify higher management for extended absences

### Notification Channels:
- In-app dashboard
- Email notifications
- SMS alerts for urgent matters
- Push notifications (mobile app)

## 7. Manager Assignment & Duty Rotation

### Assignment Logic:
1. **Primary Assignment**: Based on employee's direct supervisor
2. **Backup Assignment**: Next available officer in same station
3. **Emergency Coverage**: Duty officer rotation for after-hours
4. **Complex Case Escalation**: Automatic escalation to Battalion Chief for extended absences

### Shift-Based Coverage:
- Track 24/48 and M-F shift patterns
- Automatic handoff at shift change
- Clear "on-duty" status visibility
- Override capability for special circumstances

## 8. User Interface Design

### Key Screens:
1. **Dashboard**: Overview of active cases, pending tasks, statistics
2. **Sick Call Intake**: Step-by-step form with conditional questions
3. **Case Management**: Detailed view of individual absences
4. **Duty Roster**: Current assignments and availability
5. **Reporting**: Analytics and compliance reporting
6. **Configuration**: System settings and workflow customization

### Mobile Considerations:
- Responsive design for station computers and mobile devices
- Offline capability for initial sick call reporting
- Quick action buttons for common tasks

## 9. Integration Points

### External Systems:
- **HR/Payroll Systems**: Sync absence data
- **Scheduling Software**: Update shift coverage
- **Document Management**: Store and retrieve forms
- **Communication Platforms**: Slack/Teams integration for notifications

### Form Templates:
- WorkSafeBC claim forms
- Doctor's note templates
- Return-to-work assessment forms
- Fitness-for-duty certificates

## 10. Security & Compliance

### Data Protection:
- Role-based access control
- Audit logging for all actions
- Data encryption at rest and in transit
- Regular backup procedures

### Compliance Requirements:
- PHIPA/PIPEDA compliance for medical information
- WorkSafeBC reporting requirements
- Municipal record-keeping standards
- Privacy impact assessment

## 11. Reporting & Analytics

### Standard Reports:
- Absence trends by station, platoon, type
- Manager performance metrics
- Compliance reporting (forms submitted, timelines)
- Cost analysis of sick leave

### Real-time Dashboards:
- Active cases by severity
- Pending tasks and overdue items
- Staffing impact analysis
- Compliance status

## 12. Implementation Phases

### Phase 1: Core System (Weeks 1-4)
- User management and authentication
- Basic sick call reporting
- Manager assignment
- Simple dashboard

### Phase 2: Workflow Automation (Weeks 5-8)
- Conditional question system
- Automated notifications
- Document tracking
- Basic reporting

### Phase 3: Advanced Features (Weeks 9-12)
- Mobile app
- External integrations
- Advanced analytics
- Custom form builder

### Phase 4: Optimization (Weeks 13+)
- Performance tuning
- User feedback implementation
- Additional customization options
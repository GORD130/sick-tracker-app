import { db } from '../database/db.js'
import { Absence, NewAbsence, AbsenceUpdate } from '../database/schema.js'
import { UserService } from './userService.js'
// import { WorkflowService } from './workflowService.js'

export class AbsenceService {
  static async createAbsence(absenceData: NewAbsence): Promise<Absence> {
    return await db.transaction().execute(async (trx) => {
      // Create the absence
      const absence = await trx
        .insertInto('absences')
        .values(absenceData)
        .returningAll()
        .executeTakeFirstOrThrow()

      // Auto-assign manager if not provided
      if (!absence.assigned_manager_id) {
        const assignedManager = await UserService.getAvailableManager(absence.employee_id)
        if (assignedManager) {
          await trx
            .updateTable('absences')
            .set({ assigned_manager_id: assignedManager.id })
            .where('id', '=', absence.id)
            .execute()
          
          absence.assigned_manager_id = assignedManager.id
        }
      }

      // TODO: Create initial workflow steps
      // await WorkflowService.createInitialWorkflow(absence.id, trx)

      return absence
    })
  }

  static async getAbsenceById(id: number): Promise<Absence | null> {
    const result = await db
      .selectFrom('absences')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    
    return result || null
  }

  static async getAbsencesByEmployee(employeeId: number): Promise<Absence[]> {
    return await db
      .selectFrom('absences')
      .selectAll()
      .where('employee_id', '=', employeeId)
      .orderBy('created_at', 'desc')
      .execute()
  }

  static async getActiveAbsences(): Promise<Absence[]> {
    return await db
      .selectFrom('absences')
      .selectAll()
      .where('status', 'in', ['Reported', 'Under Review', 'Active', 'Follow-up Required'])
      .orderBy('created_at', 'desc')
      .execute()
  }

  static async getAbsencesByManager(managerId: number): Promise<Absence[]> {
    return await db
      .selectFrom('absences')
      .selectAll()
      .where('assigned_manager_id', '=', managerId)
      .orderBy('created_at', 'desc')
      .execute()
  }

  static async updateAbsence(id: number, updates: AbsenceUpdate): Promise<Absence | null> {
    const result = await db
      .updateTable('absences')
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    return result || null
  }

  static async updateAbsenceStatus(id: number, status: Absence['status']): Promise<Absence | null> {
    return await this.updateAbsence(id, { status })
  }

  static async assignManager(absenceId: number, managerId: number): Promise<Absence | null> {
    return await this.updateAbsence(absenceId, { assigned_manager_id: managerId })
  }

  static async getAbsenceWithDetails(id: number) {
    return await db
      .selectFrom('absences')
      .leftJoin('users as employee', 'employee.id', 'absences.employee_id')
      .leftJoin('users as manager', 'manager.id', 'absences.assigned_manager_id')
      .leftJoin('users as reporting_officer', 'reporting_officer.id', 'absences.reporting_officer_id')
      .leftJoin('absence_types', 'absence_types.id', 'absences.absence_type_id')
      .leftJoin('mental_health_absences', 'mental_health_absences.absence_id', 'absences.id')
      .select([
        'absences.id',
        'absences.start_date',
        'absences.expected_end_date',
        'absences.actual_end_date',
        'absences.reason_category',
        'absences.severity_level',
        'absences.status',
        'absences.management_level',
        'absences.is_self_reported',
        'absences.created_at',
        'absences.updated_at',
        
        'employee.id as employee_id',
        'employee.first_name as employee_first_name',
        'employee.last_name as employee_last_name',
        'employee.email as employee_email',
        'employee.station_id as employee_station_id',
        
        'manager.id as manager_id',
        'manager.first_name as manager_first_name',
        'manager.last_name as manager_last_name',
        
        'reporting_officer.first_name as reporting_officer_first_name',
        'reporting_officer.last_name as reporting_officer_last_name',
        
        'absence_types.name as absence_type_name',
        
        'mental_health_absences.risk_level as mental_health_risk_level',
        'mental_health_absences.follow_up_protocol as mental_health_follow_up_protocol'
      ])
      .where('absences.id', '=', id)
      .executeTakeFirst()
  }

  static async getAbsenceStatistics() {
    const totalAbsences = await db
      .selectFrom('absences')
      .select((eb) => eb.fn.countAll().as('total_count'))
      .executeTakeFirst()

    const activeAbsences = await db
      .selectFrom('absences')
      .select((eb) => eb.fn.countAll().as('active_count'))
      .where('status', 'in', ['Reported', 'Under Review', 'Active', 'Follow-up Required'])
      .executeTakeFirst()

    const byStatus = await db
      .selectFrom('absences')
      .select(['status', (eb) => eb.fn.countAll().as('count')])
      .groupBy('status')
      .execute()

    const byReason = await db
      .selectFrom('absences')
      .select(['reason_category', (eb) => eb.fn.countAll().as('count')])
      .groupBy('reason_category')
      .execute()

    return {
      total: totalAbsences?.total_count || 0,
      active: activeAbsences?.active_count || 0,
      byStatus: byStatus.reduce((acc, item) => {
        acc[item.status] = Number(item.count)
        return acc
      }, {} as Record<string, number>),
      byReason: byReason.reduce((acc, item) => {
        acc[item.reason_category] = Number(item.count)
        return acc
      }, {} as Record<string, number>)
    }
  }

  static async searchAbsences(filters: {
    employeeId?: number
    managerId?: number
    status?: string
    reasonCategory?: string
    startDate?: Date
    endDate?: Date
  }): Promise<Absence[]> {
    let query = db.selectFrom('absences').selectAll()

    if (filters.employeeId) {
      query = query.where('employee_id', '=', filters.employeeId)
    }

    if (filters.managerId) {
      query = query.where('assigned_manager_id', '=', filters.managerId)
    }

    if (filters.status) {
      query = query.where('status', '=', filters.status as any)
    }

    if (filters.reasonCategory) {
      query = query.where('reason_category', '=', filters.reasonCategory as any)
    }

    if (filters.startDate) {
      query = query.where('start_date', '>=', filters.startDate)
    }

    if (filters.endDate) {
      query = query.where('start_date', '<=', filters.endDate)
    }

    return await query.orderBy('created_at', 'desc').execute()
  }
}
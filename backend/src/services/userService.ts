import { db } from '../database/db.js'
import { User, NewUser, UserUpdate } from '../database/schema.js'

export class UserService {
  static async createUser(userData: NewUser): Promise<User> {
    return await db
      .insertInto('users')
      .values(userData)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  static async getUserById(id: number): Promise<User | null> {
    const result = await db
      .selectFrom('users')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst()
    
    return result || null
  }

  static async getUserByEmployeeId(employeeId: string): Promise<User | null> {
    const result = await db
      .selectFrom('users')
      .selectAll()
      .where('employee_id', '=', employeeId)
      .executeTakeFirst()
    
    return result || null
  }

  static async getAllUsers(): Promise<User[]> {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('is_active', '=', true)
      .orderBy('last_name', 'asc')
      .orderBy('first_name', 'asc')
      .execute()
  }

  static async getUsersByRole(roleId: number): Promise<User[]> {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('role_id', '=', roleId)
      .where('is_active', '=', true)
      .orderBy('last_name', 'asc')
      .execute()
  }

  static async getUsersByStation(stationId: number): Promise<User[]> {
    return await db
      .selectFrom('users')
      .selectAll()
      .where('station_id', '=', stationId)
      .where('is_active', '=', true)
      .orderBy('last_name', 'asc')
      .execute()
  }

  static async updateUser(id: number, updates: UserUpdate): Promise<User | null> {
    const result = await db
      .updateTable('users')
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    return result || null
  }

  static async getAvailableManager(employeeId: number): Promise<User | null> {
    // Get the employee to find their station and direct supervisor
    const employee = await this.getUserById(employeeId)
    if (!employee || !employee.station_id) {
      return null
    }

    // First, try to find the employee's direct supervisor (Lieutenant/Captain in same station)
    const directSupervisor = await db
      .selectFrom('users')
      .selectAll()
      .where('station_id', '=', employee.station_id)
      .where('role_id', 'in', [2, 3]) // Lieutenant (2) or Captain (3)
      .where('is_active', '=', true)
      .orderBy('role_id', 'asc') // Prefer Captain over Lieutenant
      .executeTakeFirst()

    if (directSupervisor) {
      return directSupervisor
    }

    // If no direct supervisor, find any available manager in the station
    const availableManager = await db
      .selectFrom('users')
      .selectAll()
      .where('station_id', '=', employee.station_id)
      .where('role_id', 'in', [2, 3, 4]) // Lieutenant, Captain, or Battalion Chief
      .where('is_active', '=', true)
      .executeTakeFirst()

    return availableManager || null
  }

  static async getManagersOnDuty(): Promise<User[]> {
    // const currentTime = new Date()
    
    return await db
      .selectFrom('users')
      .selectAll()
      .where('role_id', 'in', [2, 3, 4]) // Lieutenant, Captain, Battalion Chief
      .where('is_active', '=', true)
      .execute()
  }

  static async getUserWithRole(userId: number) {
    return await db
      .selectFrom('users')
      .innerJoin('roles', 'roles.id', 'users.role_id')
      .select([
        'users.id',
        'users.employee_id',
        'users.first_name',
        'users.last_name',
        'users.email',
        'users.phone',
        'users.station_id',
        'users.platoon_id',
        'users.shift_pattern',
        'users.is_active',
        'users.created_at',
        'users.updated_at',
        'roles.name as role_name',
        'roles.permissions as role_permissions'
      ])
      .where('users.id', '=', userId)
      .executeTakeFirst()
  }

  static async searchUsers(filters: {
    searchTerm?: string
    roleId?: number
    stationId?: number
    isActive?: boolean
  }): Promise<User[]> {
    let query = db.selectFrom('users').selectAll()

    if (filters.searchTerm) {
      query = query.where((eb) => 
        eb.or([
          eb('first_name', 'ilike', `%${filters.searchTerm}%`),
          eb('last_name', 'ilike', `%${filters.searchTerm}%`),
          eb('email', 'ilike', `%${filters.searchTerm}%`)
        ])
      )
    }

    if (filters.roleId) {
      query = query.where('role_id', '=', filters.roleId)
    }

    if (filters.stationId) {
      query = query.where('station_id', '=', filters.stationId)
    }

    if (filters.isActive !== undefined) {
      query = query.where('is_active', '=', filters.isActive)
    }

    return await query
      .orderBy('last_name', 'asc')
      .orderBy('first_name', 'asc')
      .execute()
  }

  static async getAllRoles() {
    return await db
      .selectFrom('roles')
      .selectAll()
      .orderBy('id', 'asc')
      .execute()
  }

  static async getAllStations() {
    return await db
      .selectFrom('stations')
      .selectAll()
      .orderBy('id', 'asc')
      .execute()
  }

  static async getAllPlatoons() {
    return await db
      .selectFrom('platoons')
      .selectAll()
      .orderBy('id', 'asc')
      .execute()
  }

  static async updateUserStatus(id: number, isActive: boolean): Promise<User | null> {
    const result = await db
      .updateTable('users')
      .set({
        is_active: isActive,
        updated_at: new Date()
      })
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    return result || null
  }

  static async createStation(stationData: {
    name: string
    code: string
    address: string | null
    is_active: boolean
  }) {
    return await db
      .insertInto('stations')
      .values(stationData)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  static async createRole(roleData: {
    name: string
    description: string | null
    permissions: any
  }) {
    return await db
      .insertInto('roles')
      .values(roleData)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  static async createPlatoon(platoonData: {
    name: string
    code: string
    description: string | null
    shift_pattern: string
    is_active: boolean
  }) {
    return await db
      .insertInto('platoons')
      .values(platoonData)
      .returningAll()
      .executeTakeFirstOrThrow()
  }

  static async updatePlatoon(id: number, updates: {
    name?: string
    code?: string
    description?: string | null
    shift_pattern?: string
    is_active?: boolean
  }) {
    const result = await db
      .updateTable('platoons')
      .set(updates)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    return result || null
  }

  static async updateRole(id: number, updates: {
    name?: string
    description?: string | null
    permissions?: any
  }) {
    const result = await db
      .updateTable('roles')
      .set(updates)
      .where('id', '=', id)
      .returningAll()
      .executeTakeFirst()

    return result || null
  }

  static async deleteRole(id: number): Promise<boolean> {
    const result = await db
      .deleteFrom('roles')
      .where('id', '=', id)
      .executeTakeFirst()

    return result.numDeletedRows > 0
  }
}
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { db } from '../database/db.js'

// JWT secret - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here'
const JWT_EXPIRES_IN = '24h'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role_id: number
  station_id: number | null
  platoon: 'A' | 'B' | 'C' | 'Admin' | null
  shift_pattern: '24_48' | 'M_F' | null
  password: string
}

export interface AuthResponse {
  success: boolean
  message: string
  token?: string
  user?: {
    id: number
    employee_id: string
    first_name: string
    last_name: string
    email: string
    role_id: number
    station_id: number | null
    platoon: 'A' | 'B' | 'C' | 'Admin' | null
    shift_pattern: '24_48' | 'M_F' | null
  }
}

export interface ChangePasswordData {
  userId: number
  currentPassword: string
  newPassword: string
}

export class AuthService {
  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Find user by email
      const user = await db
        .selectFrom('users')
        .innerJoin('roles', 'users.role_id', 'roles.id')
        .select([
          'users.id',
          'users.employee_id',
          'users.first_name',
          'users.last_name',
          'users.email',
          'users.role_id',
          'users.station_id',
          'users.platoon',
          'users.shift_pattern',
          'users.password_hash',
          'users.is_active',
          'roles.name as role_name',
          'roles.permissions'
        ])
        .where('users.email', '=', credentials.email)
        .where('users.is_active', '=', true)
        .executeTakeFirst()

      if (!user) {
        return {
          success: false,
          message: 'Invalid email or password'
        }
      }

      // Check if password_hash exists and is not null
      if (!user.password_hash) {
        return {
          success: false,
          message: 'Account setup incomplete. Please contact administrator.'
        }
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash)
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Invalid email or password'
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          employeeId: user.employee_id,
          email: user.email,
          roleId: user.role_id,
          roleName: user.role_name
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      return {
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          employee_id: user.employee_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role_id: user.role_id,
          station_id: user.station_id,
          platoon: user.platoon,
          shift_pattern: user.shift_pattern
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        message: 'An error occurred during login'
      }
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      // Check if email already exists
      const existingUser = await db
        .selectFrom('users')
        .select(['id'])
        .where('email', '=', userData.email)
        .executeTakeFirst()

      if (existingUser) {
        return {
          success: false,
          message: 'Email already registered'
        }
      }

      // Check if employee ID already exists
      const existingEmployee = await db
        .selectFrom('users')
        .select(['id'])
        .where('employee_id', '=', userData.employee_id)
        .executeTakeFirst()

      if (existingEmployee) {
        return {
          success: false,
          message: 'Employee ID already registered'
        }
      }

      // Hash password
      const passwordHash = await bcrypt.hash(userData.password, 12)

      // Create user
      const user = await db
        .insertInto('users')
        .values({
          employee_id: userData.employee_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          phone: userData.phone,
          role_id: userData.role_id,
          station_id: userData.station_id,
          platoon: userData.platoon,
          shift_pattern: userData.shift_pattern,
          password_hash: passwordHash,
          is_active: true
        })
        .returning([
          'id',
          'employee_id',
          'first_name',
          'last_name',
          'email',
          'role_id',
          'station_id',
          'platoon',
          'shift_pattern'
        ])
        .executeTakeFirst()

      if (!user) {
        return {
          success: false,
          message: 'Failed to create user'
        }
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.id,
          employeeId: user.employee_id,
          email: user.email,
          roleId: user.role_id
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      )

      return {
        success: true,
        message: 'Registration successful',
        token,
        user: {
          id: user.id,
          employee_id: user.employee_id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role_id: user.role_id,
          station_id: user.station_id,
          platoon: user.platoon,
          shift_pattern: user.shift_pattern
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return {
        success: false,
        message: 'An error occurred during registration'
      }
    }
  }

  /**
   * Verify JWT token
   */
  async verifyToken(token: string): Promise<{ valid: boolean; payload?: any; message?: string }> {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as any
      
      // Check if user still exists and is active
      const user = await db
        .selectFrom('users')
        .innerJoin('roles', 'users.role_id', 'roles.id')
        .select([
          'users.id',
          'users.employee_id',
          'users.first_name',
          'users.last_name',
          'users.email',
          'users.role_id',
          'users.station_id',
          'users.platoon',
          'users.shift_pattern',
          'users.is_active',
          'roles.name as role_name',
          'roles.permissions'
        ])
        .where('users.id', '=', payload.userId)
        .where('users.is_active', '=', true)
        .executeTakeFirst()

      if (!user) {
        return {
          valid: false,
          message: 'User not found or inactive'
        }
      }

      return {
        valid: true,
        payload: {
          ...payload,
          user: {
            id: user.id,
            employee_id: user.employee_id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            role_id: user.role_id,
            station_id: user.station_id,
            platoon: user.platoon,
            shift_pattern: user.shift_pattern,
            role_name: user.role_name,
            permissions: user.permissions
          }
        }
      }
    } catch (error) {
      return {
        valid: false,
        message: 'Invalid token'
      }
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<{ success: boolean; message: string }> {
    try {
      // Get current password hash
      const user = await db
        .selectFrom('users')
        .select(['password_hash'])
        .where('id', '=', data.userId)
        .where('is_active', '=', true)
        .executeTakeFirst()

      if (!user || !user.password_hash) {
        return {
          success: false,
          message: 'User not found'
        }
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(data.currentPassword, user.password_hash)
      if (!isValidPassword) {
        return {
          success: false,
          message: 'Current password is incorrect'
        }
      }

      // Hash new password
      const newPasswordHash = await bcrypt.hash(data.newPassword, 12)

      // Update password
      await db
        .updateTable('users')
        .set({ password_hash: newPasswordHash })
        .where('id', '=', data.userId)
        .execute()

      return {
        success: true,
        message: 'Password changed successfully'
      }
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        message: 'An error occurred while changing password'
      }
    }
  }
}

export const authService = new AuthService()
import { Router } from 'express'
import { z } from 'zod'
import { UserService } from '../services/userService.js'

const router = Router()

// Validation schemas
const createUserSchema = z.object({
  employee_id: z.string().min(1, 'Employee ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  role_id: z.number(),
  station_id: z.number().optional(),
  platoon: z.enum(['A', 'B', 'C', 'Admin']).optional(),
  shift_pattern: z.enum(['24_48', 'M_F']).optional(),
  is_active: z.boolean().default(true)
})

const updateUserSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  email: z.string().email('Invalid email format').optional(),
  phone: z.string().optional(),
  role_id: z.number().optional(),
  station_id: z.number().optional(),
  platoon: z.enum(['A', 'B', 'C', 'Admin']).optional(),
  shift_pattern: z.enum(['24_48', 'M_F']).optional(),
  is_active: z.boolean().optional()
})

// GET /api/users - Get all users with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      role_id, 
      station_id, 
      is_active 
    } = req.query

    const filters = {
      searchTerm: search as string | undefined,
      roleId: role_id ? parseInt(role_id as string) : undefined,
      stationId: station_id ? parseInt(station_id as string) : undefined,
      isActive: is_active !== undefined ? is_active === 'true' : undefined
    }

    const users = await UserService.searchUsers(filters)
    res.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({ error: 'Failed to fetch users' })
  }
})

// GET /api/users/active - Get active users
router.get('/active', async (_req, res) => {
  try {
    const users = await UserService.getAllUsers()
    res.json(users)
  } catch (error) {
    console.error('Error fetching active users:', error)
    res.status(500).json({ error: 'Failed to fetch active users' })
  }
})

// GET /api/users/managers - Get all managers
router.get('/managers', async (_req, res) => {
  try {
    const managers = await UserService.getManagersOnDuty()
    res.json(managers)
  } catch (error) {
    console.error('Error fetching managers:', error)
    res.status(500).json({ error: 'Failed to fetch managers' })
  }
})

// GET /api/users/:id - Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    const user = await UserService.getUserWithRole(id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// GET /api/users/employee/:employeeId - Get user by employee ID
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const employeeId = req.params.employeeId
    const user = await UserService.getUserByEmployeeId(employeeId)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// POST /api/users - Create new user
router.post('/', async (req, res) => {
  try {
    const validationResult = createUserSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const userData = validationResult.data
    const user = await UserService.createUser(userData)
    
    res.status(201).json(user)
  } catch (error) {
    console.error('Error creating user:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      if (error.message.includes('employee_id')) {
        return res.status(409).json({ error: 'Employee ID already exists' })
      }
      if (error.message.includes('email')) {
        return res.status(409).json({ error: 'Email already exists' })
      }
    }
    
    res.status(500).json({ error: 'Failed to create user' })
  }
})

// PUT /api/users/:id - Update user
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    const validationResult = updateUserSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const user = await UserService.updateUser(id, validationResult.data)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ error: 'Failed to update user' })
  }
})

// GET /api/users/role/:roleId - Get users by role
router.get('/role/:roleId', async (req, res) => {
  try {
    const roleId = parseInt(req.params.roleId)
    if (isNaN(roleId)) {
      return res.status(400).json({ error: 'Invalid role ID' })
    }

    const users = await UserService.getUsersByRole(roleId)
    res.json(users)
  } catch (error) {
    console.error('Error fetching users by role:', error)
    res.status(500).json({ error: 'Failed to fetch users by role' })
  }
})

// GET /api/users/station/:stationId - Get users by station
router.get('/station/:stationId', async (req, res) => {
  try {
    const stationId = parseInt(req.params.stationId)
    if (isNaN(stationId)) {
      return res.status(400).json({ error: 'Invalid station ID' })
    }

    const users = await UserService.getUsersByStation(stationId)
    res.json(users)
  } catch (error) {
    console.error('Error fetching users by station:', error)
    res.status(500).json({ error: 'Failed to fetch users by station' })
  }
})

// GET /api/users/roles/all - Get all roles
router.get('/roles/all', async (_req, res) => {
  try {
    const roles = await UserService.getAllRoles()
    res.json(roles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    res.status(500).json({ error: 'Failed to fetch roles' })
  }
})

// GET /api/users/stations/all - Get all stations
router.get('/stations/all', async (_req, res) => {
  try {
    const stations = await UserService.getAllStations()
    res.json(stations)
  } catch (error) {
    console.error('Error fetching stations:', error)
    res.status(500).json({ error: 'Failed to fetch stations' })
  }
})

// PUT /api/users/:id/status - Update user status
router.put('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' })
    }

    const { is_active } = req.body
    if (typeof is_active !== 'boolean') {
      return res.status(400).json({ error: 'is_active must be a boolean' })
    }

    const user = await UserService.updateUserStatus(id, is_active)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ success: true, message: `User ${is_active ? 'activated' : 'deactivated'} successfully` })
  } catch (error) {
    console.error('Error updating user status:', error)
    res.status(500).json({ error: 'Failed to update user status' })
  }
})

// POST /api/users/stations - Create new station
router.post('/stations', async (req, res) => {
  try {
    const { name, code, address, is_active = true } = req.body
    
    if (!name || !code) {
      return res.status(400).json({ error: 'Station name and code are required' })
    }

    const station = await UserService.createStation({
      name,
      code,
      address: address || null,
      is_active
    })
    
    res.status(201).json({ success: true, station })
  } catch (error) {
    console.error('Error creating station:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      if (error.message.includes('name')) {
        return res.status(409).json({ error: 'Station name already exists' })
      }
      if (error.message.includes('code')) {
        return res.status(409).json({ error: 'Station code already exists' })
      }
    }
    
    res.status(500).json({ error: 'Failed to create station' })
  }
})

// POST /api/users/roles - Create new role
router.post('/roles', async (req, res) => {
  try {
    const { name, description, permissions = {} } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Role name is required' })
    }

    const role = await UserService.createRole({
      name,
      description: description || null,
      permissions
    })
    
    res.status(201).json({ success: true, role })
  } catch (error) {
    console.error('Error creating role:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return res.status(409).json({ error: 'Role name already exists' })
    }
    
    res.status(500).json({ error: 'Failed to create role' })
  }
})

// GET /api/users/platoons/all - Get all platoons
router.get('/platoons/all', async (_req, res) => {
  try {
    const platoons = await UserService.getAllPlatoons()
    res.json(platoons)
  } catch (error) {
    console.error('Error fetching platoons:', error)
    res.status(500).json({ error: 'Failed to fetch platoons' })
  }
})

// POST /api/users/platoons - Create new platoon
router.post('/platoons', async (req, res) => {
  try {
    const { name, code, description, shift_pattern, is_active = true } = req.body
    
    if (!name || !code || !shift_pattern) {
      return res.status(400).json({ error: 'Platoon name, code, and shift pattern are required' })
    }

    const platoon = await UserService.createPlatoon({
      name,
      code,
      description: description || null,
      shift_pattern,
      is_active
    })
    
    res.status(201).json({ success: true, platoon })
  } catch (error) {
    console.error('Error creating platoon:', error)
    
    // Handle unique constraint violations
    if (error instanceof Error && error.message.includes('unique constraint')) {
      if (error.message.includes('name')) {
        return res.status(409).json({ error: 'Platoon name already exists' })
      }
      if (error.message.includes('code')) {
        return res.status(409).json({ error: 'Platoon code already exists' })
      }
    }
    
    res.status(500).json({ error: 'Failed to create platoon' })
  }
})

// PUT /api/users/platoons/:id - Update platoon
router.put('/platoons/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid platoon ID' })
    }

    const { name, code, description, shift_pattern, is_active } = req.body
    
    const platoon = await UserService.updatePlatoon(id, {
      name,
      code,
      description,
      shift_pattern,
      is_active
    })
    
    if (!platoon) {
      return res.status(404).json({ error: 'Platoon not found' })
    }
    
    res.json({ success: true, platoon })
  } catch (error) {
    console.error('Error updating platoon:', error)
    res.status(500).json({ error: 'Failed to update platoon' })
  }
})

// PUT /api/users/roles/:id - Update role
router.put('/roles/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid role ID' })
    }

    const { name, description, permissions } = req.body
    
    const role = await UserService.updateRole(id, {
      name,
      description,
      permissions
    })
    
    if (!role) {
      return res.status(404).json({ error: 'Role not found' })
    }
    
    res.json({ success: true, role })
  } catch (error) {
    console.error('Error updating role:', error)
    res.status(500).json({ error: 'Failed to update role' })
  }
})

// DELETE /api/users/roles/:id - Delete role
router.delete('/roles/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid role ID' })
    }

    const success = await UserService.deleteRole(id)
    if (!success) {
      return res.status(404).json({ error: 'Role not found' })
    }
    
    res.json({ success: true, message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    res.status(500).json({ error: 'Failed to delete role' })
  }
})

export default router
import { Router } from 'express'
import { z } from 'zod'
import { AbsenceService } from '../services/absenceService.js'

const router = Router()

// Validation schemas
const createAbsenceSchema = z.object({
  employee_id: z.number(),
  absence_type_id: z.number(),
  start_date: z.string().transform(str => {
    const date = new Date(str)
    return isNaN(date.getTime()) ? new Date() : date
  }),
  expected_end_date: z.string().optional().transform(str => {
    if (!str) return undefined
    const date = new Date(str)
    return isNaN(date.getTime()) ? undefined : date
  }),
  reason_category: z.enum(['Illness', 'Injury', 'Family', 'Mental Health', 'Other']),
  severity_level: z.enum(['Minor', 'Moderate', 'Severe', 'Critical']),
  status: z.enum(['Reported', 'Under Review', 'Active', 'Follow-up Required', 'Resolved', 'Closed']).default('Reported'),
  reporting_officer_id: z.number(),
  assigned_manager_id: z.number().optional(),
  management_level: z.enum(['Monitor Only', 'Light Management', 'Active Management', 'Intensive Management']),
  is_self_reported: z.boolean().default(false)
})

const updateAbsenceSchema = z.object({
  expected_end_date: z.string().optional().transform(str => {
    if (!str) return undefined
    const date = new Date(str)
    return isNaN(date.getTime()) ? undefined : date
  }),
  actual_end_date: z.string().optional().transform(str => {
    if (!str) return undefined
    const date = new Date(str)
    return isNaN(date.getTime()) ? undefined : date
  }),
  status: z.enum(['Reported', 'Under Review', 'Active', 'Follow-up Required', 'Resolved', 'Closed']).optional(),
  assigned_manager_id: z.number().optional(),
  management_level: z.enum(['Monitor Only', 'Light Management', 'Active Management', 'Intensive Management']).optional()
})

// GET /api/absences - Get all absences with optional filtering
router.get('/', async (req, res) => {
  try {
    const { 
      employee_id, 
      manager_id, 
      status, 
      reason_category, 
      start_date, 
      end_date 
    } = req.query

    const filters = {
      employeeId: employee_id ? parseInt(employee_id as string) : undefined,
      managerId: manager_id ? parseInt(manager_id as string) : undefined,
      status: status as string | undefined,
      reasonCategory: reason_category as string | undefined,
      startDate: start_date ? new Date(start_date as string) : undefined,
      endDate: end_date ? new Date(end_date as string) : undefined
    }

    const absences = await AbsenceService.searchAbsences(filters)
    res.json(absences)
  } catch (error) {
    console.error('Error fetching absences:', error)
    res.status(500).json({ error: 'Failed to fetch absences' })
  }
})

// GET /api/absences/active - Get active absences
router.get('/active', async (_req, res) => {
  try {
    const absences = await AbsenceService.getActiveAbsences()
    res.json(absences)
  } catch (error) {
    console.error('Error fetching active absences:', error)
    res.status(500).json({ error: 'Failed to fetch active absences' })
  }
})

// GET /api/absences/statistics - Get absence statistics
router.get('/statistics', async (_req, res) => {
  try {
    const statistics = await AbsenceService.getAbsenceStatistics()
    res.json(statistics)
  } catch (error) {
    console.error('Error fetching absence statistics:', error)
    res.status(500).json({ error: 'Failed to fetch absence statistics' })
  }
})

// GET /api/absences/:id - Get absence by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid absence ID' })
    }

    const absence = await AbsenceService.getAbsenceWithDetails(id)
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' })
    }

    res.json(absence)
  } catch (error) {
    console.error('Error fetching absence:', error)
    res.status(500).json({ error: 'Failed to fetch absence' })
  }
})

// POST /api/absences - Create new absence
router.post('/', async (req, res) => {
  try {
    const validationResult = createAbsenceSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const absenceData = validationResult.data
    const absence = await AbsenceService.createAbsence(absenceData)
    
    res.status(201).json(absence)
  } catch (error) {
    console.error('Error creating absence:', error)
    res.status(500).json({ error: 'Failed to create absence' })
  }
})

// PUT /api/absences/:id - Update absence
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid absence ID' })
    }

    const validationResult = updateAbsenceSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const absence = await AbsenceService.updateAbsence(id, validationResult.data)
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' })
    }

    res.json(absence)
  } catch (error) {
    console.error('Error updating absence:', error)
    res.status(500).json({ error: 'Failed to update absence' })
  }
})

// PATCH /api/absences/:id/status - Update absence status
router.patch('/:id/status', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid absence ID' })
    }

    const { status } = req.body
    if (!status) {
      return res.status(400).json({ error: 'Status is required' })
    }

    const absence = await AbsenceService.updateAbsenceStatus(id, status)
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' })
    }

    res.json(absence)
  } catch (error) {
    console.error('Error updating absence status:', error)
    res.status(500).json({ error: 'Failed to update absence status' })
  }
})

// PATCH /api/absences/:id/manager - Assign manager to absence
router.patch('/:id/manager', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid absence ID' })
    }

    const { manager_id } = req.body
    if (!manager_id) {
      return res.status(400).json({ error: 'Manager ID is required' })
    }

    const absence = await AbsenceService.assignManager(id, manager_id)
    if (!absence) {
      return res.status(404).json({ error: 'Absence not found' })
    }

    res.json(absence)
  } catch (error) {
    console.error('Error assigning manager:', error)
    res.status(500).json({ error: 'Failed to assign manager' })
  }
})

// GET /api/absences/employee/:employeeId - Get absences by employee
router.get('/employee/:employeeId', async (req, res) => {
  try {
    const employeeId = parseInt(req.params.employeeId)
    if (isNaN(employeeId)) {
      return res.status(400).json({ error: 'Invalid employee ID' })
    }

    const absences = await AbsenceService.getAbsencesByEmployee(employeeId)
    res.json(absences)
  } catch (error) {
    console.error('Error fetching employee absences:', error)
    res.status(500).json({ error: 'Failed to fetch employee absences' })
  }
})

// GET /api/absences/manager/:managerId - Get absences by manager
router.get('/manager/:managerId', async (req, res) => {
  try {
    const managerId = parseInt(req.params.managerId)
    if (isNaN(managerId)) {
      return res.status(400).json({ error: 'Invalid manager ID' })
    }

    const absences = await AbsenceService.getAbsencesByManager(managerId)
    res.json(absences)
  } catch (error) {
    console.error('Error fetching manager absences:', error)
    res.status(500).json({ error: 'Failed to fetch manager absences' })
  }
})

export default router
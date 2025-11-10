import express from 'express'
import { authService, LoginCredentials, RegisterData, ChangePasswordData } from '../services/authService.js'

const router = express.Router()

/**
 * @route POST /api/auth/login
 * @description Authenticate user with email and password
 * @access Public
 */
router.post('/login', async (req, res) => {
  try {
    const credentials: LoginCredentials = req.body

    // Validate required fields
    if (!credentials.email || !credentials.password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    const result = await authService.login(credentials)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(401).json(result)
    }
  } catch (error) {
    console.error('Login route error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public (should be restricted in production)
 */
router.post('/register', async (req, res) => {
  try {
    const userData: RegisterData = req.body

    // Validate required fields
    if (!userData.employee_id || !userData.first_name || !userData.last_name || 
        !userData.email || !userData.password || !userData.role_id) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID, first name, last name, email, password, and role ID are required'
      })
    }

    const result = await authService.register(userData)
    
    if (result.success) {
      res.status(201).json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Register route error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * @route POST /api/auth/verify
 * @description Verify JWT token
 * @access Public
 */
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body

    if (!token) {
      return res.status(400).json({
        valid: false,
        message: 'Token is required'
      })
    }

    const result = await authService.verifyToken(token)
    res.json(result)
  } catch (error) {
    console.error('Verify token route error:', error)
    res.status(500).json({
      valid: false,
      message: 'Internal server error'
    })
  }
})

/**
 * @route POST /api/auth/change-password
 * @description Change user password
 * @access Private
 */
router.post('/change-password', async (req, res) => {
  try {
    const data: ChangePasswordData = req.body

    // Validate required fields
    if (!data.userId || !data.currentPassword || !data.newPassword) {
      return res.status(400).json({
        success: false,
        message: 'User ID, current password, and new password are required'
      })
    }

    const result = await authService.changePassword(data)
    
    if (result.success) {
      res.json(result)
    } else {
      res.status(400).json(result)
    }
  } catch (error) {
    console.error('Change password route error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

/**
 * @route GET /api/auth/me
 * @description Get current user info from token
 * @access Private
 */
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authorization token required'
      })
    }

    const token = authHeader.substring(7)
    const result = await authService.verifyToken(token)
    
    if (result.valid && result.payload) {
      res.json({
        success: true,
        user: result.payload.user
      })
    } else {
      res.status(401).json({
        success: false,
        message: result.message || 'Invalid token'
      })
    }
  } catch (error) {
    console.error('Get me route error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    })
  }
})

export default router
import { Router } from 'express'
import { QuestionService } from '../services/questionService.js'

const router = Router()
const questionService = new QuestionService()

/**
 * Get questions for a specific absence scenario
 */
router.get('/scenario/:absenceType/:reasonCategory', async (req, res) => {
  try {
    const { absenceType, reasonCategory } = req.params
    
    const questions = await questionService.getQuestionsForAbsence(absenceType, reasonCategory)
    
    res.json({
      success: true,
      data: questions
    })
  } catch (error) {
    console.error('Error getting questions for scenario:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get questions for scenario'
    })
  }
})

/**
 * Get dependent questions based on parent question answer
 */
router.get('/dependent/:parentQuestionId/:answer', async (req, res) => {
  try {
    const { parentQuestionId, answer } = req.params
    
    const dependentQuestions = await questionService.getDependentQuestions(
      parseInt(parentQuestionId),
      answer
    )
    
    res.json({
      success: true,
      data: dependentQuestions
    })
  } catch (error) {
    console.error('Error getting dependent questions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get dependent questions'
    })
  }
})

/**
 * Save answers for an absence
 */
router.post('/:absenceId/answers', async (req, res) => {
  try {
    const { absenceId } = req.params
    const { answers, answered_by_id } = req.body
    
    if (!answers || !Array.isArray(answers) || !answered_by_id) {
      return res.status(400).json({
        success: false,
        error: 'Answers array and answered_by_id are required'
      })
    }
    
    const savedAnswers = await questionService.saveAbsenceAnswers(
      parseInt(absenceId),
      answers.map((answer: any) => ({
        ...answer,
        answered_by_id: parseInt(answered_by_id)
      }))
    )
    
    // Analyze risk after saving answers
    const riskAssessment = await questionService.analyzeAnswersForRisk(parseInt(absenceId))
    
    res.json({
      success: true,
      data: {
        savedAnswers,
        riskAssessment
      }
    })
  } catch (error) {
    console.error('Error saving answers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to save answers'
    })
  }
})

/**
 * Get answers for an absence
 */
router.get('/:absenceId/answers', async (req, res) => {
  try {
    const { absenceId } = req.params
    
    const answers = await questionService.getAbsenceAnswers(parseInt(absenceId))
    
    res.json({
      success: true,
      data: answers
    })
  } catch (error) {
    console.error('Error getting answers:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get answers'
    })
  }
})

/**
 * Get follow-up questions for an absence
 */
router.get('/:absenceId/follow-up', async (req, res) => {
  try {
    const { absenceId } = req.params
    
    const followUpQuestions = await questionService.getFollowUpQuestions(parseInt(absenceId))
    
    res.json({
      success: true,
      data: followUpQuestions
    })
  } catch (error) {
    console.error('Error getting follow-up questions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get follow-up questions'
    })
  }
})

/**
 * Get risk assessment for an absence
 */
router.get('/:absenceId/risk-assessment', async (req, res) => {
  try {
    const { absenceId } = req.params
    
    const riskAssessment = await questionService.analyzeAnswersForRisk(parseInt(absenceId))
    
    res.json({
      success: true,
      data: riskAssessment
    })
  } catch (error) {
    console.error('Error getting risk assessment:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get risk assessment'
    })
  }
})

/**
 * Get return-to-work questions
 */
router.get('/return-to-work', async (_req, res) => {
  try {
    const questions = await questionService.getReturnToWorkQuestions()
    
    res.json({
      success: true,
      data: questions
    })
  } catch (error) {
    console.error('Error getting return-to-work questions:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get return-to-work questions'
    })
  }
})

/**
 * Get question flow for a specific absence type
 */
router.get('/flow/:absenceType/:reasonCategory', async (req, res) => {
  try {
    const { absenceType, reasonCategory } = req.params
    
    const flow = await questionService.getQuestionFlow(absenceType, reasonCategory)
    
    res.json({
      success: true,
      data: flow
    })
  } catch (error) {
    console.error('Error getting question flow:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get question flow'
    })
  }
})

/**
 * Check if absence requires mental health follow-up
 */
router.get('/:absenceId/mental-health-check', async (req, res) => {
  try {
    const { absenceId } = req.params
    
    const requiresFollowUp = await questionService.requiresMentalHealthFollowUp(parseInt(absenceId))
    
    res.json({
      success: true,
      data: { requiresMentalHealthFollowUp: requiresFollowUp }
    })
  } catch (error) {
    console.error('Error checking mental health follow-up:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to check mental health follow-up'
    })
  }
})

export default router
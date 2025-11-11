import { db } from '../database/db.js'

export class QuestionService {
  /**
   * Get all question templates for a specific category
   */
  async getQuestionsByCategory(category: 'Initial' | 'Follow-up' | 'Medical' | 'Mental Health' | 'Return-to-Work') {
    return await db
      .selectFrom('question_templates')
      .selectAll()
      .where('category', '=', category)
      .where('depends_on_question_id', 'is', null) // Only get root questions initially
      .orderBy('id')
      .execute()
  }

  /**
   * Get dependent questions based on parent question answer
   */
  async getDependentQuestions(parentQuestionId: number, answer: string) {
    return await db
      .selectFrom('question_templates')
      .selectAll()
      .where('depends_on_question_id', '=', parentQuestionId)
      .where('depends_on_answer', 'like', `%${answer}%`)
      .execute()
  }

  /**
   * Get all questions for an absence scenario
   */
  async getQuestionsForAbsence(absenceType: string, reasonCategory: string) {
    // Get initial questions based on absence type and reason
    const initialQuestions = await this.getQuestionsByCategory('Initial')
    
    // Filter questions based on absence scenario
    const filteredQuestions = initialQuestions.filter(question => {
      // Logic to determine which questions are relevant for this absence scenario
      if (reasonCategory === 'Mental Health') {
        return question.category === 'Initial' || question.category === 'Mental Health'
      } else if (reasonCategory === 'Injury') {
        return question.category === 'Initial' || question.category === 'Medical'
      } else if (absenceType === 'Extended' && reasonCategory === 'Medical') {
        // Extended medical absences get additional medical questions
        return question.category === 'Initial' || question.category === 'Medical'
      } else {
        return question.category === 'Initial'
      }
    })

    return filteredQuestions
  }

  /**
   * Save answers for an absence
   */
  async saveAbsenceAnswers(absenceId: number, answers: Array<{
    question_template_id: number
    answer: string
    answered_by_id: number
  }>) {
    const results = []
    
    for (const answer of answers) {
      const result = await db
        .insertInto('absence_questions')
        .values({
          absence_id: absenceId,
          question_template_id: answer.question_template_id,
          answer: answer.answer,
          answered_by_id: answer.answered_by_id
        })
        .returningAll()
        .executeTakeFirst()
      
      results.push(result)
    }

    return results
  }

  /**
   * Get answers for an absence
   */
  async getAbsenceAnswers(absenceId: number) {
    return await db
      .selectFrom('absence_questions')
      .innerJoin('question_templates', 'absence_questions.question_template_id', 'question_templates.id')
      .innerJoin('users', 'absence_questions.answered_by_id', 'users.id')
      .select([
        'absence_questions.id',
        'absence_questions.answer',
        'absence_questions.answered_at',
        'question_templates.question_text',
        'question_templates.question_type',
        'question_templates.category',
        'users.first_name',
        'users.last_name'
      ])
      .where('absence_questions.absence_id', '=', absenceId)
      .orderBy('absence_questions.answered_at')
      .execute()
  }

  /**
   * Get follow-up questions based on current answers
   */
  async getFollowUpQuestions(absenceId: number) {
    const currentAnswers = await this.getAbsenceAnswers(absenceId)
    const followUpQuestions = []

    for (const answer of currentAnswers) {
      // We need to get the question template ID from the database
      const questionTemplate = await db
        .selectFrom('question_templates')
        .select('id')
        .where('question_text', '=', answer.question_text)
        .executeTakeFirst()
      
      if (questionTemplate) {
        const dependentQuestions = await this.getDependentQuestions(
          questionTemplate.id,
          answer.answer
        )
        followUpQuestions.push(...dependentQuestions)
      }
    }

    return followUpQuestions
  }

  /**
   * Analyze answers for risk assessment
   */
  async analyzeAnswersForRisk(absenceId: number) {
    const answers = await this.getAbsenceAnswers(absenceId)
    const riskLevels = ['Low', 'Moderate', 'High', 'Critical']
    let currentRiskIndex = 0 // Start with Low
    const flags: string[] = []

    for (const answer of answers) {
      // Mental health risk assessment
      if (answer.question_text.includes('self-harm') && answer.answer === 'true') {
        currentRiskIndex = Math.max(currentRiskIndex, 3) // Critical
        flags.push('Self-harm risk identified')
      }

      if (answer.question_text.includes('stress level') && ['High', 'Very High'].includes(answer.answer)) {
        currentRiskIndex = Math.max(currentRiskIndex, 2) // High
        flags.push('High stress level reported')
      }

      // Medical risk assessment
      if (answer.question_text.includes('respiratory symptoms') && answer.answer !== 'None') {
        currentRiskIndex = Math.max(currentRiskIndex, 1) // Moderate
        flags.push('Respiratory symptoms present')
      }

      if (answer.question_text.includes('mobility') && answer.answer === 'true') {
        currentRiskIndex = Math.max(currentRiskIndex, 1) // Moderate
        flags.push('Mobility affected by injury')
      }

      // Follow-up assessment
      if (answer.question_text.includes('feeling today') && ['Slightly Worse', 'Much Worse'].includes(answer.answer)) {
        currentRiskIndex = Math.max(currentRiskIndex, 2) // High
        flags.push('Condition worsening')
      }
    }

    const riskLevel = riskLevels[currentRiskIndex] || 'Low'

    return {
      riskLevel,
      flags,
      requiresImmediateAttention: riskLevel === 'Critical',
      recommendedActions: this.getRecommendedActions(riskLevel, flags)
    }
  }

  /**
   * Get recommended actions based on risk assessment
   */
  private getRecommendedActions(riskLevel: string, flags: string[]) {
    const actions = []

    if (riskLevel === 'Critical') {
      actions.push('Immediate supervisor contact required')
      actions.push('Emergency support services referral')
      actions.push('Safety plan development')
    }

    if (riskLevel === 'High') {
      actions.push('Manager follow-up within 24 hours')
      actions.push('EAP referral recommended')
      actions.push('Wellness check scheduled')
    }

    if (riskLevel === 'Moderate') {
      actions.push('Regular follow-up calls')
      actions.push('Peer support connection')
      actions.push('Monitor for changes')
    }

    if (flags.includes('Respiratory symptoms present')) {
      actions.push('Medical assessment recommended')
      actions.push('Consider communicable disease protocols')
    }

    if (flags.includes('Mobility affected by injury')) {
      actions.push('Occupational health assessment')
      actions.push('Modified duty consideration')
    }

    return actions
  }

  /**
   * Get questions for return-to-work assessment
   */
  async getReturnToWorkQuestions() {
    return await this.getQuestionsByCategory('Return-to-Work')
  }

  /**
   * Check if absence requires mental health follow-up
   */
  async requiresMentalHealthFollowUp(absenceId: number): Promise<boolean> {
    const answers = await this.getAbsenceAnswers(absenceId)
    
    for (const answer of answers) {
      if (answer.question_text.includes('Mental Health') || 
          answer.question_text.includes('stress') ||
          answer.question_text.includes('self-harm')) {
        return true
      }
    }
    
    return false
  }

  /**
   * Get question flow for a specific absence type
   */
  async getQuestionFlow(absenceType: string, reasonCategory: string) {
    const baseQuestions = await this.getQuestionsForAbsence(absenceType, reasonCategory)
    const flow = []

    for (const question of baseQuestions) {
      const questionNode = {
        ...question,
        dependentQuestions: [] as any[]
      }

      // Get potential dependent questions (we'll populate these when answers are provided)
      if (question.question_type === 'select' || question.question_type === 'boolean') {
        const options = question.options || []
        for (const option of options) {
          const dependents = await this.getDependentQuestions(question.id as number, option)
          if (dependents.length > 0) {
            questionNode.dependentQuestions.push({
              triggerAnswer: option,
              questions: dependents
            })
          }
        }
      }

      flow.push(questionNode)
    }

    return flow
  }
}
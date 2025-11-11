import React, { useState, useEffect } from 'react'
import {
  Card,
  Input,
  Select,
  Textarea,
  RadioGroup,
  Radio,
  Checkbox,
  Button,
  Spinner,
  MessageBar,
  MessageBarBody,
  Field,
  Divider
} from '@fluentui/react-components'

interface Question {
  id: number
  question_text: string
  question_type: 'text' | 'select' | 'multi-select' | 'boolean'
  options: any
  depends_on_question_id: number | null
  depends_on_answer: string | null
  is_required: boolean
  category: string
}

interface QuestionAnswer {
  question_template_id: number
  answer: string
  question_text: string
  question_type: string
}

interface QuestionFlowProps {
  absenceType: string
  reasonCategory: string
  currentUserId: number
  onAnswersChange: (answers: QuestionAnswer[]) => void
}

const QuestionFlow: React.FC<QuestionFlowProps> = ({
  absenceType,
  reasonCategory,
  currentUserId,
  onAnswersChange
}) => {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [visibleQuestions, setVisibleQuestions] = useState<Question[]>([])

  // Fetch questions when absence type or reason category changes
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!absenceType || !reasonCategory) return

      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch(`/api/questions/scenario/${absenceType}/${reasonCategory}`)
        if (!response.ok) {
          throw new Error('Failed to fetch questions')
        }
        
        const data = await response.json()
        if (data.success) {
          setQuestions(data.data)
          setVisibleQuestions(data.data.filter((q: Question) => !q.depends_on_question_id))
        } else {
          throw new Error(data.error || 'Failed to fetch questions')
        }
      } catch (err) {
        console.error('Error fetching questions:', err)
        setError(err instanceof Error ? err.message : 'Failed to load questions')
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [absenceType, reasonCategory])

  // Update visible questions based on answers
  useEffect(() => {
    const updateVisibleQuestions = async () => {
      const newVisibleQuestions = [...questions.filter(q => !q.depends_on_question_id)]
      
      // Add dependent questions based on answers
      for (const question of questions) {
        if (question.depends_on_question_id && answers[question.depends_on_question_id]) {
          const parentAnswer = answers[question.depends_on_question_id]
          const parentQuestion = questions.find(q => q.id === question.depends_on_question_id)
          
          if (parentQuestion && question.depends_on_answer) {
            const triggerAnswers = question.depends_on_answer.split(',')
            if (triggerAnswers.includes(parentAnswer)) {
              newVisibleQuestions.push(question)
            }
          }
        }
      }
      
      setVisibleQuestions(newVisibleQuestions)
    }

    updateVisibleQuestions()
  }, [answers, questions])

  // Notify parent component when answers change
  useEffect(() => {
    const questionAnswers: QuestionAnswer[] = Object.entries(answers).map(([questionId, answer]) => {
      const question = questions.find(q => q.id === parseInt(questionId))
      return {
        question_template_id: parseInt(questionId),
        answer,
        question_text: question?.question_text || '',
        question_type: question?.question_type || 'text'
      }
    })
    
    onAnswersChange(questionAnswers)
  }, [answers, questions, onAnswersChange])

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleMultiSelectChange = (questionId: number, option: string, checked: boolean) => {
    const currentAnswer = answers[questionId] || ''
    const currentOptions = currentAnswer ? currentAnswer.split(',') : []
    
    let newOptions: string[]
    if (checked) {
      newOptions = [...currentOptions, option]
    } else {
      newOptions = currentOptions.filter(opt => opt !== option)
    }
    
    handleAnswerChange(questionId, newOptions.join(','))
  }

  const renderQuestionInput = (question: Question) => {
    const currentAnswer = answers[question.id] || ''

    switch (question.question_type) {
      case 'text':
        return (
          <Textarea
            value={currentAnswer}
            onChange={(_, data) => handleAnswerChange(question.id, data.value)}
            placeholder="Enter your answer..."
            rows={3}
          />
        )
      
      case 'select':
        const selectOptions = question.options ? JSON.parse(question.options) : []
        return (
          <Select
            value={currentAnswer}
            onChange={(_, data) => handleAnswerChange(question.id, data.value)}
          >
            <option value="">Select an option...</option>
            {selectOptions.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        )
      
      case 'multi-select':
        const multiOptions = question.options ? JSON.parse(question.options) : []
        const selectedOptions = currentAnswer ? currentAnswer.split(',') : []
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {multiOptions.map((option: string) => (
              <Checkbox
                key={option}
                label={option}
                checked={selectedOptions.includes(option)}
                onChange={(_, data) => handleMultiSelectChange(question.id, option, !!data.checked)}
              />
            ))}
          </div>
        )
      
      case 'boolean':
        return (
          <RadioGroup
            value={currentAnswer}
            onChange={(_, data) => handleAnswerChange(question.id, data.value)}
          >
            <Radio value="true" label="Yes" />
            <Radio value="false" label="No" />
          </RadioGroup>
        )
      
      default:
        return (
          <Input
            value={currentAnswer}
            onChange={(_, data) => handleAnswerChange(question.id, data.value)}
            placeholder="Enter your answer..."
          />
        )
    }
  }

  if (loading) {
    return (
      <Card style={{ marginTop: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem' }}>
          <Spinner size="small" />
          <span>Loading questions...</span>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <MessageBar intent="error" style={{ marginTop: '1rem' }}>
        <MessageBarBody>{error}</MessageBarBody>
      </MessageBar>
    )
  }

  if (!absenceType || !reasonCategory) {
    return (
      <MessageBar style={{ marginTop: '1rem' }}>
        <MessageBarBody>
          Please select an absence type and reason category to see relevant questions.
        </MessageBarBody>
      </MessageBar>
    )
  }

  if (visibleQuestions.length === 0) {
    return (
      <MessageBar style={{ marginTop: '1rem' }}>
        <MessageBarBody>
          No additional questions required for this absence type and reason category.
        </MessageBarBody>
      </MessageBar>
    )
  }

  return (
    <Card style={{ marginTop: '1rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Additional Questions</h3>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Please answer the following questions to help us better understand the situation.
      </p>
      
      <Divider style={{ marginBottom: '1rem' }} />
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {visibleQuestions.map((question) => (
          <Field
            key={question.id}
            label={question.question_text}
            required={question.is_required}
          >
            {renderQuestionInput(question)}
          </Field>
        ))}
      </div>
    </Card>
  )
}

export default QuestionFlow
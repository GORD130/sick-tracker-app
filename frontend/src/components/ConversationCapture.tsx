import React, { useState } from 'react'
import {
  Card,
  Textarea,
  Button,
  Field,
  Divider
} from '@fluentui/react-components'

interface ConversationEntry {
  id: string
  question: string
  answer: string
  timestamp: Date
}

interface ConversationCaptureProps {
  onConversationChange: (conversation: ConversationEntry[]) => void
}

const ConversationCapture: React.FC<ConversationCaptureProps> = ({
  onConversationChange
}) => {
  const [conversation, setConversation] = useState<ConversationEntry[]>([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [currentAnswer, setCurrentAnswer] = useState('')

  const addConversationEntry = () => {
    if (!currentQuestion.trim() || !currentAnswer.trim()) return

    const newEntry: ConversationEntry = {
      id: Date.now().toString(),
      question: currentQuestion.trim(),
      answer: currentAnswer.trim(),
      timestamp: new Date()
    }

    const updatedConversation = [...conversation, newEntry]
    setConversation(updatedConversation)
    onConversationChange(updatedConversation)
    
    // Clear current inputs
    setCurrentQuestion('')
    setCurrentAnswer('')
  }

  const removeConversationEntry = (id: string) => {
    const updatedConversation = conversation.filter(entry => entry.id !== id)
    setConversation(updatedConversation)
    onConversationChange(updatedConversation)
  }

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Card style={{ marginTop: '1rem' }}>
      <h3 style={{ marginBottom: '1rem' }}>Conversation Details</h3>
      <p style={{ marginBottom: '1rem', color: '#666' }}>
        Record what was asked and said during the absence reporting conversation.
      </p>
      
      <Divider style={{ marginBottom: '1rem' }} />
      
      {/* Current conversation entry form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
        <Field label="What was asked?">
          <Textarea
            value={currentQuestion}
            onChange={(_, data) => setCurrentQuestion(data.value)}
            placeholder="Enter the question that was asked..."
            rows={2}
          />
        </Field>
        
        <Field label="What was said?">
          <Textarea
            value={currentAnswer}
            onChange={(_, data) => setCurrentAnswer(data.value)}
            placeholder="Enter the response that was given..."
            rows={3}
          />
        </Field>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            appearance="primary"
            onClick={addConversationEntry}
            disabled={!currentQuestion.trim() || !currentAnswer.trim()}
          >
            Add Conversation Entry
          </Button>
        </div>
      </div>

      {/* Display existing conversation entries */}
      {conversation.length > 0 && (
        <div>
          <h4 style={{ marginBottom: '1rem' }}>Recorded Conversation</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {conversation.map((entry) => (
              <Card key={entry.id} style={{ padding: '1rem', position: 'relative' }}>
                <Button
                  appearance="subtle"
                  style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}
                  onClick={() => removeConversationEntry(entry.id)}
                >
                  Remove
                </Button>
                
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Asked:</strong> {entry.question}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>Said:</strong> {entry.answer}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  Recorded at: {formatTimestamp(entry.timestamp)}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

export default ConversationCapture
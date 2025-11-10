import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Input,
  Select,
  Textarea,
  Spinner,
  MessageBar,
  MessageBarBody,
  Field,
  // Label,
  RadioGroup,
  Radio,
  Divider,
} from '@fluentui/react-components'

interface User {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  station_id?: number
}

interface AbsenceType {
  id: number
  name: string
  requires_note: boolean
}

interface SickCallFormData {
  employee_id: number
  absence_type_id: number
  start_date: string
  expected_end_date: string
  reason_category: 'Illness' | 'Injury' | 'Family' | 'Mental Health' | 'Other'
  severity_level: 'Minor' | 'Moderate' | 'Severe' | 'Critical'
  reporting_officer_id: number
  management_level: 'Monitor Only' | 'Light Management' | 'Active Management' | 'Intensive Management'
  notes?: string
}

const SickCallForm: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [absenceTypes, setAbsenceTypes] = useState<AbsenceType[]>([])
  const [currentUser, setCurrentUser] = useState<User | null>(null)

  const [formData, setFormData] = useState<SickCallFormData>({
    employee_id: 0,
    absence_type_id: 0,
    start_date: new Date().toISOString().split('T')[0],
    expected_end_date: '',
    reason_category: 'Illness',
    severity_level: 'Minor',
    reporting_officer_id: 0,
    management_level: 'Active Management',
    notes: ''
  })

  // Fetch users and absence types on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // In a real app, you'd fetch current user from auth context
        const mockCurrentUser: User = {
          id: 1,
          employee_id: 'MANAGER001',
          first_name: 'John',
          last_name: 'Manager',
          station_id: 1
        }
        setCurrentUser(mockCurrentUser)
        setFormData(prev => ({ ...prev, reporting_officer_id: mockCurrentUser.id }))

        // Fetch users
        const usersResponse = await fetch('/api/users/active')
        if (usersResponse.ok) {
          const usersData = await usersResponse.json()
          setUsers(usersData)
        }

        // Fetch absence types (mock data for now)
        const mockAbsenceTypes: AbsenceType[] = [
          { id: 1, name: 'Sick Leave', requires_note: false },
          { id: 2, name: 'Workplace Injury', requires_note: true },
          { id: 3, name: 'Medical Appointment', requires_note: false },
          { id: 4, name: 'Family Emergency', requires_note: false },
          { id: 5, name: 'Mental Health', requires_note: true },
        ]
        setAbsenceTypes(mockAbsenceTypes)

      } catch (err) {
        console.error('Error fetching initial data:', err)
        setError('Failed to load form data')
      }
    }

    fetchInitialData()
  }, [])

  const handleInputChange = (field: keyof SickCallFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const response = await fetch('/api/absences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          is_self_reported: false
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit sick call')
      }

      setSuccess(true)
      // Reset form
      setFormData({
        employee_id: 0,
        absence_type_id: 0,
        start_date: new Date().toISOString().split('T')[0],
        expected_end_date: '',
        reason_category: 'Illness',
        severity_level: 'Minor',
        reporting_officer_id: currentUser?.id || 0,
        management_level: 'Active Management',
        notes: ''
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getSelectedAbsenceType = () => {
    return absenceTypes.find(type => type.id === formData.absence_type_id)
  }

  return (
    <Card style={{ maxWidth: '600px', margin: '2rem auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem' }}>Report Sick Call</h2>

      {error && (
        <MessageBar intent="error" style={{ marginBottom: '1rem' }}>
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}

      {success && (
        <MessageBar intent="success" style={{ marginBottom: '1rem' }}>
          <MessageBarBody>Sick call reported successfully!</MessageBarBody>
        </MessageBar>
      )}

      <form onSubmit={handleSubmit}>
        <Field required label="Employee">
          <Select
            value={formData.employee_id}
            onChange={(_, data) => handleInputChange('employee_id', parseInt(data.value))}
          >
            <option value={0}>Select Employee</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.employee_id})
              </option>
            ))}
          </Select>
        </Field>

        <Field required label="Absence Type" style={{ marginTop: '1rem' }}>
          <Select
            value={formData.absence_type_id}
            onChange={(_, data) => handleInputChange('absence_type_id', parseInt(data.value))}
          >
            <option value={0}>Select Absence Type</option>
            {absenceTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </Select>
        </Field>

        {getSelectedAbsenceType()?.requires_note && (
          <MessageBar intent="warning" style={{ marginTop: '1rem' }}>
            <MessageBarBody>
              This absence type requires a doctor's note or medical certificate.
            </MessageBarBody>
          </MessageBar>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
          <Field required label="Start Date">
            <Input
              type="date"
              value={formData.start_date}
              onChange={(_, data) => handleInputChange('start_date', data.value)}
            />
          </Field>

          <Field label="Expected Return Date">
            <Input
              type="date"
              value={formData.expected_end_date}
              onChange={(_, data) => handleInputChange('expected_end_date', data.value)}
            />
          </Field>
        </div>

        <Field required label="Reason Category" style={{ marginTop: '1rem' }}>
          <Select
            value={formData.reason_category}
            onChange={(_, data) => handleInputChange('reason_category', data.value)}
          >
            <option value="Illness">Illness</option>
            <option value="Injury">Injury</option>
            <option value="Family">Family Emergency</option>
            <option value="Mental Health">Mental Health</option>
            <option value="Other">Other</option>
          </Select>
        </Field>

        <Field required label="Severity Level" style={{ marginTop: '1rem' }}>
          <RadioGroup
            value={formData.severity_level}
            onChange={(_, data) => handleInputChange('severity_level', data.value)}
          >
            <Radio value="Minor" label="Minor" />
            <Radio value="Moderate" label="Moderate" />
            <Radio value="Severe" label="Severe" />
            <Radio value="Critical" label="Critical" />
          </RadioGroup>
        </Field>

        <Field required label="Management Level" style={{ marginTop: '1rem' }}>
          <RadioGroup
            value={formData.management_level}
            onChange={(_, data) => handleInputChange('management_level', data.value)}
          >
            <Radio value="Monitor Only" label="Monitor Only" />
            <Radio value="Light Management" label="Light Management" />
            <Radio value="Active Management" label="Active Management" />
            <Radio value="Intensive Management" label="Intensive Management" />
          </RadioGroup>
        </Field>

        <Field label="Additional Notes" style={{ marginTop: '1rem' }}>
          <Textarea
            value={formData.notes}
            onChange={(_, data) => handleInputChange('notes', data.value)}
            placeholder="Any additional information about the absence..."
            rows={3}
          />
        </Field>

        <Divider style={{ margin: '1.5rem 0' }} />

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <Button appearance="secondary" type="button">
            Cancel
          </Button>
          <Button 
            appearance="primary" 
            type="submit" 
            disabled={loading || !formData.employee_id || !formData.absence_type_id}
          >
            {loading ? <Spinner size="tiny" /> : 'Submit Sick Call'}
          </Button>
        </div>
      </form>
    </Card>
  )
}

export default SickCallForm
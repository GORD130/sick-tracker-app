import React, { useState, useEffect } from 'react'
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  Input,
  Select,
  Option,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Field,
  Spinner,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Switch
} from '@fluentui/react-components'

interface User {
  id: number
  employee_id: string
  first_name: string
  last_name: string
  email: string
  phone: string | null
  role_id: number
  station_id: number | null
  platoon: 'A' | 'B' | 'C' | 'Admin' | null
  shift_pattern: '24_48' | 'M_F' | null
  is_active: boolean
}

interface Role {
  id: number
  name: string
}

interface Station {
  id: number
  name: string
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false)
  const [newUser, setNewUser] = useState({
    employee_id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role_id: 0,
    station_id: null as number | null,
    platoon: null as 'A' | 'B' | 'C' | 'Admin' | null,
    shift_pattern: null as '24_48' | 'M_F' | null,
    password: ''
  })

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5001/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users/roles/all')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setRoles(data)
    } catch (err) {
      console.error('Failed to load roles:', err)
    }
  }

  const loadStations = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/users/stations/all')
      if (!response.ok) throw new Error('Failed to fetch stations')
      const data = await response.json()
      setStations(data)
    } catch (err) {
      console.error('Failed to load stations:', err)
    }
  }

  useEffect(() => {
    loadUsers()
    loadRoles()
    loadStations()
  }, [])

  const handleAddUser = async () => {
    try {
      setError(null)
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('User created successfully')
        setIsAddUserDialogOpen(false)
        setNewUser({
          employee_id: '',
          first_name: '',
          last_name: '',
          email: '',
          phone: '',
          role_id: 0,
          station_id: null,
          platoon: null,
          shift_pattern: null,
          password: ''
        })
        loadUsers()
      } else {
        setError(result.message || 'Failed to create user')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      setError(null)
      const response = await fetch(`http://localhost:5001/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (response.ok) {
        setSuccess(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`)
        loadUsers()
      } else {
        const error = await response.json()
        setError(error.message || 'Failed to update user status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status')
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>User Management</h1>
        <Button appearance="primary" onClick={() => setIsAddUserDialogOpen(true)}>
          Add New User
        </Button>
      </div>

      {error && (
        <MessageBar intent="error" style={{ marginBottom: '1rem' }}>
          <MessageBarBody>
            <MessageBarTitle>Error</MessageBarTitle>
            {error}
          </MessageBarBody>
        </MessageBar>
      )}

      {success && (
        <MessageBar intent="success" style={{ marginBottom: '1rem' }}>
          <MessageBarBody>
            <MessageBarTitle>Success</MessageBarTitle>
            {success}
          </MessageBarBody>
        </MessageBar>
      )}

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Spinner label="Loading users..." />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHeaderCell>Employee ID</TableHeaderCell>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Role</TableHeaderCell>
              <TableHeaderCell>Station</TableHeaderCell>
              <TableHeaderCell>Platoon</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{user.employee_id}</TableCell>
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {roles.find(role => role.id === user.role_id)?.name || 'Unknown'}
                </TableCell>
                <TableCell>
                  {stations.find(station => station.id === user.station_id)?.name || 'N/A'}
                </TableCell>
                <TableCell>{user.platoon || 'N/A'}</TableCell>
                <TableCell>
                  <Switch
                    checked={user.is_active}
                    onChange={() => handleToggleUserStatus(user.id, user.is_active)}
                  />
                  <span style={{ marginLeft: '0.5rem' }}>
                    {user.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add User Dialog */}
      <Dialog open={isAddUserDialogOpen} onOpenChange={(_, data) => {
        setIsAddUserDialogOpen(data.open)
        clearMessages()
      }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add New User</DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: '1fr 1fr' }}>
                <Field label="Employee ID" required>
                  <Input
                    value={newUser.employee_id}
                    onChange={(_, data) => setNewUser({ ...newUser, employee_id: data.value })}
                  />
                </Field>
                <Field label="Password" required>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(_, data) => setNewUser({ ...newUser, password: data.value })}
                  />
                </Field>
                <Field label="First Name" required>
                  <Input
                    value={newUser.first_name}
                    onChange={(_, data) => setNewUser({ ...newUser, first_name: data.value })}
                  />
                </Field>
                <Field label="Last Name" required>
                  <Input
                    value={newUser.last_name}
                    onChange={(_, data) => setNewUser({ ...newUser, last_name: data.value })}
                  />
                </Field>
                <Field label="Email" required>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(_, data) => setNewUser({ ...newUser, email: data.value })}
                  />
                </Field>
                <Field label="Phone">
                  <Input
                    value={newUser.phone}
                    onChange={(_, data) => setNewUser({ ...newUser, phone: data.value })}
                  />
                </Field>
                <Field label="Role" required>
                  <Select
                    value={newUser.role_id.toString()}
                    onChange={(_, data) => setNewUser({ ...newUser, role_id: parseInt(data.value || '0') })}
                  >
                    <Option value="0">Please select a role...</Option>
                    {roles.map((role) => (
                      <Option key={role.id} value={role.id.toString()}>
                        {role.name}
                      </Option>
                    ))}
                  </Select>
                </Field>
                <Field label="Station">
                  <Select
                    value={newUser.station_id?.toString() || ''}
                    onChange={(_, data) => setNewUser({ ...newUser, station_id: data.value ? parseInt(data.value) : null })}
                  >
                    <Option value="">Select Station</Option>
                    {stations.map((station) => (
                      <Option key={station.id} value={station.id.toString()}>
                        {station.name}
                      </Option>
                    ))}
                  </Select>
                </Field>
                <Field label="Platoon">
                  <Select
                    value={newUser.platoon || ''}
                    onChange={(_, data) => setNewUser({ ...newUser, platoon: data.value as any })}
                  >
                    <Option value="">Select Platoon</Option>
                    <Option value="A">A Platoon</Option>
                    <Option value="B">B Platoon</Option>
                    <Option value="C">C Platoon</Option>
                    <Option value="Admin">Admin</Option>
                  </Select>
                </Field>
                <Field label="Shift Pattern">
                  <Select
                    value={newUser.shift_pattern || ''}
                    onChange={(_, data) => setNewUser({ ...newUser, shift_pattern: data.value as any })}
                  >
                    <Option value="">Select Shift Pattern</Option>
                    <Option value="24_48">24/48</Option>
                    <Option value="M_F">Monday-Friday</Option>
                  </Select>
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={handleAddUser}
                disabled={!newUser.employee_id || !newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password || !newUser.role_id}
              >
                Create User
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}

export default UserManagement
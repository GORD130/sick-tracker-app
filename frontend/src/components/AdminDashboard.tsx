
import React, { useState, useEffect } from 'react'
import {
  Button,
  Card,
  Input,
  Select,
  Option,
  Table,
  TableHeader,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
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
  Switch,
  TabList,
  Tab,
  TabValue,
  Textarea
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
  permissions: any
  description: string | null
}

interface Station {
  id: number
  name: string
  code: string
  address: string | null
  is_active: boolean
}

const AdminDashboard: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<TabValue>('users')
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [stations, setStations] = useState<Station[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // User management states
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

  // Station management states
  const [isAddStationDialogOpen, setIsAddStationDialogOpen] = useState(false)
  const [newStation, setNewStation] = useState({
    name: '',
    code: '',
    address: '',
    is_active: true
  })

  // Role management states
  const [isAddRoleDialogOpen, setIsAddRoleDialogOpen] = useState(false)
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: {}
  })

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    }
  }

  const loadRoles = async () => {
    try {
      const response = await fetch(`/api/users/roles/all?t=${Date.now()}`)
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      console.log('Loaded roles:', data)
      setRoles(data)
    } catch (err) {
      console.error('Failed to load roles:', err)
    }
  }

  const loadStations = async () => {
    try {
      const response = await fetch(`/api/users/stations/all?t=${Date.now()}`)
      if (!response.ok) throw new Error('Failed to fetch stations')
      const data = await response.json()
      console.log('Loaded stations:', data)
      setStations(data)
    } catch (err) {
      console.error('Failed to load stations:', err)
    }
  }

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      console.log('Loading all data...')
      await Promise.all([loadUsers(), loadRoles(), loadStations()])
      console.log('Data loading complete')
      setLoading(false)
    }
    loadAllData()
  }, [])

  // Debug when add user dialog opens and reload data
  useEffect(() => {
    if (isAddUserDialogOpen) {
      console.log('Add User Dialog opened - Current state:')
      console.log('Roles:', roles)
      console.log('Stations:', stations)
      console.log('New User:', newUser)
      
      // Force reload data when dialog opens to ensure fresh data
      loadRoles()
      loadStations()
    }
  }, [isAddUserDialogOpen])

  const handleAddUser = async () => {
    try {
      setError(null)
      console.log('Creating user with data:', newUser)
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      const result = await response.json()
      console.log('User creation response:', result)

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
      console.error('Error creating user:', err)
      setError(err instanceof Error ? err.message : 'Failed to create user')
    }
  }

  const handleAddStation = async () => {
    try {
      setError(null)
      const response = await fetch('/api/users/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStation),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Station created successfully')
        setIsAddStationDialogOpen(false)
        setNewStation({
          name: '',
          code: '',
          address: '',
          is_active: true
        })
        loadStations()
      } else {
        setError(result.message || 'Failed to create station')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create station')
    }
  }

  const handleAddRole = async () => {
    try {
      setError(null)
      const response = await fetch('/api/users/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newRole),
      })

      const result = await response.json()

      if (result.success) {
        setSuccess('Role created successfully')
        setIsAddRoleDialogOpen(false)
        setNewRole({
          name: '',
          description: '',
          permissions: {}
        })
        loadRoles()
      } else {
        setError(result.message || 'Failed to create role')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create role')
    }
  }

  const handleToggleUserStatus = async (userId: number, currentStatus: boolean) => {
    try {
      setError(null)
      const response = await fetch(`/api/users/${userId}/status`, {
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

  const handleResetPassword = async (userId: number) => {
    try {
      setError(null)
      const newPassword = prompt('Enter new password for this user:')
      if (!newPassword) return

      const response = await fetch(`/api/users/${userId}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_password: newPassword }),
      })

      if (response.ok) {
        setSuccess('Password reset successfully')
      } else {
        const error = await response.json()
        setError(error.message || 'Failed to reset password')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password')
    }
  }

  const clearMessages = () => {
    setError(null)
    setSuccess(null)
  }

  const renderUsersTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>User Management</h3>
        <Button appearance="primary" onClick={() => setIsAddUserDialogOpen(true)}>
          Add New User
        </Button>
      </div>

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
              <TableHeaderCell>Actions</TableHeaderCell>
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
                <TableCell>
                  <Button 
                    size="small" 
                    appearance="secondary"
                    onClick={() => handleResetPassword(user.id)}
                  >
                    Reset Password
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )

  const renderStationsTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Station Management</h3>
        <Button appearance="primary" onClick={() => setIsAddStationDialogOpen(true)}>
          Add New Station
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Code</TableHeaderCell>
            <TableHeaderCell>Address</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stations.map((station) => (
            <TableRow key={station.id}>
              <TableCell>{station.name}</TableCell>
              <TableCell>{station.code}</TableCell>
              <TableCell>{station.address || 'N/A'}</TableCell>
              <TableCell>
                <Switch checked={station.is_active} />
                <span style={{ marginLeft: '0.5rem' }}>
                  {station.is_active ? 'Active' : 'Inactive'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  const renderRolesTab = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3>Role Management</h3>
        <Button appearance="primary" onClick={() => setIsAddRoleDialogOpen(true)}>
          Add New Role
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Description</TableHeaderCell>
            <TableHeaderCell>Permissions</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.description || 'N/A'}</TableCell>
              <TableCell>
                {Object.keys(role.permissions || {}).length > 0 ? 
                  Object.keys(role.permissions).join(', ') : 'No permissions'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: '2rem' }}>Administration Dashboard</h1>

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

      <TabList selectedValue={selectedTab} onTabSelect={(_, data) => setSelectedTab(data.value)}>
        <Tab value="users">Users</Tab>
        <Tab value="stations">Stations</Tab>
        <Tab value="roles">Roles</Tab>
        <Tab value="import">Data Import</Tab>
      </TabList>

      <div style={{ marginTop: '1rem' }}>
        {selectedTab === 'users' && renderUsersTab()}
        {selectedTab === 'stations' && renderStationsTab()}
        {selectedTab === 'roles' && renderRolesTab()}
        {selectedTab === 'import' && (
          <Card>
            <h3>Data Import</h3>
            <p>Import functionality coming soon...</p>
            <Textarea placeholder="Paste CSV data here..." rows={10} />
            <Button appearance="primary" style={{ marginTop: '1rem' }}>Import Data</Button>
          </Card>
        )}
      </div>

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
                  <select
                    value={newUser.role_id.toString()}
                    onChange={(e) => {
                      console.log('Role selected:', e.target.value, 'from options:', roles)
                      setNewUser({ ...newUser, role_id: parseInt(e.target.value || '0') })
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="0">Please select a role...</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id.toString()}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Station">
                  <select
                    value={newUser.station_id?.toString() || ''}
                    onChange={(e) => {
                      console.log('Station selected:', e.target.value, 'from options:', stations)
                      setNewUser({ ...newUser, station_id: e.target.value ? parseInt(e.target.value) : null })
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Station</option>
                    {stations.length > 0 ? (
                      stations.map((station) => (
                        <option key={station.id} value={station.id.toString()}>
                          {station.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading stations...</option>
                    )}
                  </select>
                </Field>
                <Field label="Platoon">
                  <select
                    value={newUser.platoon || ''}
                    onChange={(e) => {
                      console.log('Platoon selected:', e.target.value)
                      setNewUser({ ...newUser, platoon: e.target.value as any })
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Platoon</option>
                    <option value="A">A Platoon</option>
                    <option value="B">B Platoon</option>
                    <option value="C">C Platoon</option>
                    <option value="Admin">Admin</option>
                  </select>
                </Field>
                <Field label="Shift Pattern">
                  <select
                    value={newUser.shift_pattern || ''}
                    onChange={(e) => {
                      console.log('Shift pattern selected:', e.target.value)
                      setNewUser({ ...newUser, shift_pattern: e.target.value as any })
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select Shift Pattern</option>
                    <option value="24_48">24/48</option>
                    <option value="M_F">Monday-Friday</option>
                  </select>
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
                // Temporarily remove disabled for testing
                // disabled={!newUser.employee_id || !newUser.first_name || !newUser.last_name || !newUser.email || !newUser.password || !newUser.role_id}
              >
                Create User
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Station Dialog */}
      <Dialog open={isAddStationDialogOpen} onOpenChange={(_, data) => {
        setIsAddStationDialogOpen(data.open)
        clearMessages()
      }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add New Station</DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <Field label="Station Name" required>
                  <Input
                    value={newStation.name}
                    onChange={(_, data) => setNewStation({ ...newStation, name: data.value })}
                  />
                </Field>
                <Field label="Station Code" required>
                  <Input
                    value={newStation.code}
                    onChange={(_, data) => setNewStation({ ...newStation, code: data.value })}
                  />
                </Field>
                <Field label="Address">
                  <Input
                    value={newStation.address}
                    onChange={(_, data) => setNewStation({ ...newStation, address: data.value })}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={handleAddStation}
                disabled={!newStation.name || !newStation.code}
              >
                Create Station
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Role Dialog */}
      <Dialog open={isAddRoleDialogOpen} onOpenChange={(_, data) => {
        setIsAddRoleDialogOpen(data.open)
        clearMessages()
      }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add New Role</DialogTitle>
            <DialogContent>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <Field label="Role Name" required>
                  <Input
                    value={newRole.name}
                    onChange={(_, data) => setNewRole({ ...newRole, name: data.value })}
                  />
                </Field>
                <Field label="Description">
                  <Input
                    value={newRole.description}
                    onChange={(_, data) => setNewRole({ ...newRole, description: data.value })}
                  />
                </Field>
                <Field label="Permissions (JSON)">
                  <Textarea
                    value={JSON.stringify(newRole.permissions, null, 2)}
                    onChange={(_, data) => {
                      try {
                        const permissions = JSON.parse(data.value || '{}')
                        setNewRole({ ...newRole, permissions })
                      } catch (e) {
                        // Invalid JSON, keep current permissions
                      }
                    }}
                    rows={6}
                  />
                </Field>
              </div>
            </DialogContent>
            <DialogActions>
              <DialogTrigger disableButtonEnhancement>
                <Button appearance="secondary">Cancel</Button>
              </DialogTrigger>
              <Button
                appearance="primary"
                onClick={handleAddRole}
                disabled={!newRole.name}
              >
                Create Role
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  )
}

export default AdminDashboard

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
      const response = await fetch('/api/users/roles/all')
      if (!response.ok) throw new Error('Failed to fetch roles')
      const data = await response.json()
      setRoles(data)
    } catch (err) {
      console.error('Failed to load roles:', err)
    }
  }

  const loadStations = async () => {
    try {
      const response = await fetch('/api/users/stations/all')
      if (!response.ok) throw new Error('Failed to fetch stations')
      const data = await response.json()
      setStations(data)
    } catch (err) {
      console.error('Failed to load stations:', err)
    }
  }

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true)
      await Promise.all([loadUsers(), loadRoles(), loadStations()])
      setLoading(false)
    }
    loadAllData()
  }, [])

  const handleAddUser = async () => {
    try {
      setError(null)
      const response = await fetch('/api/auth/register', {
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
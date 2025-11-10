import { useState } from 'react'
import { FluentProvider, webLightTheme, Button } from '@fluentui/react-components'
import './App.css'
import SickCallForm from './components/SickCallForm'
import UserManagement from './components/UserManagement'

function App() {
  const [currentView, setCurrentView] = useState<'sick-call' | 'users'>('sick-call')

  return (
    <FluentProvider theme={webLightTheme}>
      <div className="App">
        <header style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ margin: 0, color: '#0078d4' }}>Fire Department Sick Leave Management</h1>
              <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
                Comprehensive absence tracking and management system
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                appearance={currentView === 'sick-call' ? 'primary' : 'secondary'}
                onClick={() => setCurrentView('sick-call')}
              >
                Sick Call Reporting
              </Button>
              <Button
                appearance={currentView === 'users' ? 'primary' : 'secondary'}
                onClick={() => setCurrentView('users')}
              >
                User Management
              </Button>
            </div>
          </div>
        </header>
        <main>
          {currentView === 'sick-call' && <SickCallForm />}
          {currentView === 'users' && <UserManagement />}
        </main>
      </div>
    </FluentProvider>
  )
}

export default App
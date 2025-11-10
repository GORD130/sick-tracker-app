// import React from 'react'
import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import './App.css'
import SickCallForm from './components/SickCallForm'

function App() {
  return (
    <FluentProvider theme={webLightTheme}>
      <div className="App">
        <header style={{ padding: '1rem', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
          <h1 style={{ margin: 0, color: '#0078d4' }}>Fire Department Sick Leave Management</h1>
          <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
            Comprehensive absence tracking and management system
          </p>
        </header>
        <main>
          <SickCallForm />
        </main>
      </div>
    </FluentProvider>
  )
}

export default App
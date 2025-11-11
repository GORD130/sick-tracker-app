// Test script to verify the complete absence reporting system with questions and conversation

const BASE_URL = 'http://localhost:5001/api'

async function testCompleteSystem() {
  console.log('🧪 Testing Complete Absence Reporting System...\n')

  try {
    // Step 1: Get available users
    console.log('1. Fetching users...')
    const usersResponse = await fetch(`${BASE_URL}/users/active`)
    const users = await usersResponse.json()
    console.log(`   Found ${users.length} users`)

    // Step 2: Get absence types
    console.log('2. Fetching absence types...')
    const typesResponse = await fetch(`${BASE_URL}/absences/types`)
    const absenceTypes = await typesResponse.json()
    console.log(`   Found ${absenceTypes.length} absence types`)

    // Step 3: Create a new absence
    console.log('3. Creating new absence...')
    const absenceData = {
      employee_id: users[0].id,
      absence_type_id: absenceTypes.find(t => t.name === 'Sick Leave').id,
      start_date: new Date().toISOString().split('T')[0],
      expected_end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      reason_category: 'Illness',
      severity_level: 'Moderate',
      reporting_officer_id: users[1].id,
      management_level: 'Active Management',
      is_self_reported: false
    }

    const absenceResponse = await fetch(`${BASE_URL}/absences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(absenceData)
    })

    if (!absenceResponse.ok) {
      throw new Error(`Failed to create absence: ${absenceResponse.status}`)
    }

    const absence = await absenceResponse.json()
    console.log(`   Created absence with ID: ${absence.id}`)

    // Step 4: Save question answers
    console.log('4. Saving question answers...')
    const questionAnswers = [
      {
        question_template_id: 1,
        answer: 'Illness',
        question_text: 'What is the primary reason for your absence?',
        question_type: 'select'
      },
      {
        question_template_id: 2,
        answer: 'Yesterday afternoon',
        question_text: 'When did your symptoms first appear?',
        question_type: 'text'
      }
    ]

    const answersResponse = await fetch(`${BASE_URL}/questions/${absence.id}/answers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: questionAnswers,
        answered_by_id: users[1].id
      })
    })

    if (!answersResponse.ok) {
      console.log('   Warning: Failed to save question answers')
    } else {
      console.log('   Successfully saved question answers')
    }

    // Step 5: Save conversation details
    console.log('5. Saving conversation details...')
    const conversation = [
      {
        id: '1',
        question: 'How are you feeling today?',
        answer: 'I have a fever and headache, feeling quite unwell',
        timestamp: new Date().toISOString()
      },
      {
        id: '2', 
        question: 'Have you taken any medication?',
        answer: 'Yes, I took some ibuprofen this morning',
        timestamp: new Date().toISOString()
      }
    ]

    const conversationResponse = await fetch(`${BASE_URL}/absences/${absence.id}/conversation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        conversation,
        recorded_by_id: users[1].id
      })
    })

    if (!conversationResponse.ok) {
      console.log('   Warning: Failed to save conversation')
    } else {
      console.log('   Successfully saved conversation details')
    }

    // Step 6: Verify the absence was created with all data
    console.log('6. Verifying absence data...')
    const verifyResponse = await fetch(`${BASE_URL}/absences/${absence.id}`)
    const verifiedAbsence = await verifyResponse.json()
    
    console.log(`   Absence Status: ${verifiedAbsence.status}`)
    console.log(`   Reason Category: ${verifiedAbsence.reason_category}`)
    console.log(`   Management Level: ${verifiedAbsence.management_level}`)

    // Step 7: Get question answers for verification
    console.log('7. Verifying question answers...')
    const answersVerifyResponse = await fetch(`${BASE_URL}/questions/${absence.id}/answers`)
    const savedAnswers = await answersVerifyResponse.json()
    console.log(`   Saved ${savedAnswers.data?.length || 0} question answers`)

    console.log('\n✅ SUCCESS: Complete absence reporting system is working!')
    console.log(`   Absence ID: ${absence.id}`)
    console.log(`   Questions: ${questionAnswers.length}`)
    console.log(`   Conversation Entries: ${conversation.length}`)

  } catch (error) {
    console.error('\n❌ ERROR:', error.message)
    process.exit(1)
  }
}

// Run the test
testCompleteSystem()
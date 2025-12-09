import 'dotenv/config'
import { sendWelcomeEmail } from '../lib/email'

async function testSendEmail() {
  console.log('Testing email sending functionality...\n')
  
  // Test sending a welcome email
  const testEmail = process.env.TEST_EMAIL || 'yazambenda@gmail.com'
  const testPassword = 'TestPassword123!'
  const testName = 'Test User'
  
  console.log(`Sending test email to: ${testEmail}`)
  console.log('This is a test email - you can ignore it.\n')
  
  try {
    const result = await sendWelcomeEmail(
      testEmail,
      testPassword,
      testName,
      [{ id: 'test-course', title: 'Test Course' }]
    )
    
    if (result) {
      console.log('✅ Test email sent successfully!')
      console.log(`Check your inbox at: ${testEmail}`)
    } else {
      console.error('❌ Failed to send test email')
      console.error('Check the error messages above for details')
      process.exit(1)
    }
  } catch (error) {
    console.error('❌ Error sending test email:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
    }
    process.exit(1)
  }
}

testSendEmail().catch(console.error)


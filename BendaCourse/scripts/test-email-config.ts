import 'dotenv/config'
import { validateEmailConfig, logEmailConfigStatus, createEmailTransporter } from '../lib/email'

async function testEmailConfig() {
  console.log('Testing Email Configuration...\n')
  
  // Validate configuration
  const config = validateEmailConfig()
  logEmailConfigStatus()
  
  if (!config.isValid) {
    console.error('\n❌ Email configuration is invalid. Please set the missing environment variables.')
    console.error('Required variables:')
    config.missing.forEach(v => console.error(`  - ${v}`))
    process.exit(1)
  }
  
  console.log('\n✅ All required email environment variables are set!')
  
  // Test SMTP connection
  console.log('\nTesting SMTP connection...')
  try {
    const transporter = createEmailTransporter()
    await transporter.verify()
    console.log('✅ SMTP connection successful!')
    console.log('   Email service is ready to send emails.')
  } catch (error) {
    console.error('❌ SMTP connection failed!')
    console.error('   This might be due to:')
    console.error('   - Incorrect SMTP credentials')
    console.error('   - Network/firewall issues')
    console.error('   - Gmail App Password not set correctly')
    console.error('\n   Error details:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
  
  console.log('\n✅ Email configuration test passed!')
}

testEmailConfig().catch(console.error)


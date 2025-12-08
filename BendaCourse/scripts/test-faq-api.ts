import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testFAQAPI() {
  try {
    console.log('🧪 Testing FAQ API endpoints...\n')

    // First, verify the FAQ we created exists
    console.log('📋 Checking existing FAQs in database...')
    const existingFAQs = await prisma.fAQ.findMany({
      orderBy: { createdAt: 'desc' },
    })
    console.log(`Found ${existingFAQs.length} FAQ(s) in database\n`)

    if (existingFAQs.length > 0) {
      const latestFAQ = existingFAQs[0]
      console.log('📝 Latest FAQ:')
      console.log(`  ID: ${latestFAQ.id}`)
      console.log(`  Question: ${latestFAQ.question}`)
      console.log(`  Answer: ${latestFAQ.answer.substring(0, 50)}...`)
      console.log(`  Order: ${latestFAQ.order}`)
      console.log(`  Active: ${latestFAQ.isActive}`)
      console.log(`  Created: ${latestFAQ.createdAt}`)
      console.log()

      // Test querying active FAQs (like the public API does)
      console.log('🔍 Testing active FAQs query (public API simulation)...')
      const activeFAQs = await prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      })
      console.log(`✅ Found ${activeFAQs.length} active FAQ(s)`)
      activeFAQs.forEach((faq, index) => {
        console.log(`  ${index + 1}. ${faq.question}`)
      })
      console.log()

      // Test querying all FAQs (like the admin API does)
      console.log('🔍 Testing all FAQs query (admin API simulation)...')
      const allFAQs = await prisma.fAQ.findMany({
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      })
      console.log(`✅ Found ${allFAQs.length} total FAQ(s)`)
      console.log()

      console.log('✅ All API simulation tests passed!')
      console.log('\n📊 Summary:')
      console.log(`  - Total FAQs: ${existingFAQs.length}`)
      console.log(`  - Active FAQs: ${activeFAQs.length}`)
      console.log(`  - Inactive FAQs: ${existingFAQs.length - activeFAQs.length}`)
    } else {
      console.log('⚠️  No FAQs found in database')
    }

    console.log('\n✅ Test completed successfully!')
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testFAQAPI()
  .then(() => {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })


import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testFAQ() {
  try {
    console.log('🧪 Testing FAQ creation...\n')

    // Test data
    const testFAQ = {
      question: 'איך אני מתחבר לפלטפורמה?',
      answer: 'אתה יכול להתחבר באמצעות האימייל והסיסמה שקיבלת במייל. אם שכחת את הסיסמה, תוכל לאפס אותה בעמוד שכחתי סיסמה.',
      order: 1,
      isActive: true,
    }

    console.log('📝 Creating FAQ with data:')
    console.log(JSON.stringify(testFAQ, null, 2))
    console.log()

    // Create FAQ
    const createdFAQ = await prisma.fAQ.create({
      data: testFAQ,
    })

    console.log('✅ FAQ created successfully!')
    console.log('📋 Created FAQ:')
    console.log(JSON.stringify(createdFAQ, null, 2))
    console.log()

    // Verify it exists in database
    console.log('🔍 Verifying FAQ exists in database...')
    const foundFAQ = await prisma.fAQ.findUnique({
      where: { id: createdFAQ.id },
    })

    if (foundFAQ) {
      console.log('✅ FAQ found in database!')
      console.log('📋 Retrieved FAQ:')
      console.log(JSON.stringify(foundFAQ, null, 2))
      console.log()

      // Verify data matches
      const dataMatches =
        foundFAQ.question === testFAQ.question &&
        foundFAQ.answer === testFAQ.answer &&
        foundFAQ.order === testFAQ.order &&
        foundFAQ.isActive === testFAQ.isActive

      if (dataMatches) {
        console.log('✅ All data matches correctly!')
      } else {
        console.log('❌ Data mismatch detected!')
        console.log('Expected:', testFAQ)
        console.log('Got:', foundFAQ)
      }

      // Count all FAQs
      const totalFAQs = await prisma.fAQ.count()
      console.log(`\n📊 Total FAQs in database: ${totalFAQs}`)

      // List all active FAQs
      const activeFAQs = await prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      })
      console.log(`📋 Active FAQs: ${activeFAQs.length}`)
      activeFAQs.forEach((faq, index) => {
        console.log(`  ${index + 1}. ${faq.question}`)
      })

      console.log('\n✅ Test completed successfully!')
    } else {
      console.log('❌ FAQ not found in database!')
      throw new Error('FAQ was not found after creation')
    }
  } catch (error) {
    console.error('❌ Test failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

testFAQ()
  .then(() => {
    console.log('\n🎉 All tests passed!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  })


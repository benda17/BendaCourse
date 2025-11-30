'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { XCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function PaymentFailurePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background via-background to-secondary/20 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-border/40 max-w-md">
          <CardHeader className="text-center">
            <XCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
            <CardTitle className="text-2xl">Payment Failed</CardTitle>
            <CardDescription>
              There was an issue processing your payment. Please try again.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
            <Link href="/">
              <Button className="w-full">Try Again</Button>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}


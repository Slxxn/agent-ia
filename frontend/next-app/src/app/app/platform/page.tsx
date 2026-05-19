'use client'
import dynamic from 'next/dynamic'

const Dashboard = dynamic(() => import('../_dashboard'), { ssr: false })

export default function PlatformPage() {
  return <Dashboard />
}

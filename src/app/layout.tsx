import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Маленькое приключение',
  description: 'Интерактивное приглашение в Московский зоопарк',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}

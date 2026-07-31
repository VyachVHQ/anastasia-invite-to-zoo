import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const basePath = path.join(process.cwd(), 'markers.base.json')

export async function GET() {
  try {
    if (!fs.existsSync(basePath)) {
      return NextResponse.json({ markers: [] })
    }
    const data = JSON.parse(fs.readFileSync(basePath, 'utf-8'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ markers: [] })
  }
}

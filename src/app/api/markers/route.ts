import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const markersPath = path.join(process.cwd(), 'markers.json')

export async function GET() {
  try {
    if (!fs.existsSync(markersPath)) {
      return NextResponse.json({ markers: [] })
    }
    const data = JSON.parse(fs.readFileSync(markersPath, 'utf-8'))
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ markers: [] })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    fs.writeFileSync(markersPath, JSON.stringify(body, null, 2), 'utf-8')
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

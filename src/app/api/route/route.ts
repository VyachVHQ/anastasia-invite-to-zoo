import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const answerDir = path.join(process.cwd(), 'answer')

export async function POST(request: Request) {
  try {
    const body = await request.json()
    if (!fs.existsSync(answerDir)) {
      fs.mkdirSync(answerDir, { recursive: true })
    }
    const now = new Date()
    const filename = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}.txt`
    const filePath = path.join(answerDir, filename)
    if (body.append && fs.existsSync(filePath)) {
      fs.appendFileSync(filePath, `\n${body.content}`, 'utf-8')
    } else {
      fs.writeFileSync(filePath, body.content, 'utf-8')
    }
    return NextResponse.json({ success: true, filename })
  } catch (e) {
    return NextResponse.json({ success: false, error: String(e) }, { status: 500 })
  }
}

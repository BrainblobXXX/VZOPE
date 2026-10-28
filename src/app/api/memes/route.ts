import { NextResponse } from 'next/server'
import { MEME_MANIFEST } from '@/generated/media'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json({ memes: MEME_MANIFEST })
}

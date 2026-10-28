import { NextResponse } from 'next/server'
import { AVATAR_MANIFEST } from '@/generated/media'

export const dynamic = 'force-static'

export async function GET() {
  return NextResponse.json({ avatars: AVATAR_MANIFEST })
}

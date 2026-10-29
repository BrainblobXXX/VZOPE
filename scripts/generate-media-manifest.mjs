import { readdir, writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const memesDir = path.join(root, 'public', 'memes')
const avatarsDir = path.join(root, 'public', 'avatars')
const audioDir = path.join(root, 'public', 'audio')
const outFile = path.join(root, 'src', 'generated', 'media.ts')

const EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'])
const AUDIO_EXTENSIONS = new Set(['.mp3', '.ogg', '.wav', '.m4a', '.aac', '.flac'])
const ACCENTS = ['#FFB000', '#33FF00', '#00FFFF', '#FF00FF', '#FFB000', '#33FF00']

async function listFiles(dir, extensions = EXTENSIONS) {
  try {
    const files = await readdir(dir)
    return files.filter((file) => extensions.has(path.extname(file).toLowerCase()))
  } catch {
    return []
  }
}

const memeFiles = (await listFiles(memesDir)).sort((a, b) => a.localeCompare(b, 'ru'))
const memes = memeFiles.map((file, index) => {
  const base = file.replace(/\.[^.]+$/, '')
  const caption = base.replace(/[_-]+/g, ' ').trim() || `МЕМ ${index + 1}`
  return {
    id: `file-${index + 1}`,
    src: `/memes/${encodeURIComponent(file)}`,
    caption,
    emoji: '🖼',
    tag: 'МЕМ',
    accent: ACCENTS[index % ACCENTS.length],
  }
})

const audioFiles = (await listFiles(audioDir, AUDIO_EXTENSIONS)).sort((a, b) => a.localeCompare(b, 'ru'))
const audio = audioFiles.map((file) => `/audio/${encodeURIComponent(file)}`)

const avatarFiles = (await listFiles(avatarsDir)).sort((a, b) => a.localeCompare(b, 'ru'))
const avatars = {}
for (const file of avatarFiles) {
  const key = path.parse(file).name.toLowerCase()
  if (!avatars[key]) avatars[key] = `/avatars/${encodeURIComponent(file)}`
}

const source = `/* AUTO-GENERATED FILE. Do not edit by hand.\n * Run: npm run media:manifest\n */\n\nexport const MEME_MANIFEST = ${JSON.stringify(memes, null, 2)}\n\nexport const AVATAR_MANIFEST: Record<string, string> = ${JSON.stringify(avatars, null, 2)}\n\nexport const AUDIO_MANIFEST: string[] = ${JSON.stringify(audio, null, 2)}\n`

await mkdir(path.dirname(outFile), { recursive: true })
await writeFile(outFile, source, 'utf8')
console.log(`[media] memes: ${memes.length}, avatars: ${Object.keys(avatars).length}, audio: ${audio.length}`)

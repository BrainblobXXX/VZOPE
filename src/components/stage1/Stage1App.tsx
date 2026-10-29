'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Banner, Modal, PxButton } from '../tv/ui'
import SnowOverlay from '../tv/SnowOverlay'
import PhotoAvatar from './PhotoAvatar'
import { pauseSoundtrack, playBeep, playCassette, playClick, playCoin, playError, playMatch, playSend, playSwipe, playSwitch, playTear, resumeSoundtrack, setSoundEnabled, startHum, startSoundtrack, stopHum, stopSoundtrack } from '../../lib/tv/sounds'
import Stage1Shell from './Stage1Shell'
import Stage1MatchModal from './Stage1MatchModal'
import Stage1Feed from './screens/Stage1Feed'
import Stage1Profile from './screens/Stage1Profile'
import Stage1Viewers from './screens/Stage1Viewers'
import Stage1Channel from './screens/Stage1Channel'
import Stage1DeadChannel from './screens/Stage1DeadChannel'
import Stage1Shop from './screens/Stage1Shop'
import Stage1Cassette from './screens/Stage1Cassette'
import Stage1Auth from './Stage1Auth'
import Stage1Boot from './Stage1Boot'
import UserModal from './UserModal'
import { CASSETTE_MESSAGES, GENERIC_REPLIES, MATCHES, ME, MEMES, REPLIES, SHOP_ITEMS, START_COINS, VIEWERS, type S1Account, type S1ChatMessage, type S1Cassette, type S1Match, type S1Meme, type S1MyMatch, type S1Request, type S1Screen, type S1ShopItem, type S1User } from './data'

const STATE_KEY = 'stage1:state:v1'
const ACCOUNT_KEY = 'stage1:account:v1'
const SESSION_KEY = 'stage1:session:v1'
const BOOTED_KEY = 'stage1:booted:v1'
const DEFAULT_ABOUT = '«ЛЮБЛЮ ПЕЛЬМЕНИ, ЭЛТ И КОГДА ПОМЕХИ СКЛАДЫВАЮТСЯ В ЧЬЁ-ТО ЛИЦО. ПИШУ ОТСЮДА.»'

type Phase = 'loading' | 'auth' | 'boot' | 'app'

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(password)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

interface SavedState {
  coins: number
  owned: string[]
  unread: Record<string, number>
  cassetteMessages: Record<string, S1ChatMessage[]>
  cassettes: S1Cassette[]
  requests: S1Request[]
  likes: number
  matchIndex: number
  status: string
  about: string
  myMatches: S1MyMatch[]
  matchesSeen: number
  myExports: S1Meme[]
}

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function shuffle<T>(items: T[]): T[] {
  const next = [...items]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

function nowTime() {
  return new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

function pickReply(userId: string, lastRef?: Record<string, string>) {
  const pool = REPLIES[userId]
  const src = pool && pool.length > 0 ? pool : GENERIC_REPLIES
  let phrase = src[randomInt(0, src.length - 1)]
  // не повторяем последнюю фразу подряд
  if (lastRef && src.length > 1) {
    for (let i = 0; i < 3 && lastRef[userId] === phrase; i += 1) {
      phrase = src[randomInt(0, src.length - 1)]
    }
    lastRef[userId] = phrase
  }
  return phrase
}

export default function Stage1App() {
  const [phase, setPhase] = useState<Phase>('loading')
  const [account, setAccount] = useState<S1Account | null>(null)
  const [me, setMe] = useState<S1User>(ME)
  const [screen, setScreen] = useState<S1Screen>('feed')
  const [feedIndex, setFeedIndex] = useState(0)
  const [channel, setChannel] = useState(1)
  const [crtOff, setCrtOff] = useState(false)
  const [snow, setSnow] = useState(false)
  const [activeMatch, setActiveMatch] = useState<S1Match | null>(null)
  const [cassetteUserId, setCassetteUserId] = useState<string | null>(null)
  const [cassetteMessages, setCassetteMessages] = useState<Record<string, S1ChatMessage[]>>(CASSETTE_MESSAGES)
  const [cassettes, setCassettes] = useState<S1Cassette[]>([])
  const [requests, setRequests] = useState<S1Request[]>([])
  const [soundOn, setSoundOn] = useState(true)
  const [online, setOnline] = useState(true)
  const [banner, setBanner] = useState<{ text: string; tone: 'amber' | 'red' | 'green' } | null>(null)
  const [memes, setMemes] = useState<S1Meme[]>(() => shuffle(MEMES))
  const [avatars, setAvatars] = useState<Record<string, string>>({})
  const [myAvatar, setMyAvatar] = useState<string | undefined>(undefined)
  const [coins, setCoins] = useState(START_COINS)
  const [owned, setOwned] = useState<string[]>([])
  const [typingFrom, setTypingFrom] = useState<string | null>(null)
  const [unread, setUnread] = useState<Record<string, number>>({})
  const [myStatus, setMyStatus] = useState(ME.status)
  const [myAbout, setMyAbout] = useState(DEFAULT_ABOUT)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [likes, setLikes] = useState(0)
  const [matchIndex, setMatchIndex] = useState(0)
  const [myMatches, setMyMatches] = useState<S1MyMatch[]>([])
  const [matchesSeen, setMatchesSeen] = useState(0)
  const [matchesOpen, setMatchesOpen] = useState(false)
  const [matchProfileUser, setMatchProfileUser] = useState<S1User | null>(null)
  const [myExports, setMyExports] = useState<S1Meme[]>([])

  useEffect(() => {
    let alive = true
    fetch('/api/memes', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { memes?: S1Meme[] }) => {
        if (!alive) return
        if (Array.isArray(data.memes) && data.memes.length > 0) setMemes(shuffle(data.memes))
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true
    fetch('/api/avatars', { cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { avatars?: Record<string, string> }) => {
        if (alive && data.avatars) setAvatars(data.avatars)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem('stage1:my-avatar')
        if (saved) setMyAvatar(saved)
        // персистентность мокапа: коины, инвентарь, плёнки кассет, заявки
        const raw = localStorage.getItem(STATE_KEY)
        if (raw) {
          const s = JSON.parse(raw) as Partial<SavedState>
          if (typeof s.coins === 'number') setCoins(s.coins)
          if (Array.isArray(s.owned)) setOwned(s.owned)
          if (s.unread && typeof s.unread === 'object') setUnread(s.unread)
          if (s.cassetteMessages && typeof s.cassetteMessages === 'object') setCassetteMessages(s.cassetteMessages)
          if (Array.isArray(s.cassettes) && s.cassettes.length > 0) setCassettes(s.cassettes)
          if (Array.isArray(s.requests)) setRequests(s.requests)
          if (typeof s.likes === 'number') setLikes(s.likes)
          if (typeof s.matchIndex === 'number') setMatchIndex(s.matchIndex)
          if (typeof s.status === 'string' && s.status) setMyStatus(s.status)
          if (typeof s.about === 'string' && s.about) setMyAbout(s.about)
          if (Array.isArray(s.myMatches)) setMyMatches(s.myMatches)
          if (typeof s.matchesSeen === 'number') setMatchesSeen(s.matchesSeen)
          if (Array.isArray(s.myExports)) setMyExports(s.myExports)
        }
      } catch {
        // битое состояние — начинаем с чистой кассеты
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  // первый запуск: локальный аккаунт, сессия и заставка
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const rawAccount = localStorage.getItem(ACCOUNT_KEY)
        const savedAccount = rawAccount ? (JSON.parse(rawAccount) as S1Account) : null

        if (savedAccount) {
          setAccount(savedAccount)
          setMe((prev) => ({
            ...prev,
            nick: savedAccount.nick,
            gender: savedAccount.gender,
            age: savedAccount.age,
          }))
        }

        // сессия не переживает перезапуск: каждый запуск начинается с регистрации/входа
        setPhase('auth')
      } catch {
        setPhase('auth')
      }
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  // сохранение мокапа при каждом изменении
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const state: SavedState = {
          coins,
          owned,
          unread,
          cassetteMessages,
          cassettes,
          requests,
          likes,
          matchIndex,
          status: myStatus,
          about: myAbout,
          myMatches,
          matchesSeen,
          myExports,
        }
        localStorage.setItem(STATE_KEY, JSON.stringify(state))
      } catch {
        // не влезло — не критично, мокап живёт в сессии
      }
    }, 200)
    return () => window.clearTimeout(timer)
  }, [coins, owned, unread, cassetteMessages, cassettes, requests, myStatus, myAbout, likes, matchIndex, myMatches, matchesSeen, myExports])

  // включение телевизора: вспышка снега на старте
  useEffect(() => {
    const start = window.setTimeout(() => setSnow(true), 0)
    const end = window.setTimeout(() => setSnow(false), 520)
    return () => {
      window.clearTimeout(start)
      window.clearTimeout(end)
    }
  }, [])

  // фоновый гул ЭЛТ — после первого касания (autoplay-политика)
  useEffect(() => {
    const kick = () => startHum()
    window.addEventListener('pointerdown', kick, { once: true })
    window.addEventListener('keydown', kick, { once: true })
    return () => {
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
    }
  }, [])

  // не играем радио, когда вкладка/WebView свернуты
  useEffect(() => {
    const onVisibility = () => {
      if (document.hidden) pauseSoundtrack()
      else if (soundOn) resumeSoundtrack()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [soundOn])

  const transitioning = useRef(false)
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nextMatchAtRef = useRef<number | null>(null)
  const onlineRef = useRef(true)
  const cassetteUserIdRef = useRef<string | null>(null)
  const pendingRepliesRef = useRef<string[]>([])
  const replyTimersRef = useRef<number[]>([])
  const lastReplyRef = useRef<Record<string, string>>({})
  // зеркала состояния для фоновых таймеров (входящие заявки)
  const cassettesRef = useRef(cassettes)
  const myMatchesRef = useRef(myMatches)
  const requestsRef = useRef(requests)

  useEffect(() => {
    const timers = replyTimersRef.current
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  useEffect(() => {
    cassettesRef.current = cassettes
    myMatchesRef.current = myMatches
    requestsRef.current = requests
  }, [cassettes, myMatches, requests])

  const showBanner = (text: string, tone: 'amber' | 'red' | 'green' = 'amber') => {
    if (bannerTimer.current) clearTimeout(bannerTimer.current)
    setBanner({ text, tone })
    bannerTimer.current = setTimeout(() => setBanner(null), 2200)
  }

  const effectiveAvatars = myAvatar ? { ...avatars, me: myAvatar } : avatars

  const onAvatarUpload = (dataUrl: string) => {
    setMyAvatar(dataUrl)
    try {
      localStorage.setItem('stage1:my-avatar', dataUrl)
    } catch {
      // Если не влезло в localStorage — превью всё равно останется в сессии.
    }
    showBanner('АВАТАР ОБНОВЛЕН', 'green')
  }

  const registerAccount = async (nick: string, gender: 'М' | 'Ж', age: number, password: string) => {
    const normalized = nick.trim().toUpperCase()
    if (account?.nick === normalized) return 'ЭТОТ НИК УЖЕ ЗАРЕГИСТРИРОВАН'
    if (normalized === ME.nick || VIEWERS.some((u) => u.nick === normalized)) return 'ЭТОТ НИК УЖЕ В ЭФИРЕ'

    const nextAccount: S1Account = {
      nick: normalized,
      gender,
      age,
      passwordHash: await hashPassword(password),
    }

    try {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextAccount))
      localStorage.removeItem(SESSION_KEY)
      localStorage.removeItem(STATE_KEY)
      localStorage.removeItem('stage1:my-avatar')
      localStorage.removeItem(BOOTED_KEY)
    } catch {
      // localStorage может быть недоступен — мокап всё равно откроется
    }

    setAccount(nextAccount)
    setMe((prev) => ({ ...prev, nick: normalized, gender, age }))
    setCoins(START_COINS)
    setOwned([])
    setUnread({})
    setCassetteMessages(CASSETTE_MESSAGES)
    setCassettes([])
    setRequests([])
    setLikes(0)
    setMatchIndex(0)
    setMyMatches([])
    setMatchesSeen(0)
    setMyExports([])
    setMyAvatar(undefined)
    setMyStatus(ME.status)
    setMyAbout(DEFAULT_ABOUT)
    setActiveMatch(null)
    setCassetteUserId(null)
    setScreen('feed')
    setFeedIndex(0)
    setPhase(localStorage.getItem(BOOTED_KEY) === '1' ? 'app' : 'boot')
    return null
  }

  const loginAccount = async (nick: string, password: string) => {
    const normalized = nick.trim().toUpperCase()
    if (!account) return 'АККАУНТ НЕ НАЙДЕН. ЗАРЕГИСТРИРУЙСЯ.'
    if (account.nick !== normalized) return 'НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ'
    if ((await hashPassword(password)) !== account.passwordHash) return 'НЕВЕРНЫЙ ЛОГИН ИЛИ ПАРОЛЬ'

    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // мокап живёт в памяти
    }
    setMe((prev) => ({ ...prev, nick: account.nick, gender: account.gender, age: account.age }))
    setScreen('feed')
    setFeedIndex(0)
    setChannel(1)
    setActiveMatch(null)
    setCassetteUserId(null)
    setPhase(localStorage.getItem(BOOTED_KEY) === '1' ? 'app' : 'boot')
    return null
  }

  const finishBoot = () => {
    try {
      localStorage.setItem(BOOTED_KEY, '1')
    } catch {
      // не критично
    }
    setPhase('app')
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // не критично
    }
    setSettingsOpen(false)
    stopSoundtrack()
    setPhase('auth')
  }

  const transit = (fn: () => void) => {
    if (transitioning.current) return
    transitioning.current = true
    playSwitch()
    setCrtOff(true)
    setTimeout(() => {
      fn()
      setSnow(true)
    }, 110)
    setTimeout(() => {
      setSnow(false)
      setCrtOff(false)
      transitioning.current = false
    }, 360)
  }

  const goRoot = (next: S1Screen) => {
    setActiveMatch(null)
    setCassetteUserId(null)
    cassetteUserIdRef.current = null
    transit(() => setScreen(next))
  }

  // ── кассета: отправка, подарки, живые ответы ─────────────────

  const appendMessage = (userId: string, msg: S1ChatMessage) => {
    setCassetteMessages((prev) => ({ ...prev, [userId]: [...(prev[userId] ?? []), msg] }))
  }

  const touchCassetteRow = (userId: string, last: string) => {
    setCassettes((prev) => prev.map((c) => (c.userId === userId ? { ...c, last, time: nowTime() } : c)))
  }

  const deliverReply = (userId: string) => {
    const nick = VIEWERS.find((u) => u.id === userId)?.nick ?? 'СОБЕСЕДНИК'
    setTypingFrom(userId)
    const t1 = window.setTimeout(() => {
      setTypingFrom(null)
      const text = pickReply(userId, lastReplyRef.current)
      appendMessage(userId, { id: `r-${Date.now()}`, from: 'them', text, time: nowTime() })
      touchCassetteRow(userId, text)
      if (cassetteUserIdRef.current !== userId) {
        setUnread((prev) => ({ ...prev, [userId]: (prev[userId] ?? 0) + 1 }))
        showBanner(`НОВЫЙ КАДР НА КАССЕТЕ ${nick}`, 'green')
        playBeep()
      }
    }, randomInt(1400, 2600))
    replyTimersRef.current.push(t1)
  }

  const scheduleReply = (userId: string) => {
    const t = window.setTimeout(() => {
      if (!onlineRef.current) {
        // антенна отвалилась — пакет ждёт в очереди
        pendingRepliesRef.current.push(userId)
        return
      }
      deliverReply(userId)
    }, randomInt(3800, 8200))
    replyTimersRef.current.push(t)
  }

  const sendCassetteMessage = (userId: string, value: string) => {
    const text = value.trim()
    if (!text) return
    playSend()
    appendMessage(userId, { id: `local-${Date.now()}`, from: 'me', text: text.slice(0, 500), time: nowTime() })
    touchCassetteRow(userId, text)
    scheduleReply(userId)
  }

  const sendCassetteItem = (userId: string, item: S1ShopItem) => {
    if (item.kind === 'gift') {
      // подарки одноразовые
      setOwned((prev) => prev.filter((id) => id !== item.id))
      showBanner('ПОДАРОК ВРУЧЁН. ОТРЫВОК ПЛЁНКИ СЛЕЗА.', 'green')
    } else {
      showBanner('СТИКЕР ЗАПИСАН НА ПЛЁНКЕ', 'green')
    }
    playSend()
    appendMessage(userId, {
      id: `it-${Date.now()}`,
      from: 'me',
      text: item.name,
      time: nowTime(),
      kind: item.kind,
      emoji: item.emoji,
    })
    touchCassetteRow(userId, `${item.emoji} ${item.name}`)
    scheduleReply(userId)
  }

  const acceptRequest = (userId: string) => {
    const request = requests.find((r) => r.userId === userId)
    if (!request) return

    // мэтч от зрителя переезжает в «МОИ МЭТЧИ» как принятый
    setMyMatches((prev) =>
      prev.some((m) => m.userId === userId)
        ? prev.map((m) => (m.userId === userId && m.status !== 'accepted' ? { ...m, status: 'accepted' } : m))
        : [...prev, { userId, nick: request.nick, seed: request.seed, common: request.common, status: 'accepted' }],
    )

    const already = cassettes.some((c) => c.userId === userId)
    if (!already) {
      const time = nowTime()
      setCassettes((prev) => [
        ...prev,
        {
          id: `c-${userId}`,
          userId,
          nick: request.nick,
          seed: request.seed,
          last: 'ЗАЯВКА ПРИНЯТА. НАПИШИ ПЕРВЫМ.',
          time,
        },
      ])
    }
    setRequests((prev) => prev.filter((r) => r.userId !== userId))
    showBanner(already ? 'КАССЕТА УЖЕ НА ПОЛКЕ' : 'КАССЕТА НА ПОЛКЕ', 'green')
  }

  const declineRequest = (userId: string) => {
    setRequests((prev) => prev.filter((r) => r.userId !== userId))
    showBanner('ЗАЯВКА ОТКЛОНЕНА', 'red')
  }

  const deleteCassette = (userId: string) => {
    playTear()
    setCassettes((prev) => prev.filter((c) => c.userId !== userId))
    setCassetteMessages((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
    setUnread((prev) => {
      const next = { ...prev }
      delete next[userId]
      return next
    })
    setMyMatches((prev) => prev.filter((m) => m.userId !== userId))
    showBanner('КАССЕТА ВЫТАЩЕНА', 'red')
  }

  const openCassette = (userId: string) => {
    playCassette()
    setCassetteUserId(userId)
    cassetteUserIdRef.current = userId
    setUnread((prev) => ({ ...prev, [userId]: 0 }))
    transit(() => setScreen('cassette'))
  }

  // ── ЛАВКА ────────────────────────────────────────────────────

  const buyItem = (item: S1ShopItem) => {
    if (owned.includes(item.id)) {
      showBanner('УЖЕ НА ПОЛКЕ', 'amber')
      return
    }
    if (coins < item.price) {
      showBanner('МАЛО МЕМ-КОИНОВ', 'red')
      playError()
      return
    }
    setCoins((c) => c - item.price)
    setOwned((prev) => [...prev, item.id])
    playCoin()
    showBanner(`КУПЛЕНО: ${item.name}`, 'green')
  }

  const shopItems = SHOP_ITEMS.map((item) => ({ ...item, owned: owned.includes(item.id) }))

  // ── навигация ────────────────────────────────────────────────

  const panel = (next: S1Screen) => {
    if (screen === next) return
    playClick()
    if (next === 'profile') {
      // помечаем прочитанным с задержкой — метка «НОВОЕ» успевает мелькнуть в списке
      const t = window.setTimeout(markRequestsSeen, 1200)
      replyTimersRef.current.push(t)
    }
    goRoot(next)
  }

  const onKnob = () => {
    playClick()
    const nextChannel = screen === 'channel' ? (channel % 5) + 1 : 1
    setActiveMatch(null)
    setCassetteUserId(null)
    cassetteUserIdRef.current = null
    transit(() => {
      setChannel(nextChannel)
      setScreen('channel')
    })
  }

  const toggleAntenna = () => {
    playClick()
    const next = !online
    onlineRef.current = next
    setOnline(next)
    showBanner(next ? 'СИГНАЛ ПОЙМАН. ПАКЕТЫ УШЛИ.' : 'СИГНАЛ ПОТЕРЯН. ПРОВЕРЬ СВЯЗЬ.', next ? 'green' : 'red')
    if (next && pendingRepliesRef.current.length > 0) {
      const queued = [...pendingRepliesRef.current]
      pendingRepliesRef.current = []
      queued.forEach((entry, i) => {
        const t = window.setTimeout(() => {
          if (entry.startsWith('match:')) deliverRequestAccept(entry.slice(6))
          else deliverReply(entry)
        }, 600 + i * 1200)
        replyTimersRef.current.push(t)
      })
    }
  }

  const toggleSound = () => {
    playClick()
    const next = !soundOn
    setSoundOn(next)
    setSoundEnabled(next)
    if (next) {
      startHum()
      startSoundtrack()
    } else {
      stopHum()
      stopSoundtrack()
    }
  }

  // ── фоновые входящие заявки от зрителей ─────────────────────

  const deliverIncomingRequest = () => {
    // заявки приходят только от уже найденных мэтчей, а не из воздуха
    const candidates = myMatchesRef.current
      .filter((m) => m.status === 'found')
      .filter((m) => !cassettesRef.current.some((c) => c.userId === m.userId))
      .filter((m) => !requestsRef.current.some((r) => r.userId === m.userId))
      .map((m) => ({ match: m, user: VIEWERS.find((u) => u.id === m.userId) }))
      .filter((x): x is { match: S1MyMatch; user: S1User } => Boolean(x.user))
    if (candidates.length === 0) return
    const picked = candidates[randomInt(0, candidates.length - 1)]
    setRequests((prev) =>
      prev.some((r) => r.userId === picked.user.id)
        ? prev
        : [...prev, { id: `rq-${Date.now()}`, userId: picked.user.id, nick: picked.user.nick, seed: picked.user.seed, common: picked.match.common, seen: false }],
    )
    showBanner(`ЗАЯВКА ОТ ${picked.user.nick}. ПРОФИЛЬ ЖДЁТ.`, 'amber')
    playBeep()
  }

  useEffect(() => {
    if (!online || myMatches.length === 0) return
    // после появления мэтча даём ему «написать» с небольшой задержкой
    const timer = window.setTimeout(deliverIncomingRequest, 3500)
    return () => window.clearTimeout(timer)
  }, [online, myMatches.length])

  const markRequestsSeen = () => {
    setRequests((prev) => (prev.some((r) => !r.seen) ? prev.map((r) => (r.seen ? r : { ...r, seen: true })) : prev))
  }

  const deliverRequestAccept = (userId: string) => {
    const user = VIEWERS.find((u) => u.id === userId)
    if (!user) return
    // мэтч переехал в «принят» — кассета на полке
    setMyMatches((prev) => prev.map((m) => (m.userId === userId && m.status !== 'accepted' ? { ...m, status: 'accepted' } : m)))
    setCassettes((prev) =>
      prev.some((c) => c.userId === userId)
        ? prev
        : [
            ...prev,
            {
              id: `c-${userId}`,
              userId,
              nick: user.nick,
              seed: user.seed,
              last: 'МЭТЧ ПРИНЯТ. КАССЕТА ЗАРЯЖЕНА.',
              time: nowTime(),
            },
          ],
    )
    showBanner(`${user.nick} ПРИНЯЛ ЗАЯВКУ. КАССЕТА НА ПОЛКЕ.`, 'green')
    playCassette()
  }

  const sendMatchRequest = (userId: string) => {
    setActiveMatch(null)
    setMyMatches((prev) => prev.map((m) => (m.userId === userId && m.status === 'found' ? { ...m, status: 'sent' } : m)))
    showBanner('ЗАЯВКА ОТПРАВЛЕНА. ЖДИ ОТВЕТА.', 'green')
    const t = window.setTimeout(() => {
      if (!onlineRef.current) {
        // антенна отвалилась — ответ на заявку ждёт в очереди
        pendingRepliesRef.current.push(`match:${userId}`)
        return
      }
      deliverRequestAccept(userId)
    }, randomInt(6000, 14000))
    replyTimersRef.current.push(t)
  }

  const handleLike = () => {
    const likesTotal = likes + 1
    setLikes(likesTotal)
    setCoins((c) => c + 1) // за лайк капает 1 мем-коин
    if (nextMatchAtRef.current === null) nextMatchAtRef.current = randomInt(4, 10)
    if (matchIndex >= MATCHES.length) return
    if (likesTotal < (nextMatchAtRef.current ?? 0)) return

    const next = MATCHES[matchIndex]
    setMatchIndex(matchIndex + 1)
    nextMatchAtRef.current = likesTotal + randomInt(4, 10)
    setMyMatches((prev) =>
      prev.some((m) => m.userId === next.userId)
        ? prev.map((m) => (m.userId === next.userId ? { ...m, common: next.common } : m))
        : [...prev, { userId: next.userId, nick: next.nick, seed: next.seed, common: next.common, status: 'found' }],
    )
    playMatch()
    setActiveMatch(next)
  }

  // ── МОИ МЭТЧИ / сжигание кадров ─────────────────────────────

  const openMatches = () => {
    playClick()
    const visible = myMatches.filter((m) => !cassettes.some((c) => c.userId === m.userId))
    setMatchesSeen(visible.length)
    setMatchesOpen(true)
  }

  const burnCassetteMessage = (userId: string, msgId: string) => {
    setCassetteMessages((prev) => ({
      ...prev,
      [userId]: (prev[userId] ?? []).filter((m) => m.id !== msgId),
    }))
    playTear()
    showBanner('КАДР СЖЕЧЕН. ПЛЁНКА СМОТАЛАСЬ.', 'red')
  }

  // ── экспорт кадра соседа в МЭМ-ЭФИР ─────────────────────────

  const exportCassetteMessage = (userId: string, msg: S1ChatMessage) => {
    const id = `exp-${userId}-${msg.id}`
    if (myExports.some((m) => m.id === id)) {
      showBanner('ЭТОТ КАДР УЖЕ В ЭФИРЕ', 'amber')
      return
    }
    const meme: S1Meme = {
      id,
      emoji: '📽',
      caption: msg.text.slice(0, 90),
      tag: 'КАССЕТА',
      accent: '#FF00FF',
      exported: true,
    }
    setMyExports((prev) => [meme, ...prev])
    setCoins((c) => c + 1)
    playCoin()
    showBanner('КАДР УШЁЛ В МЭМ-ЭФИР. ЭФИР ЗАПЛАТИЛ +1.', 'green')
  }

  const allMemes = useMemo(() => [...myExports, ...memes], [myExports, memes])

  const unreadSum = Object.values(unread).reduce((sum, n) => sum + n, 0)
  const unseenRequests = requests.filter((r) => !r.seen).length
  const profileBadge = unreadSum + unseenRequests
  const visibleMatches = myMatches.filter((m) => !cassettes.some((c) => c.userId === m.userId))
  const matchBadge = Math.max(0, visibleMatches.length - matchesSeen)

  const screenContent = () => {
    switch (screen) {
      case 'feed':
        return (
          <Stage1Feed
            memes={allMemes}
            matchBadge={matchBadge}
            onOpenMatches={openMatches}
            onLike={handleLike}
            onRefresh={() => setMemes((prev) => shuffle(prev))}
            initialIndex={feedIndex}
            onIndexChange={setFeedIndex}
            onSwipe={(dir) => playSwipe(dir === 1 ? 'right' : 'left')}
          />
        )
      case 'viewers':
        return (
          <Stage1Viewers
            avatars={effectiveAvatars}
            me={me}
            cassettes={cassettes}
            requests={requests}
            myStatus={myStatus}
            onToast={showBanner}
            onOpenCassette={openCassette}
            onGoShop={() => panel('shop')}
          />
        )
      case 'profile':
        return (
          <Stage1Profile
            avatars={effectiveAvatars}
            me={me}
            coins={coins}
            cassettes={cassettes}
            unread={unread}
            requests={requests}
            myStatus={myStatus}
            myAbout={myAbout}
            matchesCount={myMatches.length}
            onAvatarUpload={onAvatarUpload}
            onOpenCassette={openCassette}
            onDeleteCassette={deleteCassette}
            onAcceptRequest={acceptRequest}
            onDeclineRequest={declineRequest}
            onToast={showBanner}
            onEditProfile={(status, about) => {
              setMyStatus(status)
              setMyAbout(about)
              showBanner('ПРОФИЛЬ ПЕРЕЗАПИСАН НА ПЛЁНКУ', 'green')
            }}
            onOpenSettings={() => setSettingsOpen(true)}
            onGoShop={() => panel('shop')}
          />
        )
      case 'shop':
        return <Stage1Shop items={shopItems} coins={coins} onBuy={buyItem} />
      case 'channel':
        return channel === 1 ? <Stage1Channel avatars={effectiveAvatars} online={online} /> : <Stage1DeadChannel channel={channel} />
      case 'cassette': {
        const user = VIEWERS.find((u) => u.id === cassetteUserId)
        if (!user) return null
        return (
          <Stage1Cassette
            key={user.id}
            user={user}
            messages={cassetteMessages[user.id] ?? []}
            avatars={effectiveAvatars}
            typing={typingFrom === user.id}
            stickers={shopItems.filter((i) => i.kind === 'sticker' && i.owned)}
            gifts={shopItems.filter((i) => i.kind === 'gift' && i.owned)}
            onBack={() => {
              const t = window.setTimeout(markRequestsSeen, 1200)
              replyTimersRef.current.push(t)
              goRoot('profile')
            }}
            onSend={(text) => sendCassetteMessage(user.id, text)}
            onSendItem={(item) => sendCassetteItem(user.id, item)}
            onBurn={(msgId) => burnCassetteMessage(user.id, msgId)}
            onExport={(msg) => exportCassetteMessage(user.id, msg)}
          />
        )
      }
    }
  }

  if (phase === 'loading') {
    return <div className="min-h-dvh w-full bg-black" aria-label="Загрузка" />
  }

  if (phase === 'auth') {
    return <Stage1Auth onRegister={registerAccount} onLogin={loginAccount} onStartAudio={startSoundtrack} />
  }

  if (phase === 'boot') {
    return <Stage1Boot memes={memes} onDone={finishBoot} />
  }

  return (
    <Stage1Shell
      screen={screen}
      channel={channel}
      matchBadge={matchBadge}
      profileBadge={profileBadge}
      online={online}
      soundOn={soundOn}
      onKnob={onKnob}
      onFeed={() => panel('feed')}
      onViewers={() => panel('viewers')}
      onProfile={() => panel('profile')}
      onShop={() => panel('shop')}
      onAntenna={toggleAntenna}
      onSound={toggleSound}
    >
      <div className={`crt-wrap h-full ${crtOff ? 'crt-off' : ''}`}>{screenContent()}</div>

      <SnowOverlay active={snow} />

      <div className="crt-overlays absolute inset-0 z-[26]" aria-hidden="true">
        <div className="crt-scanlines absolute inset-0" />
        <div className="crt-vignette absolute inset-0" />
        <div className="crt-flicker absolute inset-0" />
      </div>

      {banner && <Banner text={banner.text} tone={banner.tone} />}

      {activeMatch && (
        <Stage1MatchModal
          match={activeMatch}
          memes={allMemes}
          avatars={effectiveAvatars}
          onClose={() => {
            setActiveMatch(null)
            showBanner('МЭТЧ В «МОИХ МЭТЧАХ»', 'green')
          }}
          onRequest={() => {
            if (activeMatch) sendMatchRequest(activeMatch.userId)
          }}
        />
      )}

      {matchesOpen && (
        <Modal title="МОИ МЭТЧИ" onClose={() => setMatchesOpen(false)} wide>
          <div className="flex min-h-0 flex-1 flex-col gap-1.5">
            {visibleMatches.length === 0 ? (
              <p className="font-pixel py-4 text-center text-[7px] leading-relaxed text-[#8a6f3f]">
                {myMatches.length > 0 ? (
                  'ВСЕ МЭТЧИ УЖЕ НА ПОЛКЕ. ОТКРЫВАЙ КАССЕТУ В ПРОФИЛЕ.'
                ) : (
                  <>
                    ПОКА ПУСТО. ЛАЙКАЙ МЕМЫ —
                    <br />
                    СОВПАДЕНИЯ ПРИДУТ САМИ.
                  </>
                )}
              </p>
            ) : (
              <div className="pixel-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1">
                {visibleMatches.map((m) => {
                  const cassette = cassettes.find((c) => c.userId === m.userId)
                  return (
                    <div key={m.userId} className="flex items-center gap-2 border-2 border-[#5a3a00] bg-[#140c04] p-2">
                      <button
                        type="button"
                        onClick={() => setMatchProfileUser(VIEWERS.find((u) => u.id === m.userId) ?? null)}
                        className="shrink-0 cursor-pointer border border-transparent hover:border-[#FFB000]"
                        aria-label={`Открыть профиль ${m.nick}`}
                      >
                        <PhotoAvatar src={effectiveAvatars[m.userId]} seed={m.seed} size={34} alt={m.nick} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="font-pixel truncate text-[8px] text-[#FFB000]">{m.nick}</p>
                        <p className="font-pixel mt-0.5 text-[5px] text-[#8a6f3f]">ОБЩИХ МЕМОВ · {m.common}</p>
                        <p
                          className={`font-pixel mt-0.5 text-[5px] ${
                            m.status === 'accepted' ? 'text-[#33FF00]' : m.status === 'sent' ? 'text-[#8a6f3f]' : 'text-[#FFB000]'
                          }`}
                        >
                          {m.status === 'accepted' ? '● КАССЕТА НА ПОЛКЕ' : m.status === 'sent' ? '… ЗАЯВКА УШЛА' : '● ВКУСЫ СОВПАЛИ'}
                        </p>
                      </div>
                      {m.status === 'accepted' && cassette ? (
                        <PxButton
                          variant="green"
                          className="shrink-0 px-2 py-1 text-[6px]"
                          onClick={() => {
                            setMatchesOpen(false)
                            openCassette(m.userId)
                          }}
                        >
                          КАССЕТА →
                        </PxButton>
                      ) : m.status === 'found' ? (
                        <PxButton
                          variant="ghost"
                          className="shrink-0 px-2 py-1 text-[6px]"
                          onClick={() => {
                            setMatchesOpen(false)
                            sendMatchRequest(m.userId)
                          }}
                        >
                          ЗАЯВКУ →
                        </PxButton>
                      ) : (
                        <span className="font-pixel shrink-0 border border-[#3d2a10] px-2 py-1 text-[6px] text-[#5a4626]">ЖДЁМ</span>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
            <PxButton variant="ghost" onClick={() => setMatchesOpen(false)}>
              ЗАКРЫТЬ
            </PxButton>
          </div>
        </Modal>
      )}

      {matchProfileUser && (
        <UserModal
          user={matchProfileUser}
          avatars={effectiveAvatars}
          hasCassette={cassettes.some((c) => c.userId === matchProfileUser.id)}
          onOpenCassette={() => {
            setMatchProfileUser(null)
            setMatchesOpen(false)
            openCassette(matchProfileUser.id)
          }}
          onGoShop={() => {
            setMatchProfileUser(null)
            setMatchesOpen(false)
            panel('shop')
          }}
          onClose={() => setMatchProfileUser(null)}
        />
      )}

      {settingsOpen && (
        <Modal title="НАСТРОЙКИ" onClose={() => setSettingsOpen(false)}>
          <div className="flex flex-col gap-3">
            <p className="font-pixel text-[6px] leading-relaxed text-[#8a6f3f]">
              ДЕМО ЖИВЁТ В ЭТОМ ТЕЛЕВИЗОРЕ: КОИНЫ, ЛАВКА И КАССЕТЫ
              <br />
              ЗАПИСЫВАЮТСЯ НА ЛОКАЛЬНУЮ ПЛЁНКУ (localStorage).
            </p>
            <div className="border border-[#5a3a00] bg-[#0d0a06] p-2">
              <p className="font-pixel text-[6px] leading-relaxed text-[#e8d9b0]">
                ЗВУК И АНТЕННА — КНОПКИ НА КОРПУСЕ.
                <br />
                ЛАЙКИ В МЭМ-ЭФИРЕ КАПАЮТ КОИНАМИ.
              </p>
            </div>
            <PxButton variant="ghost" onClick={logout}>
              ВЫЙТИ
            </PxButton>
            <ResetButton onReset={() => {
              playTear()
              try {
                localStorage.removeItem(STATE_KEY)
                localStorage.removeItem('stage1:my-avatar')
                localStorage.removeItem(ACCOUNT_KEY)
                localStorage.removeItem(SESSION_KEY)
                localStorage.removeItem(BOOTED_KEY)
              } catch {
                // ну, значит плёнка заляпана
              }
              window.setTimeout(() => window.location.reload(), 380)
            }} />
            <PxButton variant="ghost" onClick={() => setSettingsOpen(false)}>
              ЗАКРЫТЬ
            </PxButton>
          </div>
        </Modal>
      )}
    </Stage1Shell>
  )
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [armed, setArmed] = useState(false)
  return (
    <PxButton
      variant={armed ? 'danger' : 'ghost'}
      onClick={() => (armed ? onReset() : setArmed(true))}
    >
      {armed ? 'ТОЧНО СМЫТЬ ВСЮ ПЛЁНКУ?' : 'СБРОСИТЬ ДЕМО'}
    </PxButton>
  )
}

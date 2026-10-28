'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import TVShell from './TVShell'
import SnowOverlay from './SnowOverlay'
import PixelAvatar from './PixelAvatar'
import { Banner, Modal, PxButton } from './ui'
import ChannelScreen from './screens/ChannelScreen'
import OnAirScreen from './screens/OnAirScreen'
import OwnProfileScreen from './screens/OwnProfileScreen'
import OtherProfileScreen from './screens/OtherProfileScreen'
import PrivateChatScreen from './screens/PrivateChatScreen'
import RegistrationScreen from './screens/RegistrationScreen'
import FirstLaunchScreen from './screens/FirstLaunchScreen'
import ShopScreen from './screens/ShopScreen'
import MemeFeedScreen, { type MatchPopup } from './screens/MemeFeedScreen'
import {
  ERR,
  ME_ID,
  REACTIONS,
  initialChannels,
  initialGifts,
  initialInventory,
  initialMe,
  krotReplies,
  floodIdleLines,
  idleAuthors,
  makeInitialCassette,
  makeOlderMessages,
  mockUsers,
  uid,
  type Cassette,
  type Channel,
  type Gender,
  type Gift,
  type Message,
  type MemeVerdict,
  type ReactionEmoji,
  type User,
} from '@/lib/tv/data'
import {
  CANDIDATE_TASTE,
  INCOMING_AT_SWIPE,
  INCOMING_USER,
  MATCH_MIN_COMMON,
  MATCH_THRESHOLD,
  buildFeed,
  tasteAgrees,
} from '@/lib/tv/data'
import { shopItems as shopCatalog } from '@/lib/tv/data'
import * as snd from '@/lib/tv/sounds'

type ScreenId = 'register' | 'first' | 'memes' | 'channel' | 'onair' | 'profile' | 'other' | 'chat' | 'shop'
type Loc = 'channel' | 'chat'
type ComposerContext = { kind: 'reply'; nick: string; text: string } | { kind: 'edit'; text: string } | null

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]

const OTHER_PHOTO_COUNT: Record<string, number> = { u1: 2, u3: 3, u5: 1 }
const GREETINGS: Record<string, string> = {
  u2: 'давай, только быстро, у меня борщ на плите',
  u3: 'о, привет! плёнку смотать не забудь',
  u5: 'прив. если что — я рисую, а не болтаю',
  u10: 'ЗАЯВКА ПРИНЯТА. НЕ НАРУШАЙ.',
}
const DEFAULT_GREETING = 'алло, кто это? а, вижу. ну давай, чего хотел'

export default function TVApp() {
  // ── навигация ──
  const [stack, setStack] = useState<ScreenId[]>(['register'])
  const [channel, setChannel] = useState(1)
  const [crtOff, setCrtOff] = useState(false)
  const [snow, setSnow] = useState(false)
  const transitioningRef = useRef(false)

  // ── данные ──
  const [me, setMe] = useState<User>(() => structuredClone(initialMe))
  const [users] = useState<User[]>(mockUsers)
  const [channels, setChannels] = useState<Channel[]>(() => structuredClone(initialChannels))
  const [cassette, setCassette] = useState<Cassette | null>(null)
  const [inventory, setInventory] = useState<Record<string, number>>(() => ({ ...initialInventory }))
  const [gifts, setGifts] = useState<Record<string, Gift[]>>(() => structuredClone(initialGifts))
  const [photos, setPhotos] = useState<Array<{ src: string | null }>>(() =>
    Array.from({ length: 4 }, () => ({ src: null })),
  )
  const [avatarImg, setAvatarImg] = useState<string | null>(null)
  const [online, setOnline] = useState(true)
  const [soundOn, setSoundOn] = useState(true)

  // ── вспомогательные экраны/оверлеи ──
  const [banner, setBanner] = useState<{ text: string; tone: 'amber' | 'red' | 'green' } | null>(null)
  const bannerTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [viewingUser, setViewingUser] = useState<string | null>(null)
  const [shopTarget, setShopTarget] = useState<User | null>(null)
  const [msgMenu, setMsgMenu] = useState<{ loc: Loc; msgId: string } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState<{ loc: Loc; id: string } | null>(null)
  const [replyTo, setReplyTo] = useState<{ loc: Loc; nick: string; text: string } | null>(null)
  const [composer, setComposer] = useState('')
  const [frameMenu, setFrameMenu] = useState<number | null>(null)
  const [viewer, setViewer] = useState<{ src: string } | null>(null)
  const [cassetteMenu, setCassetteMenu] = useState<'menu' | 'confirm' | null>(null)
  const [logoutConfirm, setLogoutConfirm] = useState(false)
  const [olderBatches, setOlderBatches] = useState<Record<number, number>>({})
  // «прочитано до» по каналам — для бейджей непрочитанных на крутилке
  const [seenAt, setSeenAt] = useState<Record<number, number>>(() => ({ 1: Date.now(), 2: Date.now(), 3: Date.now(), 4: Date.now(), 5: Date.now() }))

  // ── мем-эфир (Экран 1, v2.0) ──
  const feed = useMemo(() => buildFeed(), [])
  const [memeHistory, setMemeHistory] = useState<Array<{ memeId: string; verdict: MemeVerdict }>>([])
  const [matchPopup, setMatchPopup] = useState<MatchPopup | null>(null)
  const [incomingReq, setIncomingReq] = useState<MatchPopup | null>(null)
  const [excluded, setExcluded] = useState<string[]>([]) // кандидаты, которых пропустили/кто отказал

  // ── админ-полномочия (удаление, мут, бан — раздел 1 v2.0) ──
  const [muted, setMuted] = useState<string[]>([])
  const [banned, setBanned] = useState<string[]>([])

  const fileRef = useRef<HTMLInputElement>(null)
  const pendingFrame = useRef<number>(-2) // -2: ничего, -1: аватар, 0..3: кадр

  const screen = stack[stack.length - 1]

  // рефсы для интервалов
  const onlineRef = useRef(online)
  const channelRef = useRef(channel)
  const stackRef = useRef(stack)
  const cassetteRef = useRef(cassette)
  const mutedRef = useRef(muted)
  const bannedRef = useRef(banned)
  useEffect(() => { onlineRef.current = online }, [online])
  useEffect(() => { channelRef.current = channel }, [channel])
  useEffect(() => { stackRef.current = stack }, [stack])
  useEffect(() => { cassetteRef.current = cassette }, [cassette])
  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { bannedRef.current = banned }, [banned])

  useEffect(() => { snd.setSoundEnabled(soundOn); if (soundOn) snd.startHum() }, [soundOn])

  // фоновый гул ЭЛТ (раздел 2.4): стартует с первого жеста юзера (autoplay-политика браузера)
  useEffect(() => {
    const kick = () => { snd.startHum() }
    window.addEventListener('pointerdown', kick, { once: true })
    window.addEventListener('keydown', kick, { once: true })
    return () => {
      window.removeEventListener('pointerdown', kick)
      window.removeEventListener('keydown', kick)
    }
  }, [])

  // ── баннер ──
  const showBanner = (text: string, tone: 'amber' | 'red' | 'green' = 'amber') => {
    setBanner({ text, tone })
    if (bannerTimer.current) clearTimeout(bannerTimer.current)
    bannerTimer.current = setTimeout(() => setBanner(null), 2400)
  }

  // ── переходы со снегом ──
  const transit = (fn: () => void) => {
    if (transitioningRef.current) return
    transitioningRef.current = true
    snd.playSwitch()
    setCrtOff(true)
    setTimeout(() => {
      fn()
      setSnow(true)
    }, 110)
    setTimeout(() => {
      setSnow(false)
      setCrtOff(false)
      transitioningRef.current = false
    }, 360)
  }

  const goRoot = (id: ScreenId) => transit(() => setStack([id]))
  const goPush = (id: ScreenId) => transit(() => setStack((s) => [...s, id]))
  const goBack = () =>
    transit(() =>
      setStack((s) => (s.length > 1 ? s.slice(0, -1) : ['channel'])),
    )

  // ── корпус ──
  const onKnob = () =>
    transit(() => {
      const prev = channelRef.current
      const next = (prev % 5) + 1
      setChannel(next)
      setStack(['channel'])
      setShopTarget(null)
      // ушли с канала — всё, что на него прилетело, пока смотрели, считается прочитанным
      setSeenAt((s) => ({ ...s, [prev]: Date.now(), [next]: Date.now() }))
    })

  const panelToggle = (id: ScreenId) => {
    if (screen === id) {
      setSeenAt((s) => ({ ...s, [channelRef.current]: Date.now() }))
      goRoot('channel')
    } else goRoot(id)
  }

  const toggleAntenna = () => {
    snd.playClick()
    if (online) {
      setOnline(false)
      showBanner(ERR.ANTENNA, 'red')
      snd.playError()
    } else {
      setOnline(true)
      // догнали отложенные пакеты
      setChannels((cs) => cs.map((c) => ({ ...c, messages: c.messages.map((m) => (m.status === 'queued' ? { ...m, status: 'sent' } : m)) })))
      setCassette((c) => (c ? { ...c, messages: c.messages.map((m) => (m.status === 'queued' ? { ...m, status: 'sent' } : m)) } : c))
      showBanner(ERR.SIGNAL_BACK, 'green')
      snd.playBeep()
    }
  }

  // ── реакции ──
  const react = (loc: Loc, msgId: string, emoji: ReactionEmoji) => {
    snd.playClick()
    const upd = (m: Message): Message => {
      if (m.id !== msgId) return m
      const ex = m.reactions.find((r) => r.emoji === emoji)
      let reactions
      if (ex?.byMe) {
        reactions = m.reactions
          .map((r) => (r.emoji === emoji ? { ...r, count: r.count - 1, byMe: false } : r))
          .filter((r) => r.count > 0)
      } else if (ex) {
        reactions = m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1, byMe: true } : r))
      } else {
        reactions = [...m.reactions, { emoji, count: 1, byMe: true }]
      }
      return { ...m, reactions }
    }
    if (loc === 'channel') {
      setChannels((cs) => cs.map((c) => (c.id === channel ? { ...c, messages: c.messages.map(upd) } : c)))
    } else {
      setCassette((c) => (c ? { ...c, messages: c.messages.map(upd) } : c))
    }
  }

  // ── отправка во флудилку ──
  const sendFlood = (payload: { text?: string; media?: Message['media'] }) => {
    if (editing?.loc === 'channel') {
      const { id } = editing
      setChannels((cs) =>
        cs.map((c) =>
          c.id === channel
            ? { ...c, messages: c.messages.map((m) => (m.id === id ? { ...m, text: payload.text, edited: true } : m)) }
            : c,
        ),
      )
      setEditing(null)
      setComposer('')
      showBanner('КАДР ПЕРЕЗАПИСАН')
      snd.playSend()
      return
    }
    const m: Message = {
      id: uid(),
      authorId: ME_ID,
      text: payload.text,
      media: payload.media,
      time: Date.now(),
      reactions: [],
      status: online ? 'sent' : 'queued',
      replyTo:
        replyTo?.loc === 'channel' ? { authorNick: replyTo.nick, text: replyTo.text } : undefined,
    }
    setChannels((cs) => cs.map((c) => (c.id === channel ? { ...c, messages: [...c.messages, m] } : c)))
    setReplyTo(null)
    setComposer('')
    if (!online) showBanner(ERR.ANTENNA, 'red')
  }

  // ── отправка в кассету ──
  const sendChat = (payload: { text?: string; media?: Message['media']; sticker?: string }) => {
    if (!cassette) return
    if (editing?.loc === 'chat') {
      const { id } = editing
      setCassette((c) =>
        c
          ? {
              ...c,
              messages: c.messages.map((m) => (m.id === id ? { ...m, text: payload.text, edited: true } : m)),
            }
          : c,
      )
      setEditing(null)
      setComposer('')
      showBanner('КАДР ПЕРЕЗАПИСАН')
      snd.playSend()
      return
    }
    const m: Message = {
      id: uid(),
      authorId: ME_ID,
      text: payload.text,
      media: payload.media,
      sticker: payload.sticker,
      time: Date.now(),
      reactions: [],
      status: online ? 'sent' : 'queued',
      replyTo: replyTo?.loc === 'chat' ? { authorNick: replyTo.nick, text: replyTo.text } : undefined,
    }
    setCassette((c) => (c ? { ...c, messages: [...c.messages, m] } : c))
    setReplyTo(null)
    setComposer('')
    if (!online) showBanner(ERR.ANTENNA, 'red')

    // КРОТ отвечает на плёнку
    if (online && cassette.userId === 'u1' && !payload.sticker) {
      const cur = stackRef.current[stackRef.current.length - 1]
      setTimeout(
        () => {
          const reply = pick(krotReplies)
          setCassette((c) =>
            c ? { ...c, messages: [...c.messages, { id: uid(), authorId: 'u1', text: reply, time: Date.now(), reactions: [] }] } : c,
          )
          snd.playBeep()
          if (stackRef.current[stackRef.current.length - 1] !== 'chat') {
            showBanner(`КАСС_КРОТ: ${reply.slice(0, 26)}...`, 'green')
          }
        },
        4500 + Math.random() * 4000,
      )
      void cur
    }
  }

  // ── живой эфир ──
  useEffect(() => {
    const iv = setInterval(() => {
      if (!onlineRef.current) return
      if (stackRef.current[stackRef.current.length - 1] !== 'channel') return
      const roll = Math.random()
      if (roll < 0.62) {
        const text = pick(floodIdleLines)
        const author = pick(idleAuthors)
        // мут/бан: наказанные молчат в эфире (админ-полномочия v2.0)
        if (mutedRef.current.includes(author) || bannedRef.current.includes(author)) return
        setChannels((cs) =>
          cs.map((c) =>
            c.id === channelRef.current
              ? { ...c, messages: [...c.messages, { id: uid(), authorId: author, text, time: Date.now(), reactions: [] }] }
              : c,
          ),
        )
        // смотрим канал живьём — всё прилетевшее сразу «прочитано»
        setSeenAt((s) => ({ ...s, [channelRef.current]: Date.now() }))
      } else if (roll < 0.88) {
        // кто-то лайкнул моё сообщение → +1 мем-коин
        setChannels((cs) =>
          cs.map((c) => {
            if (c.id !== channelRef.current) return c
            const mine = c.messages.filter((m) => m.authorId === ME_ID)
            if (!mine.length) return c
            const target = pick(mine)
            const emoji = pick(REACTIONS.filter((e) => e !== '👎'))
            return {
              ...c,
              messages: c.messages.map((m) => {
                if (m.id !== target.id) return m
                const ex = m.reactions.find((r) => r.emoji === emoji)
                const reactions = ex
                  ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
                  : [...m.reactions, { emoji, count: 1, byMe: false }]
                return { ...m, reactions }
              }),
            }
          }),
        )
        setMe((m) => ({ ...m, coins: m.coins + 1 }))
      }
    }, 14000)
    return () => clearInterval(iv)
  }, [])

  // ── фоновый эфир: соседние каналы тоже живут → бейджи непрочитанных ──
  useEffect(() => {
    const iv = setInterval(() => {
      if (!onlineRef.current) return
      const cur = stackRef.current[stackRef.current.length - 1]
      if (cur === 'register' || cur === 'first') return
      if (Math.random() > 0.5) return
      const target = 1 + Math.floor(Math.random() * 5)
      // сообщение в канал, который юзер прямо сейчас смотрит, сюда не попадает (им занимается живой эфир)
      if (cur === 'channel' && target === channelRef.current) return
      const text = pick(floodIdleLines)
      const author = pick(idleAuthors)
      if (mutedRef.current.includes(author) || bannedRef.current.includes(author)) return
      setChannels((cs) =>
        cs.map((c) =>
          c.id === target
            ? { ...c, messages: [...c.messages, { id: uid(), authorId: author, text, time: Date.now(), reactions: [] }] }
            : c,
        ),
      )
      snd.playBeep()
    }, 17000)
    return () => clearInterval(iv)
  }, [])

  // ── непрочитанные по каналам ──
  const unread = useMemo(() => {
    const rec: Record<number, number> = {}
    for (const c of channels) {
      const watching = screen === 'channel' && c.id === channel
      rec[c.id] = watching ? 0 : c.messages.filter((m) => m.authorId !== ME_ID && m.time > (seenAt[c.id] ?? 0)).length
    }
    return rec
  }, [channels, seenAt, screen, channel])

  // ── мем-эфир: свайп и фоновый мэтчинг (раздел 4.3 v2.0) ──
  const onSwipe = (memeId: string, verdict: MemeVerdict) => {
    setMemeHistory((h) => [...h.slice(-29), { memeId, verdict }])
  }

  // мэтч: сравниваю мои последние N реакций с мок-вкусами кандидатов противоположного пола
  useEffect(() => {
    if (matchPopup || incomingReq) return
    if (!online) return
    if (memeHistory.length < MATCH_MIN_COMMON) return
    let best: { id: string; ratio: number; memes: string[] } | null = null
    for (const candId of Object.keys(CANDIDATE_TASTE)) {
      if (excluded.includes(candId)) continue
      const agree = memeHistory.filter((h) => tasteAgrees(candId, h.memeId))
      const ratio = agree.length / memeHistory.length
      if (ratio < MATCH_THRESHOLD) continue
      const liked = agree.filter((h) => h.verdict === 'like').map((h) => h.memeId)
      const common = (liked.length ? liked : agree.map((h) => h.memeId)).slice(-3)
      if (!best || ratio > best.ratio) best = { id: candId, ratio, memes: common }
    }
    if (best) {
      snd.playMatch()
      setMatchPopup({ userId: best.id, memeIds: best.memes })
      setExcluded((e) => (e.includes(best!.id) ? e : [...e, best!.id]))
      // фоновый мэтчинг (v2.0): юзера нет в МЭМ-эфире — пуш-уведомление
      const cur = stackRef.current[stackRef.current.length - 1]
      if (cur !== 'memes') {
        const nick = mockUsers.find((u) => u.id === best.id)?.nick ?? 'КТО-ТО'
        showBanner(`ПУШ: СОВПАДЕНИЕ ВКУСОВ С ${nick}. ЗАЙДИ В МЭМ-ЭФИР`, 'green')
      }
    }
  }, [memeHistory, matchPopup, incomingReq, excluded, online])

  // подсказка мэтчинга («сигнал родственной души»)
  const matchHint: 'scan' | 'close' = useMemo(() => {
    if (memeHistory.length < 3) return 'scan'
    for (const candId of Object.keys(CANDIDATE_TASTE)) {
      if (excluded.includes(candId)) continue
      const agree = memeHistory.filter((h) => tasteAgrees(candId, h.memeId)).length
      if (agree / memeHistory.length >= 0.6) return 'close'
    }
    return 'scan'
  }, [memeHistory, excluded])

  // заявка на общение от другой стороны (п.4): прилетает по мок-событию
  const incomingDoneRef = useRef(false)
  useEffect(() => {
    if (incomingDoneRef.current) return
    if (matchPopup || incomingReq) return
    if (memeHistory.length < INCOMING_AT_SWIPE) return
    incomingDoneRef.current = true
    const liked = memeHistory.filter((h) => h.verdict === 'like').map((h) => h.memeId).slice(-3)
    setIncomingReq({ userId: INCOMING_USER, memeIds: liked })
    snd.playBeep()
    if (stackRef.current[stackRef.current.length - 1] !== 'memes') {
      // пуш-уведомление (раздел 1 v2.0): юзера нет в мем-эфире — шлём пуш
      const nick = mockUsers.find((u) => u.id === INCOMING_USER)?.nick ?? 'КТО-ТО'
      showBanner(`ПУШ: ${nick} ${ERR.REQ_PUSH}`, 'green')
    }
  }, [memeHistory, matchPopup, incomingReq])

  const sendRequest = (userId: string) => {
    // гвард: userId должен быть реальным юзером (не объект события и т.п.)
    if (!userId || typeof userId !== 'string' || !mockUsers.some((u) => u.id === userId)) return
    setMatchPopup(null)
    snd.playBeep()
    showBanner(ERR.REQ_SENT)
    const nick = mockUsers.find((u) => u.id === userId)?.nick ?? '??'
    setTimeout(() => {
      if (!onlineRef.current) return
      if (Math.random() < 0.7) {
        showBanner(`${nick}: ${ERR.REQ_ACCEPTED}`, 'green')
        snd.playMatch()
        // оба приняли → автоматический переход в Экран 7 (Личный чат / Кассета)
        openCassetteWith(userId)
      } else {
        showBanner(ERR.REQ_DECLINED, 'red')
      }
    }, 1800 + Math.random() * 2400)
  }

  const skipMatch = () => {
    if (!matchPopup) return
    setExcluded((e) => (e.includes(matchPopup.userId) ? e : [...e, matchPopup.userId]))
    setMatchPopup(null)
    snd.playClick()
    showBanner('ПРОПУСК. ЛЕНТА ПРОДОЛЖАЕТСЯ')
  }

  const acceptIncoming = () => {
    if (!incomingReq) return
    const target = incomingReq.userId
    setIncomingReq(null)
    showBanner(ERR.REQ_ACCEPTED, 'green')
    openCassetteWith(target)
  }

  const declineIncoming = () => {
    setIncomingReq(null)
    snd.playClick()
    showBanner('ЗАЯВКУ ОТКЛОНИЛИ. ЭФИР ПРОДОЛЖАЕТСЯ')
  }

  // ── админ-полномочия: удаление / мут / бан ──
  const adminDelete = () => {
    if (!msgMenu) return
    if (msgMenu.loc === 'channel') {
      setChannels((cs) => cs.map((c) => (c.id === channel ? { ...c, messages: c.messages.filter((m) => m.id !== msgMenu.msgId) } : c)))
    } else {
      setCassette((c) => (c ? { ...c, messages: c.messages.filter((m) => m.id !== msgMenu.msgId) } : c))
    }
    snd.playCassette()
    showBanner(ERR.ADMIN_DELETED)
    closeMenu()
  }

  const toggleMute = (userId: string) => {
    const nick = mockUsers.find((u) => u.id === userId)?.nick ?? '??'
    const wasMuted = muted.includes(userId)
    setMuted((m) => (wasMuted ? m.filter((x) => x !== userId) : [...m, userId]))
    snd.playClick()
    showBanner(`${nick}: ${wasMuted ? ERR.UNMUTED : ERR.MUTED}`)
    closeMenu()
  }

  const banUser = (userId: string) => {
    const nick = mockUsers.find((u) => u.id === userId)?.nick ?? '??'
    const wasBanned = banned.includes(userId)
    setBanned((b) => (wasBanned ? b.filter((x) => x !== userId) : [...b, userId]))
    snd.playError()
    // кассета с отключённым собеседником зажёвана (краевой случай 11.9)
    if (!wasBanned && cassetteRef.current?.userId === userId) {
      showBanner(ERR.CASSETTE_JAMMED, 'red')
    } else {
      showBanner(`${nick}: ${wasBanned ? ERR.UNBANNED : ERR.BANNED}`, wasBanned ? 'amber' : 'red')
    }
    closeMenu()
  }

  // ── профили ──
  const openProfile = (userId: string) => {
    if (userId === ME_ID) {
      goPush('profile')
      return
    }
    // забанен админом → канал отключён, профиль не открывается (краевой случай 10.9)
    if (banned.includes(userId)) {
      snd.playError()
      showBanner(ERR.CHANNEL_OFF, 'red')
      return
    }
    setViewingUser(userId)
    goPush('other')
  }

  const viewedUser = users.find((u) => u.id === viewingUser) ?? null
  const otherPhotos = useMemo(() => {
    const count = viewedUser ? OTHER_PHOTO_COUNT[viewedUser.id] ?? 0 : 0
    return Array.from({ length: 4 }, (_, i) => ({
      src: i < count && viewedUser ? `pixel:${viewedUser.avatarSeed}-f${i}` : null,
    }))
  }, [viewedUser])

  const writeState = useMemo(() => {
    if (!viewedUser) return { can: false, hint: '' }
    if (!cassette) return { can: true, hint: '' }
    if (cassette.userId === viewedUser.id) return { can: true, hint: 'ТАП: ОТКРОЕТСЯ ТВОЯ КАССЕТА' }
    return { can: false, hint: ERR.SHELF_BUSY }
  }, [cassette, viewedUser])

  // открыть (или создать) кассету с юзером. false — полка занята другим (правило одной кассеты)
  const openCassetteWith = (userId: string): boolean => {
    // гвард: неизвестный юзер — кассету не создаём (иначе экран лички падает в пустоту)
    if (!userId || typeof userId !== 'string' || !users.some((u) => u.id === userId)) return false
    const cur = cassetteRef.current
    if (cur && cur.userId !== userId) {
      snd.playError()
      showBanner(ERR.SHELF_BUSY, 'red')
      return false
    }
    if (!cur) {
      const greeting = GREETINGS[userId] ?? DEFAULT_GREETING
      const c: Cassette =
        userId === 'u1'
          ? makeInitialCassette()
          : {
              id: 'cass-' + uid(),
              userId,
              createdAt: Date.now(),
              messages: [{ id: uid(), authorId: userId, text: greeting, time: Date.now(), reactions: [] }],
            }
      setCassette(c)
      snd.playCassette()
    }
    goPush('chat')
    return true
  }

  const write = (userId: string) => {
    openCassetteWith(userId)
  }

  const removeCassette = () => {
    setCassette(null)
    setCassetteMenu(null)
    snd.playCassette()
    goRoot('profile')
    setTimeout(() => showBanner(ERR.CASSETTE_OUT), 380)
  }

  // ── кадры плёнки / файлы ──
  const openFile = (frame: number) => {
    pendingFrame.current = frame
    fileRef.current?.click()
  }

  const onFile = (f: File | undefined) => {
    if (!f) return
    if (f.size > 5 * 1024 * 1024) {
      showBanner(ERR.PHOTO_FAT, 'red')
      snd.playError()
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      const src = String(reader.result)
      snd.playFlash()
      if (pendingFrame.current === -1) {
        setAvatarImg(src)
        showBanner('АВАТАР ПРОЯВЛЕН')
      } else if (pendingFrame.current >= 0) {
        const idx = pendingFrame.current
        setPhotos((ps) => ps.map((p, i) => (i === idx ? { src } : p)))
        showBanner(ERR.FRAME_DEVELOPED)
      }
    }
    reader.readAsDataURL(f)
  }

  // ── магазин ──
  const buy = (itemId: string) => {
    const item = shopCatalog.find((i) => i.id === itemId)
    if (!item) return
    if (me.coins < item.price) {
      snd.playError()
      showBanner(ERR.FEW_COINS, 'red')
      return
    }
    snd.playCoin()
    setMe((m) => ({ ...m, coins: m.coins - item.price }))
    setInventory((inv) => ({ ...inv, [itemId]: (inv[itemId] ?? 0) + 1 }))
    showBanner(ERR.BOUGHT)
  }

  const gift = (itemId: string, targetId: string | null) => {
    const item = shopCatalog.find((i) => i.id === itemId)
    if (!item || !targetId) return
    const fromInventory = (inventory[itemId] ?? 0) > 0
    if (!fromInventory) {
      if (me.coins < item.price) {
        snd.playError()
        showBanner(ERR.FEW_COINS, 'red')
        return
      }
      setMe((m) => ({ ...m, coins: m.coins - item.price }))
    } else {
      setInventory((inv) => {
        const next = { ...inv, [itemId]: (inv[itemId] ?? 0) - 1 }
        if (next[itemId] <= 0) delete next[itemId]
        return next
      })
    }
    setGifts((g) => ({
      ...g,
      [targetId]: [
        ...(g[targetId] ?? []),
        { id: uid(), fromNick: me.nick, name: item.name, icon: item.icon },
      ],
    }))
    snd.playCoin()
    showBanner(ERR.GIFT_SENT)
  }

  const useStickerInChat = (itemId: string) => {
    if (!cassette) {
      snd.playError()
      showBanner('ПОЛКА ПУСТА. СНАЧАЛА НАПИШИ КОМУ-ТО', 'red')
      return
    }
    snd.playClick()
    goPush('chat')
  }

  const useSticker = (itemId: string) => {
    setInventory((inv) => {
      const next = { ...inv, [itemId]: (inv[itemId] ?? 0) - 1 }
      if (next[itemId] <= 0) delete next[itemId]
      return next
    })
  }

  // ── меню сообщения ──
  const menuMessage: Message | null = useMemo(() => {
    if (!msgMenu) return null
    if (msgMenu.loc === 'channel') {
      return channels.find((c) => c.id === channel)?.messages.find((m) => m.id === msgMenu.msgId) ?? null
    }
    return cassette?.messages.find((m) => m.id === msgMenu.msgId) ?? null
  }, [msgMenu, channels, channel, cassette])
  const menuAuthor = menuMessage ? (menuMessage.authorId === ME_ID ? me : users.find((u) => u.id === menuMessage.authorId)) : null

  const closeMenu = () => {
    setMsgMenu(null)
    setDeleting(false)
  }

  const doDelete = () => {
    if (!msgMenu) return
    if (msgMenu.loc === 'channel') {
      setChannels((cs) => cs.map((c) => (c.id === channel ? { ...c, messages: c.messages.filter((m) => m.id !== msgMenu.msgId) } : c)))
    } else {
      setCassette((c) => (c ? { ...c, messages: c.messages.filter((m) => m.id !== msgMenu.msgId) } : c))
    }
    snd.playCassette()
    showBanner(ERR.FRAME_BURNED)
    closeMenu()
  }

  const startEdit = () => {
    if (!menuMessage?.text) return
    setEditing({ loc: msgMenu!.loc, id: menuMessage.id })
    setComposer(menuMessage.text)
    setReplyTo(null)
    closeMenu()
  }

  const copyText = async () => {
    if (!menuMessage?.text) return
    try {
      await navigator.clipboard.writeText(menuMessage.text)
      showBanner(ERR.COPIED)
    } catch {
      showBanner('БУФЕР ЗАПАРЕН. СКОПИРУЙ РУКАМИ', 'red')
    }
    closeMenu()
  }

  // ── контекст композера ──
  const composerContext: ComposerContext = useMemo(() => {
    if (editing) {
      const msg =
        editing.loc === 'channel'
          ? channels.find((c) => c.id === channel)?.messages.find((m) => m.id === editing.id)
          : cassette?.messages.find((m) => m.id === editing.id)
      return { kind: 'edit', text: msg?.text ?? '...' }
    }
    if (replyTo) return { kind: 'reply', nick: replyTo.nick, text: replyTo.text }
    return null
  }, [editing, replyTo, channels, channel, cassette])

  const cancelContext = () => {
    if (editing) {
      setEditing(null)
      setComposer('')
    }
    setReplyTo(null)
  }

  // ── выход ──
  const logout = () => {
    setLogoutConfirm(false)
    closeMenu()
    transit(() => {
      setStack(['register'])
      setMe(structuredClone(initialMe))
      setChannels(structuredClone(initialChannels))
      setCassette(null)
      setInventory({ ...initialInventory })
      setGifts(structuredClone(initialGifts))
      setPhotos(Array.from({ length: 4 }, () => ({ src: null })))
      setAvatarImg(null)
      setChannel(1)
      setShopTarget(null)
      setViewingUser(null)
      setComposer('')
      setEditing(null)
      setReplyTo(null)
      setOlderBatches({})
      setSeenAt({ 1: Date.now(), 2: Date.now(), 3: Date.now(), 4: Date.now(), 5: Date.now() })
      // мем-эфир и модерация — тоже сброс
      setMemeHistory([])
      setMatchPopup(null)
      setIncomingReq(null)
      setExcluded([])
      setMuted([])
      setBanned([])
      incomingDoneRef.current = false
    })
  }

  // ── регистрация/вход ──
  const onAuth = (nick: string, gender: Gender) => {
    setMe({ ...structuredClone(initialMe), nick, gender, avatarSeed: 'me-' + nick.toLowerCase() })
    setStack(['first'])
    snd.playBeep()
  }

  // ── подгрузка старых кадров ──
  const onLoadOlder = () => {
    const batch = olderBatches[channel] ?? 0
    if (batch >= 2) return
    const older = makeOlderMessages(channel, batch)
    setChannels((cs) => cs.map((c) => (c.id === channel ? { ...c, messages: [...older, ...c.messages] } : c)))
    setOlderBatches((b) => ({ ...b, [channel]: batch + 1 }))
    snd.playClick()
    showBanner(ERR.OLD_FRAMES)
  }

  // ── рендер контента экрана ──
  const chatCompanion = cassette ? users.find((u) => u.id === cassette.userId) ?? null : null

  let content: React.ReactNode = null
  if (screen === 'register') {
    content = <RegistrationScreen onDone={onAuth} onBanner={showBanner} />
  } else if (screen === 'first') {
    content = <FirstLaunchScreen onDone={() => setStack(['memes'])} />
  } else if (screen === 'memes') {
    content = (
      <MemeFeedScreen
        me={me}
        users={users}
        feed={feed}
        swipeCount={memeHistory.length}
        matchHint={matchHint}
        matchPopup={matchPopup}
        incoming={incomingReq}
        onSwipe={onSwipe}
        onSendRequest={sendRequest}
        onSkipMatch={skipMatch}
        onAcceptIncoming={acceptIncoming}
        onDeclineIncoming={declineIncoming}
        onOpenProfile={openProfile}
      />
    )
  } else if (screen === 'channel') {
    const ch = channels.find((c) => c.id === channel)!
    content = (
      <ChannelScreen
        channel={ch}
        me={me}
        users={users}
        bannedIds={banned}
        online={online}
        canLoadOlder={(olderBatches[channel] ?? 0) < 2}
        value={composer}
        onValueChange={setComposer}
        context={composerContext}
        onCancelContext={cancelContext}
        onSend={sendFlood}
        onReact={(id, e) => react('channel', id, e)}
        onOpenProfile={openProfile}
        onMsgMenu={(id) => { setMsgMenu({ loc: 'channel', msgId: id }); setDeleting(false) }}
        onLoadOlder={onLoadOlder}
        onBanner={showBanner}
      />
    )
  } else if (screen === 'onair') {
    // забаненные — вне эфира (канал отключён)
    const onairUsers = users.filter((u) => !banned.includes(u.id))
    content = <OnAirScreen me={me} users={onairUsers} onOpenProfile={openProfile} />
  } else if (screen === 'profile') {
    content = (
      <OwnProfileScreen
        me={me}
        photos={photos}
        avatarImg={avatarImg}
        cassette={cassette}
        soundOn={soundOn}
        onEdit={(patch) => setMe((m) => ({ ...m, ...patch }))}
        onAvatarClick={() => openFile(-1)}
        onFrameAction={(i) => {
          if (photos[i]?.src) setFrameMenu(i)
          else openFile(i)
        }}
        onOpenChat={() => goPush('chat')}
        onLogout={() => setLogoutConfirm(true)}
        onBanner={showBanner}
      />
    )
  } else if (screen === 'other' && viewedUser) {
    const userGifts = gifts[viewedUser.id] ?? []
    content = (
      <OtherProfileScreen
        user={viewedUser}
        gifts={userGifts}
        photos={otherPhotos}
        canWrite={writeState.can}
        writeHint={writeState.hint}
        onWrite={() => write(viewedUser.id)}
        onGift={() => {
          setShopTarget(viewedUser)
          goRoot('shop')
        }}
        onBack={goBack}
        onFrameClick={(i) => {
          const src = otherPhotos[i]?.src
          if (src) setViewer({ src })
        }}
      />
    )
  } else if (screen === 'chat' && cassette && chatCompanion) {
    content = (
      <PrivateChatScreen
        cassette={cassette}
        me={me}
        companion={chatCompanion}
        online={online}
        locked={banned.includes(chatCompanion.id)}
        stickerCounts={inventory}
        value={composer}
        onValueChange={setComposer}
        context={composerContext}
        onCancelContext={cancelContext}
        onSend={sendChat}
        onReact={(id, e) => react('chat', id, e)}
        onMsgMenu={(id) => { setMsgMenu({ loc: 'chat', msgId: id }); setDeleting(false) }}
        onBanner={showBanner}
        onCassetteMenu={() => setCassetteMenu('menu')}
        onUseSticker={useSticker}
        onGift={() => {
          setShopTarget(chatCompanion)
          goRoot('shop')
        }}
      />
    )
  } else if (screen === 'shop') {
    content = (
      <ShopScreen
        coins={me.coins}
        inventory={inventory}
        giftTarget={shopTarget}
        onBuy={buy}
        onGift={gift}
        onUseStickerInChat={useStickerInChat}
        onBack={() => {
          setShopTarget(null)
          goRoot('channel')
        }}
      />
    )
  }

  // индикатор канала (правый верхний угол «экрана»)
  const indicator =
    screen === 'channel' ? (
      <div className="font-pixel glow-amber pointer-events-none absolute right-2.5 top-2 z-20 text-[10px] text-[#FFB000]" aria-hidden="true">
        CH {channel}
      </div>
    ) : null

  return (
    <div className="min-h-dvh" style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}>
      <TVShell
        channel={channel}
        screen={screen}
        online={online}
        soundOn={soundOn}
        unread={unread}
        onKnob={onKnob}
        onOnAir={() => { snd.playClick(); panelToggle('onair') }}
        onProfile={() => { snd.playClick(); panelToggle('profile') }}
        onShop={() => { snd.playClick(); panelToggle('shop') }}
        onAntenna={toggleAntenna}
        onSound={() => { snd.playClick(); setSoundOn((v) => !v) }}
        onMemes={() => { snd.playClick(); panelToggle('memes') }}
      >
        <div className={`crt-wrap h-full ${crtOff ? 'crt-off' : ''}`}>{content}</div>

        <SnowOverlay active={snow} />

        {/* CRT-оверлеи */}
        <div className="crt-overlays absolute inset-0 z-[26]" aria-hidden="true">
          <div className="crt-scanlines absolute inset-0" />
          <div className="crt-vignette absolute inset-0" />
          <div className="crt-flicker absolute inset-0" />
        </div>

        {indicator}

        {banner && <Banner text={banner.text} tone={banner.tone} />}

        {/* меню сообщения */}
        {menuMessage && msgMenu && (
          <Modal title={menuAuthor?.nick ?? '???' } onClose={closeMenu}>
            {deleting ? (
              <div className="flex flex-col gap-3">
                <p className="font-pixel text-center text-[8px] leading-relaxed text-[#FF4A4A]">СЖЕЧЬ КАДР? ОБРАТНО НЕ БУДЕТ</p>
                <div className="flex gap-2">
                  <PxButton variant="danger" className="flex-1" onClick={doDelete}>ДА</PxButton>
                  <PxButton variant="ghost" className="flex-1" onClick={() => setDeleting(false)}>НЕТ</PxButton>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <div>
                  <p className="font-pixel mb-1.5 text-[6px] text-[#5a4626]">РЕАКЦИЯ (ЛАЙК = +1 КОИН АВТОРУ):</p>
                  <div className="flex justify-between gap-1">
                    {REACTIONS.map((e) => (
                      <button
                        key={e}
                        onClick={() => { react(msgMenu.loc, menuMessage.id, e); closeMenu() }}
                        className="emoji-px flex-1 border-2 border-[#6b4a00] py-2 text-[13px] hover:border-[#FFB000]"
                        aria-label={`Реакция ${e}`}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  {menuMessage.authorId === ME_ID ? (
                    <>
                      {menuMessage.text && !menuMessage.media && !menuMessage.sticker && (
                        <PxButton className="w-full" onClick={startEdit}>✎ ИЗМЕНИТЬ (ТЕКСТ)</PxButton>
                      )}
                      <PxButton variant="danger" className="w-full" onClick={() => setDeleting(true)}>🗑 СЖЕЧЬ КАДР</PxButton>
                    </>
                  ) : (
                    <>
                      <PxButton variant="green" className="w-full" onClick={() => { setReplyTo({ loc: msgMenu.loc, nick: menuAuthor?.nick ?? '?', text: (menuMessage.text ?? '[КАДР]').slice(0, 50) }); closeMenu() }}>
                        ↩ ОТВЕТИТЬ
                      </PxButton>
                      {menuMessage.text && (
                        <PxButton variant="ghost" className="w-full" onClick={copyText}>⧉ СКОПИРОВАТЬ</PxButton>
                      )}
                    </>
                  )}
                  {menuMessage.authorId !== ME_ID && me.role === 'admin' && (
                    <div className="mt-1 border-t border-dashed border-[#3d3020] pt-2">
                      <p className="font-pixel mb-1.5 text-[5px] tracking-wide text-[#5a4626]">АДМИН-ПОЛНОМОЧИЯ ЭФИРА:</p>
                      <div className="flex flex-col gap-1.5">
                        <PxButton variant="danger" className="w-full" onClick={adminDelete}>🗑 УДАЛИТЬ КАДР (МОДЕРАЦИЯ)</PxButton>
                        <PxButton className="w-full" onClick={() => toggleMute(menuMessage.authorId)}>
                          {muted.includes(menuMessage.authorId) ? '🔊 СНЯТЬ МУТ' : '🔇 ЗАМУТИТЬ (10 МИН)'}
                        </PxButton>
                        <PxButton
                          variant={banned.includes(menuMessage.authorId) ? 'ghost' : 'danger'}
                          className="w-full"
                          onClick={() => banUser(menuMessage.authorId)}
                        >
                          {banned.includes(menuMessage.authorId) ? '⚪ РАЗБАНИТЬ' : '⛔ БАН. КАНАЛ OFF'}
                        </PxButton>
                      </div>
                    </div>
                  )}
                  <PxButton variant="ghost" className="w-full" onClick={closeMenu}>ОТМЕНА</PxButton>
                </div>
              </div>
            )}
          </Modal>
        )}

        {/* просмотр кадра */}
        {viewer && (
          <Modal title="КАДР" onClose={() => setViewer(null)}>
            <div className="flex flex-col items-center gap-2">
              {viewer.src.startsWith('pixel:') ? (
                <PixelAvatar seed={viewer.src.slice(6)} size={180} />
              ) : (
                 
                <img src={viewer.src} alt="Кадр" className="max-h-64 w-auto border-2 border-[#6b4a00]" style={{ imageRendering: 'pixelated' }} />
              )}
              <PxButton variant="ghost" onClick={() => setViewer(null)}>ЗАКРЫТЬ</PxButton>
            </div>
          </Modal>
        )}

        {/* меню кадра плёнки */}
        {frameMenu !== null && (
          <Modal title={`КАДР ${frameMenu + 1}`} onClose={() => setFrameMenu(null)}>
            <div className="flex flex-col gap-1.5">
              <PxButton className="w-full" onClick={() => { setViewer({ src: photos[frameMenu].src! }); setFrameMenu(null) }}>👁 ПРОСМОТРЕТЬ</PxButton>
              <PxButton variant="green" className="w-full" onClick={() => { setAvatarImg(photos[frameMenu].src!); setFrameMenu(null); showBanner('АВАТАР ОБНОВЛЕН') }}>★ СДЕЛАТЬ АВАТАРКОЙ</PxButton>
              <PxButton variant="danger" className="w-full" onClick={() => { setPhotos((ps) => ps.map((p, i) => (i === frameMenu ? { src: null } : p))); setFrameMenu(null); snd.playCassette(); showBanner(ERR.FRAME_BURNED) }}>🔥 СЖЕЧЬ КАДР</PxButton>
              <PxButton variant="ghost" className="w-full" onClick={() => setFrameMenu(null)}>ОТМЕНА</PxButton>
            </div>
          </Modal>
        )}

        {/* меню кассеты */}
        {cassetteMenu && (
          <Modal title="КАССЕТА" onClose={() => setCassetteMenu(null)}>
            {cassetteMenu === 'menu' ? (
              <div className="flex flex-col gap-1.5">
                <p className="font-pixel text-center text-[7px] leading-relaxed text-[#8a6f3f]">
                  {me.nick.slice(0, 8)} × {chatCompanion?.nick.slice(0, 8)}
                </p>
                <PxButton variant="danger" className="w-full" onClick={() => setCassetteMenu('confirm')}>📼 ВЫТАЩИТЬ КАССЕТУ</PxButton>
                <PxButton variant="ghost" className="w-full" onClick={() => setCassetteMenu(null)}>ОТМЕНА</PxButton>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <p className="font-pixel text-center text-[8px] leading-relaxed text-[#FF4A4A]">ВЫТАЩИТЬ КАССЕТУ? ПЛЁНКА СМОТАЕТСЯ. ИСТОРИЯ СГОРИТ У ОБОИХ.</p>
                <div className="flex gap-2">
                  <PxButton variant="danger" className="flex-1" onClick={removeCassette}>ДА</PxButton>
                  <PxButton variant="ghost" className="flex-1" onClick={() => setCassetteMenu(null)}>НЕТ</PxButton>
                </div>
              </div>
            )}
          </Modal>
        )}

        {/* подтверждение выхода */}
        {logoutConfirm && (
          <Modal title="ВЫХОД" onClose={() => setLogoutConfirm(false)}>
            <div className="flex flex-col gap-3">
              <p className="font-pixel text-center text-[8px] leading-relaxed text-[#e8d9b0]">ВАЛИТЬ ИЗ ЭФИРА? СЕССИЯ СГОРИТ, ТЕЛЕВИЗОР ЗАБЫВЕТ ТЕБЯ.</p>
              <div className="flex gap-2">
                <PxButton variant="danger" className="flex-1" onClick={logout}>ДА, ВАЛИТЬ</PxButton>
                <PxButton variant="ghost" className="flex-1" onClick={() => setLogoutConfirm(false)}>ОСТАТЬСЯ</PxButton>
              </div>
            </div>
          </Modal>
        )}

        {/* скрытый инпут файлов профиля */}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { onFile(e.target.files?.[0]); e.currentTarget.value = '' }} />
      </TVShell>
    </div>
  )
}

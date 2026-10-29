// ─────────────────────────────────────────────────────────────
// Stage 1 — чистый мокап. Никакой регистрации, мэтчинга и сервера.
// ─────────────────────────────────────────────────────────────

export type S1Screen = 'feed' | 'viewers' | 'profile' | 'shop' | 'channel' | 'cassette'

export interface S1Account {
  nick: string
  gender: 'М' | 'Ж'
  age: number
  passwordHash: string
}

export interface S1User {
  id: string
  nick: string
  seed: string
  gender: 'М' | 'Ж'
  age?: number
  online: boolean
  status: string
  orientation?: string
  about?: string
  interests?: string[]
}

export interface S1Match {
  id: string
  userId: string
  nick: string
  seed: string
  common: number
}

export interface S1Meme {
  id: string
  emoji: string
  caption: string
  tag: string
  accent: string
  src?: string
  /** кадр экспортирован из кассеты в МЭМ-ЭФИР */
  exported?: boolean
}

/** мэтч из списка «МОИ МЭТЧИ»: found — вкусы совпали, sent — заявка ушла, accepted — кассета на полке */
export interface S1MyMatch {
  userId: string
  nick: string
  seed: string
  common: number
  status: 'found' | 'sent' | 'accepted'
}

export const ME: S1User = {
  id: 'me',
  nick: 'ЖОПА',
  seed: 'zhopa',
  gender: 'М',
  age: 27,
  online: true,
  status: 'смотрит мем-эфир',
}

export const VIEWERS: S1User[] = [
  { id: 'u1', nick: 'КАСС_КРОТ', seed: 'krot-7', gender: 'Ж', age: 24, online: true, status: 'болтает в личке',
    orientation: 'би', about: 'СОБИРАЮ КАССЕТЫ, СМОТРЮ ЭЛТ И ВЕРЮ В ПЕЛЬМЕНИ. ИЩУ ТОГО, КТО ПОЙМЁТ ШУМ ПОМЕХ.', interests: ['ЭЛТ', 'КАССЕТЫ', 'ПЕЛЬМЕНИ', 'ПИКСЕЛЬ-АРТ', 'НОЧНЫЕ ЭФИРЫ'] },
  { id: 'u2', nick: 'ДЯДЯ_ВОВАН', seed: 'vovan-1', gender: 'М', age: 52, online: true, status: 'чинит телевизор' },
  { id: 'u3', nick: 'ЛЮБА_90Х', seed: 'luba-3', gender: 'Ж', age: 28, online: true, status: 'слушает винил',
    orientation: 'гетеро', about: 'СЛУШАЮ ВИНИЛ, СОБИРАЮ КАССЕТЫ И ЗАПИСЫВАЮ ЭФИРЫ НА МАГНИТОФОН.', interests: ['ВИНИЛ', '90-Е', 'КАССЕТЫ', 'ФОТОГРАФИЯ'] },
  { id: 'u4', nick: 'ГОСТЬ_С_КУХНИ', seed: 'gost-2', gender: 'М', age: 33, online: false, status: 'выпал из эфира' },
  { id: 'u5', nick: 'ПИКСЕЛЬНАЯ_ДАША', seed: 'dasha-9', gender: 'Ж', age: 19, online: true, status: 'рисует стикеры',
    orientation: 'би', about: 'РИСУЮ СТИКЕРЫ И ЖАБ. ВЕРЮ, ЧТО ПИКСЕЛЬ — ЭТО НЕ УСТАРЕЛО, А СТИЛЬ.', interests: ['ПИКСЕЛЬ-АРТ', 'СТИКЕРЫ', 'ЖАБЫ', 'МЕМЫ'] },
  { id: 'u6', nick: 'МАТРИЧНЫЙ_ПРИНТЕР', seed: 'printer-4', gender: 'М', age: 40, online: false, status: 'печатает' },
  { id: 'u7', nick: 'ВАСЯ_С_БАЛКОНА', seed: 'vasya-5', gender: 'М', age: 40, online: true, status: 'на балконе' },
  { id: 'u8', nick: 'ШУМ_И_ПОМЕХИ', seed: 'noise-8', gender: 'М', age: 30, online: false, status: 'выпал из эфира' },
]

export const MEMES: S1Meme[] = [
  { id: 'm1', emoji: '📼', caption: 'КОГДА НАШЁЛ КАССЕТУ С ЗАПИСЬЮ 1998 ГОДА', tag: 'НОСТАЛЬГИЯ', accent: '#FFB000' },
  { id: 'm2', emoji: '🐸', caption: 'ЖАБА ИЗ 8 БИТ СМОТРИТ НА ТЕБЯ КАК НА ПРЕДАТЕЛЯ', tag: 'ПИКСЕЛИ', accent: '#33FF00' },
  { id: 'm3', emoji: '🥟', caption: 'ПЕЛЬМЕНИ ВАРЯТСЯ 7 МИНУТ. СПОР ЗАКРЫТ', tag: 'КУХНЯ', accent: '#FFB000' },
  { id: 'm4', emoji: '📺', caption: 'ТЕЛЕВИЗОР САМ ВКЛЮЧИЛСЯ В 3:00. ТАК И НАДО', tag: 'ЭЛТ', accent: '#00FFFF' },
  { id: 'm5', emoji: '🧠', caption: 'МОЗГ ПОСЛЕ ТРЕТЬЕГО ЧАСА МЕМОВ', tag: 'СОСТОЯНИЕ', accent: '#FF00FF' },
  { id: 'm6', emoji: '🧻', caption: 'ОТНОШЕНИЯ С ТУАЛЕТНОЙ БУМАГОЙ СЕРЬЁЗНЕЕ', tag: 'ЖИЗА', accent: '#FFB000' },
  { id: 'm7', emoji: '🛸', caption: 'ПРИШЕЛЬЦЫ ПРИЛЕТЕЛИ НА КАНАЛ 5 И ОСТАЛИСЬ', tag: 'СИГНАЛ', accent: '#33FF00' },
  { id: 'm8', emoji: '🪩', caption: 'ДИСКОТЕКА В ПОДЪЕЗДЕ. ВХОД ПО ПАМЯТИ', tag: 'ДВОР', accent: '#FF00FF' },
  { id: 'm9', emoji: '🍜', caption: 'ДОШИРАК В 3:00 — ЭТО ЗАВТРАК', tag: 'КУХНЯ', accent: '#FFB000' },
  { id: 'm10', emoji: '🧦', caption: 'НОСКИ НАШЛИСЬ В ХОЛОДИЛЬНИКЕ', tag: 'ЖИЗА', accent: '#33FF00' },
  { id: 'm11', emoji: '🐟', caption: 'РЫБА СМОТРИТ НА ТЕБЯ КАК НА ПЛАН', tag: 'АКВАРИУМ', accent: '#00FFFF' },
  { id: 'm12', emoji: '📟', caption: 'ПЕЙДЖЕР ПИКНУЛ. ЭТО 2003', tag: 'НОСТАЛЬГИЯ', accent: '#FF00FF' },
  { id: 'm13', emoji: '🎛', caption: 'КРУТИЛКА ГРОМЧЕ, ЧЕМ ЖИЗНЬ', tag: 'ЗВУК', accent: '#FFB000' },
  { id: 'm14', emoji: '🧊', caption: 'ЛЁД В МОРОЗИЛКЕ. ТАК И ДОЛЖНО БЫТЬ', tag: 'ХОЛОД', accent: '#00FFFF' },
  { id: 'm15', emoji: '🕹', caption: 'УРОВЕНЬ ПРОЙДЕН, А СМЫСЛ НЕТ', tag: 'ИГРЫ', accent: '#33FF00' },
  { id: 'm16', emoji: '🪑', caption: 'СТУЛ СЛОМАЛСЯ, НО ТЫ СИДИШЬ', tag: 'ДВОР', accent: '#FFB000' },
  { id: 'm17', emoji: '📡', caption: 'СИГНАЛ ЕСТЬ, НО НЕ ТОТ', tag: 'СИГНАЛ', accent: '#FF00FF' },
  { id: 'm18', emoji: '🧄', caption: 'ЧЕСНОК — ЭТО ПРИПРАВА И ОРУЖИЕ', tag: 'КУХНЯ', accent: '#33FF00' },
  { id: 'm19', emoji: '🪞', caption: 'ЗЕРКАЛО ПОКАЗАЛО УСТАЛОГО ЧЕЛОВЕКА', tag: 'СОСТОЯНИЕ', accent: '#00FFFF' },
  { id: 'm20', emoji: '🛒', caption: 'ПРИШЁЛ ЗА ХЛЕБОМ, УШЁЛ С ТЕЛЕВИЗОРОМ', tag: 'БЫТ', accent: '#FFB000' },
]

export const CASSETTES: S1Cassette[] = [
  { id: 'c1', userId: 'u1', nick: 'КАСС_КРОТ', seed: 'krot-7', last: 'КАССЕТА ЗАБРОНИРОВАНА. НЕ ЗАБУДЬ БАНКУ', time: '14:02' },
  { id: 'c2', userId: 'u5', nick: 'ПИКСЕЛЬНАЯ_ДАША', seed: 'dasha-9', last: 'СТИКЕРЫ НОВЫЕ, БЕРИ ПОКА ДЕШЁВЫЕ', time: '12:41' },
  { id: 'c3', userId: 'u3', nick: 'ЛЮБА_90Х', seed: 'luba-3', last: 'ВИНИЛ НАШЁЛСЯ. ПРИХОДИ СЛУШАТЬ', time: '11:18' },
]

export const MATCHES: S1Match[] = [
  { id: 'm1', userId: 'u1', nick: 'КАСС_КРОТ', seed: 'krot-7', common: 16 },
  { id: 'm2', userId: 'u3', nick: 'ЛЮБА_90Х', seed: 'luba-3', common: 15 },
  { id: 'm3', userId: 'u5', nick: 'ПИКСЕЛЬНАЯ_ДАША', seed: 'dasha-9', common: 15 },
  { id: 'm4', userId: 'u2', nick: 'ДЯДЯ_ВОВАН', seed: 'vovan-1', common: 14 },
  { id: 'm5', userId: 'u7', nick: 'ВАСЯ_С_БАЛКОНА', seed: 'vasya-5', common: 13 },
]

export const REQUESTS: S1Request[] = [
  { id: 'r1', userId: 'u4', nick: 'ГОСТЬ_С_КУХНИ', seed: 'gost-2', common: 15, seen: true },
  { id: 'r2', userId: 'u7', nick: 'ВАСЯ_С_БАЛКОНА', seed: 'vasya-5', common: 16, seen: true },
]

export const LIVE_MESSAGES = [
  { id: 'l1', userId: 'u2', nick: 'ДЯДЯ_ВОВАН', seed: 'vovan-1', text: 'ПОСТАВИЛ ТЕЛЕВИЗОР НА БАЛКОН. СОСЕДИ СНИЗУ ЗАВИДУЮТ.', time: '13:02' },
  { id: 'l2', userId: 'u3', nick: 'ЛЮБА_90Х', seed: 'luba-3', text: 'ПРИШЛА С РАБОТЫ. ХОЛОДИЛЬНИК ГУДИТ, ТЕЛЕВИЗОР ШУМИТ.', time: '13:07' },
  { id: 'l3', userId: 'u6', nick: 'МАТРИЧНЫЙ_ПРИНТЕР', seed: 'printer-4', text: 'ПЕЧАТАЮ АНЕКДОТ ДНЯ: ЭЛТ ТАКОЙ ТЯЖЁЛЫЙ, ЧТО ЕГО НОСИЛИ ВТРОЁМ.', time: '13:11' },
  { id: 'l4', userId: 'u5', nick: 'ПИКСЕЛЬНАЯ_ДАША', seed: 'dasha-9', text: 'НАРИСОВАЛА ПИКСЕЛЬНУЮ ЖАБУ С УСАМИ. КОМУ ПОКАЗАТЬ?', time: '13:16' },
  { id: 'l5', userId: 'u1', nick: 'КАСС_КРОТ', seed: 'krot-7', text: 'КТО ХОЧЕТ ЛИЧНУЮ КАССЕТУ — ПИШИТЕ В ПРОФИЛЬ.', time: '13:20' },
]

export interface S1Cassette {
  id: string
  userId: string
  nick: string
  seed: string
  last: string
  time: string
}

export interface S1Request {
  id: string
  userId: string
  nick: string
  seed: string
  common: number
  /** заявку уже видели в профиле (гасит бейдж «НОВОЕ») */
  seen?: boolean
}

export interface S1ChatMessage {
  id: string
  from: 'me' | 'them'
  text: string
  time: string
  /** вид кадра: обычный текст / купленный стикер / подарок */
  kind?: 'text' | 'sticker' | 'gift'
  /** крупный эмодзи для стикера или подарка */
  emoji?: string
}

export const CASSETTE_MESSAGES: Record<string, S1ChatMessage[]> = {
  u1: [
    { id: 'u1-1', from: 'them', text: 'ПРИВЕТ. ТЫ ТОЖЕ УГОРАЕШЬ С ЭЛТ?', time: '13:41' },
    { id: 'u1-2', from: 'me', text: 'ДА. У МЕНЯ ДОМА РУБИН-2094. ОН ЕЩЁ РАБОТАЕТ.', time: '13:42' },
    { id: 'u1-3', from: 'them', text: 'ЭТО СУДЬБА. КАКУЮ КАССЕТУ СЛУШАЕШЬ?', time: '13:44' },
    { id: 'u1-4', from: 'me', text: 'СЕЙЧАС — ЗАПИСЬ ДОЖДЯ С БАЛКОНА. ОЧЕНЬ УСПОКАИВАЕТ.', time: '13:45' },
    { id: 'u1-5', from: 'them', text: 'ПРИШЛИ, ЕСЛИ НЕ ЖАЛКО. У МЕНЯ ЕСТЬ ПЛЁНКА С ГРОЗОЙ.', time: '13:47' },
  ],
  u3: [
    { id: 'u3-1', from: 'them', text: 'ПРИВЕТ. ТВОЙ ПРОФИЛЬ ВЫГЛЯДИТ КАК АФИША КОНЦЕРТА.', time: '12:10' },
    { id: 'u3-2', from: 'me', text: 'ЭТО КОМПЛИМЕНТ?', time: '12:11' },
    { id: 'u3-3', from: 'them', text: 'ДА. У МЕНЯ ВИНИЛ, КАССЕТЫ И НИЧЕГО СОВРЕМЕННОГО.', time: '12:12' },
    { id: 'u3-4', from: 'me', text: 'ТОГДА МЫ ПОЙМЁМ ДРУГ ДРУГА.', time: '12:14' },
  ],
  u5: [
    { id: 'u5-1', from: 'them', text: 'ПРИВЕТ! Я НАРИСОВАЛА ТЕБЯ В ПИКСЕЛЯХ. НЕ СПРАШИВАЙ ЗАЧЕМ.', time: '11:02' },
    { id: 'u5-2', from: 'me', text: 'ПОКАЖЕШЬ?', time: '11:03' },
    { id: 'u5-3', from: 'them', text: 'ТОЛЬКО ЕСЛИ ОБЕЩАЕШЬ НЕ СМЕЯТЬСЯ. ЖАБА ПОЛУЧИЛАСЬ ЛУЧШЕ.', time: '11:04' },
  ],
  u2: [
    { id: 'u2-1', from: 'them', text: 'ЗДОРОВО. ТЁТЯ ЗИНА ПЕРЕДАВАЛА СГУЩЁНКУ.', time: '10:20' },
    { id: 'u2-2', from: 'me', text: 'СПАСИБО. ПРИХОДИ СМОТРЕТЬ ФУТБОЛ.', time: '10:22' },
    { id: 'u2-3', from: 'them', text: 'У МЕНЯ ТЕЛЕВИЗОР НЕ ЛОВИТ. НО Я ПРИДУ.', time: '10:23' },
  ],
}


// ── авто-ответы кассеты (мокап «собеседник живёт») ───────────

export const REPLIES: Record<string, string[]> = {
  u1: [
    'ЗАПИСАЛА. ГРОЗА — ЭТО ЛУЧШИЙ ПОДКАСТ.',
    'У МЕНЯ МАГНИТОФОН «ВЕСНА». ТАКЖЕ ШУМИТ, РОДНОЙ.',
    'СГОНИ ДО МАГАЗИНА, ТАМ КАССЕТЫ Б/У ОТДАЮТ.',
    'СЕГОДНЯ В 22:00 — НОЧНОЙ ЭФИР. БУДЬ.',
    'ПЕРЕМОТАЛА ТРИ РАЗА. ПЛЁНКА ЖИВАЯ.',
  ],
  u2: [
    'ТЁТЯ ЗИНА ЕЩЁ ОДНУ СГУЩЁНКУ ПЕРЕДАЛА.',
    'ТЕЛЕВИЗОР ПОСТАВИЛ НА ХОЛОДИЛЬНИК. ЗВУК ЛУЧШЕ.',
    'ФУТБОЛ СМОТРИМ В СУББОТУ. БЕРИ ПЕЛЬМЕНИ.',
    'У МЕНЯ АНТЕННА НА БАЛКОНЕ ИЗ ЗОНТА. ЛОВИТ.',
  ],
  u3: [
    'ВИНИЛ ЗАПИСАЛ ДЛЯ ТЕБЯ. ЗАБИРАЙ.',
    'МАГНИТОФОН СНИМАЛА НА ПЛЁНКУ. ПОКАЖУ ПОТОМ.',
    'ЗАПИСЬ ГРОЗЫ МЕНЯЮ НА ТВОЙ ДОЖДЬ. ГОТОВО.',
    'СЛУШАЕМ СТОРОН Б. ТАМ ШУМ ИЗ ДОМА.',
  ],
  u5: [
    'НАРИСОВАЛА ТЕБЯ ЕЩЁ РАЗ. ТЕПЕРЬ В ШАПКЕ.',
    'СТИКЕР С ЖАБОЙ ГОТОВ. ЗАБИРАЙ В ЛАВКЕ.',
    'ПИКСЕЛИ ПО КАНАЛУ 5 БЕГУТ. УСПЕЙ СКОПИРОВАТЬ.',
    'РИСУЮ НОЧЬЮ. ДНЁМ ПИКСЕЛИ СПЯТ.',
  ],
}

// ── отклики эфира на мой кадр в канале 1 (@ответ) ────────────

export const REPLY_ACKS = [
  'ЭТО В ТОЧКУ. ПОДПИСЫВАЮСЬ.',
  'ЗАПИСАЛ. СОСЕДЯМ ПЕРЕСКАЖУ.',
  'ЭФИР СОГЛАСЕН. КАДР ЧИСТЫЙ.',
  'ВОТ ЭТО Я ПОНЯЛ. ПЕЧАТАЮ ДАЛЬШЕ.',
  'ПЕРЕДАЛ БАЛКОНУ. БАЛКОН ОДОБРЯЕТ.',
  'ЛОВЛЮ ЭТО НА ПЛЁНКУ. ДОРОГОЙ КАДР.',
]

export const GENERIC_REPLIES = [
  'ПРИНЯЛ. ЗАПИСЫВАЮ НА ПЛЁНКУ.',
  'ХА, В ТОЧКУ. ЭФИР ТОГО СТОИТ.',
  'ПЕРЕМОТАЮ И ОТВЕЧУ.',
  'ШУМ СЕГОДНЯ ЧИСТЫЙ. ХОРОШИЙ ДЕНЬ.',
  'ДЕРЖИ В КУРСЕ. КАССЕТА ЗАРЯЖЕНА.',
]

// ── живой эфир канала 1 (мокап: подкидываем кадры) ───────────

export const LIVE_INCOMING: { userId: string; text: string }[] = [
  { userId: 'u2', text: 'СОСЕДЬЯ ПОПРОСИЛИ ГРОМЧЕ. НЕ ОЖИДАЛ.' },
  { userId: 'u5', text: 'ПРОДАЮ СТИКЕРЫ ЗА МЕМ-КОИНЫ. ЛАВКА ЖДЁТ.' },
  { userId: 'u3', text: 'КТО НА ЗАПИСИ ГРОЗЫ? ОБМЕНЯЮСЬ.' },
  { userId: 'u6', text: 'ПЕЧАТАЮ ОТВЕТ. ЖДИТЕ. МЕДЛЕННО.' },
  { userId: 'u1', text: 'КАССЕТЫ Б/У ОТДАЮТ У ДК. Я УЖЕ ТАМ.' },
  { userId: 'u7', text: 'С БАЛКОНА ВИДНО, ЧТО У ВСЕХ РАБОТАЕТ ТВ.' },
  { userId: 'u5', text: 'НАРИСОВАЛА НИК КОГО-ТО ИЗ ЭФИРА. УГАДАЙТЕ.' },
  { userId: 'u2', text: 'ПЕЛЬМЕНИ ГОТОВЫ. ЭФИР ПОДОЖДЁТ.' },
  { userId: 'u1', text: 'НОЧНОЙ ЭФИР В 22:00. ТЕМА: ШУМ И ЕГО СМЫСЛ.' },
  { userId: 'u3', text: 'ВИНИЛ КАПНУЛ. ЗИМА БЛИЗКО.' },
  { userId: 'u7', text: 'КРУТИЛКУ ЗАЕЛО НА 3-М. ЖИВУ ТЕПЕРЬ ТАМ.' },
  { userId: 'u6', text: 'ГОТОВО. РАСПЕЧАТАЛ. ПРИЖМИ МАГНИТОМ.' },
]

// ── ЛАВКА: витрина мокапа (стикеры многоразовые, подарки одноразовые) ──

export interface S1ShopItem {
  id: string
  kind: 'sticker' | 'gift'
  emoji: string
  name: string
  desc: string
  price: number
  rare?: boolean
}

export const SHOP_ITEMS: S1ShopItem[] = [
  { id: 's1', kind: 'sticker', emoji: '🐸', name: 'ЖАБА_УСАТАЯ', desc: 'СМОТРИТ ОСОЗИНАННО. КЛАССИКА ЭФИРА.', price: 5 },
  { id: 's2', kind: 'sticker', emoji: '📼', name: 'КАССЕТА_ДНЯ', desc: 'ЗАПИСЬ ЧЕГО-ТО ВАЖНОГО. СЛУШАЙ САМ.', price: 7 },
  { id: 's3', kind: 'sticker', emoji: '📺', name: 'ЭЛТ_ГУДИТ', desc: 'ГУЛ 50 ГЦ. УСПОКАИВАЕТ ВСЕХ.', price: 6 },
  { id: 's4', kind: 'sticker', emoji: '🥟', name: 'ПЕЛЬМЕНЬ_МУДРОСТИ', desc: 'ОТВЕЧАЕТ НА СЛОЖНЫЕ ВОПРОСЫ. ИНОГДА.', price: 8 },
  { id: 's5', kind: 'sticker', emoji: '👾', name: 'ПИКСЕЛЬ_ДЕМОН', desc: '8-БИТНЫЙ. ГРЕЗИТ О КАНАЛЕ 5.', price: 9, rare: true },
  { id: 's6', kind: 'sticker', emoji: '🧻', name: 'СМЕНЫ_НЕТ', desc: 'ЖИЗА. БЕЗ КОММЕНТАРИЕВ.', price: 4 },
  { id: 's7', kind: 'sticker', emoji: '🛸', name: 'ТАРЕЛКА_5', desc: 'ПРИЛЕТЕЛА И ОСТАЛАСЬ. КАК ВСЕ.', price: 10 },
  { id: 's8', kind: 'sticker', emoji: '🕹', name: 'УРОВЕНЬ_ПРОЙДЕН', desc: 'А ЧТО ДАЛЬШЕ — НИКТО НЕ ЗНАЕТ.', price: 12, rare: true },
  { id: 'g1', kind: 'gift', emoji: '🌹', name: 'РОЗА_ПЛАСТИКОВАЯ', desc: 'ВЕЧНАЯ. КАК ШУМ НА 3-М КАНАЛЕ.', price: 15 },
  { id: 'g2', kind: 'gift', emoji: '🍫', name: 'ШОКОАД_«АЛЁША»', desc: 'ИЗ ЛАРЬКА. ВКУС 1994 ГОДА.', price: 12 },
  { id: 'g3', kind: 'gift', emoji: '🎧', name: 'НАУШНИКИ_ОДНО', desc: 'ОДИН НАУШНИК. ВТОРОЙ — СИМВОЛ ДОВЕРИЯ.', price: 18, rare: true },
  { id: 'g4', kind: 'gift', emoji: '⭐', name: 'ЗВЕЗДА_С_БАЛКОНА', desc: 'СОРВАНА ВАСЕЙ. НЕ СПРАШИВАЙ КАК.', price: 25 },
  { id: 'g5', kind: 'gift', emoji: '📻', name: 'РАДИОТОЧКА', desc: 'ГРОМЧЕ ЦЕНТРАЛЬНОГО. СНИМАЙСЯ С УЧЁТА.', price: 30 },
  { id: 'g6', kind: 'gift', emoji: '🏆', name: 'КУБОК_ЭЛТ', desc: 'ЗА ВКЛАД В ПИКСЕЛЬНОЕ ИСКУССТВО.', price: 40, rare: true },
]

export const START_COINS = 42

// ── живые статусы зрителей (гуляют каждые ~18с) ──────────────

export const LIVE_STATUSES = [
  'перематывает плёнку',
  'смотрит мем-эфир',
  'болтает в личке',
  'греет пельмени',
  'чинит антенну',
  'слушает шум 3-го канала',
  'рисует стикеры',
  'записывает грозу',
  'крутит крутилку',
  'ждёт ночной эфир',
]

export const STATUS_MAX = 40
export const ABOUT_MAX = 200

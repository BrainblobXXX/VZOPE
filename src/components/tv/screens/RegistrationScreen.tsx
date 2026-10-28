'use client'

import { useState } from 'react'
import { ERR, mockUsers, type Gender } from '@/lib/tv/data'
import { playClick, playError, playSend } from '@/lib/tv/sounds'
import { PxButton } from '../ui'

export default function RegistrationScreen({
  onDone,
  onBanner,
}: {
  onDone: (nick: string, gender: Gender) => void
  onBanner: (text: string) => void
}) {
  const [tab, setTab] = useState<'login' | 'register'>('register')
  const [login, setLogin] = useState('')
  const [pass, setPass] = useState('')
  const [gender, setGender] = useState<Gender>('M')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')

  const fail = (text: string) => {
    setError(text)
    playError()
  }

  const submit = () => {
    playClick()
    setError('')
    if (!login.trim() || !pass.trim()) return fail(ERR.EMPTY)
    if (login.trim().length < 3 || pass.length < 6) return fail(ERR.SHORT)
    const exists = mockUsers.some((u) => u.nick === login.trim().toUpperCase()) || login.trim().toUpperCase() === 'ТЕЛЕПУЗИК'
    if (tab === 'register' && exists) return fail(ERR.NICK_TAKEN)
    playSend()
    onDone(login.trim().toUpperCase(), gender)
  }

  return (
    <div className="pixel-scroll flex h-full flex-col overflow-y-auto px-4 py-4">
      <header className="mb-4 text-center">
        <h1 className="chroma font-pixel text-[22px] text-[#FFB000]">В ЖОПЕ</h1>
        <p className="font-pixel mt-2 text-[7px] leading-relaxed text-[#8a6f3f]">
          ЭФИР 2094 · ПОДКЛЮЧЕНИЕ К АНАЛОГОВОЙ СЕТИ
        </p>
      </header>

      {/* табы */}
      <div className="mb-4 flex" role="tablist" aria-label="Вход или регистрация">
        {(['register', 'login'] as const).map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => {
              playClick()
              setTab(t)
              setError('')
            }}
            className={`font-pixel flex-1 border-2 px-2 py-2 text-[8px] ${
              tab === t
                ? 'border-[#FFB000] bg-[#FFB000] text-[#1a0f05]'
                : 'border-[#6b4a00] text-[#8a6f3f]'
            }`}
          >
            {t === 'register' ? 'РЕГИСТРАЦИЯ' : 'ВХОД'}
          </button>
        ))}
      </div>

      <form
        className="flex flex-1 flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          submit()
        }}
      >
        <label className="block">
          <span className="font-pixel mb-1 block text-[7px] text-[#8a6f3f]">ЛОГИН (3–16, БЕЗ ПРОБЕЛОВ)</span>
          <input
            value={login}
            onChange={(e) => setLogin(e.target.value.replace(/\s/g, '').slice(0, 16))}
            className="font-pixel px-input w-full px-2 py-2.5 text-[9px]"
            placeholder="ВАШ_НИК"
            autoComplete="off"
            maxLength={16}
          />
        </label>

        <label className="block">
          <span className="font-pixel mb-1 block text-[7px] text-[#8a6f3f]">ПАРОЛЬ (ОТ 6 СИМВОЛОВ)</span>
          <div className="relative">
            <input
              value={pass}
              onChange={(e) => setPass(e.target.value.slice(0, 32))}
              type={showPass ? 'text' : 'password'}
              className="font-pixel px-input w-full px-2 py-2.5 pr-9 text-[9px]"
              placeholder="••••••"
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="font-pixel absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-[#8a6f3f] hover:text-[#FFB000]"
              aria-label={showPass ? 'Скрыть пароль' : 'Показать пароль'}
            >
              {showPass ? '🙈' : '👁'}
            </button>
          </div>
        </label>

        {tab === 'register' && (
          <fieldset className="block">
            <legend className="font-pixel mb-1 text-[7px] text-[#8a6f3f]">ПОЛ (ПОТОМ НЕ МЕНЯЕТСЯ)</legend>
            <div className="flex gap-2">
              {([['M', 'ПАЦАН'], ['F', 'ДЕВКА']] as const).map(([g, label]) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => {
                    playClick()
                    setGender(g)
                  }}
                  className={`font-pixel flex-1 border-2 px-2 py-2.5 text-[8px] ${
                    gender === g
                      ? 'border-[#33FF00] bg-[#33FF00]/10 text-[#33FF00]'
                      : 'border-[#6b4a00] text-[#8a6f3f]'
                  }`}
                  aria-pressed={gender === g}
                >
                  {gender === g ? '◉' : '○'} {label}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {/* ошибка */}
        {error && (
          <p className="font-pixel border-2 border-[#FF4A4A] bg-[#FF4A4A]/5 px-2 py-2 text-[7px] leading-relaxed text-[#FF4A4A]" role="alert">
            {error}
          </p>
        )}

        <div className="mt-auto">
          <PxButton type="submit" className="w-full !py-3 text-center">
            {tab === 'register' ? 'ЗАРЕГИСТРИРОВАТЬСЯ' : 'ВОЙТИ В ЭФИР'}
          </PxButton>
          <p className="font-pixel mt-3 text-center text-[6px] leading-relaxed text-[#5a4626]">
            БЕЗ EMAIL, БЕЗ КАПЧИ, БЕЗ СОЦСЕТЕЙ.
            <br />
            КАК НАСТРОЙКА СТАРОГО ВИДЕОПЛЕЕРА.
          </p>
        </div>
      </form>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { PxButton } from '../tv/ui'
import { playClick, playError, playSend } from '../../lib/tv/sounds'

type Tab = 'register' | 'login'
type Gender = 'М' | 'Ж'

export default function Stage1Auth({
  onRegister,
  onLogin,
}: {
  onRegister: (nick: string, gender: Gender, age: number, password: string) => Promise<string | null>
  onLogin: (nick: string, password: string) => Promise<string | null>
}) {
  const [tab, setTab] = useState<Tab>('register')
  const [nick, setNick] = useState('')
  const [password, setPassword] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState<Gender>('М')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fail = (text: string) => {
    setError(text)
    playError()
    setSubmitting(false)
  }

  const submit = async () => {
    if (submitting) return
    setError('')
    const login = nick.trim().toUpperCase()

    if (!login || !password || (tab === 'register' && !age)) {
      fail('НЕ ЛЕЗЕТ. ЗАПОЛНИ ВСЁ')
      return
    }
    if (login.length < 3 || login.length > 16 || !/^[A-ZА-ЯЁ0-9]+$/.test(login)) {
      fail('ЛОГИН: 3–16 СИМВОЛОВ, БУКВЫ И ЦИФРЫ, БЕЗ ПРОБЕЛОВ')
      return
    }
    if (password.length < 6) {
      fail('ПАРОЛЬ — МИНИМУМ 6 СИМВОЛОВ')
      return
    }

    const ageValue = Number(age)
    if (tab === 'register' && (!Number.isInteger(ageValue) || ageValue < 18 || ageValue > 99)) {
      fail('ВОЗРАСТ — ЦЕЛОЕ ЧИСЛО ОТ 18 ДО 99')
      return
    }

    setSubmitting(true)
    try {
      const result = tab === 'register'
        ? await onRegister(login, gender, ageValue, password)
        : await onLogin(login, password)
      if (result) {
        fail(result)
        return
      }
      playSend()
    } catch {
      fail('СБОЙ НА ЛИНИИ. ПОПРОБУЙ ЕЩЁ')
    }
  }

  return (
    <div className="kitchen-bg relative flex min-h-dvh w-full items-center justify-center p-3">
      <div className="crt-overlays pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="crt-scanlines absolute inset-0 opacity-40" />
        <div className="crt-vignette absolute inset-0" />
      </div>

      <div className="relative z-10 w-full max-w-[380px] border-2 border-[#FFB000] bg-[#140c04] p-3 shadow-[0_0_30px_rgba(255,176,0,.18)]">
        <header className="mb-3 text-center">
          <h1 className="chroma font-pixel text-[24px] text-[#FFB000]">В ЖОПЕ</h1>
          <p className="font-pixel mt-2 text-[6px] leading-relaxed text-[#8a6f3f]">
            ЭФИР 2094 · ПОДКЛЮЧЕНИЕ К АНАЛОГОВОЙ СЕТИ
          </p>
        </header>

        <div className="mb-3 flex" role="tablist" aria-label="Вход или регистрация">
          {(['register', 'login'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => {
                playClick()
                setTab(t)
                setError('')
              }}
              className={`font-pixel flex-1 border-2 px-1 py-2 text-[7px] ${
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
          className="flex flex-col gap-2.5"
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <label className="block">
            <span className="font-pixel mb-1 block text-[5px] text-[#8a6f3f]">ЛОГИН · 3–16, БЕЗ ПРОБЕЛОВ</span>
            <input
              value={nick}
              onChange={(e) => setNick(e.target.value.replace(/\s/g, '').toUpperCase().slice(0, 16))}
              className="font-pixel w-full border-2 border-[#5a3a00] bg-[#0d0a06] px-2 py-2 text-[8px] text-[#e8d9b0] placeholder:text-[#5a4626] focus:border-[#FFB000] focus:outline-none"
              placeholder="ВАШНИК"
              autoComplete="username"
              maxLength={16}
            />
          </label>

          <label className="block">
            <span className="font-pixel mb-1 block text-[5px] text-[#8a6f3f]">ПАРОЛЬ · ОТ 6 СИМВОЛОВ</span>
            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value.slice(0, 32))}
                type={showPass ? 'text' : 'password'}
                className="font-pixel w-full border-2 border-[#5a3a00] bg-[#0d0a06] px-2 py-2 pr-9 text-[8px] text-[#e8d9b0] placeholder:text-[#5a4626] focus:border-[#FFB000] focus:outline-none"
                placeholder="••••••"
                autoComplete={tab === 'register' ? 'new-password' : 'current-password'}
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
            <>
              <label className="block">
                <span className="font-pixel mb-1 block text-[5px] text-[#8a6f3f]">ВОЗРАСТ · 18–99</span>
                <input
                  value={age}
                  onChange={(e) => setAge(e.target.value.replace(/\D/g, '').slice(0, 2))}
                  type="number"
                  min={18}
                  max={99}
                  inputMode="numeric"
                  className="font-pixel w-full border-2 border-[#5a3a00] bg-[#0d0a06] px-2 py-2 text-[8px] text-[#e8d9b0] placeholder:text-[#5a4626] focus:border-[#FFB000] focus:outline-none"
                  placeholder="18"
                />
              </label>

              <fieldset className="block">
                <legend className="font-pixel mb-1 text-[5px] text-[#8a6f3f]">ПОЛ · ПОТОМ НЕ МЕНЯЕТСЯ</legend>
                <div className="flex gap-2">
                  {(['М', 'Ж'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => {
                        playClick()
                        setGender(g)
                      }}
                      className={`font-pixel flex-1 border-2 px-2 py-2 text-[8px] ${
                        gender === g
                          ? 'border-[#33FF00] bg-[#33FF00]/10 text-[#33FF00]'
                          : 'border-[#6b4a00] text-[#8a6f3f]'
                      }`}
                      aria-pressed={gender === g}
                    >
                      {gender === g ? '◉' : '○'} {g}
                    </button>
                  ))}
                </div>
              </fieldset>
            </>
          )}

          {error && (
            <p className="font-pixel border-2 border-[#FF4A4A] bg-[#FF4A4A]/5 px-2 py-2 text-[6px] leading-relaxed text-[#FF4A4A]" role="alert">
              {error}
            </p>
          )}

          <PxButton type="submit" className="mt-1 w-full !py-3" disabled={submitting}>
            {submitting
              ? 'ПОДКЛЮЧАЕМСЯ...'
              : tab === 'register'
                ? 'ЗАРЕГИСТРИРОВАТЬСЯ'
                : 'ВОЙТИ В ЭФИР'}
          </PxButton>

          <p className="font-pixel text-center text-[5px] leading-relaxed text-[#5a4626]">
            БЕЗ EMAIL, БЕЗ SMS, БЕЗ СОЦСЕТЕЙ.
            <br />
            АККАУНТ ХРАНИТСЯ В ЭТОМ БРАУЗЕРЕ.
          </p>
        </form>
      </div>
    </div>
  )
}

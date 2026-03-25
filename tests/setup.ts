import { vi, beforeEach } from 'vitest'

const readBodyMock = vi.fn()
const setCookieMock = vi.fn()
const getCookieMock = vi.fn()

function createError(opts: { statusCode: number; statusMessage: string }): Error {
  const err = new Error(opts.statusMessage) as any
  err.statusCode = opts.statusCode
  err.statusMessage = opts.statusMessage
  return err
}

Object.assign(globalThis, {
  defineEventHandler: (fn: Function) => fn,
  createError,
  readBody: readBodyMock,
  setCookie: setCookieMock,
  getCookie: getCookieMock,
})

beforeEach(() => {
  vi.clearAllMocks()
  readBodyMock.mockReset()
  setCookieMock.mockReset()
  getCookieMock.mockReset()
})

export { readBodyMock, setCookieMock, getCookieMock }

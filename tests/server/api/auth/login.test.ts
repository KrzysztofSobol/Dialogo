import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import { readBodyMock, setCookieMock } from '../../../setup'

vi.mock('fs/promises')

import handler from '~/server/api/auth/login'

describe('Auth API - Login', () => {
  const mockEvent = { context: { params: {} } } as any

  it('should return 401 for invalid username or password', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify([{ id: '1', username: 'alice', password: 'correct' }]) as any
    )
    readBodyMock.mockResolvedValue({ username: 'alice', password: 'wrong' })

    const result = await handler(mockEvent)

    expect(result).toEqual({ statusCode: 401, message: 'Invalid username or password' })
  })

  it('should return 200 and set cookie on successful login', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify([{ id: 'user1', username: 'alice', password: 'pass123' }]) as any
    )
    readBodyMock.mockResolvedValue({ username: 'alice', password: 'pass123' })

    const result = await handler(mockEvent)

    expect(setCookieMock).toHaveBeenCalledWith(
      mockEvent,
      'session',
      JSON.stringify({ userId: 'user1' }),
      expect.objectContaining({ maxAge: 7200 })
    )
    expect(result).toEqual({ statusCode: 200, message: 'Logged in successfully' })
  })

  it('should throw 500 error on file read error', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('disk error'))
    readBodyMock.mockResolvedValue({ username: 'alice', password: 'pass' })

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})

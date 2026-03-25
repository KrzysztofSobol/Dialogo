import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import { readBodyMock } from '../../../setup'

vi.mock('fs/promises')

import handler from '~/server/api/auth/register'

describe('Auth API - Register', () => {
  const mockEvent = {} as any

  it('should return 400 if username already exists', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify([{ id: '1', username: 'alice', password: 'pass', avatar: '/default.jpg' }]) as any
    )
    readBodyMock.mockResolvedValue({ username: 'alice', password: 'newpass' })

    const result = await handler(mockEvent)

    expect(result).toEqual({ statusCode: 400, message: 'This username already exists' })
  })

  it('should return 200 and save new user on successful registration', async () => {
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify([]) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()
    readBodyMock.mockResolvedValue({ username: 'newuser', password: 'pass123' })

    const result = await handler(mockEvent)

    expect(result).toEqual({ statusCode: 200, message: 'User registered successfully' })
    expect(fs.writeFile).toHaveBeenCalled()
    const written = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string)
    expect(written).toHaveLength(1)
    expect(written[0].username).toBe('newuser')
    expect(written[0].avatar).toBe('/assets/defaultUserIcon.jpg')
  })

  it('should throw 500 error on file read error', async () => {
    vi.mocked(fs.readFile).mockRejectedValue(new Error('disk error'))
    readBodyMock.mockResolvedValue({ username: 'alice', password: 'pass' })

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})

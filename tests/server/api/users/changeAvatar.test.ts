import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import { readBodyMock } from '../../../setup'

vi.mock('fs/promises')
vi.mock('h3', () => ({
  defineEventHandler: (fn: Function) => fn,
  getRouterParam: vi.fn(),
  createError: (opts: { statusCode: number; statusMessage: string }) => {
    const err = new Error(opts.statusMessage) as any
    err.statusCode = opts.statusCode
    err.statusMessage = opts.statusMessage
    return err
  },
}))

import handler from '~/server/api/users/changeAvatar'

const baseUsers = [
  { id: 'u1', username: 'alice', password: 'pass', avatar: '/uploads/old.jpg' },
]

describe('Users API - Change Avatar', () => {
  const mockEvent = {} as any

  it('should update user avatar and delete old avatar', async () => {
    readBodyMock.mockResolvedValue({ userId: 'u1', filePath: '/uploads/new.jpg' })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseUsers) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()
    vi.mocked(fs.unlink).mockResolvedValue()

    const result = await handler(mockEvent)

    expect(result).toMatchObject({ status: 'success' })
    expect(fs.unlink).toHaveBeenCalledWith('./public//uploads/old.jpg')
  })

  it('should not delete old avatar if it is the default icon', async () => {
    const usersWithDefault = [
      { id: 'u1', username: 'alice', password: 'pass', avatar: '/assets/defaultUserIcon.jpg' },
    ]
    readBodyMock.mockResolvedValue({ userId: 'u1', filePath: '/uploads/new.jpg' })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(usersWithDefault) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()

    await handler(mockEvent)

    expect(fs.unlink).not.toHaveBeenCalled()
  })

  it('should throw 404 if user not found', async () => {
    readBodyMock.mockResolvedValue({ userId: 'nonexistent', filePath: '/uploads/new.jpg' })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(baseUsers) as any)

    const result = await handler(mockEvent)

    expect((result as any).statusCode).toBe(404)
  })

  it('should throw 400 if userId is missing', async () => {
    readBodyMock.mockResolvedValue({ filePath: '/uploads/new.jpg' })

    const result = await handler(mockEvent)

    expect((result as any).statusCode).toBe(400)
  })
})

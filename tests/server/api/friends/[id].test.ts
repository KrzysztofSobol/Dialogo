import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')

import handler from '~/server/api/friends/[id]'

describe('Friends API - Get', () => {
  it('should return list of friends for a given user', async () => {
    const mockEvent = { context: { params: { id: 'u1' } } } as any
    const users = [
      { id: 'u2', username: 'bob', password: 'pass', avatar: '/default.jpg' },
      { id: 'u3', username: 'carol', password: 'pass', avatar: '/default.jpg' },
      { id: 'u4', username: 'dave', password: 'pass', avatar: '/default.jpg' },
    ]
    vi.mocked(fs.readFile)
      .mockResolvedValueOnce(JSON.stringify(['u2', 'u3']) as any)
      .mockResolvedValueOnce(JSON.stringify(users) as any)

    const result = await handler(mockEvent)

    expect(result.statusCode).toBe(200)
    expect(result.friends).toHaveLength(2)
    expect(result.friends[0]).toMatchObject({ id: 'u2', username: 'bob' })
    expect(result.friends[1]).toMatchObject({ id: 'u3', username: 'carol' })
  })

  it('should throw 500 if friends file does not exist', async () => {
    const mockEvent = { context: { params: { id: 'u1' } } } as any
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import handler from '../../../../../server/api/users/[userId]/getAvatar.ts'
import fs from 'fs/promises'
import * as h3 from 'h3'

describe('User Get Avatar API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(h3, 'getRouterParam').mockImplementation((event, param) => {
      return (event as any).context.params[param]
    })
    vi.spyOn(h3, 'getQuery').mockImplementation(() => ({}))
  })

  it('should return avatar for a given user', async () => {
    const mockUsers = [
      { id: 'user1', username: 'Test', avatar: 'avatar1.png' }
    ]
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockUsers))

    const event = { context: { params: { userId: 'user1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      avatar: 'avatar1.png'
    })
    expect(fs.readFile).toHaveBeenCalledWith('./db/users.json', 'utf8')
  })

  it('should throw 400 if userId is missing', async () => {
    const event = { context: { params: {} } } as any
    const response = await handler(event)
    expect(response).toEqual(expect.objectContaining({ statusCode: 400, statusMessage: 'User ID is required' }))
  })

  it('should throw 404 if user not found', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce('[]')
    const event = { context: { params: { userId: 'user1' } } } as any
    const response = await handler(event)
    expect(response).toEqual(expect.objectContaining({ statusCode: 404, statusMessage: 'User not found' }))
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import handler from '../../../../../server/api/servers/[serverId]/usersBasic.get.ts'
import fs from 'fs/promises'
import * as h3 from 'h3'

describe('Server Users Basic Get API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(h3, 'getRouterParam').mockImplementation((event, param) => {
      return (event as any).context.params[param]
    })
  })

  it('should throw 400 if serverId is missing', async () => {
    const event = { context: { params: {} } } as any
    await expect(handler(event)).rejects.toThrow('Server ID is required')
  })

  it('should return basic user info for a given server', async () => {
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/serverUsers/users_server1.json') return JSON.stringify(['user1', 'user3'])
      if (path === './db/users.json') return JSON.stringify([
        { id: 'user1', username: 'User One', password: '123' },
        { id: 'user2', username: 'User Two', password: '123' },
        { id: 'user3', username: 'User Three', password: '123' }
      ])
      return '[]'
    })

    const event = { context: { params: { serverId: 'server1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'Server users retrieved',
      users: [
        { id: 'user1', username: 'User One' },
        { id: 'user3', username: 'User Three' }
      ]
    })
  })

  it('should throw 404 if server users file is missing', async () => {
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/serverUsers/users_server1.json') throw new Error('ENOENT')
      return '[]'
    })

    const event = { context: { params: { serverId: 'server1' } } } as any
    await expect(handler(event)).rejects.toThrow('Server not found')
  })
})

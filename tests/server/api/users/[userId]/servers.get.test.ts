import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import handler from '../../../../../server/api/users/[userId]/servers.get.ts'
import fs from 'fs/promises'
import * as h3 from 'h3'

describe('User Servers Get API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(h3, 'getRouterParam').mockImplementation((event, param) => {
      return (event as any).context.params[param]
    })
  })

  it('should return servers for a given user', async () => {
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/userServers/servers_user1.json') return JSON.stringify(['server1', 'server3'])
      if (path === './db/servers.json') return JSON.stringify([
        { id: 'server1', title: 'S1' },
        { id: 'server2', title: 'S2' },
        { id: 'server3', title: 'S3' }
      ])
      return '[]'
    })

    const event = { context: { params: { userId: 'user1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'User servers retrieved',
      servers: [
        { id: 'server1', title: 'S1' },
        { id: 'server3', title: 'S3' }
      ]
    })
  })

  it('should throw error if userId is missing', async () => {
    const event = { context: { params: {} } } as any
    await expect(handler(event)).rejects.toThrow('Failed to get user servers')
  })

  it('should return empty list if user servers file missing', async () => {
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/userServers/servers_user1.json') throw new Error('ENOENT')
      if (path === './db/servers.json') return JSON.stringify([{ id: 'server1', title: 'S1' }])
      return '[]'
    })

    const event = { context: { params: { userId: 'user1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'User servers retrieved',
      servers: []
    })
  })

  it('should throw 500 if servers file fails to read', async () => {
    vi.mocked(fs.readFile).mockImplementation(async (path) => {
      if (path === './db/userServers/servers_user1.json') return JSON.stringify(['server1'])
      if (path === './db/servers.json') throw new Error('ENOENT')
      return '[]'
    })

    const event = { context: { params: { userId: 'user1' } } } as any
    await expect(handler(event)).rejects.toThrow('Failed to get user servers')
  })
})

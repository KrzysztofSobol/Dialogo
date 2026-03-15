import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import handler from '../../../../../server/api/servers/[serverId]/users.get.ts'
import fs from 'fs/promises'
import * as h3 from 'h3'

describe('Server Users Get API', () => {
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

  it('should return users for a given server', async () => {
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(['user1', 'user2']))

    const event = { context: { params: { serverId: 'server1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'Server users retrieved',
      users: ['user1', 'user2']
    })
    expect(fs.readFile).toHaveBeenCalledWith('./db/serverUsers/users_server1.json', 'utf8')
  })

  it('should return empty array if file does not exist', async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('ENOENT'))

    const event = { context: { params: { serverId: 'server1' } } } as any
    const response = await handler(event)

    expect(response).toEqual({
      status: 'success',
      message: 'Server users retrieved',
      users: []
    })
  })
})

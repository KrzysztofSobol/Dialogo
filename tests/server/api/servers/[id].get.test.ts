import { describe, it, expect, vi, beforeEach } from 'vitest'
// @ts-ignore
import handler from '../../../../server/api/servers/[id].get.ts'
import fs from 'fs/promises'

describe('Servers Get By ID API', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return server data if found', async () => {
    const mockServers = [
      { id: 'server1', name: 'Server One' },
      { id: 'server2', name: 'Server Two' }
    ]
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockServers))

    const event = {
      context: { params: { id: 'server1' } }
    } as any

    const response = await handler(event)

    expect(fs.readFile).toHaveBeenCalledWith('./db/servers.json', 'utf8')
    expect(response).toEqual(mockServers[0])
  })

  it('should return 404 if server not found', async () => {
    const mockServers = [
      { id: 'server1', name: 'Server One' }
    ]
    vi.mocked(fs.readFile).mockResolvedValueOnce(JSON.stringify(mockServers))

    const event = {
      context: { params: { id: 'server2' } }
    } as any

    const response = await handler(event)

    expect(response).toEqual({ status: 404, message: 'Server not found' })
  })

  it('should return 500 if an error occurs reading the file', async () => {
    vi.mocked(fs.readFile).mockRejectedValueOnce(new Error('File read error'))

    const event = {
      context: { params: { id: 'server1' } }
    } as any

    const response = await handler(event)

    expect(response).toEqual({ status: 500, message: 'Error fetching server data' })
  })
})

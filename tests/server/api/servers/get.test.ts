import { describe, it, expect, vi, beforeEach } from 'vitest'
import getServersHandler from '../../../../server/api/servers/get'
import fs from 'fs/promises'

describe('Servers Get API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return list of servers', async () => {
    const mockServers = [
      { id: 'server1', title: 'Server 1', ownerId: 'user1' },
      { id: 'server2', title: 'Server 2', ownerId: 'user2' }
    ]
    ;(fs as any).__setMockFileData('./db/servers.json', JSON.stringify(mockServers))

    const result = await getServersHandler(mockEvent as any)
    
    expect(result).toEqual(mockServers)
  })

  it('should handle error if servers.json does not exist', async () => {
    const result = await getServersHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 500, message: 'Error getting servers' })
  })
})

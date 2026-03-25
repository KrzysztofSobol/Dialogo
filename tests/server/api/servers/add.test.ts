import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import { readBodyMock } from '../../../setup'

vi.mock('fs/promises')

import handler from '~/server/api/servers/add'

describe('Servers API - Add', () => {
  const mockEvent = {} as any

  it('should create new servers.json and add server if file does not exist', async () => {
    readBodyMock.mockResolvedValue({ id: 's1', title: 'Server 1', creatorId: 'u1' })
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(mockEvent)

    expect(result.status).toBe('success')
    expect(result.server).toMatchObject({ id: 's1', title: 'Server 1', creatorId: 'u1' })
    expect(fs.writeFile).toHaveBeenCalled()
    const written = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string)
    expect(written).toHaveLength(1)
  })

  it('should add server to existing servers.json', async () => {
    const existing = [{ id: 'old', title: 'Old Server', creatorId: 'u0', createdAt: '2024-01-01' }]
    readBodyMock.mockResolvedValue({ id: 'new', title: 'New Server', creatorId: 'u1' })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(existing) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(mockEvent)

    expect(result.status).toBe('success')
    const written = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string)
    expect(written).toHaveLength(2)
    expect(written[0].id).toBe('old')
    expect(written[1].id).toBe('new')
  })

  it('should throw 500 on error', async () => {
    readBodyMock.mockResolvedValue({ id: 's1', title: 'Server 1', creatorId: 'u1' })
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.writeFile).mockRejectedValue(new Error('write error'))

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})

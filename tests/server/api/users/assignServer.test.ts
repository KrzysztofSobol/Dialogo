import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')
vi.mock('h3', () => ({
  defineEventHandler: (fn: Function) => fn,
  readBody: vi.fn(),
  createError: (opts: { statusCode: number; statusMessage: string }) => {
    const err = new Error(opts.statusMessage) as any
    err.statusCode = opts.statusCode
    err.statusMessage = opts.statusMessage
    return err
  },
}))

import { readBody } from 'h3'
import handler from '~/server/api/users/assignServer'

describe('Users API - Assign Server', () => {
  const mockEvent = {} as any

  it('should create new servers list and add server if user has no servers', async () => {
    vi.mocked(readBody).mockResolvedValue({ userId: 'u1', serverId: 's1' })
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(mockEvent)

    expect(result.status).toBe('success')
    expect(result.servers).toContain('s1')
    expect(fs.writeFile).toHaveBeenCalled()
  })

  it('should add server to existing servers list', async () => {
    vi.mocked(readBody).mockResolvedValue({ userId: 'u1', serverId: 's2' })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(['s1']) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(mockEvent)

    expect(result.status).toBe('success')
    expect(result.servers).toContain('s1')
    expect(result.servers).toContain('s2')
    expect(result.servers).toHaveLength(2)
  })

  it('should not add duplicate server', async () => {
    vi.mocked(readBody).mockResolvedValue({ userId: 'u1', serverId: 's1' })
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(['s1']) as any)

    const result = await handler(mockEvent)

    expect(result.servers).toHaveLength(1)
    expect(result.servers).toContain('s1')
    expect(fs.writeFile).not.toHaveBeenCalled()
  })
})

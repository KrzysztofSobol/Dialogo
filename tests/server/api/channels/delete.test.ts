import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'

vi.mock('fs/promises')
vi.mock('h3', () => ({
  defineEventHandler: (fn: Function) => fn,
  createError: (opts: { statusCode: number; statusMessage: string }) => {
    const err = new Error(opts.statusMessage) as any
    err.statusCode = opts.statusCode
    err.statusMessage = opts.statusMessage
    return err
  },
}))

import handler from '~/server/api/channels/[channelId]/delete'

describe('Channels API - Delete', () => {
  it('should throw error if no channelId in params', async () => {
    const event = { context: { params: {} } } as any

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 400 })
  })

  it('should delete channel and its messages if both exist', async () => {
    const event = { context: { params: { channelId: 'ch1' } } } as any
    const channels = [
      { id: 'ch1', serverId: 's1', title: 'General', creatorId: 'u1' },
      { id: 'ch2', serverId: 's1', title: 'Gaming', creatorId: 'u1' },
    ]
    vi.mocked(fs.unlink).mockResolvedValue()
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(channels) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(event)

    expect(fs.unlink).toHaveBeenCalledWith('./db/messages/channel_ch1.json')
    expect(fs.writeFile).toHaveBeenCalledWith(
      './db/channels.json',
      JSON.stringify([{ id: 'ch2', serverId: 's1', title: 'Gaming', creatorId: 'u1' }], null, 2)
    )
    expect(result).toMatchObject({ status: 'success' })
  })

  it('should delete channel even if messages file does not exist', async () => {
    const event = { context: { params: { channelId: 'ch1' } } } as any
    const channels = [{ id: 'ch1', serverId: 's1', title: 'General', creatorId: 'u1' }]
    vi.mocked(fs.unlink).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(channels) as any)
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(event)

    expect(result).toMatchObject({ status: 'success' })
  })

  it('should throw 500 if reading channels.json fails', async () => {
    const event = { context: { params: { channelId: 'ch1' } } } as any
    vi.mocked(fs.unlink).mockResolvedValue()
    vi.mocked(fs.readFile).mockRejectedValue(new Error('read error'))

    await expect(handler(event)).rejects.toMatchObject({ statusCode: 500 })
  })
})

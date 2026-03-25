import { vi, describe, it, expect } from 'vitest'
import fs from 'fs/promises'
import { readBodyMock } from '../../../setup'

vi.mock('fs/promises')

import handler from '~/server/api/chats/get'

describe('Chats API - Get', () => {
  const mockEvent = {} as any

  it('should create new chat if one does not exist', async () => {
    readBodyMock.mockResolvedValue({ userId: 'u1', friendId: 'u2' })
    vi.mocked(fs.access).mockResolvedValue()
    vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'))
    vi.mocked(fs.writeFile).mockResolvedValue()

    const result = await handler(mockEvent)

    expect(result).toBe('chatu1u2')
    expect(fs.writeFile).toHaveBeenCalledTimes(2)
  })

  it('should return existing chat id if they already have a chat', async () => {
    readBodyMock.mockResolvedValue({ userId: 'u1', friendId: 'u2' })
    vi.mocked(fs.access).mockResolvedValue()
    vi.mocked(fs.readFile).mockResolvedValue(
      JSON.stringify([{ chatId: 'chatu1u2', friendId: 'u2' }]) as any
    )

    const result = await handler(mockEvent)

    expect(result).toBe('chatu1u2')
    expect(fs.writeFile).not.toHaveBeenCalled()
  })
})

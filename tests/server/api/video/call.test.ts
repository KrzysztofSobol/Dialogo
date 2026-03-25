import { vi, describe, it, expect } from 'vitest'
import { readBodyMock } from '../../../setup'

vi.mock('~/server/websocket', () => ({
  sendCallNotification: vi.fn().mockReturnValue('notification-sent'),
}))

import handler from '~/server/api/video/call'
import { sendCallNotification } from '~/server/websocket'

describe('Video API - Call', () => {
  const mockEvent = {} as any

  it('should call sendCallNotification with body parameters', async () => {
    readBodyMock.mockResolvedValue({ callerId: 'u1', calleeId: 'u2' })

    const result = await handler(mockEvent)

    expect(sendCallNotification).toHaveBeenCalledWith('u1', 'u2')
    expect(result).toBe('notification-sent')
  })

  it('should handle readBody error', async () => {
    readBodyMock.mockRejectedValue(new Error('body parse error'))

    await expect(handler(mockEvent)).rejects.toMatchObject({ statusCode: 500 })
  })
})

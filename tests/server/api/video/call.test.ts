import { describe, it, expect, vi, beforeEach } from 'vitest'
import callHandler from '../../../../server/api/video/call'
import * as websocket from '../../../../server/websocket'

vi.mock('../../../../server/websocket', () => ({
  sendCallNotification: vi.fn(),
}))

describe('Video Call API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call sendCallNotification with body parameters', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      callerId: 'user1',
      calleeId: 'user2'
    })

    ;(websocket.sendCallNotification as any).mockReturnValueOnce({ status: 'success' })

    const result = await callHandler(mockEvent as any)
    
    expect(websocket.sendCallNotification).toHaveBeenCalledWith('user1', 'user2')
    expect(result).toEqual({ status: 'success' })
  })

  it('should handle readBody error', async () => {
    // @ts-ignore
    globalThis.readBody.mockRejectedValueOnce(new Error('Read body failed'))

    try {
      await callHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Read body failed')
    }
  })
})

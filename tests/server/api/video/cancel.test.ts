import { describe, it, expect, vi, beforeEach } from 'vitest'
import cancelHandler from '../../../../server/api/video/cancel'
import * as websocket from '../../../../server/websocket'

vi.mock('../../../../server/websocket', () => ({
  sendCallCancelation: vi.fn(),
}))

describe('Video Cancel API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call sendCallCancelation with body parameters', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      callerId: 'user1',
      calleeId: 'user2'
    })

    ;(websocket.sendCallCancelation as any).mockReturnValueOnce({ status: 'success' })

    const result = await cancelHandler(mockEvent as any)
    
    expect(websocket.sendCallCancelation).toHaveBeenCalledWith('user1', 'user2')
    expect(result).toEqual({ status: 'success' })
  })

  it('should handle readBody error', async () => {
    // @ts-ignore
    globalThis.readBody.mockRejectedValueOnce(new Error('Read body failed'))

    try {
      await cancelHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Read body failed')
    }
  })
})

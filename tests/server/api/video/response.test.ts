import { describe, it, expect, vi, beforeEach } from 'vitest'
import responseHandler from '../../../../server/api/video/response'
import * as websocket from '../../../../server/websocket'

vi.mock('../../../../server/websocket', () => ({
  sendCallResponse: vi.fn(),
}))

describe('Video Response API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should call sendCallResponse with body parameters', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      from: 'user1',
      to: 'user2',
      response: 'accept'
    })

    ;(websocket.sendCallResponse as any).mockReturnValueOnce({ status: 'success' })

    const result = await responseHandler(mockEvent as any)
    
    expect(websocket.sendCallResponse).toHaveBeenCalledWith('user1', 'user2', 'accept')
    expect(result).toEqual({ status: 'success' })
  })

  it('should handle readBody error', async () => {
    // @ts-ignore
    globalThis.readBody.mockRejectedValueOnce(new Error('Read body failed'))

    try {
      await responseHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Read body failed')
    }
  })
})

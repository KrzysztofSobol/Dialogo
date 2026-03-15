import { describe, it, expect, vi, beforeEach } from 'vitest'
import logoutHandler from '../../../../server/api/auth/logout'

describe('Logout API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should clear cookie and return 200', async () => {
    const result = await logoutHandler(mockEvent as any)
    
    expect(result).toEqual({ statusCode: 200, message: 'Logout successful' })
    // @ts-ignore
    expect(globalThis.setCookie).toHaveBeenCalledWith(
      mockEvent,
      'session',
      '',
      { maxAge: -1 }
    )
  })
})

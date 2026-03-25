import { describe, it, expect } from 'vitest'
import { setCookieMock } from '../../../setup'

import handler from '~/server/api/auth/logout'

describe('Auth API - Logout', () => {
  it('should clear cookie and return 200', async () => {
    const mockEvent = {} as any

    const result = await handler(mockEvent)

    expect(setCookieMock).toHaveBeenCalledWith(
      mockEvent,
      'session',
      '',
      expect.objectContaining({ maxAge: -1 })
    )
    expect(result).toEqual({ statusCode: 200, message: 'Logout successful' })
  })
})

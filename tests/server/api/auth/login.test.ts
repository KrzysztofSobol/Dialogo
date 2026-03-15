import { describe, it, expect, vi, beforeEach } from 'vitest'
import loginHandler from '../../../../server/api/auth/login'
import fs from 'fs/promises'

describe('Login API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return 401 for invalid username or password', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({ username: 'wrong', password: 'wrong' })
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: '1', username: 'testuser', password: 'password123', avatar: 'test.jpg' }
    ]))

    const result = await loginHandler(mockEvent as any)
    
    expect(result).toEqual({ statusCode: 401, message: 'Invalid username or password' })
  })

  it('should return 200 and set cookie on successful login', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({ username: 'testuser', password: 'password123' })
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: '1', username: 'testuser', password: 'password123', avatar: 'test.jpg' }
    ]))

    const result = await loginHandler(mockEvent as any)
    
    expect(result).toEqual({ statusCode: 200, message: 'Logged in successfully' })
    // @ts-ignore
    expect(globalThis.setCookie).toHaveBeenCalledWith(
      mockEvent,
      'session',
      JSON.stringify({ userId: '1' }),
      { maxAge: 60 * 60 * 2 }
    )
  })

  it('should throw 500 error on file read error', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({ username: 'testuser', password: 'password123' })
    // No mock data set, fs will throw ENOENT

    try {
      await loginHandler(mockEvent as any)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Login error')
    }
  })
})

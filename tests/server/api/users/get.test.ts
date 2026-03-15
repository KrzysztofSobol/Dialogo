import { describe, it, expect, vi, beforeEach } from 'vitest'
import getHandler from '../../../../server/api/users/get'
import fs from 'fs/promises'

describe('Users Get API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return 401 if session cookie is not found', async () => {
    // @ts-ignore
    globalThis.getCookie.mockReturnValueOnce(undefined)

    const result = await getHandler(mockEvent as any)
    expect(result).toEqual({ statusCode: 401, message: 'Session not found' })
  })

  it('should return 404 if user is not found', async () => {
    // @ts-ignore
    globalThis.getCookie.mockReturnValueOnce(JSON.stringify({ userId: '2' }))
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: '1', username: 'testuser', password: 'password123', avatar: 'test.jpg' }
    ]))

    const result = await getHandler(mockEvent as any)
    expect(result).toEqual({ statusCode: 404, message: 'User not found' })
  })

  it('should return 200 and user data if found', async () => {
    // @ts-ignore
    globalThis.getCookie.mockReturnValueOnce(JSON.stringify({ userId: '1' }))
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: '1', username: 'testuser', password: 'password123', avatar: 'test.jpg' }
    ]))

    const result = await getHandler(mockEvent as any)
    expect(result.statusCode).toBe(200)
    expect(result.user).toBeDefined()
    expect(result.user.username).toBe('testuser')
  })

  it('should throw 500 error on file read error', async () => {
    // @ts-ignore
    globalThis.getCookie.mockReturnValueOnce(JSON.stringify({ userId: '1' }))
    // No mock file, throws ENOENT

    try {
      await getHandler(mockEvent as any)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Get user error')
    }
  })
})

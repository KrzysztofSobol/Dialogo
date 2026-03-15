import { describe, it, expect, vi, beforeEach } from 'vitest'
import registerHandler from '../../../../server/api/auth/register'
import fs from 'fs/promises'

describe('Register API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should return 400 if username already exists', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({ username: 'testuser', password: 'password123' })
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: '1', username: 'testuser', password: 'password123', avatar: 'test.jpg' }
    ]))

    const result = await registerHandler(mockEvent as any)
    
    expect(result).toEqual({ statusCode: 400, message: 'This username already exists' })
  })

  it('should return 200 and save new user on successful registration', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({ username: 'newuser', password: 'password123' })
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: '1', username: 'testuser', password: 'password123', avatar: 'test.jpg' }
    ]))

    const result = await registerHandler(mockEvent as any)
    
    expect(result).toEqual({ statusCode: 200, message: 'User registered successfully' })
    
    const writtenData = await fs.readFile('./db/users.json', 'utf8')
    const users = JSON.parse(writtenData)
    expect(users).toHaveLength(2)
    expect(users[1].username).toBe('newuser')
    expect(users[1].password).toBe('password123')
    expect(users[1].avatar).toBe('/assets/defaultUserIcon.jpg')
    expect(users[1].id).toBeDefined()
  })

  it('should throw 500 error on file read error', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({ username: 'testuser', password: 'password123' })
    // No mock data set, fs will throw ENOENT

    try {
      await registerHandler(mockEvent as any)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('Registration error')
    }
  })
})

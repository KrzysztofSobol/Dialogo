import { describe, it, expect, vi, beforeEach } from 'vitest'
import uploadAvatarHandler from '../../../server/api/uploadAvatar'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => 'avatar-1234')
}))

describe('Upload Avatar API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should upload avatar and return path', async () => {
    // @ts-ignore
    globalThis.readMultipartFormData.mockResolvedValueOnce([
      { filename: 'avatar.jpg', data: 'mock-avatar-content' }
    ])

    const result = await uploadAvatarHandler(mockEvent as any) as any
    
    expect(result).toEqual({
      status: 'success',
      filePath: '/avatars/avatar-1234.jpg'
    })

    const fileContent = await fs.readFile('public/avatars/avatar-1234.jpg', 'utf8')
    expect(fileContent).toBe('mock-avatar-content')
  })

  it('should handle missing form data', async () => {
    // @ts-ignore
    globalThis.readMultipartFormData.mockResolvedValueOnce(null)

    const result = await uploadAvatarHandler(mockEvent as any) as any
    
    // The handler catches and returns error rather than throwing
    expect(result.statusCode).toBe(500)
    expect(result.message).toContain('Internal Server Error')
  })
})

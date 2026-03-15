import { describe, it, expect, vi, beforeEach } from 'vitest'
import uploadHandler from '../../../server/api/upload'
import fs from 'fs/promises'
import { randomUUID } from 'crypto'

vi.mock('crypto', () => ({
  randomUUID: vi.fn(() => '1234-5678')
}))

describe('Upload API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should upload file and return path', async () => {
    // @ts-ignore
    globalThis.readMultipartFormData.mockResolvedValueOnce([
      { filename: 'test.png', data: 'mock-file-content' }
    ])

    const result = await uploadHandler(mockEvent as any)
    
    expect(result).toEqual({
      status: 'success',
      filePath: '/uploads/1234-5678.png'
    })

    const fileContent = await fs.readFile('public/uploads/1234-5678.png', 'utf8')
    expect(fileContent).toBe('mock-file-content')
  })

  it('should handle missing form data', async () => {
    // @ts-ignore
    globalThis.readMultipartFormData.mockResolvedValueOnce(null)

    try {
      await uploadHandler(mockEvent as any)
      expect(true).toBe(false)
    } catch (e: any) {
      expect(e.statusCode).toBe(500)
      expect(e.message).toContain('No file uploaded')
    }
  })
})

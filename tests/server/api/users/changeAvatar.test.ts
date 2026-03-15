import { describe, it, expect, vi, beforeEach } from 'vitest'
import changeAvatarHandler from '../../../../server/api/users/changeAvatar'
import fs from 'fs/promises'

describe('Users ChangeAvatar API', () => {
  const mockEvent = { req: {}, res: {} }

  beforeEach(() => {
    vi.clearAllMocks()
    ;(fs as any).__clearMockFiles()
  })

  it('should update user avatar and delete old avatar', async () => {
    // Mock user db
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: 'user1', username: 'testuser', avatar: 'old_avatar.jpg' }
    ]))
    // Mock the old avatar file so unlink succeeds
    ;(fs as any).__setMockFileData('./public/old_avatar.jpg', 'mock_image_data')

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      filePath: 'new_avatar.jpg'
    })

    const result = await changeAvatarHandler(mockEvent as any)
    
    expect(result).toEqual({ status: 'success', message: 'Avatar updated' })

    // Verify user db updated
    const updatedUsersData = await fs.readFile('./db/users.json', 'utf8')
    const updatedUsers = JSON.parse(updatedUsersData)
    expect(updatedUsers[0].avatar).toBe('new_avatar.jpg')

    // Verify old avatar was deleted
    let oldAvatarExists = false
    try {
      await fs.readFile('./public/old_avatar.jpg', 'utf8')
      oldAvatarExists = true
    } catch (e) {
      oldAvatarExists = false
    }
    expect(oldAvatarExists).toBe(false)
  })

  it('should not delete old avatar if it is the default icon', async () => {
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: 'user1', username: 'testuser', avatar: '/assets/defaultUserIcon.jpg' }
    ]))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'user1',
      filePath: 'new_avatar.jpg'
    })

    const result = await changeAvatarHandler(mockEvent as any)
    expect(result).toEqual({ status: 'success', message: 'Avatar updated' })
    expect(fs.unlink).not.toHaveBeenCalled()
  })

  it('should throw 404 if user not found', async () => {
    ;(fs as any).__setMockFileData('./db/users.json', JSON.stringify([
      { id: 'user1', username: 'testuser', avatar: 'old_avatar.jpg' }
    ]))

    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      userId: 'nonexistent',
      filePath: 'new_avatar.jpg'
    })

    const result = await changeAvatarHandler(mockEvent as any) as any
    expect(result.statusCode).toBe(404)
    expect(result.message).toContain('User not found')
  })

  it('should throw 400 if userId is missing', async () => {
    // @ts-ignore
    globalThis.readBody.mockResolvedValueOnce({
      filePath: 'new_avatar.jpg'
    })

    const result = await changeAvatarHandler(mockEvent as any) as any
    expect(result.statusCode).toBe(400)
    expect(result.message).toContain('User ID is required')
  })
})

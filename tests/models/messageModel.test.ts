import { describe, it, expect } from 'vitest'
import { Message } from '../../models/messageModel'

describe('Message', () => {
  it('should create message with all parameters', () => {
    const publishDate = new Date()
    const message = new Message('id1', 'channel1', publishDate, 'author', 'authorId', 'content', '/path')
    expect(message.id).toBe('id1')
    expect(message.channelId).toBe('channel1')
    expect(message.publishDate).toBe(publishDate)
    expect(message.author).toBe('author')
    expect(message.authorId).toBe('authorId')
    expect(message.content).toBe('content')
    expect(message.filePath).toBe('/path')
  })

  it('should create message without filePath', () => {
    const publishDate = new Date()
    const message = new Message('id1', 'channel1', publishDate, 'author', 'authorId', 'content')
    expect(message.filePath).toBeUndefined()
  })
})

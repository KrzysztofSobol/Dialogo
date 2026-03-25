import { describe, it, expect } from 'vitest'
import { Message } from '~/models/messageModel'

describe('Message Model', () => {
  it('should create message with all parameters', () => {
    const date = new Date('2024-01-01T00:00:00Z')
    const message = new Message('m1', 'ch1', date, 'alice', 'u1', 'Hello World', '/uploads/file.jpg')

    expect(message.id).toBe('m1')
    expect(message.channelId).toBe('ch1')
    expect(message.publishDate).toBe(date)
    expect(message.author).toBe('alice')
    expect(message.authorId).toBe('u1')
    expect(message.content).toBe('Hello World')
    expect(message.filePath).toBe('/uploads/file.jpg')
  })

  it('should create message without filePath', () => {
    const date = new Date('2024-06-15T12:00:00Z')
    const message = new Message('m2', 'ch2', date, 'bob', 'u2', 'Hi there')

    expect(message.id).toBe('m2')
    expect(message.channelId).toBe('ch2')
    expect(message.publishDate).toBe(date)
    expect(message.author).toBe('bob')
    expect(message.authorId).toBe('u2')
    expect(message.content).toBe('Hi there')
    expect(message.filePath).toBeUndefined()
  })
})

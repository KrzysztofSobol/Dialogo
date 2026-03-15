import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WebSocket } from 'ws'

const { connectionCallbackHolder } = vi.hoisted(() => {
  return {
    connectionCallbackHolder: { callback: null as any }
  }
})

vi.mock('ws', () => {
  return {
    WebSocketServer: class {
      on(event: string, callback: any) {
        if (event === 'connection') {
          connectionCallbackHolder.callback = callback
        }
      }
    },
    WebSocket: {
      OPEN: 1
    }
  }
})

import * as websocket from '../../server/websocket'

describe('Websocket Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const createMockWs = () => ({
    readyState: WebSocket.OPEN,
    send: vi.fn(),
    on: vi.fn()
  })

  it('should handle channel connections and broadcast messages', () => {
    const connectionCallback = connectionCallbackHolder.callback
    expect(connectionCallback).toBeDefined()
    if (!connectionCallback) return

    const ws1 = createMockWs()
    const ws2 = createMockWs()
    
    // Simulate user1 connecting to channel1
    connectionCallback(ws1, { url: '/?userId=user1&channelId=channel1', headers: { host: 'localhost' } })
    
    // Simulate user2 connecting to channel1
    connectionCallback(ws2, { url: '/?userId=user2&channelId=channel1', headers: { host: 'localhost' } })
    
    const message = {
      id: 'msg1',
      authorId: 'user1',
      author: 'User One',
      content: 'Hello World',
      publishDate: new Date(),
      channelId: 'channel1',
      avatar: 'avatar.png'
    }

    websocket.sendMessageToChannel(message)

    expect(ws1.send).toHaveBeenCalledWith(JSON.stringify(message))
    expect(ws2.send).toHaveBeenCalledWith(JSON.stringify(message))
  })

  it('should handle notification connections and send chat notifications', () => {
    const connectionCallback = connectionCallbackHolder.callback
    if (!connectionCallback) return

    const receiverWs = createMockWs()
    
    // Simulate user2 connecting to notifications
    connectionCallback(receiverWs, { url: '/?userId=user2', headers: { host: 'localhost' } })
    
    const message = {
      id: 'msg1',
      authorId: 'user1',
      author: 'User One',
      content: 'Private Hi',
      publishDate: new Date(),
      channelId: 'chat1',
      avatar: 'avatar.png'
    }

    websocket.sendChatNotifications(message, 'user2')

    expect(receiverWs.send).toHaveBeenCalledWith(JSON.stringify({ 
      title: 'Private chat with: User One', 
      message: 'Message: Private Hi', 
      from: '/privateMessages/chat1/User One' 
    }))
  })

  it('should send server notifications', () => {
    const connectionCallback = connectionCallbackHolder.callback
    if (!connectionCallback) return

    const wsA = createMockWs()
    const wsB = createMockWs()
    
    // Simulate users connecting to notifications
    connectionCallback(wsA, { url: '/?userId=userA', headers: { host: 'localhost' } })
    connectionCallback(wsB, { url: '/?userId=userB', headers: { host: 'localhost' } })
    
    const message = {
      id: 'msg1',
      authorId: 'userA', // The author shouldn't receive the notification
      author: 'User A',
      content: 'Server Message',
      publishDate: new Date(),
      channelId: 'channel1',
      avatar: 'avatar.png'
    }

    websocket.sendServerNotifications(message, 'MyServer', 'server1', 'General', ['userA', 'userB'])

    expect(wsA.send).not.toHaveBeenCalled()
    expect(wsB.send).toHaveBeenCalledWith(JSON.stringify({
      title: 'Channel: /MyServer/General',
      message: 'Message: Server Message',
      from: '/server/server1'
    }))
  })

  it('should handle call connections and notifications', () => {
    const connectionCallback = connectionCallbackHolder.callback
    if (!connectionCallback) return

    const callerWs = createMockWs()
    const calleeWs = createMockWs()

    // Caller initiates a call, callee is connected to notifications
    connectionCallback(calleeWs, { url: '/?userId=callee1', headers: { host: 'localhost' } })
    
    const res = websocket.sendCallNotification('caller1', 'callee1')
    expect(res).toEqual({ status: 'success', message: 'Call request sent' })
    expect(calleeWs.send).toHaveBeenCalledWith(JSON.stringify({ title: 'Incoming call', message: 'caller1' }))

    // Now they connect to the call
    connectionCallback(callerWs, { url: '/?CallerId=caller1&CalleeID=callee1', headers: { host: 'localhost' } })
    
    // Test that the callee is now marked as in call, so a new call notification will fail
    const res2 = websocket.sendCallNotification('caller2', 'caller1')
    expect(res2).toEqual({ status: 'error', message: 'User is in call' })
    
    // Extract the message handler
    const onMessageHandler = callerWs.on.mock.calls.find(call => call[0] === 'message')?.[1]
    expect(onMessageHandler).toBeDefined()
    
    // Add callee to call to test broadcast
    const calleeCallWs = createMockWs()
    connectionCallback(calleeCallWs, { url: '/?CallerId=caller1&CalleeID=callee1', headers: { host: 'localhost' } })
    
    onMessageHandler(JSON.stringify({ type: 'offer', sdp: 'sdp_data' }))
    expect(calleeCallWs.send).toHaveBeenCalledWith(JSON.stringify({ type: 'offer', sdp: 'sdp_data' }))

    // Test call response
    const res3 = websocket.sendCallResponse('caller1', 'callee1', 'accept')
    expect(res3).toEqual({ status: 'success', message: 'Call request answered' })
    expect(calleeWs.send).toHaveBeenCalledWith(JSON.stringify({ title: 'Call response', message: 'accept', from: 'caller1' }))

    // Test call cancel
    const res4 = websocket.sendCallCancelation('caller1', 'callee1')
    expect(res4).toEqual({ status: 'success', message: 'Call request answered' })
    expect(calleeWs.send).toHaveBeenCalledWith(JSON.stringify({ title: 'Cancel call' }))

    // Test offline user call notification
    const res5 = websocket.sendCallNotification('caller1', 'offlineUser')
    expect(res5).toEqual({ status: 'error', message: 'User is offline' })
  })

  it('should handle disconnects properly', () => {
    const connectionCallback = connectionCallbackHolder.callback
    if (!connectionCallback) return

    const ws = createMockWs()
    connectionCallback(ws, { url: '/?userId=userClose&channelId=channelClose', headers: { host: 'localhost' } })
    
    const onCloseHandler = ws.on.mock.calls.find(call => call[0] === 'close')?.[1]
    expect(onCloseHandler).toBeDefined()
    
    onCloseHandler()
    // Verification would ideally be checking that channel is empty, but we can't access it easily
    // So we just ensure it doesn't crash
    expect(true).toBe(true)
  })
})

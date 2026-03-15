import { vi } from 'vitest'

// Create inline mocks instead of resolving paths, as it's more stable
vi.mock('fs/promises', () => {
  const mockFiles = new Map<string, string>()
  
  const fsMock = {
    readFile: vi.fn(async (path: string) => {
      const normalizedPath = path.replace(/\\/g, '/').replace(/^\.\//, '')
      if (mockFiles.has(normalizedPath)) {
        return mockFiles.get(normalizedPath)
      }
      throw new Error(`ENOENT: no such file or directory, open '${normalizedPath}'`)
    }),
    writeFile: vi.fn(async (path: string, data: string) => {
      mockFiles.set(path.replace(/\\/g, '/').replace(/^\.\//, ''), data)
    }),
    mkdir: vi.fn(async () => {}),
    access: vi.fn(async () => {}),
    readdir: vi.fn(async () => []),
    unlink: vi.fn(async (path: string) => {
       mockFiles.delete(path.replace(/\\/g, '/').replace(/^\.\//, ''))
    }),
    __setMockFileData: (path: string, data: string) => {
      mockFiles.set(path.replace(/\\/g, '/').replace(/^\.\//, ''), data)
    },
    __clearMockFiles: () => {
      mockFiles.clear()
    }
  }

  return {
    default: fsMock,
    ...fsMock
  }
})

vi.mock('h3', () => ({
  defineEventHandler: (handler: any) => handler,
  readBody: vi.fn((...args: any[]) => (globalThis as any).readBody(...args)),
  getCookie: vi.fn((...args: any[]) => (globalThis as any).getCookie(...args)),
  setCookie: vi.fn((...args: any[]) => (globalThis as any).setCookie(...args)),
  getQuery: vi.fn((...args: any[]) => (globalThis as any).getQuery(...args)),
  getRouterParam: vi.fn((...args: any[]) => (globalThis as any).getRouterParam(...args)),
  readMultipartFormData: vi.fn((...args: any[]) => (globalThis as any).readMultipartFormData(...args)),
  createError: vi.fn((opts: any) => {
    const err = new Error(opts.statusMessage || 'Error')
    ;(err as any).statusCode = opts.statusCode
    ;(err as any).statusMessage = opts.statusMessage
    return err
  }),
}))

// Globals provided by Nuxt
// @ts-ignore
globalThis.defineEventHandler = (handler: any) => handler
// @ts-ignore
globalThis.readBody = vi.fn()
// @ts-ignore
globalThis.getCookie = vi.fn()
// @ts-ignore
globalThis.setCookie = vi.fn()
// @ts-ignore
globalThis.getQuery = vi.fn()
// @ts-ignore
globalThis.getRouterParam = vi.fn()
// @ts-ignore
globalThis.readMultipartFormData = vi.fn()
// @ts-ignore
globalThis.createError = vi.fn((opts: any) => {
  const err = new Error(opts.statusMessage || 'Error')
  ;(err as any).statusCode = opts.statusCode
  return err
})

// Clear mocks before each test
import { beforeEach } from 'vitest'

beforeEach(() => {
  vi.clearAllMocks()
  import('fs/promises').then(fs => {
    (fs.default as any).__clearMockFiles()
  })
})

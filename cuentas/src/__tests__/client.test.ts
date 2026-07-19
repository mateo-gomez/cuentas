jest.mock("../utils", () => ({
  removeInitialSlash: (s: string) => s.replace(/^\//, ""),
}))

jest.mock("../config", () => ({
  default: { apiUrl: "http://test-api" },
}))

jest.mock("../helpers/storage", () => ({
  storage: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  },
}))

jest.mock("../lib/logger", () => ({
  createLogger: () => ({
    error: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  }),
}))

import { client } from "../helpers/client"
import { ApiError, isApiError } from "../helpers/ApiError"

const mockFetch = jest.fn()
global.fetch = mockFetch as unknown as typeof fetch

describe("client fetcher", () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  describe("error paths", () => {
    it("throws ApiError with message and statusCode on non-2xx", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: async () => ({
          statusCode: 401,
          message: "Invalid email or password",
        }),
      })

      let caught: unknown
      try {
        await client.get("/test")
      } catch (e) {
        caught = e
      }

      expect(isApiError(caught)).toBe(true)
      const err = caught as ApiError
      expect(err.message).toBe("Invalid email or password")
      expect(err.statusCode).toBe(401)
    })

    it("populates errors field when backend includes it", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({
          statusCode: 400,
          message: "Validation failed",
          errors: { email: ["invalid format"] },
        }),
      })

      let caught: unknown
      try {
        await client.get("/test")
      } catch (e) {
        caught = e
      }

      expect(isApiError(caught)).toBe(true)
      expect((caught as ApiError).errors).toEqual({ email: ["invalid format"] })
    })

    it("uses fallback message when backend response has no message", async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({}),
      })

      let caught: unknown
      try {
        await client.get("/test")
      } catch (e) {
        caught = e
      }

      expect(isApiError(caught)).toBe(true)
      expect((caught as ApiError).message).toBe(
        "Ha ocurrido un error inesperado",
      )
    })

    it("propagates network error without wrapping in ApiError", async () => {
      mockFetch.mockRejectedValue(new Error("Network request failed"))

      let caught: unknown
      try {
        await client.get("/test")
      } catch (e) {
        caught = e
      }

      expect(isApiError(caught)).toBe(false)
      expect(caught).toBeInstanceOf(Error)
      expect((caught as Error).message).toBe("Network request failed")
    })
  })

  describe("happy path", () => {
    it("returns parsed JSON on 2xx", async () => {
      const data = { id: "1", name: "test" }
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => data,
      })

      const result = await client.get("/test")
      expect(result).toEqual(data)
    })
  })
})

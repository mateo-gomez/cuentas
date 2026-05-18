import { ApiError, isApiError } from "../helpers/ApiError"

describe("ApiError", () => {
  describe("constructor", () => {
    it("stores message", () => {
      const err = new ApiError("test message", 400)
      expect(err.message).toBe("test message")
    })

    it("stores statusCode", () => {
      const err = new ApiError("msg", 401)
      expect(err.statusCode).toBe(401)
    })

    it("stores errors when provided", () => {
      const errors = { email: ["invalid format"] }
      const err = new ApiError("validation", 400, errors)
      expect(err.errors).toEqual(errors)
    })

    it("errors is undefined when not provided", () => {
      const err = new ApiError("msg", 500)
      expect(err.errors).toBeUndefined()
    })

    it("name is ApiError", () => {
      const err = new ApiError("msg", 400)
      expect(err.name).toBe("ApiError")
    })

    it("is instance of Error", () => {
      const err = new ApiError("msg", 400)
      expect(err).toBeInstanceOf(Error)
    })
  })

  describe("isApiError", () => {
    it("returns true for ApiError instance", () => {
      expect(isApiError(new ApiError("msg", 400))).toBe(true)
    })

    it("returns false for plain Error", () => {
      expect(isApiError(new Error("msg"))).toBe(false)
    })

    it("returns false for null", () => {
      expect(isApiError(null)).toBe(false)
    })

    it("returns false for undefined", () => {
      expect(isApiError(undefined)).toBe(false)
    })

    it("returns false for plain object", () => {
      expect(isApiError({ message: "msg", statusCode: 400 })).toBe(false)
    })
  })
})

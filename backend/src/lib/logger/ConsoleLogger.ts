import { ILogger } from "./ILogger"

const LEVEL_PREFIX: Record<string, string> = {
  debug: "[DEBUG]",
  info:  "[INFO] ",
  warn:  "[WARN] ",
  error: "[ERROR]",
}

export class ConsoleLogger implements ILogger {
  constructor(private readonly namespace: string) {}

  private format(level: string, message: string): string {
    return `${LEVEL_PREFIX[level]} [${this.namespace}] ${message}`
  }

  debug(message: string, context?: Record<string, unknown>): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.format("debug", message), ...(context ? [context] : []))
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    console.info(this.format("info", message), ...(context ? [context] : []))
  }

  warn(message: string, context?: Record<string, unknown>): void {
    console.warn(this.format("warn", message), ...(context ? [context] : []))
  }

  error(message: string, context?: Record<string, unknown>): void {
    console.error(this.format("error", message), ...(context ? [context] : []))
  }
}

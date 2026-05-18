import { ILogger } from "./ILogger"
import { ConsoleLogger } from "./ConsoleLogger"

export function createLogger(namespace: string): ILogger {
  return new ConsoleLogger(namespace)
}

import newrelic from "newrelic";
import util from "util";

export interface ConsoleLogOptions {
  /**
   * Array of log-related methods to instrument (defaults to log, dir, debug, info, warn and error)
   */
  captureMethods: Array<LogMethods | `${LogMethods}`>;
  /**
   * Level to use for non-level-specific methods (console.log and console.dir, defaults to "info")
   */
  defaultLevel: "debug" | "info" | "warn" | "error";
}

export enum LogMethods {
  log = "log",
  dir = "dir",
  debug = "debug",
  info = "info",
  warn = "warn",
  error = "error",
}

type ConsoleMethods = Partial<Pick<Console, LogMethods>>;

const ORIG_METHODS: ConsoleMethods = {};

/**
 * Instrument console-related logging methods
 * @param {ConsoleLogOptions} param0
 */
export default function initialize({
  captureMethods = Object.values(LogMethods),
  defaultLevel = "info",
}: Partial<ConsoleLogOptions> = {}) {
  captureMethods.forEach((method) => {
    // prevent double-wrapping
    if (method in ORIG_METHODS) return;

    ORIG_METHODS[method] = console[method];

    // the `dir` method is slightly different from the rest of the logging methods
    if (method === "dir") {
      const original = console.dir;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console[method] = function (obj: unknown, ...options: any[]) {
        newrelic.recordLogEvent({
          message: util.inspect(obj, ...options),
          level: defaultLevel,
        });
        original(obj, ...options);
      };
    } else {
      const original = console[method];
      console[method] = function (...args: unknown[]) {
        newrelic.recordLogEvent({
          message: util.format(...args),
          level: method === "log" ? defaultLevel : method,
        });
        original(...args);
      };
    }
  });
}

/**
 * Remove instrumentation put in place by most recent call to `initialize`
 */
export function uninitialize() {
  Object.values(LogMethods).forEach((method) => {
    const original = ORIG_METHODS[method];
    if (original) {
      console[method] = original;
      delete ORIG_METHODS[method];
    }
  });
}

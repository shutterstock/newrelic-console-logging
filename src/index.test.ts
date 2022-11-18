import newrelic from "newrelic";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from "@jest/globals";

import initialize, { LogMethods, uninitialize } from "./index";

jest.mock("newrelic", () => {
  return {
    recordLogEvent: jest.fn(),
  };
});

interface ConsoleMocks {
  log: jest.SpiedFunction<Console["log"]>;
  dir: jest.SpiedFunction<Console["dir"]>;
  debug: jest.SpiedFunction<Console["debug"]>;
  info: jest.SpiedFunction<Console["info"]>;
  warn: jest.SpiedFunction<Console["warn"]>;
  error: jest.SpiedFunction<Console["error"]>;
}

describe("capture-console", () => {
  const mocks: Partial<ConsoleMocks> = {};
  beforeEach(() => {
    mocks.log = jest.spyOn(console, "log").mockImplementation(jest.fn());
    mocks.dir = jest.spyOn(console, "dir").mockImplementation(jest.fn());
    mocks.debug = jest.spyOn(console, "debug").mockImplementation(jest.fn());
    mocks.info = jest.spyOn(console, "info").mockImplementation(jest.fn());
    mocks.warn = jest.spyOn(console, "warn").mockImplementation(jest.fn());
    mocks.error = jest.spyOn(console, "error").mockImplementation(jest.fn());
  });

  afterEach(() => uninitialize());

  it("wraps existing log methods", () => {
    initialize();
    console.log("This is log message %d", 1);
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "info",
      message: "This is log message 1",
    });
    expect(mocks.log).toHaveBeenCalledWith("This is log message %d", 1);

    console.dir({ foo: "bar" });
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "info",
      message: "{ foo: 'bar' }",
    });
    expect(mocks.dir).toHaveBeenCalledWith({ foo: "bar" });

    console.debug("Debug 1");
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "debug",
      message: "Debug 1",
    });
    expect(mocks.debug).toHaveBeenCalledWith("Debug 1");

    console.info("%s %d", "Info", 2);
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "info",
      message: "Info 2",
    });
    expect(mocks.info).toHaveBeenCalledWith("%s %d", "Info", 2);

    console.warn("Warning");
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "warn",
      message: "Warning",
    });
    expect(mocks.warn).toHaveBeenCalledWith("Warning");

    console.error("Error");
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "error",
      message: "Error",
    });
    expect(mocks.error).toHaveBeenCalledWith("Error");
  });

  it("avoids double wrapping", () => {
    initialize({
      captureMethods: [LogMethods.log, "info"],
      defaultLevel: "error",
    });
    // this will be a no-op
    initialize({
      captureMethods: ["log", LogMethods.info],
      defaultLevel: "debug",
    });

    console.log("This should be sent as error");
    console.info("This should be sent as info");
    expect(newrelic.recordLogEvent).toHaveBeenCalledTimes(2);
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "error",
      message: "This should be sent as error",
    });
    expect(newrelic.recordLogEvent).toHaveBeenCalledWith({
      level: "info",
      message: "This should be sent as info",
    });
  });
});

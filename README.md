# `newrelic-console-logging` <!-- omit in toc -->

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Build Status](https://github.com/shutterstock/newrelic-console-logging/actions/workflows/ci.yaml/badge.svg)](https://github.com/shutterstock/newrelic-console-logging/actions/workflows/ci.yaml)

This module handles forwarding logs emitted via the various `console` log-related methods (i.e. `console.log(...)`) to New Relic's log aggregation endpoint.
It is intended to be used in conjunction with [New Relic's](https://newrelic.com/) [APM agent](https://www.npmjs.com/package/newrelic).

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Example Usage](#example-usage)
- [API](#api)
  - [`initialize`](#initialize)
  - [`uninitialize`](#uninitialize)
- [Other Exports](#other-exports)
  - [`LogMethods` (enum)](#logmethods-enum)
  - [`ConsoleLogOptions`](#consolelogoptions)

## Getting Started

### Prerequisites

Your project should have a dependency on [New Relic](https://www.npmjs.com/package/newrelic) `v9.4.0` or newer (listed as a peer dependency of this module).
For this module to be useful, you will also need to have [Logs in Context](https://docs.newrelic.com/docs/logs/logs-context/configure-logs-context-nodejs) enabled.
This module has no other runtime dependencies.

### Installation

```bash
npm install --save newrelic-console-logging
# or using yarn
yarn add newrelic-console-logging
```

### Example Usage

```typescript
import newrelic from "newrelic";
import newrelicConsoleLogging from "newrelic-console-logging";

// initialize
newrelicConsoleLogging();

// this will be forwarded to New Relic's log aggregation endpoint
console.log("Hello, World!");
```

## API

### `initialize`

This is the default export and (most likely) the only thing you will need to know about for this module.
It supports a couple of options for slight changes in behavior but both have sensible defaults.

| Property         | Type                                     | Description                                                                                                                                                                                   |
| ---------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `captureMethods` | `LogMethods[]`                           | **Default: `["log", "dir", "debug", "info", "warn", "error"]`.** Determines which logging-related methods on the `console` object are instrumented. By default, all of them are instrumented. |
| `defaultLevel`   | `"debug" \| "info" \| "warn" \| "error"` | **Default: `"info"`.** For methods that do not have an explicit log level (like `console.log` or `console.dir`), use this log level instead.                                                  |

### `uninitialize`

This is provided as a means of removing all instrumentation from the logging methods instrumented by the most recent call to [`initialize`](#initialize)

## Other Exports

### `LogMethods` (enum)

Provides the names of the various log-related methods on the `console` object.

### `ConsoleLogOptions`

Defines the acceptable options for the [`initialize`](#initialize) method

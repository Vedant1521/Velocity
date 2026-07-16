import * as Sentry from "@sentry/node";

type LogContext = Record<string, unknown>;

// A lightweight telemetry wrapper routing to console and error-reporting platforms (Sentry)
export const logger = {
  info(message: string, context?: LogContext) {
    console.log(message, context ?? "");
  },

  warn(message: string, context?: LogContext) {
    console.warn(message, context ?? "");
  },

  error(message: string, context?: LogContext) {
    console.error(message, context ?? "");

    // Automatically capture backend exception logs in Sentry for error tracking
    Sentry.captureMessage(message, {
      level: "error",
      extra: context,
    });
  },

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(message, context ?? "");
    }
  },
};

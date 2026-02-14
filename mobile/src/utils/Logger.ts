/**
 * Logger Utility
 * Production-safe logging with level filtering
 * Automatically strips logs in production builds
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: any;
}

class LoggerClass {
  private logs: LogEntry[] = [];
  private maxLogs: number = 100;
  private isProduction: boolean = process.env.NODE_ENV === 'production';
  private minLevel: LogLevel = this.isProduction ? 'error' : 'debug';

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.minLevel);
  }

  private addLog(level: LogLevel, message: string, ...data: any[]) {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data: data.length > 0 ? data : undefined,
    };

    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const prefix = `[${level.toUpperCase()}]`;
    switch (level) {
      case 'debug':
        console.debug(prefix, message, ...data);
        break;
      case 'info':
        console.info(prefix, message, ...data);
        break;
      case 'warn':
        console.warn(prefix, message, ...data);
        break;
      case 'error':
        console.error(prefix, message, ...data);
        break;
    }
  }

  debug(message: string, ...data: any[]) {
    this.addLog('debug', message, ...data);
  }

  info(message: string, ...data: any[]) {
    this.addLog('info', message, ...data);
  }

  warn(message: string, ...data: any[]) {
    this.addLog('warn', message, ...data);
  }

  error(message: string, ...data: any[]) {
    this.addLog('error', message, ...data);
  }

  // Get logs for debugging
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Clear logs
  clear() {
    this.logs = [];
  }

  // Set minimum log level
  setMinLevel(level: LogLevel) {
    this.minLevel = level;
  }

  // Performance logging
  performance(operation: string, durationMs: number) {
    if (durationMs > 100) {
      this.warn(`Slow operation: ${operation} took ${durationMs}ms`);
    } else {
      this.debug(`Performance: ${operation} took ${durationMs}ms`);
    }
  }
}

export const Logger = new LoggerClass();

// Helper for development-only logs
export function devLog(message: string, ...data: any[]) {
  if (__DEV__) {
    console.log('[DEV]', message, ...data);
  }
}

export default Logger;

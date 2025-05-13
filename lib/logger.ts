export type LogType = 'login' | 'plan_activation' | 'plan_update' | 'staff_created' | 'boost_added' | 'setting_changed';

export interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  type: LogType;
  description: string;
  metadata?: Record<string, any>;
}

class Logger {
  private logs: LogEntry[] = [];
  private readonly STORAGE_KEY = 'wishchat_activity_logs';

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    try {
      const savedLogs = localStorage.getItem(this.STORAGE_KEY);
      if (savedLogs) {
        this.logs = JSON.parse(savedLogs);
      }
    } catch (error) {
      console.error('Failed to load logs from storage:', error);
      this.logs = [];
    }
  }

  private saveLogs(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save logs to storage:', error);
    }
  }

  public log(
    user: string,
    type: LogType,
    description: string,
    metadata?: Record<string, any>
  ): void {
    const logEntry: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      user,
      type,
      description,
      metadata
    };

    this.logs.push(logEntry);
    this.saveLogs();
    console.log(`[${type.toUpperCase()}] ${description}`);
  }

  public getAll(): LogEntry[] {
    return [...this.logs].sort((a, b) => {
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  public getByType(type: LogType): LogEntry[] {
    return this.getAll().filter(log => log.type === type);
  }

  public getByUser(username: string): LogEntry[] {
    return this.getAll().filter(log => log.user === username);
  }

  public getByDateRange(startDate: Date, endDate: Date): LogEntry[] {
    return this.getAll().filter(log => {
      const logDate = new Date(log.timestamp);
      return logDate >= startDate && logDate <= endDate;
    });
  }

  public exportToFile(): string {
    const logText = this.logs
      .map(log => {
        const timestamp = new Date(log.timestamp).toLocaleString();
        const metadata = log.metadata ? JSON.stringify(log.metadata) : '';
        return `[${timestamp}] [${log.type}] [${log.user}] ${log.description} ${metadata}`;
      })
      .join('\n');

    const blob = new Blob([logText], { type: 'text/plain' });
    return URL.createObjectURL(blob);
  }

  public clear(): void {
    this.logs = [];
    this.saveLogs();
  }
}

// Create a singleton instance
const logger = new Logger();
export default logger;

/**
 * Enumeration of log levels in order of severity.
 * Higher values include lower severity levels.
 */
export enum LogLevel {
    NONE = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4,
    TRACE = 5
}

/**
 * Enumeration of timestamp formats for log messages.
 */
export enum LogTimestampFormat {
    OFF = 0,
    LOCAL = 1,
    ISO = 3
}

/**
 * A static utility class for logging messages to the console with configurable
 * log levels and timestamp formatting. Automatically disables logging in production.
 * 
 * @class Logger
 * @static
 * @module framework
 * @example
 * ```typescript
 * Logger.setLogLevel(LogLevel.DEBUG);
 * Logger.setTimestampFormat(LogTimestampFormat.ISO);
 * Logger.info('Application started');
 * Logger.error('Something went wrong', error);
 * ```
 */
export class Logger {

    private static _instance: Logger;
    private static readonly production: boolean = import.meta.env.PROD;
    private static logLevel: LogLevel = LogLevel.ERROR;
    private static timestampFormat: LogTimestampFormat = LogTimestampFormat.ISO;

    /**
     * Gets the singleton instance of the Logger class.
     * Note: This class is primarily used through static methods.
     * @returns The Logger instance
     */
    public static getInstance(): Logger {
        if (!Logger._instance) {
            Logger._instance = new Logger();
        }
        return Logger._instance;
    }

    /**
     * Logs an informational message to the console if the current log level
     * allows INFO messages and the application is not in production mode.
     * 
     * @param message - The message to be logged
     * @param optionalParams - Additional parameters to log
     * @returns void
     * @example
     * ```typescript
     * Logger.info('Application started');
     * ```
     */
    public static info(message?: any, ...optionalParams: any[]): void {
        if (Logger.logLevel < LogLevel.INFO || Logger.production) return;
        console.log(`[${Logger.timestamp}] ${message}`, ...optionalParams);
    }

    /**
     * Logs a debug message to the console if the current log level
     * allows DEBUG messages and the application is not in production mode.
     * 
     * @param message - The message to be logged
     * @param optionalParams - Additional parameters to log
     * @returns void
     * @example
     * ```typescript
     * Logger.debug('Internal state', state);
     * ```
     */
    public static debug(message?: any, ...optionalParams: any[]): void {
        if (Logger.logLevel < LogLevel.DEBUG || Logger.production) return;
        console.log(`[${Logger.timestamp}] ${message}`, ...optionalParams);
    }

    /**
     * Logs an error message to the console if the current log level
     * allows ERROR messages. Errors are always logged, even in production.
     * 
     * @param message - The error message to be logged
     * @param optionalParams - Additional parameters to log (e.g., error objects)
     * @returns void
     * @example
     * ```typescript
     * Logger.error('Database connection failed', error);
     * ```
     */
    public static error(message?: any, ...optionalParams: any[]): void {
        if (Logger.logLevel < LogLevel.ERROR) return;
        console.error(`[${Logger.timestamp}] ${message}`, ...optionalParams);
    }

    /**
     * Logs a warning message to the console if the current log level
     * allows WARN messages. Warnings are always logged, even in production.
     * 
     * @param message - The warning message to be logged
     * @param optionalParams - Additional parameters to log
     * @returns void
     * @example
     * ```typescript
     * Logger.warn('Deprecated API used', apiName);
     * ```
     */
    public static warn(message?: any, ...optionalParams: any[]): void {
        if (Logger.logLevel < LogLevel.WARN) return;
        console.warn(`[${Logger.timestamp}] ${message}`, ...optionalParams);
    }

    /**
     * Clears the console if the current log level is not NONE.
     * 
     * @returns void
     */
    public static clear(): void {
        if (Logger.logLevel === LogLevel.NONE) return;
        console.clear();
    }

    /**
     * Starts a timer to measure the duration of an operation.
     * The timer is only started if the current log level is not NONE
     * and the application is not in production mode.
     * 
     * @param label - The label to identify this timer
     * @returns void
     * @example
     * ```typescript
     * Logger.time('database-query');
     * // ... perform operation
     * Logger.timeEnd('database-query');
     * ```
     */
    public static time(label: string): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.time(label);
    }

    /**
     * Stops a timer that was previously started with Logger.time()
     * and displays the elapsed time in the console.
     * The timer is only stopped if the current log level is not NONE
     * and the application is not in production mode.
     * 
     * @param label - The label of the timer to stop
     * @returns void
     * @see Logger.time
     */
    public static timeEnd(label: string): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.timeEnd(label);
    }

    /**
     * Creates a new group in the console for organizing related log messages.
     * The group is only created if the current log level is not NONE
     * and the application is not in production mode.
     * 
     * @param label - The label for the group
     * @returns void
     * @example
     * ```typescript
     * Logger.group('User Authentication');
     * Logger.info('Validating credentials');
     * Logger.info('Creating session');
     * Logger.groupEnd();
     * ```
     */
    public static group(label: string): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.group(label);
    }

    /**
     * Ends the most recently created group in the console.
     * The group is only ended if the current log level is not NONE
     * and the application is not in production mode.
     * 
     * @returns void
     * @see Logger.group
     */
    public static groupEnd(): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.groupEnd();
    }

    /**
     * Logs a trace message to console if current log level
     * allows TRACE messages and the application is not in production mode.
     * Includes a stack trace to help with debugging.
     * 
     * @param message - The message to be logged
     * @param optionalParams - Additional parameters to log
     * @returns void
     * @example
     * ```typescript
     * Logger.trace('Entering function', functionName);
     * ```
     */
    public static trace(message?: any, ...optionalParams: any[]): void {
        if (Logger.logLevel < LogLevel.TRACE || Logger.production) return;
        console.trace(message, ...optionalParams);
    }

    /**
     * Creates a collapsed group in the console for organizing related log messages.
     * The group starts collapsed and can be expanded by the user.
     * Only created if the current log level is not NONE
     * and the application is not in production mode.
     * 
     * @param label - The label for the collapsed group
     * @returns void
     * @example
     * ```typescript
     * Logger.groupCollapsed('Debug Info');
     * Logger.debug('Internal state', state);
     * Logger.groupEnd();
     * ```
     */
    public static groupCollapsed(label: string): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.groupCollapsed(label);
    }

    /**
     * Displays an interactive tree representation of specified object.
     * The output is similar to the console.dir() function in Firefox.
     * Only displayed if current log level is not NONE
     * and the application is not in production mode.
     * 
     * @param message - The object to display in a tree format
     * @param optionalParams - Additional objects to display
     * @returns void
     * @example
     * ```typescript
     * Logger.dir(userObject);
     * ```
     */
    public static dir(message?: any, ...optionalParams: any[]): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.dir(message, ...optionalParams);
    }

    /**
     * Displays an XML representation of specified object.
     * Only displayed if current log level is not NONE
     * and the application is not in production mode.
     * 
     * @param value - The object to display in XML format
     * @returns void
     * @example
     * ```typescript
     * Logger.dirxml(xmlElement);
     * ```
     */
    public static dirxml(value: any): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.dirxml(value);
    }

    /**
     * Displays tabular data as a table in console.
     * Only displayed if current log level is not NONE
     * and the application is not in production mode.
     * 
     * @param tabularData - The data to display in table format (array or object)
     * @param properties - Optional array of column names to display
     * @returns void
     * @example
     * ```typescript
     * Logger.table([{name: 'John', age: 30}, {name: 'Jane', age: 25}]);
     * ```
     */
    public static table(tabularData: any, properties?: string[]): void {
        if (Logger.logLevel === LogLevel.NONE || Logger.production) return;
        console.table(tabularData, properties);
    }

    /**
     * Retrieves the current timestamp as a string based on the configured format.
     * 
     * @returns The current timestamp in either ISO or local format, or an empty string if timestamping is off.
     */
    private static get timestamp(): string {
        if (Logger.timestampFormat === LogTimestampFormat.ISO)
            return new Date().toISOString();
        else if (Logger.timestampFormat === LogTimestampFormat.LOCAL)
            return new Date().toLocaleString();
        return '';
    }

    /**
     * Sets the format of the timestamp used in log messages.
     * @param format The desired timestamp format.
     * @default LogTimestampFormat.ISO
     * @see LogTimestampFormat
     */
    public static setTimestampFormat(format: LogTimestampFormat): void {
        Logger.timestampFormat = format;
    }

    /**
     * Sets the minimum log level for messages to be displayed.
     * @param level The desired minimum log level.
     * @default LogLevel.ERROR
     * @see LogLevel
     */
    public static setLogLevel(level: LogLevel): void {
        Logger.logLevel = level;
    }
}
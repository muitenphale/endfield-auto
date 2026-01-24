import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;

const customFormat = printf(({ level, message, timestamp, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
    // eslint-disable-next-line no-control-regex
    const upperLevel = level.replace(/(\x1b\[[0-9;]*m)|([^\x1b]+)/g, (m, ansi, text) => ansi || text.toUpperCase());
    return `${timestamp} [${upperLevel}]${metaStr} ${message}`;
});

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || "info",
    format: combine(
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        customFormat
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
                customFormat
            ),
        }),
    ],
});

export default logger;

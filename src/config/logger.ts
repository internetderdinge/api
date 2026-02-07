import winston from 'winston';
import type { Format } from 'logform';
import config from './config';

const enumerateErrorFormat: Format = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: winston.format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? winston.format.colorize() : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf((info) => {
      const { level, message, stack, ...rest } = info as Record<string, unknown>;
      const restKeys = Object.keys(rest);
      const restText = restKeys.length ? ` ${JSON.stringify(rest)}` : '';
      const stackText = stack ? `\n${stack}` : '';
      return `${level}: ${message}${stackText}${restText}`;
    }),
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;

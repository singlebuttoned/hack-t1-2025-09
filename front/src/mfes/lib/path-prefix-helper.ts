import { PathPrefix } from './types';

/**
 * Compile-time checker for path validity
 */
export function validPathPrefix<T extends `/${string}`>(
  s: T & (T extends `${string}/` ? never : unknown)
): T & PathPrefix {
  if (process.env.NODE_ENV !== 'production') {
    if (!s.startsWith('/')) {
      throw new Error(
        `validPathPrefix expected value to start with '/'. Received: "${s}"`
      );
    }
    if (s.length > 1 && s.endsWith('/')) {
      throw new Error(
        `validPathPrefix expected value without trailing '/'. Received: "${s}"`
      );
    }
  }

  return s as unknown as T & PathPrefix;
}

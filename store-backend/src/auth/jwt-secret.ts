/**
 * Single source of truth for resolving the JWT signing secret.
 *
 * - If `JWT_SECRET` is set, it is used as-is.
 * - In production (`NODE_ENV=production`) a missing secret is a fatal
 *   misconfiguration: we throw so the app refuses to boot rather than
 *   silently signing tokens with a publicly known string.
 * - In development we fall back to a well-known value and log a warning so
 *   local work keeps running without extra setup.
 */

const DEV_FALLBACK_SECRET = 'fallback-dev-secret';
const MIN_SECRET_LENGTH = 16;

let warned = false;

export function resolveJwtSecret(
  env: NodeJS.ProcessEnv = process.env,
): string {
  const secret = env.JWT_SECRET?.trim();

  if (secret) {
    if (
      env.NODE_ENV === 'production' &&
      secret.length < MIN_SECRET_LENGTH &&
      secret === DEV_FALLBACK_SECRET
    ) {
      throw new Error(
        'JWT_SECRET is set to the insecure development fallback. ' +
          'Generate a strong secret (e.g. `openssl rand -hex 32`).',
      );
    }
    return secret;
  }

  if (env.NODE_ENV === 'production') {
    throw new Error(
      'JWT_SECRET is not set. Refusing to start in production without it — ' +
        'tokens would be forgeable. Generate one (e.g. `openssl rand -hex 32`) ' +
        'and set it in the environment.',
    );
  }

  if (!warned) {
    warned = true;
    // eslint-disable-next-line no-console
    console.warn(
      '[auth] JWT_SECRET is not set — using the insecure development fallback. ' +
        'Never do this in production.',
    );
  }
  return DEV_FALLBACK_SECRET;
}

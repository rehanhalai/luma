export function invariant<T>(
  value: T,
  error: Error | (() => Error),
): asserts value is NonNullable<T> {
  if (!value) {
    throw typeof error === 'function' ? error() : error;
  }
}

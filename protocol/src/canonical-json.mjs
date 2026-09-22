import { invariant } from './errors.mjs';

function normalize(value, path, seen) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    invariant(Number.isFinite(value), 'CANONICAL_NON_FINITE_NUMBER', path);
    invariant(!Object.is(value, -0), 'CANONICAL_NEGATIVE_ZERO', path);
    return value;
  }
  invariant(typeof value !== 'undefined', 'CANONICAL_UNDEFINED', path);
  invariant(typeof value !== 'bigint' && typeof value !== 'function' && typeof value !== 'symbol', 'CANONICAL_UNSUPPORTED_TYPE', path);
  invariant(typeof value === 'object', 'CANONICAL_UNSUPPORTED_TYPE', path);
  invariant(!seen.has(value), 'CANONICAL_CYCLE', path);
  invariant(Object.getPrototypeOf(value) === Object.prototype || Array.isArray(value), 'CANONICAL_NON_PLAIN_OBJECT', path);
  invariant(!Object.hasOwn(value, 'toJSON'), 'CANONICAL_TOJSON_FORBIDDEN', path);

  seen.add(value);
  let output;
  if (Array.isArray(value)) {
    invariant(Object.keys(value).length === value.length, 'CANONICAL_SPARSE_ARRAY', path);
    output = value.map((entry, index) => normalize(entry, `${path}[${index}]`, seen));
  } else {
    output = {};
    for (const key of Object.keys(value).sort()) output[key] = normalize(value[key], `${path}.${key}`, seen);
  }
  seen.delete(value);
  return output;
}

export function canonicalize(value) {
  return JSON.stringify(normalize(value, '$', new Set()));
}

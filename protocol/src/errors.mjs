export class ProtocolError extends Error {
  constructor(code, detail = '') {
    super(detail ? `${code}: ${detail}` : code);
    this.name = 'ProtocolError';
    this.code = code;
  }
}

export function invariant(condition, code, detail = '') {
  if (!condition) throw new ProtocolError(code, detail);
}

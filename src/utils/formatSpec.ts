/**
 * formatSpec — notation helper for pharmaceutical specification values.
 *
 * Formats a value/unit/tolerance combination according to site notation rules:
 *   - Thin space (U+2009) between value and unit
 *   - Tolerance expressed as " ± <tol>"
 *   - Diameter prefix "Ø\u2009" when isDiameter is true
 *
 * All formatting flows through this single function so that notation is
 * consistent across every product spec table, variant label, and summary.
 */

export interface FormatSpecOptions {
  /** The numeric or string value. Numbers are converted via .toString() — no rounding or padding. */
  value: string | number;
  /** Unit string, rendered exactly as provided (callers must pass "mL" not "ml"). Optional. */
  unit?: string;
  /** Tolerance value. Numbers are converted via .toString(). Optional. */
  tol?: string | number;
  /** When true, prefixes the output with "Ø\u2009". Default false. */
  isDiameter?: boolean;
}

const THIN = '\u2009'; // U+2009 THIN SPACE

export function formatSpec(opts: FormatSpecOptions): string {
  const { value, unit, tol, isDiameter = false } = opts;

  const valueStr = typeof value === 'number' ? value.toString() : value;
  const tolStr   = tol !== undefined ? (typeof tol === 'number' ? tol.toString() : tol) : undefined;
  const hasUnit  = typeof unit === 'string' && unit.length > 0;
  const hasTol   = tolStr !== undefined;

  // Build the core (non-diameter) part
  let core: string;

  if (!hasTol && !hasUnit) {
    // bare value
    core = valueStr;
  } else if (!hasTol && hasUnit) {
    // value thin-space unit
    core = `${valueStr}${THIN}${unit}`;
  } else if (hasTol && !hasUnit) {
    // value ± tol
    core = `${valueStr} ± ${tolStr}`;
  } else {
    // hasTol && hasUnit  →  value ± tol thin-space unit
    core = `${valueStr} ± ${tolStr}${THIN}${unit}`;
  }

  return isDiameter ? `Ø${THIN}${core}` : core;
}

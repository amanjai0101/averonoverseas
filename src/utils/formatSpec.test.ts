import { describe, it, expect } from 'vitest';
import { formatSpec } from './formatSpec';

// U+2009 THIN SPACE
const T = '\u2009';

/**
 * Eight example-based unit tests for formatSpec().
 * Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 */
describe('formatSpec', () => {
  // (a) plain value with unit
  it('(a) returns value + thin-space + unit when only value and unit are given', () => {
    expect(formatSpec({ value: '24.30', unit: 'mm' })).toBe(`24.30${T}mm`);
  });

  // (b) value with tolerance and unit
  it('(b) returns value ± tol + thin-space + unit when tol and unit are given', () => {
    expect(formatSpec({ value: '24.30', tol: '0.20', unit: 'mm' })).toBe(`24.30 ± 0.20${T}mm`);
  });

  // (c) diameter prefix with unit
  it('(c) prepends Ø + thin-space when isDiameter is true', () => {
    expect(formatSpec({ value: '34.40', unit: 'mm', isDiameter: true })).toBe(`Ø${T}34.40${T}mm`);
  });

  // (d) mL unit case preservation
  it('(d) preserves unit case exactly — mL not ml', () => {
    expect(formatSpec({ value: '25.70', unit: 'mL' })).toBe(`25.70${T}mL`);
  });

  // (e) no unit — bare value returned
  it('(e) returns bare value string when no unit and no tol are provided', () => {
    expect(formatSpec({ value: '100' })).toBe('100');
  });

  // (f) zero tolerance with unit
  it('(f) formats a zero tolerance correctly with unit', () => {
    expect(formatSpec({ value: '10', tol: '0', unit: 'mm' })).toBe(`10 ± 0${T}mm`);
  });

  // (g) tolerance without unit
  it('(g) returns value ± tol with no trailing unit when unit is absent', () => {
    expect(formatSpec({ value: '10', tol: '0.5' })).toBe('10 ± 0.5');
  });

  // (h) isDiameter with tolerance and no unit
  it('(h) prepends Ø + thin-space and appends ± tol when isDiameter true and no unit', () => {
    expect(formatSpec({ value: '34.40', tol: '0.20', isDiameter: true })).toBe(`Ø${T}34.40 ± 0.20`);
  });
});

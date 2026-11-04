import { afterEach, describe, expect, it, vi } from 'vitest';
import { CLINIC_TIME_ZONE, clinicTodayISO } from './clinicDate';

describe('clinicTodayISO (FE-03)', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('defaults to the Asia/Riyadh clinic zone (PO-15)', () => {
    expect(CLINIC_TIME_ZONE).toBe('Asia/Riyadh');
  });

  it('returns the Riyadh day at 01:00 Riyadh, when UTC is still on the previous day', () => {
    const oneAmRiyadh = new Date('2026-11-02T22:00:00Z');
    expect(oneAmRiyadh.toISOString().slice(0, 10)).toBe('2026-11-02');
    expect(clinicTodayISO(oneAmRiyadh)).toBe('2026-11-03');
  });

  it('switches day exactly at Riyadh midnight', () => {
    expect(clinicTodayISO(new Date('2026-11-02T20:59:59Z'))).toBe('2026-11-02');
    expect(clinicTodayISO(new Date('2026-11-02T21:00:00Z'))).toBe('2026-11-03');
  });

  it('ignores the browser zone of a patient abroad', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
    const oneAmRiyadh = new Date('2026-11-02T22:00:00Z');
    expect(oneAmRiyadh.getDate()).toBe(2);
    expect(clinicTodayISO(oneAmRiyadh)).toBe('2026-11-03');
  });

  it('pads month and day and handles year change', () => {
    expect(clinicTodayISO(new Date('2026-12-31T21:30:00Z'))).toBe('2027-01-01');
    expect(clinicTodayISO(new Date('2026-03-05T09:00:00Z'))).toBe('2026-03-05');
  });

  it('accepts another clinic zone', () => {
    expect(clinicTodayISO(new Date('2026-11-02T22:00:00Z'), 'Europe/London')).toBe('2026-11-02');
  });
});

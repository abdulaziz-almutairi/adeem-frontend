import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const getAvailableSlots = vi.fn();

vi.mock('../../api/doctorApi', () => ({
  doctorApi: {
    getVerifiedDoctors: vi.fn(async () => [
      { id: 3, fullName: 'د. سارة', specialty: 'جلدية', pricePerSession: 200 },
    ]),
  },
}));
vi.mock('../../api/appointmentApi', () => ({
  appointmentApi: {
    getAvailableSlots: (...args: unknown[]) => getAvailableSlots(...args),
    bookAppointment: vi.fn(),
  },
}));

const { default: BookingPage } = await import('./BookingPage');

async function openDateStep() {
  render(
    <MemoryRouter>
      <BookingPage />
    </MemoryRouter>,
  );
  fireEvent.click(await screen.findByText('د. سارة'));
  return screen.getByLabelText('التاريخ') as HTMLInputElement;
}

describe('BookingPage date limit (FE-03)', () => {
  beforeEach(() => {
    getAvailableSlots.mockReset();
    getAvailableSlots.mockResolvedValue([]);
    vi.useFakeTimers({ toFake: ['Date'] });
    // 01:00 in Riyadh on 3 November, still 2 November in UTC
    vi.setSystemTime(new Date('2026-11-02T22:00:00Z'));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('defaults to the Riyadh day at 01:00 Riyadh and loads its slots', async () => {
    const input = await openDateStep();

    expect(input.value).toBe('2026-11-03');
    await waitFor(() => expect(getAvailableSlots).toHaveBeenCalledWith(3, '2026-11-03'));
  });

  it('does not allow selecting yesterday', async () => {
    const input = await openDateStep();

    expect(input.min).toBe('2026-11-03');
    fireEvent.change(input, { target: { value: '2026-11-02' } });
    expect(input.value).toBe('2026-11-03');
    expect(getAvailableSlots).not.toHaveBeenCalledWith(3, '2026-11-02');
  });

  it('still accepts a future date', async () => {
    const input = await openDateStep();

    fireEvent.change(input, { target: { value: '2026-11-05' } });
    expect(input.value).toBe('2026-11-05');
    await waitFor(() => expect(getAvailableSlots).toHaveBeenCalledWith(3, '2026-11-05'));
  });
});

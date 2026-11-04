import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const initiatePayment = vi.fn();

vi.mock('../../api/paymentApi', () => ({
  paymentApi: {
    initiatePayment: (...args: unknown[]) => initiatePayment(...args),
    confirmPayment: vi.fn(),
  },
}));

const { default: PaymentPage } = await import('./PaymentPage');

const payment = { id: 1, appointmentId: 5, amount: 150, status: 'PENDING', transactionReference: 'TX-123' };
const INVALID_LINK = 'رابط الدفع غير صالح. افتح صفحة الدفع من مواعيدك في لوحة التحكم';
const INITIATE_ERROR = 'تعذّر بدء عملية الدفع';

function renderPage(path: string, strict = true) {
  const tree = (
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/payment/:appointmentId" element={<PaymentPage />} />
      </Routes>
    </MemoryRouter>
  );
  return render(strict ? <StrictMode>{tree}</StrictMode> : tree);
}

describe('PaymentPage (FE-08)', () => {
  beforeEach(() => {
    initiatePayment.mockReset();
  });

  afterEach(cleanup);

  it('sends one initiate request on first open under StrictMode and shows no error', async () => {
    initiatePayment.mockResolvedValue(payment);

    renderPage('/payment/5');

    expect(await screen.findByText('TX-123')).toBeTruthy();
    expect(initiatePayment).toHaveBeenCalledOnce();
    expect(initiatePayment).toHaveBeenCalledWith(5);
    expect(screen.queryByText(INITIATE_ERROR)).toBeNull();
  });

  it('shows no stale error when a second StrictMode call would have failed', async () => {
    initiatePayment
      .mockResolvedValueOnce(payment)
      .mockRejectedValueOnce({ response: { data: { message: 'تم بدء الدفع مسبقاً' } } });

    renderPage('/payment/5');

    expect(await screen.findByText('TX-123')).toBeTruthy();
    expect(screen.queryByText('تم بدء الدفع مسبقاً')).toBeNull();
    expect(initiatePayment).toHaveBeenCalledOnce();
  });

  it('sends one request per open without StrictMode (production build)', async () => {
    initiatePayment.mockResolvedValue(payment);

    renderPage('/payment/5', false);

    expect(await screen.findByText('TX-123')).toBeTruthy();
    expect(initiatePayment).toHaveBeenCalledOnce();
  });

  it('sends a fresh request after a refresh', async () => {
    initiatePayment.mockResolvedValue(payment);

    const first = renderPage('/payment/5');
    await screen.findByText('TX-123');
    first.unmount();

    renderPage('/payment/5');
    await screen.findByText('TX-123');

    expect(initiatePayment).toHaveBeenCalledTimes(2);
  });

  it('sends one request per tab when two tabs are open', async () => {
    initiatePayment.mockResolvedValue(payment);

    renderPage('/payment/5');
    renderPage('/payment/5');

    await waitFor(() => expect(screen.getAllByText('TX-123')).toHaveLength(2));
    expect(initiatePayment).toHaveBeenCalledTimes(2);
  });

  it('still shows the server error when the initiate request fails', async () => {
    initiatePayment.mockRejectedValue({ response: { data: { message: 'الموعد غير موجود' } } });

    renderPage('/payment/5');

    expect(await screen.findByText('الموعد غير موجود')).toBeTruthy();
    expect(initiatePayment).toHaveBeenCalledOnce();
  });

  it.each(['abc', '0', '-3', '1.5', '12abc', '1e3'])('rejects /payment/%s with a clear message and sends no request', async (id) => {
    renderPage(`/payment/${id}`);

    expect(await screen.findByText(INVALID_LINK)).toBeTruthy();
    expect(screen.getByText('العودة إلى لوحة التحكم')).toBeTruthy();
    expect(initiatePayment).not.toHaveBeenCalled();
  });
});

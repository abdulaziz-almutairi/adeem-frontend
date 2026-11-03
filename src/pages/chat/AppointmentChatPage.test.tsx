import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const getConversation = vi.fn();
const connectAppointmentChat = vi.fn();

vi.mock('../../api/messageApi', () => ({
  messageApi: {
    getConversation: (...args: unknown[]) => getConversation(...args),
    connectAppointmentChat: (...args: unknown[]) => connectAppointmentChat(...args),
    sendMessage: vi.fn(),
  },
}));
vi.mock('../../api/appointmentApi', () => ({
  appointmentApi: {
    getMyAppointmentsAsPatient: vi.fn(async () => []),
    getMyAppointmentsAsDoctor: vi.fn(async () => []),
  },
}));
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: { id: 1, role: 'PATIENT', fullName: 'Patient' } }),
}));

const { default: AppointmentChatPage } = await import('./AppointmentChatPage');

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/chat/5']}>
      <Routes>
        <Route path="/chat/:appointmentId" element={<AppointmentChatPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('AppointmentChatPage (FE-01)', () => {
  beforeEach(() => {
    getConversation.mockReset();
    connectAppointmentChat.mockReset();
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(cleanup);

  it('opens the live connection only after the history loads', async () => {
    getConversation.mockResolvedValue([]);
    connectAppointmentChat.mockReturnValue({ deactivate: vi.fn() });

    renderPage();

    await waitFor(() => expect(connectAppointmentChat).toHaveBeenCalledOnce());
    expect(connectAppointmentChat.mock.calls[0][0]).toBe(5);
  });

  it('shows the access error and never connects when the history is refused', async () => {
    getConversation.mockRejectedValue({ response: { data: { message: 'ليس لديك صلاحية' } } });

    renderPage();

    expect(await screen.findByText('ليس لديك صلاحية')).toBeTruthy();
    expect(screen.getByText('غير متصل')).toBeTruthy();
    expect(screen.queryByText('متصل الآن')).toBeNull();
    expect(connectAppointmentChat).not.toHaveBeenCalled();
  });

  it('shows offline when the server refuses the live connection', async () => {
    getConversation.mockResolvedValue([]);
    connectAppointmentChat.mockImplementation((_id, _onMessage, _onStatus, onRefused: () => void) => {
      onRefused();
      return { deactivate: vi.fn() };
    });

    renderPage();

    expect(await screen.findByText('غير متصل')).toBeTruthy();
  });
});

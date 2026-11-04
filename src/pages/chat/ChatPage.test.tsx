import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const getHistory = vi.fn();

vi.mock('../../api/chatApi', () => ({
  chatApi: {
    getHistory: (...args: unknown[]) => getHistory(...args),
    ask: vi.fn(),
    askWithImage: vi.fn(),
  },
}));
// Same object on every render, like the real AuthContext, so the load effect runs once.
const authUser = { id: 7, role: 'PATIENT', fullName: 'Patient' };
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: authUser }),
}));

const { default: ChatPage } = await import('./ChatPage');

const LIST_STORAGE_NAME = 'adeem_ai_chat_list_7';
const LEGACY_STORAGE_NAME = 'adeem_ai_conversation_id_7';
const RETRY_TEXT = 'إعادة المحاولة';

const storedList = [
  { id: 11, title: 'محادثة أولى', updatedAt: '2026-11-01T10:00:00Z' },
  { id: 12, title: 'محادثة ثانية', updatedAt: '2026-10-30T10:00:00Z' },
];

const history = [
  { id: 1, conversationId: 11, senderType: 'USER', content: 'عندي حكة', createdAt: '2026-11-01T10:00:00Z' },
  { id: 2, conversationId: 11, senderType: 'AI', content: 'رد المساعد', createdAt: '2026-11-01T10:00:05Z' },
];

function httpError(status: number) {
  return { response: { status, data: { message: 'error' } } };
}

function storedIds() {
  return (JSON.parse(localStorage.getItem(LIST_STORAGE_NAME) || '[]') as { id: number }[]).map(c => c.id);
}

function renderPage() {
  return render(
    <MemoryRouter>
      <ChatPage />
    </MemoryRouter>,
  );
}

describe('ChatPage conversation pointers (FE-04)', () => {
  beforeEach(() => {
    getHistory.mockReset();
    localStorage.clear();
    localStorage.setItem(LIST_STORAGE_NAME, JSON.stringify(storedList));
    window.HTMLElement.prototype.scrollIntoView = vi.fn();
  });

  afterEach(cleanup);

  it('AC1: keeps every entry and offers a retry when the backend is unreachable', async () => {
    getHistory.mockRejectedValue(new Error('Network Error'));

    renderPage();

    expect(await screen.findByText(RETRY_TEXT)).toBeTruthy();
    expect(storedIds()).toEqual([11, 12]);
    expect(screen.getByText('محادثة أولى')).toBeTruthy();
    expect(screen.getByText('محادثة ثانية')).toBeTruthy();
  });

  it('AC1: the retry button loads the conversation once the backend is back', async () => {
    getHistory.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(history);

    renderPage();
    fireEvent.click(await screen.findByText(RETRY_TEXT));

    expect(await screen.findByText('رد المساعد')).toBeTruthy();
    expect(screen.queryByText(RETRY_TEXT)).toBeNull();
    expect(getHistory).toHaveBeenNthCalledWith(2, 11);
    expect(storedIds()).toEqual([11, 12]);
  });

  it('AC2: keeps the entries on 401 and shows them again after logging in', async () => {
    getHistory.mockRejectedValue(httpError(401));

    const first = renderPage();
    await screen.findByText(RETRY_TEXT);
    expect(storedIds()).toEqual([11, 12]);
    first.unmount();

    getHistory.mockReset();
    getHistory.mockResolvedValue(history);
    renderPage();

    expect(await screen.findByText('رد المساعد')).toBeTruthy();
    expect(storedIds()).toEqual([11, 12]);
  });

  it.each([403, 500, 502, 503])('keeps the entry on %i', async (status) => {
    getHistory.mockRejectedValue(httpError(status));

    renderPage();

    expect(await screen.findByText(RETRY_TEXT)).toBeTruthy();
    expect(storedIds()).toEqual([11, 12]);
  });

  it('AC3: removes a conversation the server refuses with 400 (not found or not yours)', async () => {
    getHistory.mockRejectedValue(httpError(400));

    renderPage();

    await waitFor(() => expect(storedIds()).toEqual([12]));
    expect(screen.queryByText('محادثة أولى')).toBeNull();
    expect(screen.getByText('محادثة ثانية')).toBeTruthy();
    expect(screen.queryByText(RETRY_TEXT)).toBeNull();
  });

  it('removes a conversation the server answers with 404', async () => {
    getHistory.mockRejectedValue(httpError(404));

    renderPage();

    await waitFor(() => expect(storedIds()).toEqual([12]));
  });

  it('AC3: removes a selected conversation refused with 400 and keeps the others', async () => {
    getHistory.mockResolvedValueOnce(history).mockRejectedValueOnce(httpError(400));

    renderPage();
    await screen.findByText('رد المساعد');
    fireEvent.click(screen.getByText('محادثة ثانية'));

    await waitFor(() => expect(storedIds()).toEqual([11]));
  });

  describe('legacy single-conversation pointer', () => {
    beforeEach(() => {
      localStorage.removeItem(LIST_STORAGE_NAME);
      localStorage.setItem(LEGACY_STORAGE_NAME, '11');
    });

    it('keeps the legacy pointer on a network error and migrates it on retry', async () => {
      getHistory.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValueOnce(history);

      renderPage();
      fireEvent.click(await screen.findByText(RETRY_TEXT));

      expect(await screen.findByText('رد المساعد')).toBeTruthy();
      expect(localStorage.getItem(LEGACY_STORAGE_NAME)).toBeNull();
      expect(storedIds()).toEqual([11]);
    });

    it.each([401, 403, 500])('keeps the legacy pointer on %i', async (status) => {
      getHistory.mockRejectedValue(httpError(status));

      renderPage();

      await screen.findByText(RETRY_TEXT);
      expect(localStorage.getItem(LEGACY_STORAGE_NAME)).toBe('11');
    });

    it('removes the legacy pointer on 400', async () => {
      getHistory.mockRejectedValue(httpError(400));

      renderPage();

      await waitFor(() => expect(localStorage.getItem(LEGACY_STORAGE_NAME)).toBeNull());
      expect(screen.queryByText(RETRY_TEXT)).toBeNull();
    });
  });
});

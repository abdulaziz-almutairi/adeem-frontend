import { beforeEach, describe, expect, it, vi } from 'vitest';

// A stand-in for the STOMP client that records its configuration and calls.
interface FakeConfig {
  beforeConnect: (client: FakeClient) => void;
  onConnect: () => void;
  onStompError: (frame: unknown) => void;
}

const created: FakeClient[] = [];
class FakeClient {
  config: FakeConfig;
  connectHeaders: Record<string, string> = {};
  activate = vi.fn();
  deactivate = vi.fn(async () => {});
  subscribe = vi.fn();
  constructor(config: FakeConfig) {
    this.config = config;
    created.push(this);
  }
}

vi.mock('@stomp/stompjs', () => ({ Client: FakeClient }));
vi.mock('sockjs-client', () => ({ default: vi.fn() }));

const { messageApi, stompAuthHeaders } = await import('./messageApi');

describe('connectAppointmentChat (FE-01)', () => {
  beforeEach(() => {
    created.length = 0;
    localStorage.clear();
  });

  it('builds the Authorization header from the stored token', () => {
    localStorage.setItem('adeem_auth_token', 'abc');
    expect(stompAuthHeaders()).toEqual({ Authorization: 'Bearer abc' });

    localStorage.clear();
    expect(stompAuthHeaders()).toEqual({});
  });

  it('sends the latest token in the CONNECT headers before each connect', () => {
    localStorage.setItem('adeem_auth_token', 'first');
    messageApi.connectAppointmentChat(7, vi.fn());
    const client = created[0];

    client.config.beforeConnect(client);
    expect(client.connectHeaders).toEqual({ Authorization: 'Bearer first' });

    localStorage.setItem('adeem_auth_token', 'second');
    client.config.beforeConnect(client);
    expect(client.connectHeaders).toEqual({ Authorization: 'Bearer second' });
    expect(client.activate).toHaveBeenCalledOnce();
  });

  it('subscribes only to the appointment topic once connected', () => {
    localStorage.setItem('adeem_auth_token', 'abc');
    const onStatus = vi.fn();
    messageApi.connectAppointmentChat(7, vi.fn(), onStatus);
    const client = created[0];

    client.config.onConnect();

    expect(onStatus).toHaveBeenCalledWith(true);
    expect(client.subscribe).toHaveBeenCalledWith('/topic/appointment/7', expect.any(Function));
  });

  it('stops retrying and reports when the server refuses', () => {
    localStorage.setItem('adeem_auth_token', 'abc');
    const onStatus = vi.fn();
    const onRefused = vi.fn();
    messageApi.connectAppointmentChat(7, vi.fn(), onStatus, onRefused);
    const client = created[0];

    client.config.onStompError({ headers: { message: 'Access denied' } });

    expect(client.deactivate).toHaveBeenCalledOnce();
    expect(onStatus).toHaveBeenCalledWith(false);
    expect(onRefused).toHaveBeenCalledOnce();
  });

  it('does not open a socket without a token', () => {
    const onRefused = vi.fn();
    messageApi.connectAppointmentChat(7, vi.fn(), undefined, onRefused);

    expect(created[0].activate).not.toHaveBeenCalled();
    expect(onRefused).toHaveBeenCalledOnce();
  });
});

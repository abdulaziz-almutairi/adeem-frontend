// يستخرج رسالة الخطأ التي يرسلها الخادم ({ message }) من خطأ axios، أو يرجع رسالة بديلة
export function apiErrorMessage(err: unknown, fallback: string): string {
  const message = (err as { response?: { data?: { message?: unknown } } } | null)?.response?.data?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Loader2, User, ImagePlus, X, PanelLeftOpen } from 'lucide-react';
import { chatApi } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { ChatConversationSummary, ChatMessage } from '../../types';
import ChatSidebar from '../../components/chat/ChatSidebar';
import Alert from '../../components/ui/Alert';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - نفس الحد الأقصى بالباك إند
const TITLE_MAX_LENGTH = 42;

function legacyStorageKey(userId: number) {
  return `adeem_ai_conversation_id_${userId}`;
}

function listStorageKey(userId: number) {
  return `adeem_ai_chat_list_${userId}`;
}

function deriveTitle(content?: string) {
  const trimmed = content?.trim();
  if (!trimmed) return 'محادثة عن صورة';
  return trimmed.length > TITLE_MAX_LENGTH ? `${trimmed.slice(0, TITLE_MAX_LENGTH)}…` : trimmed;
}

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString('ar-SA', { hour: 'numeric', minute: '2-digit' });
}

function loadConversationList(userId: number): ChatConversationSummary[] {
  try {
    const raw = localStorage.getItem(listStorageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveConversationList(userId: number, list: ChatConversationSummary[]) {
  localStorage.setItem(listStorageKey(userId), JSON.stringify(list));
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<ChatConversationSummary[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const loadConversation = async (userId: number, id: number) => {
    setLoadingHistory(true);
    try {
      const history = await chatApi.getHistory(id);
      setConversationId(id);
      setMessages(history.map((m, idx) => ({
        id: `h-${idx}-${m.createdAt}`,
        sender: m.senderType === 'USER' ? 'user' : 'ai',
        text: m.content,
        timestamp: new Date(m.createdAt),
      })));
    } catch {
      // المحادثة القديمة لم تعد متاحة (محذوفة/غير مصرح بها) - نحذفها من السجل المحلي
      setConversations(prev => {
        const next = prev.filter(c => c.id !== id);
        saveConversationList(userId, next);
        return next;
      });
      setConversationId(null);
      setMessages([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // تحميل سجل المحادثات المحفوظ محلياً، مع ترحيل صيغة المحادثة الواحدة القديمة إن وُجدت
  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    const list = loadConversationList(user.id);
    if (list.length > 0) {
      setConversations(list);
      loadConversation(user.id, list[0].id);
      return;
    }

    const legacyId = localStorage.getItem(legacyStorageKey(user.id));
    if (!legacyId) {
      setLoadingHistory(false);
      return;
    }

    const id = Number(legacyId);
    chatApi.getHistory(id)
      .then((history) => {
        const firstUserMessage = history.find(m => m.senderType === 'USER');
        const migrated: ChatConversationSummary[] = [{
          id,
          title: deriveTitle(firstUserMessage?.content),
          updatedAt: history[history.length - 1]?.createdAt || new Date().toISOString(),
        }];
        setConversations(migrated);
        saveConversationList(user.id, migrated);
        localStorage.removeItem(legacyStorageKey(user.id));
        setConversationId(id);
        setMessages(history.map((m, idx) => ({
          id: `h-${idx}-${m.createdAt}`,
          sender: m.senderType === 'USER' ? 'user' : 'ai',
          text: m.content,
          timestamp: new Date(m.createdAt),
        })));
      })
      .catch(() => {
        localStorage.removeItem(legacyStorageKey(user.id));
      })
      .finally(() => setLoadingHistory(false));
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // يسمح باختيار نفس الملف مرة ثانية لو أزاله وأعاد اختياره
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError('صيغة الصورة غير مدعومة. الرجاء رفع صورة بصيغة JPEG أو PNG أو WEBP أو GIF');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setError('حجم الصورة كبير جداً. الحد الأقصى المسموح 5 ميجابايت');
      return;
    }

    setError('');
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeSelectedImage = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleNewChat = () => {
    setConversationId(null);
    setMessages([]);
    setError('');
    removeSelectedImage();
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id: number) => {
    if (!user || id === conversationId) {
      setSidebarOpen(false);
      return;
    }
    setSidebarOpen(false);
    setError('');
    removeSelectedImage();
    loadConversation(user.id, id);
  };

  const handleDeleteConversation = (id: number) => {
    if (!user) return;
    setConversations(prev => {
      const next = prev.filter(c => c.id !== id);
      saveConversationList(user.id, next);
      return next;
    });
    if (id === conversationId) {
      setConversationId(null);
      setMessages([]);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if ((!content && !selectedImage) || sending || !user) return;

    const wasNewConversation = conversationId === null;

    const userMessage: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: content,
      timestamp: new Date(),
      imageUrl: imagePreview || undefined,
    };
    setMessages(prev => [...prev, userMessage]);

    const imageToSend = selectedImage;
    setInput('');
    setSelectedImage(null);
    setImagePreview(null);
    setSending(true);
    setError('');

    try {
      const reply = imageToSend
        ? await chatApi.askWithImage({ image: imageToSend, content: content || undefined, conversationId })
        : await chatApi.ask({ content, conversationId });

      setConversationId(reply.conversationId);
      setMessages(prev => [...prev, {
        id: `b-${Date.now()}`,
        sender: 'ai',
        text: reply.content,
        timestamp: new Date(reply.createdAt),
      }]);

      setConversations(prev => {
        let next: ChatConversationSummary[];
        if (wasNewConversation) {
          next = [{ id: reply.conversationId, title: deriveTitle(content), updatedAt: reply.createdAt }, ...prev];
        } else {
          const existing = prev.find(c => c.id === reply.conversationId);
          const updated: ChatConversationSummary = existing
            ? { ...existing, updatedAt: reply.createdAt }
            : { id: reply.conversationId, title: deriveTitle(content), updatedAt: reply.createdAt };
          next = [updated, ...prev.filter(c => c.id !== reply.conversationId)];
        }
        saveConversationList(user.id, next);
        return next;
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذّر التواصل مع المساعد الذكي، حاول مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-6" style={{ height: 'calc(100vh - 5rem)' }}>
        <div className="h-full bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden flex">
          <ChatSidebar
            conversations={conversations}
            activeId={conversationId}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onSelect={handleSelectConversation}
            onNewChat={handleNewChat}
            onDelete={handleDeleteConversation}
          />

          <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-brand-600 text-white shadow-sm">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors shrink-0"
                aria-label="سجل المحادثات"
              >
                <PanelLeftOpen size={18} />
              </button>
              <div className="relative shrink-0">
                <div className="w-11 h-11 rounded-full bg-white/20 ring-2 ring-white/30 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <span className="absolute -bottom-0.5 -end-0.5 w-3 h-3 rounded-full bg-success-400 ring-2 ring-brand-500" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold">وهج - المساعد الذكي</h3>
                <span className="text-xs text-white/80">استشارة أولية حول الأعراض الجلدية</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gradient-to-b from-white to-slate-50/60">
              {loadingHistory ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-brand-600 animate-spin" /></div>
              ) : messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-50 to-accent-400/10 flex items-center justify-center">
                    <Bot size={30} className="text-brand-500" />
                  </div>
                  <p className="text-sm text-slate-400 max-w-xs">اكتب سؤالك عن أي عرض جلدي تعاني منه، أو أرفق صورة الحالة وسأساعدك بمعلومات عامة</p>
                </div>
              )}

              {messages.map(m => (
                <div key={m.id} className={`flex items-end gap-2 animate-message-in ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.sender === 'user' ? 'bg-brand-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-brand-600 shadow-sm'}`}>
                    {m.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
                  </div>
                  <div className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    <div className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm ${m.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-white border border-slate-100 text-slate-800'}`}>
                      {m.imageUrl && (
                        <img src={m.imageUrl} alt="صورة مرفقة" className="rounded-xl mb-2 max-h-56 w-full object-cover" />
                      )}
                      {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                    </div>
                    <span className="text-[11px] text-slate-400 mt-1 px-1">{formatMessageTime(m.timestamp)}</span>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="flex items-end gap-2 animate-message-in">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-white border border-slate-200 text-brand-600 shadow-sm">
                    <Bot size={15} />
                  </div>
                  <div className="bg-white border border-slate-100 rounded-2xl px-4 py-3 shadow-sm flex items-center gap-1.5">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400" />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full bg-slate-400" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {error && <Alert variant="danger" className="mx-4 mt-3 text-xs">{error}</Alert>}

            {imagePreview && (
              <div className="px-4 pt-3">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="معاينة الصورة" className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm" />
                  <button
                    type="button"
                    onClick={removeSelectedImage}
                    className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-danger-500 text-white flex items-center justify-center shadow-md hover:bg-danger-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-3">
              <div className="flex items-center gap-1.5 bg-slate-50 rounded-full border border-slate-200 p-1.5 shadow-sm focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100 transition-all">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_TYPES.join(',')}
                  onChange={handleFileSelect}
                  className="hidden"
                  disabled={sending}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                  className="w-9 h-9 rounded-full text-slate-500 flex items-center justify-center hover:bg-white hover:shadow-sm transition-all disabled:opacity-50 flex-shrink-0"
                  title="إرفاق صورة"
                >
                  <ImagePlus size={18} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={selectedImage ? 'أضف وصفاً للصورة (اختياري)...' : 'اكتب رسالتك هنا...'}
                  className="flex-1 min-w-0 bg-transparent px-2 py-2 text-sm outline-none placeholder:text-slate-400"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || (!input.trim() && !selectedImage)}
                  className="w-10 h-10 rounded-full bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 hover:bg-brand-700 hover:shadow-md active:scale-95 transition-all flex-shrink-0"
                >
                  <Send size={17} />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 mt-2 max-w-6xl mx-auto px-4">
        المساعد الذكي يقدم نصائح عامة فقط ولا يُغني عن استشارة الطبيب المختص
      </p>
    </div>
  );
}

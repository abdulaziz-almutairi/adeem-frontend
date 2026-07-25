import { useEffect, useRef, useState } from 'react';
import { Bot, Send, Loader2, User, ImagePlus, X, AlertCircle } from 'lucide-react';
import { chatApi } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { ChatMessage } from '../../types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB - نفس الحد الأقصى بالباك إند

function storageKey(userId: number) {
  return `adeem_ai_conversation_id_${userId}`;
}

export default function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  // استرجاع آخر محادثة محفوظة لهذا المستخدم عند فتح الصفحة
  useEffect(() => {
    if (!user) {
      setLoadingHistory(false);
      return;
    }

    const savedId = localStorage.getItem(storageKey(user.id));
    if (!savedId) {
      setLoadingHistory(false);
      return;
    }

    const id = Number(savedId);
    chatApi.getHistory(id)
      .then((history) => {
        setConversationId(id);
        setMessages(history.map((m, idx) => ({
          id: `h-${idx}-${m.createdAt}`,
          sender: m.senderType === 'USER' ? 'user' : 'ai',
          text: m.content,
          timestamp: new Date(m.createdAt),
        })));
      })
      .catch(() => {
        // المحادثة القديمة لم تعد متاحة (محذوفة/غير مصرح بها) - نبدأ محادثة جديدة
        localStorage.removeItem(storageKey(user.id));
      })
      .finally(() => setLoadingHistory(false));
  }, [user]);

  useEffect(() => {
    if (user && conversationId) {
      localStorage.setItem(storageKey(user.id), String(conversationId));
    }
  }, [user, conversationId]);

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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if ((!content && !selectedImage) || sending) return;

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
    } catch (err: any) {
      setError(err.response?.data?.message || 'تعذّر التواصل مع المساعد الذكي، حاول مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col" style={{ height: 'calc(100vh - 5rem)' }}>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-brand-gradient rounded-t-2xl text-white">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold">وهج - المساعد الذكي</h3>
              <span className="text-xs text-white/80">استشارة أولية حول الأعراض الجلدية</span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {loadingHistory ? (
              <div className="h-full flex items-center justify-center"><Loader2 className="w-6 h-6 text-brand-600 animate-spin" /></div>
            ) : messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                <Bot size={32} />
                <p className="text-sm max-w-xs">اكتب سؤالك عن أي عرض جلدي تعاني منه، أو أرفق صورة الحالة وسأساعدك بمعلومات عامة</p>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex items-start gap-2 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${m.sender === 'user' ? 'bg-brand-100 text-brand-600' : 'bg-slate-100 text-slate-500'}`}>
                  {m.sender === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${m.sender === 'user' ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-slate-800'}`}>
                  {m.imageUrl && (
                    <img src={m.imageUrl} alt="صورة مرفقة" className="rounded-xl mb-2 max-h-56 w-full object-cover" />
                  )}
                  {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                </div>
              </div>
            ))}

            {sending && (
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100 text-slate-500">
                  <Bot size={16} />
                </div>
                <div className="bg-slate-100 rounded-2xl px-4 py-2.5">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div className="px-4 py-2 text-xs text-red-600 bg-red-50 border-t border-red-100 flex items-center gap-2">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {imagePreview && (
            <div className="px-4 pt-3 border-t border-slate-100">
              <div className="relative inline-block">
                <img src={imagePreview} alt="معاينة الصورة" className="h-20 w-20 object-cover rounded-xl border border-slate-200" />
                <button
                  type="button"
                  onClick={removeSelectedImage}
                  className="absolute -top-2 -end-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSend} className={`p-4 flex items-center gap-2 ${imagePreview ? '' : 'border-t border-slate-100'}`}>
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
              className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center hover:bg-slate-200 transition-all disabled:opacity-50 flex-shrink-0"
              title="إرفاق صورة"
            >
              <ImagePlus size={18} />
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={selectedImage ? 'أضف وصفاً للصورة (اختياري)...' : 'اكتب رسالتك هنا...'}
              className="input-field flex-1 min-w-0 px-4 py-3 rounded-xl border-2 border-slate-200 text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || (!input.trim() && !selectedImage)}
              className="w-12 h-12 rounded-xl bg-brand-gradient text-white flex items-center justify-center disabled:opacity-50 transition-all flex-shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-2">
          المساعد الذكي يقدم نصائح عامة فقط ولا يُغني عن استشارة الطبيب المختص
        </p>
      </div>
    </div>
  );
}

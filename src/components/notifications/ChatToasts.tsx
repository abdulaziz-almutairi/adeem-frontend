import { useNavigate } from 'react-router-dom';
import { MessageCircle, X } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

export default function ChatToasts() {
  const { toasts, dismissToast } = useNotifications();
  const navigate = useNavigate();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 end-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => { navigate(`/chat/${t.appointmentId}`); dismissToast(t.id); }}
          className="bg-white rounded-2xl shadow-xl border border-slate-100 p-4 flex items-start gap-3 cursor-pointer hover:shadow-2xl transition-shadow animate-toast-in"
        >
          <div className="w-9 h-9 rounded-full bg-brand-gradient text-white flex items-center justify-center flex-shrink-0">
            <MessageCircle size={16} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-sm truncate">{t.senderName}</p>
            <p className="text-xs text-slate-500 truncate">{t.content}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); dismissToast(t.id); }}
            className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

import { MessageSquarePlus, MessageSquare, Trash2, X, Sparkles } from 'lucide-react';
import { ChatConversationSummary } from '../../types';

interface ChatSidebarProps {
  conversations: ChatConversationSummary[];
  activeId: number | null;
  open: boolean;
  onClose: () => void;
  onSelect: (id: number) => void;
  onNewChat: () => void;
  onDelete: (id: number) => void;
}

const GROUP_LABELS = ['اليوم', 'أمس', 'آخر 7 أيام', 'أقدم'] as const;
type GroupLabel = typeof GROUP_LABELS[number];

function groupConversations(conversations: ChatConversationSummary[]): [GroupLabel, ChatConversationSummary[]][] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const weekAgo = new Date(startOfToday);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const buckets: Record<GroupLabel, ChatConversationSummary[]> = {
    'اليوم': [], 'أمس': [], 'آخر 7 أيام': [], 'أقدم': [],
  };

  for (const c of conversations) {
    const date = new Date(c.updatedAt);
    if (date >= startOfToday) buckets['اليوم'].push(c);
    else if (date >= startOfYesterday) buckets['أمس'].push(c);
    else if (date >= weekAgo) buckets['آخر 7 أيام'].push(c);
    else buckets['أقدم'].push(c);
  }

  return GROUP_LABELS
    .map((label): [GroupLabel, ChatConversationSummary[]] => [label, buckets[label]])
    .filter(([, items]) => items.length > 0);
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ar-SA', { hour: 'numeric', minute: '2-digit' });
}

export default function ChatSidebar({ conversations, activeId, open, onClose, onSelect, onNewChat, onDelete }: ChatSidebarProps) {
  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (window.confirm('حذف هذه المحادثة من السجل؟')) onDelete(id);
  };

  const groups = groupConversations(conversations);

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed md:static top-0 bottom-0 start-0 z-50 md:z-auto
          w-72 shrink-0 bg-slate-50/60 border-e border-slate-100 flex flex-col
          transition-transform duration-300 md:transition-none
          shadow-2xl rounded-e-2xl md:shadow-none md:rounded-none
          ${open ? 'translate-x-0' : 'max-md:rtl:translate-x-full max-md:ltr:-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-3 flex items-center gap-2">
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-brand-gradient text-white font-bold text-sm shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all"
          >
            <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
              <MessageSquarePlus size={15} />
            </span>
            محادثة جديدة
          </button>
          <button
            onClick={onClose}
            className="md:hidden p-3 rounded-xl text-slate-400 hover:bg-white hover:text-slate-600 transition-colors shrink-0"
            aria-label="إغلاق القائمة"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2.5 pb-3 space-y-4">
          {conversations.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-6 py-10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-50 to-accent-400/10 flex items-center justify-center">
                <Sparkles size={22} className="text-brand-400" />
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">لا توجد محادثات سابقة بعد،<br />ابدأ محادثتك الأولى مع وهج</p>
            </div>
          ) : (
            groups.map(([label, items]) => (
              <div key={label}>
                <p className="px-2.5 mb-1.5 text-[11px] font-bold text-slate-400 tracking-wide">{label}</p>
                <div className="space-y-1">
                  {items.map((c) => {
                    const active = c.id === activeId;
                    return (
                      <button
                        key={c.id}
                        onClick={() => onSelect(c.id)}
                        className={`
                          group relative w-full flex items-center gap-2.5 py-2.5 rounded-xl text-start transition-all
                          ${active ? 'bg-white shadow-sm ps-3 pe-2' : 'hover:bg-white/70 ps-3 pe-2'}
                        `}
                      >
                        {active && (
                          <span className="absolute inset-y-1.5 start-0 w-1 rounded-full bg-brand-gradient" />
                        )}
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${active ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-slate-200'}`}>
                          <MessageSquare size={14} />
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm truncate ${active ? 'font-bold text-dark-900' : 'font-semibold text-slate-600'}`}>{c.title}</p>
                          <p className="text-[11px] text-slate-400 mt-0.5">{formatTime(c.updatedAt)}</p>
                        </div>
                        <span
                          onClick={(e) => handleDelete(e, c.id)}
                          className="opacity-0 group-hover:opacity-100 focus-visible:opacity-100 p-1.5 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 active:scale-90 transition-all shrink-0"
                          role="button"
                          aria-label="حذف المحادثة"
                        >
                          <Trash2 size={13} />
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Loader2, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { assistantQuery, summarizeNote, extractTasks } from '../../api/ai.api.js';

export default function AiAssistantPanel({ isOpen, onClose, noteContent, noteId, onInsert }) {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const handleAction = async (actionType) => {
    if (loading) return;
    setLoading(true);
    let userMsg = "";
    try {
      let result = "";
      if (actionType === 'summarize') {
        userMsg = "Summarize this note";
        setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        const res = await summarizeNote(noteContent);
        result = res.data;
      } else if (actionType === 'tasks') {
        userMsg = "Extract action items";
        setHistory(prev => [...prev, { role: 'user', content: userMsg }]);
        const res = await extractTasks(noteContent);
        const tasks = res.data || [];
        result = tasks.length > 0 ? tasks.map(t => `- [ ] ${t.title}`).join('\n') : "No tasks found.";
      }
      setHistory(prev => [...prev, { role: 'ai', content: result }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'error', content: "AI couldn't complete this request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    const currentQuery = query.trim();
    setQuery('');
    setHistory(prev => [...prev, { role: 'user', content: currentQuery }]);
    setLoading(true);

    try {
      const res = await assistantQuery(currentQuery, noteId);
      setHistory(prev => [...prev, { role: 'ai', content: res.data }]);
    } catch (err) {
      setHistory(prev => [...prev, { role: 'error', content: "AI couldn't complete this request. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: '100%', opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: '100%', opacity: 0 }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-80 sm:w-96 bg-snap-surface border-l border-snap-border shadow-2xl flex flex-col z-50"
    >
      <div className="flex items-center justify-between p-4 border-b border-snap-border bg-snap-bg">
        <div className="flex items-center gap-2 text-snap-accent">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-semibold text-white">SnapNote AI</h3>
        </div>
        <button onClick={onClose} className="text-white-muted hover:text-white transition">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {history.length === 0 ? (
          <div className="text-center text-white-muted mt-10">
            <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Ask something about this note...</p>
            <div className="mt-6 flex flex-col gap-2">
              <button onClick={() => handleAction('summarize')} className="text-xs bg-snap-bg hover:bg-snap-border text-left px-3 py-2 rounded-md transition">
                • Summarize this note
              </button>
              <button onClick={() => handleAction('tasks')} className="text-xs bg-snap-bg hover:bg-snap-border text-left px-3 py-2 rounded-md transition">
                • Extract tasks
              </button>
            </div>
          </div>
        ) : (
          history.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] text-sm p-3 rounded-xl ${msg.role === 'user' ? 'bg-snap-accent text-white rounded-br-none' : msg.role === 'error' ? 'bg-red-500/20 text-red-200 border border-red-500/30' : 'bg-snap-bg text-gray-200 border border-snap-border rounded-bl-none whitespace-pre-wrap'}`}>
                {msg.content}
                {msg.role === 'ai' && (
                  <div className="mt-2 text-right">
                    <button onClick={() => onInsert(msg.content)} className="text-[10px] text-white-muted hover:text-snap-accent transition underline">
                      Insert into note
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-snap-bg border border-snap-border p-3 rounded-xl rounded-bl-none flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-snap-accent" />
              <span className="text-xs text-white-muted">Thinking...</span>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-snap-border text-[10px] text-center text-gray-500">
        AI-generated content may be inaccurate. Review before using.
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-snap-bg border-t border-snap-border flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask AI..."
          className="flex-1 bg-snap-surface text-sm text-white px-3 py-2 rounded-lg border border-snap-border outline-none focus:border-snap-accent transition"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={!query.trim() || loading}
          className="bg-snap-accent text-white p-2 rounded-lg disabled:opacity-50 hover:bg-snap-accent-hover transition flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  );
}

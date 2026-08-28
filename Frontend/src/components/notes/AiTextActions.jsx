import { useState } from 'react';
import { Sparkles, Wand2, RefreshCw, X, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  summarizeNote,
  extractKeyPoints,
  generateTitle,
  generateTags,
  rewriteText,
  improveGrammar,
  shortenText,
  expandText
} from '../../api/ai.api.js';

export default function AiTextActions({ selectedText, fullText, onInsert, onReplace, onTitleGenerated, onTagsGenerated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [activeAction, setActiveAction] = useState('');

  const targetText = selectedText || fullText;

  const handleAction = async (actionFn, actionName, ...args) => {
    if (!targetText || loading) return;
    setLoading(true);
    setActiveAction(actionName);
    setResult('');
    setIsOpen(true);
    try {
      const res = await actionFn(targetText, ...args);
      // For tags and title, handle specially if callbacks exist
      if (actionName === 'Tags' && onTagsGenerated) {
        onTagsGenerated(res.data); // Should be array of tags
        setResult("Tags generated and applied.");
      } else if (actionName === 'Title' && onTitleGenerated) {
        onTitleGenerated(res.data);
        setResult("Title generated: " + res.data);
      } else {
        setResult(res.data);
      }
    } catch (err) {
      setResult("AI couldn't complete this request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-40">
      {/* Dropdown Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-snap-accent/10 hover:bg-snap-accent/20 text-snap-accent rounded-md transition text-sm font-medium"
      >
        <Sparkles className="w-4 h-4" />
        {selectedText ? "AI Assist (Selection)" : "AI Assist"}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && !result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 w-48 bg-snap-surface border border-snap-border shadow-xl rounded-lg py-1 flex flex-col z-50"
          >
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider">Note Actions</div>
            <button onClick={() => handleAction(summarizeNote, 'Summarize')} className="text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">✨ Summarize</button>
            <button onClick={() => handleAction(extractKeyPoints, 'Key Points')} className="text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">✨ Key Points</button>
            <button onClick={() => handleAction(generateTitle, 'Title')} className="text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">✨ Generate Title</button>
            <button onClick={() => handleAction(generateTags, 'Tags')} className="text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">✨ Suggest Tags</button>
            
            <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-1 border-t border-snap-border pt-2">Rewrite Options</div>
            <button onClick={() => handleAction(improveGrammar, 'Grammar')} className="text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">Improve Grammar</button>
            <button onClick={() => handleAction(shortenText, 'Shorten')} className="text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">Make Shorter</button>
            <button onClick={() => handleAction(expandText, 'Expand')} className="text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">Expand text</button>
            <div className="relative group">
              <button className="w-full text-left px-3 py-1.5 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent transition">Rewrite as...</button>
              <div className="hidden group-hover:block absolute top-0 left-full ml-1 w-32 bg-snap-surface border border-snap-border shadow-xl rounded-lg py-1">
                {['Professional', 'Simple', 'Friendly', 'Concise'].map(style => (
                  <button key={style} onClick={() => handleAction(rewriteText, 'Rewrite', style.toLowerCase())} className="block w-full text-left px-3 py-1 text-sm hover:bg-snap-bg text-gray-200 hover:text-snap-accent">{style}</button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Loading State */}
        {isOpen && loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="absolute top-full mt-2 w-64 bg-snap-surface border border-snap-border shadow-xl rounded-lg p-4 flex items-center justify-center gap-3 z-50 text-sm text-gray-300"
          >
            <RefreshCw className="w-4 h-4 animate-spin text-snap-accent" />
            Analyzing your note...
          </motion.div>
        )}

        {/* Result Panel */}
        {isOpen && result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-full mt-2 w-80 bg-snap-surface border border-snap-accent/30 shadow-2xl rounded-lg overflow-hidden flex flex-col z-50"
          >
            <div className="bg-snap-bg px-3 py-2 border-b border-snap-border flex items-center justify-between">
              <span className="text-xs font-semibold text-snap-accent flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5" /> {activeAction} Result
              </span>
              <button onClick={() => setIsOpen(false)} className="text-white-muted hover:text-white transition"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-3 max-h-60 overflow-y-auto text-sm text-gray-200 whitespace-pre-wrap">
              {typeof result === 'string' ? result : JSON.stringify(result)}
            </div>
            
            {/* Actions for the result */}
            {activeAction !== 'Tags' && activeAction !== 'Title' && (
               <div className="p-2 border-t border-snap-border bg-snap-bg flex gap-2">
                 <button onClick={() => { onInsert(result); setIsOpen(false); }} className="flex-1 bg-snap-accent/20 hover:bg-snap-accent/30 text-snap-accent text-xs py-1.5 rounded transition flex justify-center items-center gap-1">
                   <Plus className="w-3 h-3" /> Insert
                 </button>
                 {selectedText && (
                   <button onClick={() => { onReplace(result); setIsOpen(false); }} className="flex-1 bg-snap-accent text-white text-xs py-1.5 rounded hover:bg-snap-accent-hover transition flex justify-center items-center gap-1">
                     <Check className="w-3 h-3" /> Replace
                   </button>
                 )}
                 <button onClick={() => { navigator.clipboard.writeText(result); }} className="flex-1 bg-gray-700/50 hover:bg-gray-700 text-gray-300 text-xs py-1.5 rounded transition flex justify-center items-center gap-1">
                   <Copy className="w-3 h-3" /> Copy
                 </button>
               </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

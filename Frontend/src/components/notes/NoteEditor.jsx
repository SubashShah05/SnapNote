import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { ArrowLeft, Check, X, Loader2, Tag, FolderOpen, Star, Pin, AlertTriangle, RotateCcw, Plus, Users } from 'lucide-react';
import { NoteContext } from '../../context/NoteContext';
import { useSocket } from '../../context/SocketContext';
import NoteMetadata from './NoteMetadata';
import AiAssistantPanel from './AiAssistantPanel';
import AiTextActions from './AiTextActions';
import ShareDialog from './ShareDialog';
import { Sparkles } from 'lucide-react';

// Save status indicator
function SaveStatus({ status }) {
  return (
    <div className="flex items-center gap-1.5 text-xs">
      {status === 'saving'  && <><Loader2 className="w-3.5 h-3.5 animate-spin text-white-muted"/><span className="text-white-muted">Saving...</span></>}
      {status === 'saved'   && <><Check   className="w-3.5 h-3.5 text-green-400"/><span className="text-green-400">Saved</span></>}
      {status === 'error'   && <><AlertTriangle className="w-3.5 h-3.5 text-red-400"/><span className="text-red-400">Save failed</span></>}
      {status === 'unsaved' && <span className="text-gray-600">Unsaved changes</span>}
      {status === 'syncing' && <><Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400"/><span className="text-blue-400">Syncing...</span></>}
      {status === 'readonly' && <span className="text-yellow-600">View Only</span>}
    </div>
  );
}

// Tag selector inline input
function TagEditor({ tags, onChange, disabled }) {
  const [input, setInput] = useState('');

  const addTag = (raw) => {
    if (disabled) return;
    const tag = raw.toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');
    if (!tag || tags.includes(tag) || tags.length >= 10) return;
    onChange([...tags, tag]);
    setInput('');
  };

  const removeTag = (tag) => {
    if (disabled) return;
    onChange(tags.filter(t => t !== tag));
  };

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {tags.map(tag => (
        <span key={tag} className="flex items-center gap-1 bg-snap-accent/15 text-snap-accent text-xs px-2 py-0.5 rounded-full">
          #{tag}
          {!disabled && (
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-white ml-0.5"
              aria-label={`Remove tag ${tag}`}
            ><X className="w-2.5 h-2.5"/></button>
          )}
        </span>
      ))}
      {!disabled && tags.length < 10 && (
        <input
          value={input}
          onChange={e => setInput(e.target.value.replace(/\s/g, ''))}
          onKeyDown={e => {
            if ((e.key === 'Enter' || e.key === ',') && input.trim()) { e.preventDefault(); addTag(input); }
            if (e.key === 'Backspace' && !input && tags.length) { removeTag(tags[tags.length - 1]); }
          }}
          placeholder={tags.length === 0 ? 'Add tags...' : '+tag'}
          className="text-xs bg-transparent text-white-muted placeholder-gray-600 outline-none min-w-[60px] max-w-[120px]"
        />
      )}
    </div>
  );
}

export default function NoteEditor({ note: initialNote, onBack, onSaved }) {
  const { createNote, updateNote, folders } = useContext(NoteContext);
  const { socket, isConnected } = useSocket();
  const isNew = !initialNote?._id;

  const [title,   setTitle]   = useState(initialNote?.title   || '');
  const [content, setContent] = useState(initialNote?.content || '');
  const [tags,    setTags]    = useState(initialNote?.tags    || []);
  const [folder,  setFolder]  = useState(initialNote?.folder?._id || null);
  const [saveStatus, setSaveStatus] = useState(isNew ? 'unsaved' : 'saved');
  const [savedNote, setSavedNote]   = useState(initialNote || null);
  const [retryFn, setRetryFn]       = useState(null);
  
  // Collaboration States
  const [role, setRole] = useState('owner'); // 'owner', 'editor', 'viewer'
  const [activeUsers, setActiveUsers] = useState([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // AI States
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [selectedText, setSelectedText] = useState('');

  const titleRef  = useRef(null);
  const saveTimer = useRef(null);
  const syncTimer = useRef(null);
  const isDirty   = useRef(false);

  // Focus title on mount for new notes
  useEffect(() => {
    if (isNew && titleRef.current && role !== 'viewer') titleRef.current.focus();
  }, [isNew, role]);

  // Prevent navigation if unsaved
  useEffect(() => {
    const handler = (e) => {
      if (isDirty.current) {
        e.preventDefault(); e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, []);

  // Socket setup
  useEffect(() => {
    if (!socket || !isConnected || isNew || !savedNote?._id) return;

    // Join room
    socket.emit('joinNote', savedNote._id, (response) => {
      if (response.error) {
        console.error("Failed to join note room:", response.error);
        if (response.error === "Unauthorized") {
          onBack(); // Kick out if unauthorized
        }
      } else {
        setRole(response.role);
        if (response.role === 'viewer') {
          setSaveStatus('readonly');
        }
      }
    });

    // Listen for updates
    socket.on('noteUpdated', (data) => {
      // Basic conflict handling: only apply if we aren't actively typing
      if (!isTyping) {
        if (data.title !== undefined) setTitle(data.title);
        if (data.content !== undefined) setContent(data.content);
        if (data.tags !== undefined) setTags(data.tags);
        if (data.folder !== undefined) setFolder(data.folder);
      }
    });

    // Listen for presence
    socket.on('userJoined', (data) => {
      setActiveUsers(prev => {
        if (!prev.find(u => u.userId === data.userId)) {
          return [...prev, data];
        }
        return prev;
      });
    });

    socket.on('userLeft', (data) => {
      setActiveUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    return () => {
      socket.emit('leaveNote', savedNote._id);
      socket.off('noteUpdated');
      socket.off('userJoined');
      socket.off('userLeft');
    };
  }, [socket, isConnected, savedNote?._id, isNew, isTyping, onBack]);

  // Emit sync changes via socket
  const syncChange = useCallback((newData) => {
    if (!socket || !isConnected || isNew || role === 'viewer') return;
    
    // Debounce socket emit
    clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      setSaveStatus('syncing');
      socket.emit('noteChange', {
        noteId: savedNote._id,
        ...newData
      });
      // Fallback to saved state text shortly after sync emit
      setTimeout(() => setSaveStatus(isDirty.current ? 'unsaved' : 'saved'), 500);
    }, 300);
  }, [socket, isConnected, isNew, role, savedNote?._id]);

  // Auto-save core function
  const performSave = useCallback(async (t, c, tg, f, existing) => {
    if (role === 'viewer') return null; // Viewers can't save
    
    setSaveStatus('saving');
    isDirty.current = false;
    try {
      let result;
      if (!existing?._id) {
        // Create new note
        if (!t.trim()) { setSaveStatus('unsaved'); return null; }
        result = await createNote({ title: t.trim(), content: c, tags: tg, folder: f || null });
      } else {
        result = await updateNote(existing._id, { title: t.trim() || existing.title, content: c, tags: tg, folder: f || null });
      }
      setSavedNote(result);
      setSaveStatus('saved');
      if (onSaved) onSaved(result);
      return result;
    } catch (err) {
      isDirty.current = true;
      setSaveStatus('error');
      return null;
    }
  }, [createNote, updateNote, onSaved, role]);

  // Debounced auto-save trigger
  const triggerAutoSave = useCallback((t, c, tg, f, existing) => {
    if (role === 'viewer') return; // Viewers can't trigger save
    
    isDirty.current = true;
    setSaveStatus('unsaved');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      performSave(t, c, tg, f, existing);
    }, 1500);
  }, [performSave, role]);

  // Cleanup timer
  useEffect(() => () => clearTimeout(saveTimer.current), []);

  // Keyboard shortcut: Ctrl/Cmd+S to force save
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (role !== 'viewer') {
          clearTimeout(saveTimer.current);
          performSave(title, content, tags, folder, savedNote);
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [title, content, tags, folder, savedNote, performSave, role]);

  // Content change handlers
  const handleTitleChange = (e) => {
    if (role === 'viewer') return;
    const v = e.target.value;
    setTitle(v);
    setIsTyping(true);
    triggerAutoSave(v, content, tags, folder, savedNote);
    syncChange({ title: v });
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleContentChange = (v) => {
    if (role === 'viewer') return;
    setContent(v || '');
    setIsTyping(true);
    triggerAutoSave(title, v || '', tags, folder, savedNote);
    syncChange({ content: v || '' });
    setTimeout(() => setIsTyping(false), 2000);
  };

  const handleTagsChange = (newTags) => {
    if (role === 'viewer') return;
    setTags(newTags);
    triggerAutoSave(title, content, newTags, folder, savedNote);
    syncChange({ tags: newTags });
  };

  const handleFolderChange = (e) => {
    if (role === 'viewer') return;
    const v = e.target.value || null;
    setFolder(v);
    triggerAutoSave(title, content, tags, v, savedNote);
    syncChange({ folder: v });
  };

  const handleRetry = () => {
    if (role === 'viewer') return;
    clearTimeout(saveTimer.current);
    performSave(title, content, tags, folder, savedNote);
  };

  const handleBack = () => {
    // If there are unsaved changes, save before going back
    if (isDirty.current && role !== 'viewer') {
      clearTimeout(saveTimer.current);
      performSave(title, content, tags, folder, savedNote).then(() => onBack());
    } else {
      onBack();
    }
  };

  const handleSelection = () => {
    const sel = window.getSelection().toString();
    setSelectedText(sel);
  };
  
  const insertAiText = (newText) => {
    if (role === 'viewer') return;
    const newContent = content + (content.endsWith('\n') ? '' : '\n') + newText;
    handleContentChange(newContent);
  };

  const replaceAiText = (newText) => {
    if (role === 'viewer' || !selectedText) return;
    const newContent = content.replace(selectedText, newText);
    handleContentChange(newContent);
  };

  const isReadOnly = role === 'viewer';

  return (
    <div className="flex flex-col h-full bg-snap-bg relative" data-color-mode="dark" onMouseUp={handleSelection} onKeyUp={handleSelection}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-snap-border bg-snap-surface/50 flex-shrink-0">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-sm text-white-muted hover:text-white transition"
          aria-label="Go back to notes"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        <div className="flex items-center gap-4">
          
          {/* Active Collaborators Presence */}
          {activeUsers.length > 0 && (
            <div className="flex -space-x-2 mr-2">
              {activeUsers.slice(0, 3).map((u, i) => (
                <div key={u.userId} className="w-6 h-6 rounded-full bg-blue-500 border border-snap-bg flex items-center justify-center text-[10px] font-bold text-white z-10" title={`User ID: ${u.userId} (${u.role})`}>
                  {u.userId.substring(0, 1).toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-zinc-700 border border-snap-bg flex items-center justify-center text-[10px] font-bold text-white z-0">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>
          )}

          <SaveStatus status={saveStatus} />
          {saveStatus === 'error' && !isReadOnly && (
            <button onClick={handleRetry} className="text-xs text-snap-accent hover:text-snap-accent-hover transition flex items-center gap-1">
              <RotateCcw className="w-3 h-3" /> Retry
            </button>
          )}

          {/* Share Button (Only for owner) */}
          {role === 'owner' && savedNote?._id && (
            <button 
              onClick={() => setIsShareDialogOpen(true)}
              className="flex items-center gap-1.5 text-sm bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1.5 rounded-lg transition"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>
          )}

          {!isReadOnly && (
            <button 
              onClick={() => setIsAiPanelOpen(true)}
              className="flex items-center gap-1.5 text-sm bg-snap-accent/10 hover:bg-snap-accent/20 text-snap-accent px-3 py-1.5 rounded-lg transition"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">AI Assistant</span>
            </button>
          )}
        </div>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
          {/* Title */}
          <input
            ref={titleRef}
            value={title}
            onChange={handleTitleChange}
            placeholder="Note title..."
            readOnly={isReadOnly}
            className="w-full text-2xl sm:text-3xl font-bold bg-transparent text-white placeholder-gray-700 outline-none border-none mb-4 resize-none"
            aria-label="Note title"
          />

          {/* Folder & Tags row */}
          <div className="flex flex-wrap items-center gap-4 mb-5 pb-4 border-b border-snap-border/50 text-sm">
            {/* Folder selector */}
            <div className="flex items-center gap-2 text-gray-500">
              <FolderOpen className="w-4 h-4" />
              <select
                value={folder || ''}
                onChange={handleFolderChange}
                disabled={isReadOnly}
                className="bg-transparent text-sm text-white-muted hover:text-white outline-none cursor-pointer disabled:opacity-50"
                aria-label="Select folder"
              >
                <option value="">No folder</option>
                {folders.map(f => (
                  <option key={f._id} value={f._id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-2 text-gray-500 flex-1 min-w-0">
              <Tag className="w-4 h-4 flex-shrink-0" />
              <TagEditor tags={tags} onChange={handleTagsChange} disabled={isReadOnly} />
            </div>
            
            {/* AI Text Actions Dropdown */}
            {!isReadOnly && (
              <div className="ml-auto flex-shrink-0">
                 <AiTextActions 
                   selectedText={selectedText} 
                   fullText={content} 
                   onInsert={insertAiText}
                   onReplace={replaceAiText}
                   onTitleGenerated={(t) => handleTitleChange({target: {value: t}})}
                   onTagsGenerated={(tg) => handleTagsChange([...new Set([...tags, ...tg])])}
                 />
              </div>
            )}
          </div>

          {/* Markdown editor */}
          <div className="min-h-[400px]">
            <MDEditor
              value={content}
              onChange={handleContentChange}
              preview={isReadOnly ? "preview" : "edit"}
              hideToolbar={isReadOnly}
              visibleDragbar={false}
              height="auto"
              minHeight={400}
              style={{
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
              }}
              textareaProps={{
                placeholder: 'Write your note here... (Markdown supported)',
                style: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: '15px', lineHeight: '1.7' },
                'aria-label': 'Note content',
                readOnly: isReadOnly
              }}
            />
          </div>
        </div>
      </div>

      {/* Metadata bar */}
      <NoteMetadata note={savedNote} content={content} />

      {/* AI Assistant Panel */}
      <AiAssistantPanel 
        isOpen={isAiPanelOpen} 
        onClose={() => setIsAiPanelOpen(false)} 
        noteContent={content}
        noteId={savedNote?._id}
        onInsert={insertAiText}
      />

      {/* Share Dialog */}
      {isShareDialogOpen && savedNote && (
        <ShareDialog 
          note={savedNote} 
          onClose={() => setIsShareDialogOpen(false)} 
        />
      )}
    </div>
  );
}

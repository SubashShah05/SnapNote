import React, { useState, useEffect } from 'react';
import { Share, Users, X, UserPlus, ShieldAlert, ShieldCheck } from 'lucide-react';
import { inviteCollaborator, getNoteCollaborators, changeRole, revokeAccess } from '../../api/share.api';

const ShareDialog = ({ note, onClose }) => {
  const [collaborators, setCollaborators] = useState([]);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchCollaborators();
  }, [note._id]);

  const fetchCollaborators = async () => {
    try {
      const data = await getNoteCollaborators(note._id);
      if (data.success) {
        setCollaborators(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const data = await inviteCollaborator(note._id, email, role);
      if (data.success) {
        setSuccess('Invitation sent successfully!');
        setEmail('');
        fetchCollaborators();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (shareId, newRole) => {
    try {
      await changeRole(shareId, newRole);
      fetchCollaborators();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevoke = async (shareId) => {
    try {
      await revokeAccess(shareId);
      fetchCollaborators();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Share size={18} />
            Share "{note.title}"
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <form onSubmit={handleInvite} className="space-y-2">
            <label className="text-sm font-medium">Invite people</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md outline-none focus:border-blue-500"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md outline-none"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            {success && <p className="text-xs text-green-500">{success}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md flex justify-center items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Invitation'}
            </button>
          </form>

          <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Users size={16} /> People with access
            </h3>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                    {note.user?.name ? note.user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium">You</p>
                    <p className="text-xs text-zinc-500">Owner</p>
                  </div>
                </div>
                <span className="text-xs font-medium text-zinc-500 flex items-center gap-1">
                  <ShieldCheck size={14} /> Owner
                </span>
              </div>
              
              {collaborators.map(collab => (
                <div key={collab._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 flex items-center justify-center font-bold text-sm">
                      {collab.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{collab.user.name} {collab.status === 'pending' && <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded ml-1">Pending</span>}</p>
                      <p className="text-xs text-zinc-500">{collab.user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={collab.role}
                      onChange={(e) => handleRoleChange(collab._id, e.target.value)}
                      className="text-xs bg-transparent border-none outline-none text-zinc-600 dark:text-zinc-400 cursor-pointer"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>
                    <button 
                      onClick={() => handleRevoke(collab._id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                      title="Remove access"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareDialog;

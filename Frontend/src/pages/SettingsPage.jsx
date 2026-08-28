import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Download, Trash2, Smartphone, Cpu } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import BACKEND_URL from '../api/url';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export default function SettingsPage() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('security');
    const [sessions, setSessions] = useState([]);
    const [loadingSessions, setLoadingSessions] = useState(false);
    
    // Password state
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

    // Preferences state
    const [aiEnabled, setAiEnabled] = useState(true);

    useEffect(() => {
        if (activeTab === 'sessions') {
            fetchSessions();
        }
    }, [activeTab]);

    const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
            const res = await BACKEND_URL.get('/user/sessions');
            setSessions(res.data.data);
        } catch (error) {
            toast.error("Failed to load sessions");
        } finally {
            setLoadingSessions(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            return toast.error("New passwords do not match");
        }
        try {
            await BACKEND_URL.put('/user/password', {
                currentPassword: passwords.current,
                newPassword: passwords.new
            });
            toast.success("Password updated successfully");
            setPasswords({ current: '', new: '', confirm: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Password update failed");
        }
    };

    const handleRevokeSession = async (id) => {
        try {
            await BACKEND_URL.delete(`/user/sessions/${id}`);
            toast.success("Session revoked");
            fetchSessions();
        } catch (error) {
            toast.error("Failed to revoke session");
        }
    };

    const handleExport = async () => {
        try {
            const res = await BACKEND_URL.get('/user/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'snapnote-export.json');
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Data exported successfully");
        } catch (error) {
            toast.error("Failed to export data");
        }
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you ABSOLUTELY sure? This will delete all your notes permanently. This action cannot be undone.")) return;
        
        try {
            await BACKEND_URL.delete('/user/account');
            toast.success("Account deleted permanently");
            logout();
            navigate('/');
        } catch (error) {
            toast.error("Failed to delete account");
        }
    };

    const handleToggleAi = async () => {
        try {
            await BACKEND_URL.put('/user/preferences', { aiEnabled: !aiEnabled });
            setAiEnabled(!aiEnabled);
            toast.success(`AI features ${!aiEnabled ? 'enabled' : 'disabled'}`);
        } catch (error) {
            toast.error("Failed to update preferences");
        }
    };

    return (
        <div className="min-h-screen bg-snap-bg text-white p-6 pb-20">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Account Settings</h1>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 flex flex-col gap-2">
                        <button onClick={() => setActiveTab('security')} className={`text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'security' ? 'bg-snap-card border border-snap-accent/50 text-snap-accent' : 'hover:bg-white/5 text-gray-400'}`}>
                            <Key className="w-5 h-5" /> Security
                        </button>
                        <button onClick={() => setActiveTab('sessions')} className={`text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'sessions' ? 'bg-snap-card border border-snap-accent/50 text-snap-accent' : 'hover:bg-white/5 text-gray-400'}`}>
                            <Smartphone className="w-5 h-5" /> Sessions
                        </button>
                        <button onClick={() => setActiveTab('privacy')} className={`text-left px-4 py-3 rounded-xl transition flex items-center gap-3 ${activeTab === 'privacy' ? 'bg-snap-card border border-snap-accent/50 text-snap-accent' : 'hover:bg-white/5 text-gray-400'}`}>
                            <Shield className="w-5 h-5" /> Privacy & Data
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 bg-snap-card border border-snap-border rounded-2xl p-6 md:p-8">
                        {activeTab === 'security' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-semibold mb-6">Change Password</h2>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                                        <input type="password" value={passwords.current} onChange={e => setPasswords({ ...passwords, current: e.target.value })} className="w-full bg-snap-surface border border-snap-border rounded-lg px-4 py-2 focus:border-snap-accent outline-none" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">New Password</label>
                                        <input type="password" value={passwords.new} onChange={e => setPasswords({ ...passwords, new: e.target.value })} className="w-full bg-snap-surface border border-snap-border rounded-lg px-4 py-2 focus:border-snap-accent outline-none" required minLength={6} />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                                        <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} className="w-full bg-snap-surface border border-snap-border rounded-lg px-4 py-2 focus:border-snap-accent outline-none" required />
                                    </div>
                                    <button type="submit" className="bg-snap-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition">Update Password</button>
                                </form>
                            </motion.div>
                        )}

                        {activeTab === 'sessions' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-semibold mb-6">Active Sessions</h2>
                                <p className="text-gray-400 text-sm mb-6">Manage your active logins across devices.</p>
                                
                                {loadingSessions ? (
                                    <div className="text-gray-500">Loading sessions...</div>
                                ) : (
                                    <div className="space-y-4">
                                        {sessions.map(session => (
                                            <div key={session._id} className="flex items-center justify-between p-4 bg-snap-surface border border-snap-border rounded-xl">
                                                <div>
                                                    <p className="font-medium text-white">{session.deviceInfo}</p>
                                                    <p className="text-xs text-gray-500 mt-1">IP: {session.ipAddress} • Last active: {new Date(session.lastActive).toLocaleString()}</p>
                                                </div>
                                                <button onClick={() => handleRevokeSession(session._id)} className="text-sm text-red-400 hover:text-red-300 transition bg-red-400/10 px-3 py-1.5 rounded-lg">Revoke</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {activeTab === 'privacy' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <h2 className="text-xl font-semibold mb-6">Privacy & Data</h2>
                                
                                <div className="space-y-8">
                                    {/* AI Settings */}
                                    <div className="pb-6 border-b border-snap-border">
                                        <h3 className="text-lg font-medium flex items-center gap-2 mb-2"><Cpu className="w-5 h-5 text-snap-accent" /> AI Features</h3>
                                        <p className="text-sm text-gray-400 mb-4">SnapNote AI processes your notes only when you explicitly request a summary, task extraction, or rewrite.</p>
                                        
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <div className="relative">
                                                <input type="checkbox" className="sr-only" checked={aiEnabled} onChange={handleToggleAi} />
                                                <div className={`block w-10 h-6 rounded-full transition ${aiEnabled ? 'bg-snap-accent' : 'bg-gray-600'}`}></div>
                                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${aiEnabled ? 'translate-x-4' : ''}`}></div>
                                            </div>
                                            <span className="text-sm font-medium">{aiEnabled ? 'AI Features Enabled' : 'AI Features Disabled'}</span>
                                        </label>
                                    </div>

                                    {/* Export */}
                                    <div className="pb-6 border-b border-snap-border">
                                        <h3 className="text-lg font-medium flex items-center gap-2 mb-2"><Download className="w-5 h-5 text-gray-300" /> Export Data</h3>
                                        <p className="text-sm text-gray-400 mb-4">Download a copy of all your notes, folders, and tasks in JSON format.</p>
                                        <button onClick={handleExport} className="bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                            Export to JSON
                                        </button>
                                    </div>

                                    {/* Delete Account */}
                                    <div>
                                        <h3 className="text-lg font-medium text-red-400 flex items-center gap-2 mb-2"><Trash2 className="w-5 h-5" /> Danger Zone</h3>
                                        <p className="text-sm text-gray-400 mb-4">Permanently delete your account and all associated data. This action cannot be undone.</p>
                                        <button onClick={handleDeleteAccount} className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 px-5 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2">
                                            Delete Account
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

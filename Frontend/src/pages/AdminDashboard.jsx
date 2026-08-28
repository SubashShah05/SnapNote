import { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { Users, FileText, CheckSquare, LogIn, Activity } from 'lucide-react';
import BACKEND_URL from '../api/url';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/dashboard');
            toast.error("Unauthorized access");
            return;
        }
        fetchAdminData();
    }, [user, navigate]);

    const fetchAdminData = async () => {
        setLoading(true);
        try {
            const [statsRes, logsRes] = await Promise.all([
                BACKEND_URL.get('/admin/stats'),
                BACKEND_URL.get('/admin/audit')
            ]);
            setStats(statsRes.data.data);
            setLogs(logsRes.data.data);
        } catch (error) {
            toast.error("Failed to load admin data");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-gray-500 bg-snap-bg">Loading admin view...</div>;
    }

    return (
        <div className="min-h-screen bg-snap-bg text-white p-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold flex items-center gap-3">
                        <Activity className="w-8 h-8 text-snap-accent" />
                        Admin Dashboard
                    </h1>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-snap-card border border-snap-border rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center gap-3 text-white-muted mb-2">
                            <Users className="w-5 h-5" />
                            <span className="font-medium text-sm">Total Users</span>
                        </div>
                        <span className="text-4xl font-bold">{stats?.totalUsers || 0}</span>
                    </div>

                    <div className="bg-snap-card border border-snap-border rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center gap-3 text-white-muted mb-2">
                            <FileText className="w-5 h-5" />
                            <span className="font-medium text-sm">Total Notes</span>
                        </div>
                        <span className="text-4xl font-bold">{stats?.totalNotes || 0}</span>
                    </div>

                    <div className="bg-snap-card border border-snap-border rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center gap-3 text-white-muted mb-2">
                            <CheckSquare className="w-5 h-5" />
                            <span className="font-medium text-sm">Total Tasks</span>
                        </div>
                        <span className="text-4xl font-bold">{stats?.totalTasks || 0}</span>
                    </div>

                    <div className="bg-snap-card border border-snap-border rounded-2xl p-6 flex flex-col justify-between">
                        <div className="flex items-center gap-3 text-white-muted mb-2">
                            <LogIn className="w-5 h-5" />
                            <span className="font-medium text-sm">Logins (24h)</span>
                        </div>
                        <span className="text-4xl font-bold text-snap-accent">{stats?.recentLogins || 0}</span>
                    </div>
                </div>

                {/* Audit Logs Table */}
                <div className="bg-snap-card border border-snap-border rounded-2xl overflow-hidden">
                    <div className="px-6 py-4 border-b border-snap-border flex items-center justify-between">
                        <h2 className="text-lg font-semibold">System Audit Logs</h2>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-white/5 text-white-muted">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Time</th>
                                    <th className="px-6 py-3 font-medium">User</th>
                                    <th className="px-6 py-3 font-medium">Action</th>
                                    <th className="px-6 py-3 font-medium">Resource</th>
                                    <th className="px-6 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-snap-border">
                                {logs.map(log => (
                                    <tr key={log._id} className="hover:bg-white/5 transition">
                                        <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-white">{log.userId?.name || 'Unknown'}</div>
                                            <div className="text-xs text-gray-500">{log.userId?.email || ''}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-white/10 rounded-md text-xs font-mono">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white-muted">{log.resource}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                                                log.status === 'SUCCESS' ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                                            }`}>
                                                {log.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

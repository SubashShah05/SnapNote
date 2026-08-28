import React, { useEffect, useState } from 'react';
import { getActivityTimeline } from '../../api/analytics.api';
import { FileText, CheckCircle, Folder, Trash, Share, Clock } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';

const getActivityIcon = (type) => {
  if (type.includes('NOTE')) return <FileText size={14} className="text-blue-500" />;
  if (type.includes('TASK')) return <CheckCircle size={14} className="text-green-500" />;
  if (type.includes('FOLDER')) return <Folder size={14} className="text-yellow-500" />;
  if (type.includes('DELETE')) return <Trash size={14} className="text-red-500" />;
  if (type.includes('SHARE')) return <Share size={14} className="text-purple-500" />;
  return <Clock size={14} className="text-zinc-500" />;
};

const formatActivityText = (act) => {
  const metaTitle = act.metadata?.title || 'an item';
  switch (act.type) {
    case 'NOTE_CREATED': return `Created note "${metaTitle}"`;
    case 'NOTE_UPDATED': return `Updated note "${metaTitle}"`;
    case 'NOTE_DELETED': return `Deleted note "${metaTitle}"`;
    case 'NOTE_FAVORITED': return `Favorited note "${metaTitle}"`;
    case 'TASK_CREATED': return `Added task "${metaTitle}"`;
    case 'TASK_COMPLETED': return `Completed task "${metaTitle}"`;
    case 'FOLDER_CREATED': return `Created folder "${metaTitle}"`;
    default: return `Performed ${act.type.toLowerCase().replace('_', ' ')}`;
  }
};

const ActivityTimeline = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const result = await getActivityTimeline(1, 15);
        if (result.success) {
          setActivities(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="bg-snap-card border border-snap-border rounded-2xl p-5 h-64">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex gap-3 items-center">
              <div className="w-6 h-6 rounded-full bg-white/5"></div>
              <div className="flex-1 h-3 bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Group by date
  const grouped = activities.reduce((acc, act) => {
    const date = new Date(act.createdAt);
    let key = format(date, 'MMM d, yyyy');
    if (isToday(date)) key = 'Today';
    else if (isYesterday(date)) key = 'Yesterday';
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(act);
    return acc;
  }, {});

  return (
    <div className="bg-snap-card border border-snap-border rounded-2xl p-5 max-h-96 overflow-y-auto">
      <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
      
      {Object.entries(grouped).length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          No activity yet. Start taking notes!
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([dateLabel, items]) => (
            <div key={dateLabel}>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {dateLabel}
              </h4>
              <div className="space-y-4">
                {items.map(act => (
                  <div key={act._id} className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-full bg-white/5 border border-snap-border">
                      {getActivityIcon(act.type)}
                    </div>
                    <div>
                      <p className="text-sm text-gray-300">
                        {formatActivityText(act)}
                      </p>
                      <span className="text-[10px] text-gray-500">
                        {format(new Date(act.createdAt), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityTimeline;

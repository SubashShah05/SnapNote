import React, { useEffect, useState } from 'react';
import { getProductivityChart } from '../../api/analytics.api';
import { motion } from 'framer-motion';

const ProductivityChart = ({ days = 7 }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getProductivityChart(days);
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  if (loading) {
    return (
      <div className="bg-snap-card border border-snap-border rounded-2xl p-5 h-64 flex items-center justify-center">
        <div className="animate-pulse flex gap-2 items-end h-32 w-full max-w-sm">
           {[...Array(7)].map((_, i) => (
             <div key={i} className="flex-1 bg-white/5 rounded-t-sm" style={{ height: `${Math.max(20, Math.random() * 100)}%` }}></div>
           ))}
        </div>
      </div>
    );
  }

  const maxEvents = Math.max(...data.map(d => d.totalEvents), 1); // Avoid division by zero

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-snap-card border border-snap-border rounded-2xl p-5">
      <h3 className="text-sm font-semibold text-white mb-6">Activity (Last {days} days)</h3>
      <div className="flex items-end justify-between h-32 gap-2">
        {data.map((dayData, i) => {
          const dateObj = new Date(dayData._id);
          const heightPct = (dayData.totalEvents / maxEvents) * 100;
          
          return (
            <div key={dayData._id} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div className="absolute -top-8 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {dayData.totalEvents} events
              </div>
              <div className="w-full bg-white/5 rounded-t-sm h-full flex items-end overflow-hidden">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${heightPct}%` }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  className="w-full bg-snap-accent rounded-t-sm"
                />
              </div>
              <span className="text-[10px] text-gray-500 uppercase font-medium">
                {dayNames[dateObj.getUTCDay()]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductivityChart;

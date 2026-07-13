import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const parseDate = (dateVal) => {
  if (!dateVal) return new Date();
  if (Array.isArray(dateVal)) {
    const year = dateVal[0];
    const month = (dateVal[1] || 1) - 1;
    const day = dateVal[2] || 1;
    const hour = dateVal[3] || 0;
    const minute = dateVal[4] || 0;
    const second = dateVal[5] || 0;
    return new Date(year, month, day, hour, minute, second);
  }
  return new Date(dateVal);
};

const AdminTimeline = () => {
  const [users, setUsers] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timelineError, setTimelineError] = useState(false);
  const { role } = useAuth();

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        setLoading(true);
        setTimelineError(false);

        // Fetch users
        const usersData = await adminApi.getAllUsers().catch((err) => {
          console.error('Timeline page: Failed to load users:', err);
          return [];
        });
        setUsers(usersData || []);

        // Fetch timeline data from the `/admins/dashboard/timeline` endpoint
        const rawTimeline = await adminApi.getTimelineData().catch((err) => {
          console.warn('Timeline page: GET /admins/dashboard/timeline failed:', err.message);
          setTimelineError(true);
          return [];
        });
        setTimelineData(rawTimeline || []);
      } catch (err) {
        console.error('Timeline page error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (role === 'SUPER_ADMIN') {
      fetchTimeline();
    }
  }, [role]);

  const getGrowthData = () => {
    const monthlyMap = [];

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);

      monthlyMap.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
        name: d.toLocaleString("en-US", { month: "short" }),
        signups: 0,
        volume: 0,
      });
    }

    // ============================
    // USER SIGNUPS
    // ============================

    users.forEach((u) => {
      if (!u.createdAt) return;

      const date = parseDate(u.createdAt);

      const key = `${date.getFullYear()}-${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`;

      const monthObj = monthlyMap.find((m) => m.key === key);

      if (monthObj) {
        monthObj.signups += 1;
      }
    });

    // ============================
    // PAYMENT VOLUME
    // Backend returns:
    // {
    //    month: "July",
    //    transactionCount: 1598
    // }
    // ============================

    timelineData.forEach((item) => {

      const monthObj = monthlyMap.find(
        (m) =>
          m.name.toLowerCase() ===
          item.month.substring(0, 3).toLowerCase()
      );

      if (monthObj) {
        monthObj.volume = Number(item.transactionCount);
      }
    });

    console.log("Timeline API:", timelineData);
    console.log("Chart Data:", monthlyMap);

    return monthlyMap;
  };

  const growthData = getGrowthData();

  return (
    <div className="px-6 md:px-10 py-8 space-y-8 font-sans text-left">
      <div>
        <h2 className="text-2xl md:text-3xl font-serif font-medium text-c-text-primary">System Timeline</h2>
        <p className="text-sm text-c-text-secondary font-medium">
          Comprehensive performance auditing, user registrations, and growth statistics
        </p>
      </div>

      <div className="bg-c-card p-6 rounded-xl border border-c-border shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-c-border pb-3">
          <h3 className="font-serif font-medium text-c-text-primary text-base">Platform Growth</h3>
          <div className="flex items-center space-x-1.5 text-xs text-c-accent font-semibold">
            <TrendingUp size={14} />
            <span>Last 6 Months</span>
          </div>
        </div>

        <div className="h-96">
          {loading || timelineError ? (
            /* Vector skeleton line grid loader */
            <div className="w-full h-full flex flex-col justify-between space-y-4 animate-pulse pt-4">
              <div className="flex-1 border-b border-c-border/40 relative">
                <div className="absolute inset-0 flex flex-col justify-between">
                  <div className="border-t border-c-border/20 w-full h-0"></div>
                  <div className="border-t border-c-border/20 w-full h-0"></div>
                  <div className="border-t border-c-border/20 w-full h-0"></div>
                  <div className="border-t border-c-border/20 w-full h-0"></div>
                </div>
                <svg className="w-full h-full text-c-border/30 opacity-60" viewBox="0 0 600 200">
                  <path
                    d="M0,150 Q100,50 200,120 T400,80 T600,30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    d="M0,180 Q100,120 200,160 T400,90 T600,110"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                </svg>
              </div>
              <div className="flex justify-between text-xs text-c-text-secondary/40 font-mono">
                <span>Loading timeline metrics...</span>
                {timelineError && <span className="text-c-danger-text">(Timeline endpoint not ready - displaying skeleton)</span>}
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 15, right: -5, left: -10, bottom: 5 }}>
                <CartesianGrid stroke="#1C2740" strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  stroke="var(--color-text-secondary)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                {/* Double Y-Axes for correct proportional plotting of two different domains */}
                <YAxis
                  yAxisId="left"
                  orientation="left"
                  stroke="#C9A24B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#5B8FE0"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  contentStyle={{
                    background: '#141C2E',
                    borderRadius: '12px',
                    border: '1px solid #232F47',
                    color: '#F1EBDA',
                    fontSize: '12px',
                  }}
                />
                <Legend iconType="circle" iconSize={8} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="signups"
                  name="New User Signups"
                  stroke="#C9A24B"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="volume"
                  name="Payment Volume ($)"
                  stroke="#5B8FE0"
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTimeline;

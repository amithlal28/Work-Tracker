import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const COLORS = ['#06b6d4', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899'];

export function WeeklyActivityChart({ entries }) {
    // 1. Weekly Activity Data (Last 7 Days)
    const weeklyData = useMemo(() => {
        const today = new Date();
        const last7Days = [];

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(today.getDate() - i);
            last7Days.push(d.toISOString().split('T')[0]);
        }

        return last7Days.map(date => {
            const dayTotal = entries
                .filter(e => e.date === date)
                .reduce((sum, e) => sum + (Number(e.hours) || 0), 0);

            const dayLabel = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
            return { name: dayLabel, hours: dayTotal };
        });
    }, [entries]);

    if (entries.length === 0) return null;

    return (
        <div className="chart-container-glass h-100 d-flex flex-column">
            <h6 className="text-muted text-uppercase fw-bold letter-spacing-1 mb-4">Weekly Activity</h6>
            <div style={{ flexGrow: 1, minHeight: '250px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip
                            cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="hours" fill="#06b6d4" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}

export function TaskDistributionChart({ entries }) {
    // 2. Task Distribution Data
    const taskData = useMemo(() => {
        const distribution = {};
        entries.forEach(e => {
            if (!distribution[e.task]) distribution[e.task] = 0;
            distribution[e.task] += (Number(e.hours) || 0);
        });

        return Object.keys(distribution).map(task => ({
            name: task,
            value: distribution[task]
        })).sort((a, b) => b.value - a.value).slice(0, 6); // Top 6 tasks
    }, [entries]);

    if (entries.length === 0) return null;

    return (
        <div className="chart-container-glass h-100 d-flex flex-column">
            <h6 className="text-muted text-uppercase fw-bold letter-spacing-1 mb-4">Task Distribution</h6>
            <div style={{ flexGrow: 1, minHeight: '250px', position: 'relative' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={taskData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            {taskData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            {/* Custom Legend */}
            <div className="mt-3 d-flex flex-wrap justify-content-center gap-3">
                {taskData.map((item, idx) => (
                    <div key={idx} className="d-flex align-items-center small text-muted">
                        <span className="d-inline-block rounded-circle me-2" style={{ width: 8, height: 8, backgroundColor: COLORS[idx % COLORS.length] }}></span>
                        {item.name} ({item.value}h)
                    </div>
                ))}
            </div>
        </div>
    );
}

export function WorkCharts({ entries }) {
    return (
        <div className="d-flex flex-wrap gap-4">
            <div style={{ flex: 1, minWidth: '300px' }}>
                <WeeklyActivityChart entries={entries} />
            </div>
            <div style={{ flex: 1, minWidth: '300px' }}>
                <TaskDistributionChart entries={entries} />
            </div>
        </div>
    );
}

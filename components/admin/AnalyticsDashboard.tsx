
import React, { useMemo } from 'react';
import { User, LearningPathCollection, SubscriptionStatus } from '../../types';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, BookOpen, Star, Gem } from 'lucide-react';

interface AnalyticsDashboardProps {
    users: User[];
    learningPaths: LearningPathCollection;
}

const StatCard: React.FC<{ icon: React.ReactNode, label: string, value: string | number, color: string }> = ({ icon, label, value, color }) => (
    <div className="bg-white p-5 rounded-xl shadow-md flex items-center space-x-4 border-l-4" style={{ borderColor: color }}>
        {icon}
        <div>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="text-3xl font-bold text-slate-800">{value}</p>
        </div>
    </div>
);

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ users, learningPaths }) => {
    
    const totalUsers = users.length;
    const proUsers = users.filter(u => u.subscriptionStatus === 'pro').length;
    
    const pathPopularity = useMemo(() => {
        const counts: Record<string, number> = {};
        Object.values(learningPaths).forEach(path => {
            counts[path.title] = 0;
        });
        // This is a mock-up. In a real app, you'd track user enrollments.
        // Here, we'll assign random users to paths for demonstration.
        users.forEach((user, index) => {
            const pathIds = Object.keys(learningPaths);
            if (pathIds.length > 0) {
                const assignedPath = pathIds[index % pathIds.length];
                const pathTitle = learningPaths[assignedPath].title;
                counts[pathTitle]++;
            }
        });
        return Object.entries(counts).map(([name, value]) => ({ name, users: value }));
    }, [users, learningPaths]);

    const userGrowth = useMemo(() => {
        const sortedUsers = [...users].sort((a,b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
        const data: { name: string, users: number }[] = [];
        sortedUsers.forEach((user, index) => {
             data.push({ name: new Date(user.registeredAt).toLocaleDateString('de-DE'), users: index + 1 });
        });
        // Simplify data for better visualization
        if (data.length > 10) {
            return data.filter((_, i) => i % Math.floor(data.length/10) === 0 || i === data.length -1);
        }
        return data;
    }, [users]);
    
    const subscriptionData = [
        { name: 'Free', value: totalUsers - proUsers },
        { name: 'Pro', value: proUsers },
    ];
    
    const COLORS = ['#3b82f6', '#facc15'];
    const totalXp = users.reduce((acc, u) => acc + u.xp, 0);

    return (
        <div className="fade-in">
            <h1 className="text-4xl font-bold text-slate-900 mb-8">Analyse-Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard icon={<Users className="h-8 w-8 text-blue-500"/>} label="Gesamt-Benutzer" value={totalUsers} color="#3b82f6" />
                <StatCard icon={<Gem className="h-8 w-8 text-yellow-500"/>} label="Pro Abonnenten" value={proUsers} color="#facc15" />
                <StatCard icon={<BookOpen className="h-8 w-8 text-green-500"/>} label="Lernpfade" value={Object.keys(learningPaths).length} color="#22c55e"/>
                <StatCard icon={<Star className="h-8 w-8 text-purple-500"/>} label="Durchschnitts-XP" value={totalUsers > 0 ? Math.round(totalXp / totalUsers).toLocaleString('de-DE') : 0} color="#a855f7" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-xl text-slate-800 mb-4">Lernpfad-Popularität</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={pathPopularity} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="users" fill="#3b82f6" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-xl text-slate-800 mb-4">Abo-Status</h3>
                     <ResponsiveContainer width="100%" height={300}>
                         <PieChart>
                            <Pie data={subscriptionData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {subscriptionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                             <Tooltip />
                             <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                 <div className="lg:col-span-5 bg-white p-6 rounded-xl shadow-md">
                    <h3 className="font-bold text-xl text-slate-800 mb-4">Benutzerwachstum</h3>
                     <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={userGrowth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="users" stroke="#8884d8" activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;

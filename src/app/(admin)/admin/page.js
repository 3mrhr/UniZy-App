export default function AdminDashboard() {
    const stats = [
        { label: "Total Users", value: "8,249", change: "+124", isPositive: true },
        { label: "Active Housing Leads", value: "342", change: "+18", isPositive: true },
        { label: "Orders Today", value: "1,204", change: "-42", isPositive: false },
        { label: "Revenue (Today)", value: "EGP 42,500", change: "+EGP 3,200", isPositive: true },
    ];

    const recentActivity = [
        { text: "Ahmed H. requested a viewing for 'Cozy Studio'", time: "2 mins ago", type: "housing" },
        { text: "New Provider 'Al Amal Dorms' uploaded docs", time: "15 mins ago", type: "verification" },
        { text: "Driver 'Mohamed S.' reported an issue with order #892", time: "1 hour ago", type: "support" },
        { text: "System auto-approved 14 student IDs", time: "2 hours ago", type: "system" },
    ];

    return (
        <div className="flex flex-col gap-8">

            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Overview Dashboard</h1>
                <p className="text-slate-500 text-sm">Welcome back. Here is what is happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-2 relative overflow-hidden group hover:border-brand-200 transition-colors">

                        {/* Decorative background glow */}
                        <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-50 rounded-full blur-xl group-hover:bg-brand-100 transition-colors"></div>

                        <p className="text-slate-500 font-medium text-sm relative z-10">{stat.label}</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight relative z-10">{stat.value}</h3>

                        <div className={`inline-flex items-center gap-1 text-xs font-bold mt-1 relative z-10 ${stat.isPositive ? 'text-green-600' : 'text-red-500'}`}>
                            {stat.isPositive ? '↗' : '↘'} {stat.change} today
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-3 gap-8">

                {/* Main Chart Area (Placeholder) */}
                <div className="col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-bold text-slate-900">Revenue & Orders over time</h2>
                        <select className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg px-3 py-1.5 outline-none">
                            <option>Last 7 days</option>
                            <option>This Month</option>
                        </select>
                    </div>

                    {/* Fake Chart Graphic */}
                    <div className="flex-1 flex items-end gap-2 pb-4 pt-10 border-b border-slate-100 relative hide-scrollbar overflow-x-hidden">
                        {/* Y-axis lines */}
                        <div className="absolute top-10 left-0 w-full border-t border-slate-100/50 mix-blend-multiply"></div>
                        <div className="absolute top-1/2 left-0 w-full border-t border-slate-100/50 mix-blend-multiply"></div>

                        {[40, 60, 45, 80, 50, 90, 75, 85, 60, 100, 80, 95, 70].map((h, i) => (
                            <div key={i} className="flex-1 bg-brand-100 rounded-t-md hover:bg-brand-500 transition-all duration-300 relative group cursor-pointer" style={{ height: `${h}%` }}>
                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                    EGP {h * 420}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs text-slate-400 mt-3 font-medium px-1">
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                        <span>Sun</span>
                    </div>
                </div>

                {/* Side Panel: Recent Activity */}
                <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                    <h2 className="font-bold text-slate-900 mb-6">Live Activity Stream</h2>

                    <div className="flex-1 flex flex-col gap-6 relative">
                        {/* Connecting vertical line */}
                        <div className="absolute left-4 top-4 bottom-4 w-px bg-slate-100"></div>

                        {recentActivity.map((activity, i) => (
                            <div key={i} className="flex gap-4 relative z-10">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm text-xs
                        ${activity.type === 'housing' ? 'bg-orange-100 text-orange-600' :
                                        activity.type === 'verification' ? 'bg-blue-100 text-brand-600' :
                                            activity.type === 'support' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
                     `}>
                                    {activity.type === 'housing' ? '🏠' : activity.type === 'verification' ? '📄' : activity.type === 'support' ? '⚠️' : '⚡'}
                                </div>
                                <div className="pt-1">
                                    <p className="text-sm text-slate-700 font-medium leading-tight">{activity.text}</p>
                                    <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="mt-6 text-sm font-bold text-brand-600 hover:text-brand-700 w-full text-center py-2 bg-brand-50 rounded-xl transition-colors">
                        View All Logs
                    </button>
                </div>

            </div>

        </div>
    );
}

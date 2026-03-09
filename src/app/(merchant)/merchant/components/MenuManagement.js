import Link from 'next/link';

export default function MenuManagement({ menuItems, toggleAvailability, deals, totalRevenue, todayNet, settlements, setIsSettingsOpen }) {
    return (
        <div className="lg:col-span-1 flex flex-col gap-6 animate-fade-in delay-200">
            <div className="bg-white dark:bg-unizy-dark p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5">
                <h3 className="text-sm font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Menu Visibility</h3>
                <div className="space-y-4">
                    {menuItems.map(item => (
                        <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl hover:bg-gray-100 dark:hover:bg-unizy-navy transition-all duration-300">
                            <p className={`text-sm font-bold ${item.available ? 'text-gray-900 dark:text-white' : 'text-gray-400 line-through'}`}>
                                {item.name}
                            </p>
                            <button
                                onClick={() => toggleAvailability(item.id)}
                                className={`w-12 h-6 rounded-full relative transition-colors duration-300 ${item.available ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-700'}`}
                            >
                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${item.available ? 'right-1' : 'left-1'}`}></div>
                            </button>
                        </div>
                    ))}
                </div>
                <Link href="/merchant/menu" className="w-full mt-6 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold text-xs text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors block text-center">
                    Manage Full Menu
                </Link>
                <button onClick={() => setIsSettingsOpen(true)} className="w-full mt-2 py-4 rounded-2xl bg-gray-100 dark:bg-white/5 font-bold text-xs text-brand-600 dark:text-brand-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors block text-center">
                    Store Settings
                </button>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 rounded-[2.5rem] shadow-xl shadow-emerald-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                <p className="text-emerald-100 text-[10px] font-black uppercase tracking-widest mb-2">Today (Net)</p>
                <h3 className="text-3xl font-black mb-1">EGP {todayNet}</h3>
                <p className="text-emerald-100/60 text-[10px] font-bold">Updated real-time from ledger</p>
            </div>

            <div className="bg-white dark:bg-unizy-dark p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-white/5 animate-fade-in delay-300">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Active Deals</h3>
                    <button className="text-xs font-bold text-[var(--unizy-primary)]">+ New</button>
                </div>
                <div className="space-y-4">
                    {deals.map(deal => (
                        <div key={deal.id} className="p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{deal.title}</p>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${deal.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>{deal.status}</span>
                            </div>
                            <p className="text-xs text-gray-500">{deal.redemptions} redemptions</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-8 rounded-[2.5rem] shadow-xl shadow-rose-500/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000"></div>
                <p className="text-rose-100 text-[10px] font-black uppercase tracking-widest mb-2">Account Balance</p>
                <h3 className="text-3xl font-black mb-4">EGP {totalRevenue}</h3>
                <div className="flex items-baseline gap-2">
                    <span className="text-rose-200 text-xs font-bold">{settlements.length} Settlements</span>
                    <span className="text-rose-200 text-[10px] font-medium">processed</span>
                </div>
            </div>
        </div>
    );
}

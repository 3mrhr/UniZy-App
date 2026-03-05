export default function KanbanBoard({ orders, kanbanColumns, isUpdating, updateStatus, refreshOrders, statusLabel }) {
    return (
        <div className="lg:col-span-2 flex flex-col gap-6 animate-fade-in-up">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 dark:text-white">Live Orders</h2>
                <button onClick={refreshOrders} className="text-xs font-bold text-brand-600 hover:underline">↻ Refresh</button>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
                {kanbanColumns.map(col => (
                    <div key={col.key} className="flex flex-col gap-4">
                        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-2xl">
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{col.label}</span>
                            <span className="bg-white dark:bg-unizy-navy px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm">
                                {orders.filter(o => o.status === col.key).length}
                            </span>
                        </div>

                        <div className="space-y-4">
                            {orders.filter(o => o.status === col.key).map(order => (
                                <div key={order.id} className="bg-white dark:bg-unizy-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5 group hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <p className="text-xs font-bold text-rose-500">#{order.id.slice(-6)}</p>
                                        <p className="text-[10px] text-gray-400 font-medium">{order.time}</p>
                                    </div>
                                    <h4 className="font-black text-gray-900 dark:text-white leading-tight mb-1 text-sm">{order.item}</h4>
                                    <p className="text-xs text-gray-500 mb-4">{order.customer}</p>

                                    <div className="flex justify-between items-center pt-4 border-t border-gray-50 dark:border-white/5">
                                        <p className="font-bold text-gray-900 dark:text-white text-sm">{order.price}</p>
                                        {col.nextStatus && (
                                            <button
                                                disabled={isUpdating === order.id}
                                                onClick={() => updateStatus(order.id, col.nextStatus)}
                                                className={`px-4 py-2 ${col.color} text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:opacity-90 transition-all disabled:opacity-50`}
                                            >
                                                {isUpdating === order.id ? '...' : col.nextLabel}
                                            </button>
                                        )}
                                        {col.key === 'READY' && (
                                            <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                Awaiting Driver
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Completed/Picked Up orders summary */}
            {orders.filter(o => ['PICKED_UP', 'DELIVERED'].includes(o.status)).length > 0 && (
                <div className="bg-white dark:bg-unizy-dark p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
                    <h3 className="text-sm font-black text-gray-900 dark:text-white mb-4 uppercase tracking-widest">
                        Recent Completed ({orders.filter(o => ['PICKED_UP', 'DELIVERED'].includes(o.status)).length})
                    </h3>
                    <div className="space-y-3">
                        {orders.filter(o => ['PICKED_UP', 'DELIVERED'].includes(o.status)).slice(0, 5).map(order => (
                            <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl">
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white">{order.item}</p>
                                    <p className="text-xs text-gray-500">{order.customer} • {order.time}</p>
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {statusLabel(order.status)}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

import ThemeLangControls from '@/components/ThemeLangControls';

export default function MerchantHeader({ merchantName, storeOpen, onToggleStatus }) {
    return (
        <header className="bg-white dark:bg-unizy-dark px-6 py-6 shadow-sm border-b border-gray-100 dark:border-white/5 flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center text-white font-bold shadow-lg shadow-rose-500/20 text-lg">
                    M
                </div>
                <div>
                    <h1 className="text-lg font-black text-gray-900 dark:text-white leading-none">Merchant Hub</h1>
                    <button
                        onClick={onToggleStatus}
                        className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 hover:text-brand-500 transition-colors"
                    >
                        {merchantName} • <span className={storeOpen ? 'text-emerald-500' : 'text-rose-500'}>{storeOpen ? 'Open' : 'Closed'}</span>
                    </button>
                </div>
            </div>
            <ThemeLangControls />
        </header>
    );
}

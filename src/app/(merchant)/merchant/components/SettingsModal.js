export default function SettingsModal({ isSettingsOpen, setIsSettingsOpen, settingsForm, setSettingsForm, handleUpdateSettings, isUpdating }) {
    if (!isSettingsOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-unizy-dark w-full max-w-md p-8 rounded-[2.5rem] shadow-2xl relative">
                <button onClick={() => setIsSettingsOpen(false)} className="absolute top-6 right-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">✕</button>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Store Settings</h2>

                <form onSubmit={handleUpdateSettings} className="flex flex-col gap-4">
                    <input required value={settingsForm.storeName} onChange={e => setSettingsForm({ ...settingsForm, storeName: e.target.value })} placeholder="Store Name" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
                    <input value={settingsForm.storeAddress} onChange={e => setSettingsForm({ ...settingsForm, storeAddress: e.target.value })} placeholder="Store Address" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all text-sm" />
                    <textarea value={settingsForm.storeDescription} onChange={e => setSettingsForm({ ...settingsForm, storeDescription: e.target.value })} placeholder="Description / Bio" className="w-full bg-gray-50 dark:bg-unizy-navy/50 p-4 rounded-2xl border-none outline-none font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-rose-500 transition-all text-sm resize-none h-24" />

                    <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-unizy-navy/50 rounded-2xl cursor-pointer">
                        <input type="checkbox" checked={settingsForm.storeOpen} onChange={e => setSettingsForm({ ...settingsForm, storeOpen: e.target.checked })} className="w-5 h-5 rounded text-rose-500 focus:ring-rose-500" />
                        <span className="font-bold text-sm text-gray-900 dark:text-white">Store is Open (Accepting Orders)</span>
                    </label>

                    <button disabled={isUpdating === 'settings'} type="submit" className="w-full py-4 mt-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-500/20 active:scale-95 transition-all">
                        {isUpdating === 'settings' ? 'Saving...' : 'Save Settings'}
                    </button>
                </form>
            </div>
        </div>
    );
}

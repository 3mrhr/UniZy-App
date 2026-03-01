import AdminSidebar from "@/components/admin/AdminSidebar";
import ThemeLangControls from "@/components/ThemeLangControls";

export const metadata = {
    title: "UniZy Admin | Control Center",
    description: "Operations dashboard for UniZy overall management.",
};

export default function AdminLayout({ children }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-unizy-navy flex text-slate-900 dark:text-slate-200 font-sans transition-colors duration-300">
            <AdminSidebar />

            {/* Main Content wrapper with left margin mapping to the sidebar width */}
            <div className="flex-1 ml-64 flex flex-col">

                {/* Top Header */}
                <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10 sticky top-0">
                    <div className="relative w-96">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search students, orders, listings..."
                            className="w-full bg-slate-100 border-none text-sm rounded-lg block pl-9 p-2 focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeLangControls />
                        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-2"></div>
                        <button className="relative text-slate-500 hover:text-brand-600 transition-colors">
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-8 pb-20 animate-fade-in flex-1 bg-slate-50 dark:bg-unizy-navy">
                    {children}
                </main>

            </div>
        </div>
    );
}

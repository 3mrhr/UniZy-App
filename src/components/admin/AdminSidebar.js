import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/app/actions/auth";

export default async function AdminSidebar() {
    const user = await getCurrentUser();
    const role = user?.role || 'SUPERADMIN';
    const isGlobalAdmin = role === 'SUPERADMIN';

    // Base items everyone sees
    let navItems = [
        { label: "Dashboard", href: "/admin", icon: "📊" },
    ];

    // Conditional routing based on role
    if (isGlobalAdmin || role === 'HOUSINGSUPERADMIN') {
        navItems.push({ label: "Housing Moderation", href: "/admin/housing", icon: "🏠" });
    }

    // Verifications and Support are generally useful for most admins
    navItems.push(
        { label: "Verifications", href: "/admin/verifications", icon: "✅" },
        { label: "Helpdesk", href: "/admin/support", icon: "🎧" }
    );

    // Global Admin Only Items
    if (isGlobalAdmin) {
        navItems.push(
            { label: "Users & Roles", href: "/admin/roles", icon: "👥" },
            { label: "Finance & Payouts", href: "/admin/finance", icon: "💰" }
        );
    }

    return (
        <aside className="w-64 bg-slate-900 min-h-screen text-slate-300 flex flex-col fixed left-0 top-0 shadow-2xl z-20">

            {/* Admin Branding */}
            <div className="p-6 border-b border-slate-800 flex items-center gap-4">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                    <Image src="/images/unizy-logo-icon.png" alt="UniZy Logo" width={36} height={36} className="object-contain" />
                </div>
                <div>
                    <h2 className="text-white font-bold text-lg tracking-tight">UniZy Admin</h2>
                    <p className="text-xs text-brand-400 font-medium">
                        {isGlobalAdmin ? 'Global Control' : role.replace('SUPERADMIN', '') + ' Module'}
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
                {navItems.map((item) => (
                    <Link
                        href={item.href}
                        key={item.href}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 hover:text-white transition-colors group"
                    >
                        <span className="text-xl group-hover:scale-110 transition-transform">{item.icon}</span>
                        <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            {/* User Area */}
            <div className="p-4 m-4 bg-slate-800 rounded-2xl flex items-center justify-between border border-slate-700">
                <div className="flex items-center gap-3 truncate">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-indigo-500 text-white flex items-center justify-center text-xs font-bold font-mono">
                        {user?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="truncate">
                        <p className="text-white text-sm font-bold leading-tight truncate">{user?.name || 'Admin User'}</p>
                        <p className="text-[10px] text-brand-400 font-black tracking-wider uppercase truncate">{role}</p>
                    </div>
                </div>
                <button className="text-slate-500 hover:text-rose-400 transition-colors shrink-0 ml-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                </button>
            </div>

        </aside>
    );
}

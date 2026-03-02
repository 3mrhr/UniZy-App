"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Users, ShoppingBag, Truck,
    Home, Tag, Utensils, ShieldAlert, LogOut,
    Menu, X, Bell, Settings, ChevronRight, MapPin, DollarSign, Percent, CreditCard
} from 'lucide-react';

const ADMIN_ROLES = {
    ADMIN_SUPER: {
        label: 'Super Admin',
        color: 'bg-indigo-600',
        links: [
            { label: 'Overview', icon: LayoutDashboard, href: '/admin' },
            { label: 'Verifications', icon: ShieldAlert, href: '/admin/verifications' },
            { label: 'Helpdesk', icon: Users, href: '/admin/support' },
            { label: 'Hub Moderation', icon: Tag, href: '/admin/hub' },
            { label: 'Campaigns', icon: ShoppingBag, href: '/admin/campaigns' },
            { label: 'Delivery', icon: Truck, href: '/admin/delivery' },
            { label: 'Transport', icon: ShoppingBag, href: '/admin/transport' },
            { label: 'Housing', icon: Home, href: '/admin/housing' },
            { label: 'Commerce', icon: Tag, href: '/admin/commerce' },
            { label: 'Home Services', icon: Settings, href: '/admin/services' },
            { label: 'Transactions', icon: ShoppingBag, href: '/admin/transactions' },
            { label: 'Payments', icon: CreditCard, href: '/admin/payments' },
            { label: 'Global Pricing', icon: DollarSign, href: '/admin/pricing' },
            { label: 'Revenue & Commissions', icon: Percent, href: '/admin/commissions' },
            { label: 'Zones Map', icon: MapPin, href: '/admin/zones' },
            { label: 'Roles & Permissions', icon: Users, href: '/admin/roles-permissions' },
            { label: 'Permission Scopes', icon: ShieldAlert, href: '/admin/roles-permissions/scopes' },
            { label: 'Staff Management', icon: Users, href: '/admin/staff' },
            { label: 'Audit Logs', icon: Users, href: '/admin/audit-logs' },
            { label: 'Finance', icon: ShoppingBag, href: '/admin/finance' },
        ]
    },
    ADMIN_DELIVERY: {
        label: 'Delivery Admin',
        color: 'bg-orange-600',
        links: [
            { label: 'Overview', icon: LayoutDashboard, href: '/admin/delivery' },
            { label: 'Vendors', icon: Users, href: '/admin/delivery/vendors' },
            { label: 'Live Orders', icon: Truck, href: '/admin/delivery/orders' },
            { label: 'Pricing & Fees', icon: DollarSign, href: '/admin/delivery/pricing' },
            { label: 'Commissions', icon: Percent, href: '/admin/delivery/commissions' },
            { label: 'Analytics', icon: ShieldAlert, href: '/admin/delivery/analytics' },
        ]
    },
    ADMIN_TRANSPORT: {
        label: 'Transport Admin',
        color: 'bg-blue-600',
        links: [
            { label: 'Overview', icon: LayoutDashboard, href: '/admin/transport' },
            { label: 'Fleet', icon: ShoppingBag, href: '/admin/transport/fleet' },
            { label: 'Live Rides', icon: Users, href: '/admin/transport/rides' },
            { label: 'Pricing & Fares', icon: DollarSign, href: '/admin/transport/pricing' },
            { label: 'Commissions', icon: Percent, href: '/admin/transport/commissions' },
            { label: 'Analytics', icon: ShieldAlert, href: '/admin/transport/analytics' },
        ]
    },
    ADMIN_HOUSING: {
        label: 'Housing Admin',
        color: 'bg-emerald-600',
        links: [
            { label: 'Overview', icon: LayoutDashboard, href: '/admin/housing' },
            { label: 'Verifications', icon: ShieldAlert, href: '/admin/housing/verifications' },
            { label: 'Listings', icon: Home, href: '/admin/housing/listings' },
            { label: 'Pricing & Fees', icon: DollarSign, href: '/admin/housing/pricing' },
            { label: 'Commissions', icon: Percent, href: '/admin/housing/commissions' },
            { label: 'Analytics', icon: Users, href: '/admin/housing/analytics' },
        ]
    },
    ADMIN_COMMERCE: {
        label: 'Commerce Admin',
        color: 'bg-purple-600',
        links: [
            { label: 'Overview', icon: LayoutDashboard, href: '/admin/commerce' },
            { label: 'Deals', icon: Tag, href: '/admin/commerce/deals' },
            { label: 'Meals', icon: Utensils, href: '/admin/commerce/meals' },
            { label: 'Merchants', icon: Users, href: '/admin/commerce/merchants' },
            { label: 'Pricing Rules', icon: DollarSign, href: '/admin/commerce/pricing' },
            { label: 'Commissions', icon: Percent, href: '/admin/commerce/commissions' },
        ]
    }
};

export default function AdminLayout({ children }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [role, setRole] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // In a real app, this would check the authenticated user's role from a session/cookie
        // For MVP, we'll simulate based on the path or a local storage flag
        const savedRole = localStorage.getItem('unizy_admin_role') || 'ADMIN_SUPER';
        setRole(savedRole);
        setIsLoading(false);
    }, []);

    const activeRole = ADMIN_ROLES[role] || ADMIN_ROLES.ADMIN_SUPER;

    const handleLogout = () => {
        localStorage.removeItem('unizy_admin_role');
        router.push('/login');
    };

    if (isLoading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-black">Loading Dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0F172A] flex">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-[#1E293B] border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
                <div className="h-full flex flex-col">
                    {/* Sidebar Header */}
                    <div className="p-6 flex items-center justify-between">
                        <Link href="/admin" className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-black text-xl">U</span>
                            </div>
                            <span className="text-xl font-black tracking-tight text-gray-900 dark:text-white">UniZy <span className="text-brand-600">Admin</span></span>
                        </Link>
                        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Role Badge */}
                    <div className="px-6 mb-8">
                        <div className={`px-4 py-3 rounded-2xl ${activeRole.color} text-white shadow-lg`}>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-0.5">Current Role</p>
                            <p className="font-black text-sm">{activeRole.label}</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                        {activeRole.links.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl transition-all group ${isActive
                                        ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-600 dark:text-brand-400'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <link.icon className={`w-5 h-5 ${isActive ? 'text-brand-600' : 'group-hover:text-gray-900 dark:group-hover:text-white'}`} />
                                        <span className="font-bold text-sm tracking-tight">{link.label}</span>
                                    </div>
                                    {isActive && <div className="w-1.5 h-1.5 rounded-full bg-brand-600"></div>}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Sidebar Footer */}
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/5 rounded-xl transition-all font-bold text-sm"
                        >
                            <LogOut className="w-5 h-5" /> Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="h-20 bg-white dark:bg-[#1E293B] border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 relative z-40">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-500">
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-lg font-black text-gray-900 dark:text-white hidden sm:block italic">
                            Control Center Portal
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-full border border-gray-100 dark:border-gray-700">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">System Online</span>
                        </div>
                        <button className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-[#1E293B]"></span>
                        </button>
                        <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-brand-500/30">
                            AD
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gray-50/50 dark:bg-[#0F172A]">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}

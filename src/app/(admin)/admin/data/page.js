"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Users, ShoppingCart, Home, HeadphonesIcon, DollarSign, Gift,
    Settings, ChevronRight, Database, BarChart3, Shield, Bell,
    Tag, Truck, Car, Utensils, Sparkles, Megaphone, FileText,
    ClipboardList, MapPin, Lock, Wrench, CreditCard, Receipt,
    AlertTriangle, Star, BookOpen
} from "lucide-react";

const sections = [
    {
        title: "Users & Accounts",
        icon: Users,
        color: "from-blue-500 to-blue-600",
        links: [
            { name: "All Users", href: "/admin/staff", desc: "Students, merchants, drivers, providers, admins", icon: Users },
            { name: "Roles & Permissions", href: "/admin/roles-permissions", desc: "RBAC configuration and scopes", icon: Lock },
            { name: "Scopes Manager", href: "/admin/roles-permissions/scopes", desc: "Fine-grained permission scopes", icon: Shield },
            { name: "Verifications", href: "/admin/verifications", desc: "Identity & document verification queue", icon: ClipboardList },
            { name: "Referrals", href: "/admin/referrals", desc: "Referral program tracking", icon: Star },
        ],
    },
    {
        title: "Commerce & Delivery",
        icon: ShoppingCart,
        color: "from-emerald-500 to-emerald-600",
        links: [
            { name: "Commerce Overview", href: "/admin/commerce", desc: "Orders, merchant activity, sales metrics", icon: ShoppingCart },
            { name: "Commerce Pricing", href: "/admin/commerce/pricing", desc: "Delivery pricing rules and fees", icon: Tag },
            { name: "Commerce Commissions", href: "/admin/commerce/commissions", desc: "Merchant commission structure", icon: DollarSign },
            { name: "Delivery Module", href: "/admin/delivery", desc: "Delivery-specific settings", icon: Truck },
            { name: "Delivery Pricing", href: "/admin/delivery/pricing", desc: "Delivery fee configuration", icon: Tag },
            { name: "Delivery Commissions", href: "/admin/delivery/commissions", desc: "Driver commission rates", icon: DollarSign },
            { name: "Dispatch Center", href: "/admin/dispatch", desc: "Real-time order dispatch & assignment", icon: Truck },
            { name: "Listings Moderation", href: "/admin/listings-moderation", desc: "Merchant listing approval queue", icon: ClipboardList },
        ],
    },
    {
        title: "Transport",
        icon: Car,
        color: "from-violet-500 to-violet-600",
        links: [
            { name: "Transport Module", href: "/admin/transport", desc: "Ride management and fleet overview", icon: Car },
            { name: "Transport Pricing", href: "/admin/transport/pricing", desc: "Per-km rates, surge pricing", icon: Tag },
            { name: "Transport Commissions", href: "/admin/transport/commissions", desc: "Driver revenue share", icon: DollarSign },
            { name: "Zones", href: "/admin/zones", desc: "Geofenced service zones", icon: MapPin },
        ],
    },
    {
        title: "Housing",
        icon: Home,
        color: "from-amber-500 to-amber-600",
        links: [
            { name: "Housing Module", href: "/admin/housing", desc: "Listings, requests, approvals", icon: Home },
            { name: "Housing Pricing", href: "/admin/housing/pricing", desc: "Housing service fees", icon: Tag },
            { name: "Housing Commissions", href: "/admin/housing/commissions", desc: "Provider commission rates", icon: DollarSign },
        ],
    },
    {
        title: "Services & Cleaning",
        icon: Wrench,
        color: "from-cyan-500 to-cyan-600",
        links: [
            { name: "Services Module", href: "/admin/services", desc: "Service bookings and providers", icon: Wrench },
            { name: "Services Pricing", href: "/admin/services/pricing", desc: "Service fee structure", icon: Tag },
            { name: "Services Commissions", href: "/admin/services/commissions", desc: "Provider commission rates", icon: DollarSign },
            { name: "Cleaning Module", href: "/admin/cleaning", desc: "Cleaning packages and bookings", icon: Sparkles },
        ],
    },
    {
        title: "Finance",
        icon: DollarSign,
        color: "from-green-500 to-green-600",
        links: [
            { name: "Finance Overview", href: "/admin/finance", desc: "Revenue, commissions, payouts summary", icon: DollarSign },
            { name: "Transactions", href: "/admin/transactions", desc: "All financial transactions ledger", icon: Receipt },
            { name: "Payments", href: "/admin/payments", desc: "Payment statuses and processing", icon: CreditCard },
            { name: "Refunds", href: "/admin/refunds", desc: "Refund requests and processing", icon: AlertTriangle },
            { name: "Settlements", href: "/admin/finance/settlements", desc: "Provider settlement cycles", icon: FileText },
            { name: "Payouts", href: "/admin/finance/payouts", desc: "Payout processing and history", icon: DollarSign },
            { name: "Financial Reports", href: "/admin/finance/reports", desc: "P&L, revenue breakdowns", icon: BarChart3 },
            { name: "Global Pricing", href: "/admin/pricing", desc: "Cross-module pricing overview", icon: Tag },
            { name: "Global Commissions", href: "/admin/commissions", desc: "Cross-module commission overview", icon: DollarSign },
        ],
    },
    {
        title: "Rewards & Promotions",
        icon: Gift,
        color: "from-pink-500 to-pink-600",
        links: [
            { name: "Promotions", href: "/admin/promotions", desc: "Promo codes, discounts, deals", icon: Tag },
            { name: "Campaigns", href: "/admin/campaigns", desc: "Marketing campaigns", icon: Megaphone },
        ],
    },
    {
        title: "Support & Safety",
        icon: HeadphonesIcon,
        color: "from-red-500 to-red-600",
        links: [
            { name: "Support Tickets", href: "/admin/support", desc: "Customer support queue", icon: HeadphonesIcon },
            { name: "Reports", href: "/admin/reports", desc: "User reports and flags", icon: AlertTriangle },
            { name: "SLA Rules", href: "/admin/sla", desc: "Service level agreement configuration", icon: ClipboardList },
            { name: "SLA Breaches", href: "/admin/sla/breaches", desc: "SLA violation log", icon: AlertTriangle },
        ],
    },
    {
        title: "Community",
        icon: BookOpen,
        color: "from-indigo-500 to-indigo-600",
        links: [
            { name: "Hub / Forum", href: "/admin/hub", desc: "Community posts and moderation", icon: BookOpen },
            { name: "Notifications", href: "/admin/notifications", desc: "Push notification management", icon: Bell },
        ],
    },
    {
        title: "System & Audit",
        icon: Settings,
        color: "from-gray-500 to-gray-600",
        links: [
            { name: "Analytics", href: "/admin/analytics", desc: "Event tracking and funnels", icon: BarChart3 },
            { name: "Audit Logs", href: "/admin/audit-logs", desc: "Admin action history", icon: FileText },
        ],
    },
];

export default function AdminDataHub() {
    const [search, setSearch] = useState("");

    const filtered = search
        ? sections
            .map((s) => ({
                ...s,
                links: s.links.filter(
                    (l) =>
                        l.name.toLowerCase().includes(search.toLowerCase()) ||
                        l.desc.toLowerCase().includes(search.toLowerCase())
                ),
            }))
            .filter((s) => s.links.length > 0)
        : sections;

    const totalLinks = sections.reduce((a, s) => a + s.links.length, 0);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
                        <Database className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Hub</h1>
                    <span className="ml-auto px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
                        {totalLinks} modules
                    </span>
                </div>
                <p className="text-gray-500 dark:text-gray-400 ml-14">
                    Central access to all database entities, admin tools, and configuration panels.
                </p>

                {/* Search */}
                <div className="mt-5 ml-14">
                    <input
                        type="text"
                        placeholder="Search modules..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full max-w-md px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map((section) => {
                    const Icon = section.icon;
                    return (
                        <div
                            key={section.title}
                            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            {/* Section header */}
                            <div className={`bg-gradient-to-r ${section.color} px-5 py-3 flex items-center gap-2.5`}>
                                <Icon className="w-5 h-5 text-white" />
                                <h2 className="text-white font-semibold text-sm tracking-wide uppercase">
                                    {section.title}
                                </h2>
                                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                                    {section.links.length}
                                </span>
                            </div>

                            {/* Links */}
                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {section.links.map((link) => {
                                    const LinkIcon = link.icon;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                                        >
                                            <LinkIcon className="w-4 h-4 text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 flex-shrink-0" />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {link.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {link.desc}
                                                </p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

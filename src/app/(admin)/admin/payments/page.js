import { getPayments, updatePaymentStatus } from "@/app/actions/payments";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import {
    CreditCard, Search, Filter, CheckCircle2,
    XCircle, Clock, MoreVertical, RefreshCw, FileText
} from "lucide-react";

// Server Action internally bound to UI buttons
async function handleMarkPaid(formData) {
    "use server";
    const id = formData.get("id");
    if (!id) return;
    await updatePaymentStatus(id, "PAID", "Manual admin review");
}

async function handleMarkFailed(formData) {
    "use server";
    const id = formData.get("id");
    const reason = formData.get("reason") || "Manual admin rejection";
    if (!id) return;
    await updatePaymentStatus(id, "FAILED", reason);
}

export default async function AdminPaymentsPage({ searchParams }) {
    const user = await getCurrentUser();
    if (!user || (!user.role?.startsWith("ADMIN_") && user.role !== "ADMIN_SUPER")) {
        redirect("/login");
    }

    const { status, method, search, page } = await searchParams;
    const currentPage = page ? parseInt(page) : 1;

    const filters = {
        status: status || undefined,
        method: method || undefined,
        search: search || undefined,
        page: currentPage,
        limit: 20
    };

    const { payments, total, totalPages, stats, error } = await getPayments(filters);

    // Stats
    const totalPaid = stats?.totalPaid || 0;
    const totalPending = stats?.totalPending || 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold font-cabinet text-unizy-navy dark:text-gray-100 flex items-center gap-2">
                        <CreditCard className="w-6 h-6 text-brand-600" />
                        Payments & Payouts
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage transactions, cash collections, and track revenue.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-unizy-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Collected (Paid)</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                EGP {totalPaid.toLocaleString()}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-unizy-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Pending Collection</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                EGP {totalPending.toLocaleString()}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-unizy-dark p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm text-gray-500 font-medium">Total Transactions</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                                {total || 0}
                            </h3>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    {/* Quick Filter Form via GET */}
                    <form className="flex w-full gap-4">
                        <div className="flex-1 relative">
                            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                name="search"
                                defaultValue={search || ""}
                                placeholder="Search Txn ID, name, email..."
                                className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                            />
                        </div>
                        <select
                            name="status"
                            defaultValue={status || ""}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                        >
                            <option value="">All Statuses</option>
                            <option value="PENDING">Pending</option>
                            <option value="PAID">Paid</option>
                            <option value="FAILED">Failed</option>
                        </select>
                        <select
                            name="method"
                            defaultValue={method || ""}
                            className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none"
                        >
                            <option value="">All Methods</option>
                            <option value="COD">Cash on Delivery</option>
                            <option value="CASH">Cash</option>
                            <option value="CARD">Card</option>
                            <option value="WALLET">Wallet</option>
                        </select>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            Filter
                        </button>
                    </form>
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl mb-6">
                        {error}
                    </div>
                )}

                {/* Payments Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400">
                                <th className="pb-3 px-4">Txn Code</th>
                                <th className="pb-3 px-4">User</th>
                                <th className="pb-3 px-4">Amount</th>
                                <th className="pb-3 px-4">Method</th>
                                <th className="pb-3 px-4">Status</th>
                                <th className="pb-3 px-4">Date</th>
                                <th className="pb-3 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {!payments || payments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-8 text-center text-gray-500">
                                        No payments found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition">
                                        <td className="py-3 px-4 font-mono text-xs text-gray-500">
                                            {payment.transaction?.txnCode || "N/A"}
                                        </td>
                                        <td className="py-3 px-4">
                                            {payment.transaction?.user ? (
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-200">
                                                        {payment.transaction.user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {payment.transaction.user.email}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">Unknown</span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 font-medium text-gray-900 dark:text-gray-100">
                                            {payment.amount.toLocaleString()} {payment.currency}
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="px-2 py-1 text-xs font-medium rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                                {payment.method}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            {payment.status === "PAID" && (
                                                <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-1 rounded-md text-xs font-medium">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid
                                                </span>
                                            )}
                                            {payment.status === "PENDING" && (
                                                <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-900/20 dark:text-amber-400 px-2 py-1 rounded-md text-xs font-medium">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            )}
                                            {payment.status === "FAILED" && (
                                                <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 px-2 py-1 rounded-md text-xs font-medium">
                                                    <XCircle className="w-3 h-3" /> Failed
                                                </span>
                                            )}
                                            {payment.status === "REFUNDED" && (
                                                <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded-md text-xs font-medium">
                                                    <RefreshCw className="w-3 h-3" /> Refunded
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-3 px-4 text-gray-500">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4 text-right">
                                            {payment.status === "PENDING" && (
                                                <div className="flex justify-end gap-2">
                                                    <form action={handleMarkPaid}>
                                                        <input type="hidden" name="id" value={payment.id} />
                                                        <button
                                                            type="submit"
                                                            className="px-3 py-1 bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-900/20 dark:text-brand-400 rounded-lg text-xs font-medium transition"
                                                        >
                                                            Mark Paid
                                                        </button>
                                                    </form>
                                                    <form action={handleMarkFailed}>
                                                        <input type="hidden" name="id" value={payment.id} />
                                                        <input type="hidden" name="reason" value="Manually failed by admin" />
                                                        <button
                                                            type="submit"
                                                            className="px-3 py-1 bg-white border border-gray-200 text-red-600 hover:bg-red-50 dark:bg-transparent dark:border-gray-700 dark:text-red-400 rounded-lg text-xs font-medium transition"
                                                        >
                                                            Fail
                                                        </button>
                                                    </form>
                                                </div>
                                            )}
                                            {payment.status !== "PENDING" && (
                                                <span className="text-xs text-gray-400 italic">No actions</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination placeholder */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <p className="text-sm text-gray-500">
                            Page {currentPage} of {totalPages}
                        </p>
                        <div className="flex gap-2">
                            {currentPage > 1 && (
                                <a href={`?page=${currentPage - 1}${status ? '&status=' + status : ''}${method ? '&method=' + method : ''}${search ? '&search=' + search : ''}`} className="px-3 py-1 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Prev</a>
                            )}
                            {currentPage < totalPages && (
                                <a href={`?page=${currentPage + 1}${status ? '&status=' + status : ''}${method ? '&method=' + method : ''}${search ? '&search=' + search : ''}`} className="px-3 py-1 border rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">Next</a>
                            )}
                        </div>
                    </div>
                )}
            </div>

        </div>
    );
}

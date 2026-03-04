import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/authz';
import { revalidatePath } from 'next/cache';

export const metadata = {
    title: 'Transport SOS | UniZy Admin',
};

async function getTransportSOSTickets() {
    return await prisma.supportTicket.findMany({
        where: {
            category: 'TRANSPORT_SOS'
        },
        include: {
            user: {
                select: {
                    name: true,
                    phone: true
                }
            }
        },
        orderBy: [
            {
                status: 'asc' // OPEN first
            },
            {
                createdAt: 'desc'
            }
        ]
    });
}

export default async function TransportSOSAdminPage() {
    await requireRole(['ADMIN_SUPER', 'ADMIN_TRANSPORT']);

    const tickets = await getTransportSOSTickets();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 dark:text-white">Transport SOS Inbox</h1>
                    <p className="text-sm text-gray-500">Manage emergency alerts from Transport rides.</p>
                </div>
            </div>

            <div className="bg-white dark:bg-unizy-dark rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/5 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <th className="p-4">Time</th>
                            <th className="p-4">Student</th>
                            <th className="p-4">Phone</th>
                            <th className="p-4">Order ID</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
                        {tickets.length > 0 ? tickets.map(ticket => {
                            let details = {};
                            try { details = JSON.parse(ticket.description || '{}'); } catch (e) {}

                            return (
                                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <td className="p-4 whitespace-nowrap">
                                        {new Date(ticket.createdAt).toLocaleString()}
                                    </td>
                                    <td className="p-4 font-bold">
                                        {ticket.user?.name || 'Unknown'}
                                    </td>
                                    <td className="p-4">
                                        {ticket.user?.phone || 'Unknown'}
                                    </td>
                                    <td className="p-4 font-mono text-xs">
                                        {details.transportOrderId || 'N/A'}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                            ticket.status === 'OPEN' ? 'bg-red-100 text-red-700' :
                                            ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                                            'bg-yellow-100 text-yellow-700'
                                        }`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {ticket.status !== 'RESOLVED' && (
                                            <form action={async () => {
                                                'use server';
                                                const nextStatus = ticket.status === 'OPEN' ? 'IN_PROGRESS' : 'RESOLVED';
                                                await prisma.supportTicket.update({
                                                    where: { id: ticket.id },
                                                    data: { status: nextStatus }
                                                });
                                                revalidatePath('/admin/transport-sos');
                                            }}>
                                                <button
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold text-white transition-colors ${
                                                        ticket.status === 'OPEN' ? 'bg-blue-600 hover:bg-blue-700' :
                                                        'bg-green-600 hover:bg-green-700'
                                                    }`}
                                                >
                                                    {ticket.status === 'OPEN' ? 'ACKNOWLEDGE' : 'RESOLVE'}
                                                </button>
                                            </form>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={6} className="p-8 text-center text-gray-500">
                                    No Transport SOS tickets found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

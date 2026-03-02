import SupportRefundsClient from './SupportRefundsClient';
import { getCurrentUser } from '@/app/actions/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { RefreshCw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
    title: 'Request a Refund | UniZy',
    description: 'Request a refund for a previous transaction.',
};

export default async function StudentRefundPage() {
    const user = await getCurrentUser();
    if (!user) {
        redirect('/login');
    }

    // Get the user's completed or paid transactions that don't already have a refund request
    const eligibleTransactions = await prisma.transaction.findMany({
        where: {
            userId: user.id,
            status: { in: ['COMPLETED', 'CANCELLED'] }, // Allowing cancelled orders assuming they paid upfront
            refunds: { none: { status: { in: ['REQUESTED', 'APPROVED'] } } }, // Can only request if no pending refund
            payments: { some: { status: 'PAID' } } // Can only refund if money was paid
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
            payments: true
        }
    });

    const previousRefunds = await prisma.refund.findMany({
        where: { requestedById: user.id },
        include: { transaction: true },
        orderBy: { createdAt: 'desc' }
    });

    return (
        <div className="max-w-3xl mx-auto pb-24 space-y-6 pt-6">
            <div className="flex items-center text-gray-500 mb-6">
                <Link href="/support" className="hover:text-gray-900 dark:hover:text-white transition-colors flex items-center pr-4 border-r border-gray-200 dark:border-gray-800">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div className="pl-4">
                    <h1 className="text-2xl font-bold font-cabinet text-gray-900 dark:text-white flex items-center gap-2">
                        <RefreshCw className="w-6 h-6 text-brand-600" />
                        Request a Refund
                    </h1>
                </div>
            </div>

            <SupportRefundsClient eligibleTransactions={eligibleTransactions} previousRefunds={previousRefunds} />
        </div>
    );
}

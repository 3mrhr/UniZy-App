'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/i18n/LanguageProvider';

import MerchantHeader from './components/MerchantHeader';
import KanbanBoard from './components/KanbanBoard';
import MenuManagement from './components/MenuManagement';
import SettingsModal from './components/SettingsModal';

export default function MerchantClient({ merchantData }) {
    const { settlements, dbOrders = [], dbMeals = [], dbDeals = [], merchantName = 'Merchant Hub', storeAddress = '', storeDescription = '', storeOpen = false } = merchantData;
    const { dict } = useLanguage();

    const totalRevenue = settlements.reduce((sum, s) => sum + s.netAmount, 0);

    // Map DB statuses to UI display names
    const statusLabel = (s) => {
        const map = { PENDING: 'New', ACCEPTED: 'Accepted', PREPARING: 'Preparing', READY: 'Ready', PICKED_UP: 'Picked Up', DELIVERED: 'Delivered', CANCELLED: 'Cancelled' };
        return map[s] || s;
    };

    // Map real orders to UI shape
    const [orders, setOrders] = useState(() =>
        dbOrders.map(o => {
            const itemNames = o.orderItems?.map(i => `${i.nameSnapshot} x${i.qty}`).join(', ') || 'Order';
            return {
                id: o.id,
                item: itemNames,
                customer: o.user?.name || 'Customer',
                status: o.status,
                time: new Date(o.createdAt).toLocaleDateString(),
                price: `EGP ${o.total}`,
            };
        })
    );

    // Map real meals to menu items
    const [menuItems, setMenuItems] = useState(() =>
        dbMeals.map(m => ({
            id: m.id,
            name: m.name,
            available: m.status === 'ACTIVE',
        }))
    );

    // Map real deals
    const [deals] = useState(() =>
        dbDeals.map(d => ({
            id: d.id,
            title: d.title,
            status: d.status === 'ACTIVE' ? 'Active' : 'Paused',
            redemptions: d.reviews || 0,
        }))
    );

    const [isUpdating, setIsUpdating] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [settingsForm, setSettingsForm] = useState({
        storeName: merchantName,
        storeAddress,
        storeDescription,
        storeOpen
    });

    // DB-backed status update
    const updateStatus = async (id, newStatus) => {
        setIsUpdating(id);
        try {
            const { updateMerchantOrderStatus } = await import('@/app/actions/orders');
            const result = await updateMerchantOrderStatus(id, newStatus);
            if (result.ok) {
                setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
            } else {
                alert(result.error?.message || 'Failed to update order status');
            }
        } catch (e) {
            console.error('Failed to update order status:', e);
        }
        setIsUpdating(null);
    };

    const toggleAvailability = (id) => {
        setMenuItems(menuItems.map(m => m.id === id ? { ...m, available: !m.available } : m));
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setIsUpdating('settings');
        try {
            const { updateMerchantSettings } = await import('@/app/actions/merchant');
            const res = await updateMerchantSettings(settingsForm);
            if (res.success || res.ok) {
                alert('Store settings updated successfully.');
                setIsSettingsOpen(false);
            } else {
                alert(res.error?.message || res.error || 'Failed to update settings');
            }
        } catch (error) {
            console.error(error);
        }
        setIsUpdating(null);
    };

    // Refresh orders every 15 seconds
    const refreshOrders = useCallback(async () => {
        try {
            const { getMerchantOrders } = await import('@/app/actions/orders');
            const result = await getMerchantOrders();
            if (result?.success && result.orders) {
                setOrders(result.orders.map(o => {
                    const itemNames = o.orderItems?.map(i => `${i.nameSnapshot} x${i.qty}`).join(', ') || 'Order';
                    return {
                        id: o.id,
                        item: itemNames,
                        customer: o.user?.name || 'Customer',
                        status: o.status,
                        time: new Date(o.createdAt).toLocaleDateString(),
                        price: `EGP ${o.total}`,
                    };
                }));
            }
        } catch (_) { /* silent refresh failure */ }
    }, []);

    useEffect(() => {
        const interval = setInterval(refreshOrders, 15000);
        return () => clearInterval(interval);
    }, [refreshOrders]);

    // Group orders by display status for kanban
    const kanbanColumns = [
        { key: 'PENDING', label: 'New', nextStatus: 'ACCEPTED', nextLabel: 'Accept', color: 'bg-orange-500' },
        { key: 'ACCEPTED', label: 'Accepted', nextStatus: 'PREPARING', nextLabel: 'Start Preparing', color: 'bg-blue-500' },
        { key: 'PREPARING', label: 'Preparing', nextStatus: 'READY', nextLabel: 'Mark Ready', color: 'bg-green-500' },
        { key: 'READY', label: 'Ready for Pickup', nextStatus: null, nextLabel: null, color: null },
    ];

    return (
        <div className="min-h-screen bg-rose-50 dark:bg-unizy-navy transition-colors pb-24">
            <MerchantHeader
                merchantName={merchantName}
                storeOpen={storeOpen}
            />

            <main className="px-6 py-8 max-w-7xl mx-auto w-full grid lg:grid-cols-3 gap-8">
                <KanbanBoard
                    orders={orders}
                    kanbanColumns={kanbanColumns}
                    isUpdating={isUpdating}
                    updateStatus={updateStatus}
                    refreshOrders={refreshOrders}
                    statusLabel={statusLabel}
                />

                <MenuManagement
                    menuItems={menuItems}
                    toggleAvailability={toggleAvailability}
                    deals={deals}
                    totalRevenue={totalRevenue}
                    settlements={settlements}
                    setIsSettingsOpen={setIsSettingsOpen}
                />
            </main>

            <SettingsModal
                isSettingsOpen={isSettingsOpen}
                setIsSettingsOpen={setIsSettingsOpen}
                settingsForm={settingsForm}
                setSettingsForm={setSettingsForm}
                handleUpdateSettings={handleUpdateSettings}
                isUpdating={isUpdating}
            />
        </div>
    );
}

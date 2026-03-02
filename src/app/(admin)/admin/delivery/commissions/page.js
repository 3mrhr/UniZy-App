"use client";

import React from 'react';
import CommissionManager from '../../commissions/CommissionManager';

export default function DeliveryCommissionsPage() {
    return (
        <CommissionManager
            moduleName="DELIVERY"
            title="Delivery Commission Splits"
            description="Control merchant and driver payout ratios for the delivery ecosystem."
            colorClass="bg-orange-600"
        />
    );
}

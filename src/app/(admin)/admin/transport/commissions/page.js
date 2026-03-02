"use client";

import React from 'react';
import CommissionManager from '../../commissions/CommissionManager';

export default function TransportCommissionsPage() {
    return (
        <CommissionManager
            moduleName="TRANSPORT"
            title="Transport Commission Splits"
            description="Define driver payout percentages vs. platform retention per ride."
            colorClass="bg-blue-600"
        />
    );
}

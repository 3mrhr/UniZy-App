"use client";

import React from 'react';
import CommissionManager from '../../commissions/CommissionManager';

export default function CommerceCommissionsPage() {
    return (
        <CommissionManager
            moduleName="COMMERCE"
            title="Commerce Commission Splits"
            description="Configure platform vs. merchant revenue shares for Meals & Deals."
            colorClass="bg-purple-600"
        />
    );
}

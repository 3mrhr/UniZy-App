"use client";

import React from 'react';
import CommissionManager from '../../commissions/CommissionManager';

export default function ServicesCommissionsPage() {
    return (
        <CommissionManager
            moduleName="SERVICES"
            title="Home Services Splits"
            description="Set the platform margin vs. provider payout across various home services."
            colorClass="bg-indigo-600"
        />
    );
}

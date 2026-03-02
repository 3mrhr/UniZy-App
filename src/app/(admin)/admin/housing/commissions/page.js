"use client";

import React from 'react';
import CommissionManager from '../../commissions/CommissionManager';

export default function HousingCommissionsPage() {
    return (
        <CommissionManager
            moduleName="HOUSING"
            title="Housing Commission Splits"
            description="Manage the revenue share percentages between UniZy and Landlords/Property Managers."
            colorClass="bg-emerald-600"
        />
    );
}

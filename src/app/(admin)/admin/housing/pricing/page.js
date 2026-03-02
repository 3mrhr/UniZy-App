"use client";

import React from 'react';
import PricingManager from '../../pricing/PricingManager';

export default function HousingPricingPage() {
    return (
        <PricingManager
            moduleName="HOUSING"
            title="Housing Fees & Commissions"
            description="Manage dynamic pricing rules, zone geofencing, and commission limits specific to the Housing portal."
            colorClass="bg-emerald-600"
        />
    );
}

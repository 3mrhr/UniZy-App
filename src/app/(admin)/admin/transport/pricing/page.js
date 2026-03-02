"use client";

import React from 'react';
import PricingManager from '../../pricing/PricingManager';

export default function TransportPricingPage() {
    return (
        <PricingManager
            moduleName="TRANSPORT"
            title="Transport Fares & Surcharges"
            description="Manage dynamic base fares, per-km rates, and zone-specific surcharges for the Transport network."
            colorClass="bg-blue-600"
        />
    );
}

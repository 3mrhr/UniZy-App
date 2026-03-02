"use client";

import React from 'react';
import PricingManager from '../../pricing/PricingManager';

export default function CommercePricingPage() {
    return (
        <PricingManager
            moduleName="COMMERCE"
            title="Commerce & Deals Subsidies"
            description="Control promotional limits, flat fees, and commerce merchant integrations."
            colorClass="bg-purple-600"
        />
    );
}

"use client";

import React from 'react';
import PricingManager from '../../pricing/PricingManager';

export default function ServicesPricingPage() {
    return (
        <PricingManager
            moduleName="SERVICES"
            title="Home Services Platform Fees"
            description="Set commission tiers locking provider payouts and customer booking fees."
            colorClass="bg-indigo-600"
        />
    );
}

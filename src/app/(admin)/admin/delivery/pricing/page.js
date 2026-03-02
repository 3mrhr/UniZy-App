"use client";

import React from 'react';
import PricingManager from '../../pricing/PricingManager';

export default function DeliveryPricingPage() {
    return (
        <PricingManager
            moduleName="DELIVERY"
            title="Delivery Fees & Revenue"
            description="Configure parcel delivery costs, merchant commissions, and driver payouts for the Delivery sector."
            colorClass="bg-orange-600"
        />
    );
}

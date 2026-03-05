import { performance } from 'perf_hooks';

// Simulate a meal with variant and addon groups
function generateMeal(id) {
    const variantGroups = [];
    const addonGroups = [];

    for (let i = 0; i < 20; i++) {
        const options = [];
        for (let j = 0; j < 50; j++) {
            options.push({
                id: `opt-${i}-${j}`,
                name: `Option ${i}-${j}`,
                priceDelta: Math.random() * 10,
                isAvailable: true
            });
        }
        variantGroups.push({
            id: `vgroup-${i}`,
            name: `Variant Group ${i}`,
            options
        });

        const addonOptions = [];
        for (let j = 0; j < 50; j++) {
            addonOptions.push({
                id: `aopt-${i}-${j}`,
                name: `Addon Option ${i}-${j}`,
                priceDelta: Math.random() * 5,
                isAvailable: true
            });
        }
        addonGroups.push({
            id: `agroup-${i}`,
            name: `Addon Group ${i}`,
            options: addonOptions
        });
    }

    return {
        id,
        name: `Meal ${id}`,
        price: 50,
        variantGroups,
        addonGroups
    };
}

const meal = generateMeal('meal-1');

const item = {
    quantity: 1,
    variants: [],
    addons: []
};

for (let i = 0; i < 15; i++) {
    item.variants.push({ groupId: `vgroup-${i}`, optionId: `opt-${i}-${i % 50}` });
    item.addons.push({ groupId: `agroup-${i}`, optionId: `aopt-${i}-${i % 50}` });
}

function runBaseline(iterations) {
    let variantsTotal = 0;
    let addonsTotal = 0;

    const start = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
        variantsTotal = 0;
        addonsTotal = 0;

        if (item.variants && item.variants.length > 0) {
            for (const v of item.variants) {
                const group = meal.variantGroups.find(g => g.id === v.groupId);
                const opt = group?.options.find(o => o.id === v.optionId);
                if (opt && opt.isAvailable) {
                    variantsTotal += opt.priceDelta;
                }
            }
        }

        if (item.addons && item.addons.length > 0) {
            for (const a of item.addons) {
                const group = meal.addonGroups.find(g => g.id === a.groupId);
                const opt = group?.options.find(o => o.id === a.optionId);
                if (opt && opt.isAvailable) {
                    addonsTotal += opt.priceDelta;
                }
            }
        }
    }
    const end = performance.now();
    return end - start;
}

function runOptimized(iterations) {
    let variantsTotal = 0;
    let addonsTotal = 0;

    const start = performance.now();
    for (let iter = 0; iter < iterations; iter++) {
        // Optimization: Pre-process meal groups into Maps
        // Note: In the actual implementation, we'd do this once per meal
        const variantGroupsMap = new Map(meal.variantGroups.map(g => [
            g.id,
            { ...g, optionsMap: new Map(g.options.map(o => [o.id, o])) }
        ]));
        const addonGroupsMap = new Map(meal.addonGroups.map(g => [
            g.id,
            { ...g, optionsMap: new Map(g.options.map(o => [o.id, o])) }
        ]));

        variantsTotal = 0;
        addonsTotal = 0;

        if (item.variants && item.variants.length > 0) {
            for (const v of item.variants) {
                const group = variantGroupsMap.get(v.groupId);
                const opt = group?.optionsMap.get(v.optionId);
                if (opt && opt.isAvailable) {
                    variantsTotal += opt.priceDelta;
                }
            }
        }

        if (item.addons && item.addons.length > 0) {
            for (const a of item.addons) {
                const group = addonGroupsMap.get(a.groupId);
                const opt = group?.optionsMap.get(a.optionId);
                if (opt && opt.isAvailable) {
                    addonsTotal += opt.priceDelta;
                }
            }
        }
    }
    const end = performance.now();
    return end - start;
}

// More realistic optimization: Pre-process once outside the item loop
function runFullyOptimized(iterations) {
    let variantsTotal = 0;
    let addonsTotal = 0;

    const start = performance.now();

    // This happens once per meal, before processing all items for that meal
    const variantGroupsMap = new Map(meal.variantGroups.map(g => [
        g.id,
        { ...g, optionsMap: new Map(g.options.map(o => [o.id, o])) }
    ]));
    const addonGroupsMap = new Map(meal.addonGroups.map(g => [
        g.id,
        { ...g, optionsMap: new Map(g.options.map(o => [o.id, o])) }
    ]));

    for (let iter = 0; iter < iterations; iter++) {
        variantsTotal = 0;
        addonsTotal = 0;

        if (item.variants && item.variants.length > 0) {
            for (const v of item.variants) {
                const group = variantGroupsMap.get(v.groupId);
                const opt = group?.optionsMap.get(v.optionId);
                if (opt && opt.isAvailable) {
                    variantsTotal += opt.priceDelta;
                }
            }
        }

        if (item.addons && item.addons.length > 0) {
            for (const a of item.addons) {
                const group = addonGroupsMap.get(a.groupId);
                const opt = group?.optionsMap.get(a.optionId);
                if (opt && opt.isAvailable) {
                    addonsTotal += opt.priceDelta;
                }
            }
        }
    }
    const end = performance.now();
    return end - start;
}

const iterations = 10000;
console.log(`Running benchmarks with ${iterations} iterations...`);

const baselineTime = runBaseline(iterations);
console.log(`Baseline (Array.find): ${baselineTime.toFixed(4)}ms`);

const optimizedTime = runOptimized(iterations);
console.log(`Optimized (Map creation inside loop): ${optimizedTime.toFixed(4)}ms`);

const fullyOptimizedTime = runFullyOptimized(iterations);
console.log(`Fully Optimized (Map creation outside loop): ${fullyOptimizedTime.toFixed(4)}ms`);

const improvement = ((baselineTime - fullyOptimizedTime) / baselineTime * 100).toFixed(2);
console.log(`Improvement (Fully Optimized): ${improvement}%`);

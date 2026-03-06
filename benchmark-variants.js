const { performance } = require('perf_hooks');

function runBenchmark() {
    // Generate dummy data
    const meal = {
        variantGroups: Array.from({ length: 50 }, (_, i) => ({
            id: i,
            name: `Group ${i}`,
            options: Array.from({ length: 20 }, (_, j) => ({
                id: i * 100 + j,
                name: `Option ${i}-${j}`,
                priceDelta: 10,
                isAvailable: true
            }))
        })),
        addonGroups: Array.from({ length: 50 }, (_, i) => ({
            id: i,
            name: `Addon Group ${i}`,
            options: Array.from({ length: 20 }, (_, j) => ({
                id: i * 100 + j,
                name: `Addon Option ${i}-${j}`,
                priceDelta: 5,
                isAvailable: true
            }))
        }))
    };

    const item = {
        variants: Array.from({ length: 1000 }, () => {
            const groupId = Math.floor(Math.random() * 50);
            return {
                groupId,
                optionId: groupId * 100 + Math.floor(Math.random() * 20)
            };
        }),
        addons: Array.from({ length: 1000 }, () => {
            const groupId = Math.floor(Math.random() * 50);
            return {
                groupId,
                optionId: groupId * 100 + Math.floor(Math.random() * 20)
            };
        })
    };

    // Baseline
    const startBaseline = performance.now();
    let baselineTotal = 0;
    for (let i = 0; i < 100; i++) {
        let variantsTotal = 0;
        let addonsTotal = 0;

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
        baselineTotal += variantsTotal + addonsTotal;
    }
    const endBaseline = performance.now();
    const baselineTime = endBaseline - startBaseline;

    // Optimized
    const startOptimized = performance.now();
    let optimizedTotal = 0;
    for (let i = 0; i < 100; i++) {
        let variantsTotal = 0;
        let addonsTotal = 0;

        if (item.variants && item.variants.length > 0) {
            const variantGroupsMap = new Map();
            for (const g of meal.variantGroups) {
                const optionsMap = new Map();
                for (const o of g.options) {
                    optionsMap.set(o.id, o);
                }
                variantGroupsMap.set(g.id, { ...g, optionsMap });
            }

            for (const v of item.variants) {
                const group = variantGroupsMap.get(v.groupId);
                const opt = group?.optionsMap.get(v.optionId);
                if (opt && opt.isAvailable) {
                    variantsTotal += opt.priceDelta;
                }
            }
        }

        if (item.addons && item.addons.length > 0) {
            const addonGroupsMap = new Map();
            for (const g of meal.addonGroups) {
                const optionsMap = new Map();
                for (const o of g.options) {
                    optionsMap.set(o.id, o);
                }
                addonGroupsMap.set(g.id, { ...g, optionsMap });
            }

            for (const a of item.addons) {
                const group = addonGroupsMap.get(a.groupId);
                const opt = group?.optionsMap.get(a.optionId);
                if (opt && opt.isAvailable) {
                    addonsTotal += opt.priceDelta;
                }
            }
        }
        optimizedTotal += variantsTotal + addonsTotal;
    }
    const endOptimized = performance.now();
    const optimizedTime = endOptimized - startOptimized;

    console.log(`Baseline Time: ${baselineTime.toFixed(2)} ms`);
    console.log(`Optimized Time: ${optimizedTime.toFixed(2)} ms`);
    console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}%`);
    console.log(`Results Match: ${baselineTotal === optimizedTotal}`);
}

runBenchmark();

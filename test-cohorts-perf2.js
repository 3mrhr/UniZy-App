import { performance } from 'perf_hooks';

// Wait I need to simulate exactly the same dates because in my previous script the array creation dates slightly mismatch the loop dates in terms of milliseconds since new Date() is called successively. Wait, new Date() will be created sequentially in the loop, creating slightly different ms values but for comparisons since dates are converted to strings in the actual output, it should be fine. Wait, let me make sure.

function generateCohorts(weeks) {
    const cohorts = [];
    for (let i = 0; i < weeks; i++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - i * 7);
        cohorts.push({
            week: `Week -${i + 1}`,
            startDate: weekStart,
            endDate: weekEnd,
        });
    }
    return cohorts;
}

const cohortsData = generateCohorts(4);
const minDate = cohortsData[cohortsData.length - 1].startDate;
const maxDate = cohortsData[0].endDate;

console.log("Min date:", minDate.toISOString());
console.log("Max date:", maxDate.toISOString());

const allOrders = [
    {userId: '1', createdAt: new Date(new Date().setDate(new Date().getDate() - 10))},
    {userId: '2', createdAt: new Date(new Date().setDate(new Date().getDate() - 12))},
];

const results = cohortsData.map(c => {
    let activeUsers = new Set();
    allOrders.forEach(o => {
        if (o.createdAt >= c.startDate && o.createdAt < c.endDate) {
            activeUsers.add(o.userId);
        }
    });
    return {
        week: c.week,
        startDate: c.startDate.toISOString().split('T')[0],
        endDate: c.endDate.toISOString().split('T')[0],
        activeUsers: activeUsers.size,
    };
});
console.log(results);

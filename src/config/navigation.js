export const STUDENT_TABS = [
    {
        key: 'home',
        labelKey: 'home',
        fallbackLabel: 'Home',
        href: '/students',
        icon: '🏠'
    },
    {
        key: 'explore',
        labelKey: 'services',
        fallbackLabel: 'Explore',
        href: '/explore',
        icon: '⚡'
    },
    {
        key: 'activity',
        labelKey: 'activity',
        fallbackLabel: 'My Orders',
        href: '/activity',
        icon: '📋',
        showBadge: true // Feature flag for the badge
    },
    {
        key: 'wallet',
        labelKey: 'wallet',
        fallbackLabel: 'Wallet',
        href: '/wallet',
        icon: '💳'
    },
    {
        key: 'profile',
        labelKey: 'account',
        fallbackLabel: 'Profile',
        href: '/account',
        icon: '👤'
    }
];

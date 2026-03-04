import { getVerifiedMerchants, getMerchantDetails } from '../merchants';
import { prisma } from '@/lib/prisma';

// Mock prisma and auth
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
        },
    },
}));

jest.mock('@/app/actions/auth', () => ({
    getCurrentUser: jest.fn(),
}));

describe('merchants actions', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getVerifiedMerchants', () => {
        const mockMerchant = {
            id: '1',
            name: 'Test Merchant',
            profileImage: 'image.jpg',
            rating: null,
            meals: [
                { id: 'm1', name: 'Burger', price: 10, currency: 'USD', image: 'burger.jpg', rating: 4.5, isPopular: true, tags: 'fastfood, burger' }
            ],
            deals: []
        };

        it('should return verified merchants when found', async () => {
            prisma.user.findMany.mockResolvedValueOnce([mockMerchant]);

            const result = await getVerifiedMerchants();

            expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
            expect(prisma.user.findMany).toHaveBeenCalledWith(expect.objectContaining({
                where: { role: 'MERCHANT', isVerified: true }
            }));

            expect(result).toEqual({
                success: true,
                data: [{
                    ...mockMerchant,
                    time: '20-30 min',
                    tag: 'New',
                    rating: 4.5
                }]
            });
        });

        it('should fall back to all merchants if no verified merchants found', async () => {
            prisma.user.findMany
                .mockResolvedValueOnce([]) // First call returns empty
                .mockResolvedValueOnce([mockMerchant]); // Second call returns merchant

            const result = await getVerifiedMerchants();

            expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
            expect(prisma.user.findMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
                where: { role: 'MERCHANT', isVerified: true }
            }));
            expect(prisma.user.findMany).toHaveBeenNthCalledWith(2, expect.objectContaining({
                where: { role: 'MERCHANT' }
            }));

            expect(result.success).toBe(true);
            expect(result.data.length).toBe(1);
        });

        it('should filter by category if provided', async () => {
            const mockMerchant2 = {
                id: '2',
                name: 'Healthy Place',
                profileImage: null,
                rating: null,
                meals: [
                    { id: 'm2', name: 'Salad', price: 12, currency: 'USD', image: null, rating: 5, isPopular: false, tags: 'healthy, salad' }
                ],
                deals: []
            };

            prisma.user.findMany.mockResolvedValueOnce([mockMerchant, mockMerchant2]);

            const result = await getVerifiedMerchants('healthy');

            expect(result.success).toBe(true);
            expect(result.data.length).toBe(1);
            expect(result.data[0].id).toBe('2');
        });

        it('should return an error if prisma throws', async () => {
            const error = new Error('Database Error');
            prisma.user.findMany.mockRejectedValueOnce(error);

            // Supress expected console.error in tests
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const result = await getVerifiedMerchants();

            expect(result).toEqual({ success: false, error: 'Failed to fetch verified merchants.' });

            consoleSpy.mockRestore();
        });

        it('should set tag to Bestseller if merchant has more than 3 meals', async () => {
            const mockMerchantManyMeals = {
                id: '1',
                name: 'Test Merchant',
                profileImage: 'image.jpg',
                rating: null,
                meals: [
                    { id: 'm1', name: 'Burger', price: 10, currency: 'USD', image: 'burger.jpg', rating: 4, isPopular: true, tags: 'fastfood, burger' },
                    { id: 'm2', name: 'Fries', price: 5, currency: 'USD', image: 'fries.jpg', rating: 4, isPopular: true, tags: 'fastfood, fries' },
                    { id: 'm3', name: 'Soda', price: 2, currency: 'USD', image: 'soda.jpg', rating: 4, isPopular: true, tags: 'fastfood, drink' },
                    { id: 'm4', name: 'Hotdog', price: 8, currency: 'USD', image: 'hotdog.jpg', rating: 4, isPopular: true, tags: 'fastfood, hotdog' }
                ],
                deals: []
            };

            prisma.user.findMany.mockResolvedValueOnce([mockMerchantManyMeals]);

            const result = await getVerifiedMerchants();
            expect(result.success).toBe(true);
            expect(result.data[0].tag).toBe('Bestseller');
            expect(result.data[0].rating).toBe(4);
        });

        it('should compute default rating 5.0 when merchant has no meals', async () => {
             const mockMerchantNoMeals = {
                id: '1',
                name: 'Test Merchant',
                profileImage: 'image.jpg',
                rating: null,
                meals: [],
                deals: []
            };

            prisma.user.findMany.mockResolvedValueOnce([mockMerchantNoMeals]);

            const result = await getVerifiedMerchants();
            expect(result.success).toBe(true);
            expect(result.data[0].rating).toBe(5.0);
        });
    });

    describe('getMerchantDetails', () => {
        const mockMerchantDetail = {
            id: '1',
            name: 'Test Merchant',
            profileImage: 'image.jpg',
            phone: '1234567890',
            meals: [],
            deals: []
        };

        it('should return merchant details when found', async () => {
            prisma.user.findUnique.mockResolvedValueOnce(mockMerchantDetail);

            const result = await getMerchantDetails('1');

            expect(prisma.user.findUnique).toHaveBeenCalledTimes(1);
            expect(prisma.user.findUnique).toHaveBeenCalledWith(expect.objectContaining({
                where: { id: '1', role: 'MERCHANT' }
            }));

            expect(result).toEqual({ success: true, data: mockMerchantDetail });
        });

        it('should return error when merchant not found', async () => {
            prisma.user.findUnique.mockResolvedValueOnce(null);

            const result = await getMerchantDetails('invalid-id');

            expect(result).toEqual({ success: false, error: 'Merchant not found.' });
        });

        it('should return an error if prisma throws', async () => {
            const error = new Error('Database Error');
            prisma.user.findUnique.mockRejectedValueOnce(error);

            // Supress expected console.error in tests
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const result = await getMerchantDetails('1');

            expect(result).toEqual({ success: false, error: 'Failed to fetch merchant details.' });

            consoleSpy.mockRestore();
        });
    });
});

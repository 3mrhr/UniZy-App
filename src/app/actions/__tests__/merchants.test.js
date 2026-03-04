import { getVerifiedMerchants, getMerchantDetails } from '../merchants';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findMany: jest.fn(),
            findUnique: jest.fn()
        }
    }
}));

jest.mock('@/app/actions/auth', () => ({
    getCurrentUser: jest.fn()
}));

// Suppress console.error during tests
beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
    console.error.mockRestore();
});

describe('Merchant Actions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getVerifiedMerchants', () => {
        it('should return verified merchants formatted', async () => {
            const mockMerchants = [
                {
                    id: '1',
                    name: 'Burger King',
                    profileImage: 'bk.jpg',
                    rating: 4.5,
                    meals: [
                        { rating: 5, tags: 'fastfood,burger' },
                        { rating: 4, tags: 'fastfood,fries' }
                    ],
                    deals: []
                }
            ];

            prisma.user.findMany.mockResolvedValueOnce(mockMerchants);

            const result = await getVerifiedMerchants();

            expect(prisma.user.findMany).toHaveBeenCalledTimes(1);
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toEqual(expect.objectContaining({
                id: '1',
                time: '20-30 min',
                tag: 'New', // <= 3 meals
                rating: 4.5 // (5 + 4) / 2
            }));
        });

        it('should fallback to all merchants if no verified merchants are found', async () => {
            // First call returns empty (no verified merchants)
            prisma.user.findMany.mockResolvedValueOnce([]);

            const mockAllMerchants = [
                {
                    id: '2',
                    name: 'Local Pizza',
                    profileImage: 'pizza.jpg',
                    rating: 4.0,
                    meals: [
                        { rating: 4, tags: 'pizza' },
                        { rating: 4, tags: 'pizza' },
                        { rating: 4, tags: 'pizza' },
                        { rating: 4, tags: 'pizza' } // 4 meals
                    ],
                    deals: []
                }
            ];

            // Second call returns all merchants
            prisma.user.findMany.mockResolvedValueOnce(mockAllMerchants);

            const result = await getVerifiedMerchants();

            expect(prisma.user.findMany).toHaveBeenCalledTimes(2);
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0]).toEqual(expect.objectContaining({
                id: '2',
                tag: 'Bestseller', // > 3 meals
                rating: 4.0 // (4 * 4) / 4
            }));
        });

        it('should filter merchants by category correctly', async () => {
            const mockMerchants = [
                {
                    id: '1',
                    name: 'Burger King',
                    profileImage: 'bk.jpg',
                    rating: 4.5,
                    meals: [{ rating: 5, tags: 'fast food' }],
                    deals: []
                },
                {
                    id: '2',
                    name: 'Healthy Salad',
                    profileImage: 'salad.jpg',
                    rating: 4.8,
                    meals: [{ rating: 5, tags: 'healthy,vegan' }],
                    deals: []
                }
            ];

            prisma.user.findMany.mockResolvedValueOnce(mockMerchants);

            const result = await getVerifiedMerchants('fastfood');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].id).toBe('1');
        });

        it('should match category by merchant name if tags do not match', async () => {
            const mockMerchants = [
                {
                    id: '1',
                    name: 'Sweet Tooth Dessert Shop',
                    profileImage: 'dessert.jpg',
                    rating: 4.5,
                    meals: [{ rating: 5, tags: 'unknown' }],
                    deals: []
                }
            ];

            prisma.user.findMany.mockResolvedValueOnce(mockMerchants);

            const result = await getVerifiedMerchants('dessert');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data[0].name).toBe('Sweet Tooth Dessert Shop');
        });

        it('should handle errors gracefully', async () => {
            prisma.user.findMany.mockRejectedValueOnce(new Error('DB Error'));

            const result = await getVerifiedMerchants();

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to fetch verified merchants.');
            expect(console.error).toHaveBeenCalledWith('Failed to get merchants:', expect.any(Error));
        });

        it('should default rating to 5.0 if no meals', async () => {
            const mockMerchants = [
                {
                    id: '1',
                    name: 'New Shop',
                    profileImage: 'new.jpg',
                    rating: 0,
                    meals: [],
                    deals: []
                }
            ];

            prisma.user.findMany.mockResolvedValueOnce(mockMerchants);

            const result = await getVerifiedMerchants();

            expect(result.success).toBe(true);
            expect(result.data[0].rating).toBe(5.0);
        });
    });

    describe('getMerchantDetails', () => {
        it('should return merchant details if found', async () => {
            const mockMerchant = {
                id: '1',
                name: 'Burger King',
                profileImage: 'bk.jpg',
                phone: '1234567890',
                meals: [{ id: 'm1' }],
                deals: []
            };

            prisma.user.findUnique.mockResolvedValueOnce(mockMerchant);

            const result = await getMerchantDetails('1');

            expect(prisma.user.findUnique).toHaveBeenCalledWith({
                where: {
                    id: '1',
                    role: 'MERCHANT'
                },
                select: {
                    id: true,
                    name: true,
                    profileImage: true,
                    phone: true,
                    meals: {
                        where: { status: 'ACTIVE' }
                    },
                    deals: {
                        take: 2
                    }
                }
            });
            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockMerchant);
        });

        it('should return error if merchant not found', async () => {
            prisma.user.findUnique.mockResolvedValueOnce(null);

            const result = await getMerchantDetails('999');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Merchant not found.');
        });

        it('should handle errors gracefully', async () => {
            prisma.user.findUnique.mockRejectedValueOnce(new Error('DB Error'));

            const result = await getMerchantDetails('1');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Failed to fetch merchant details.');
            expect(console.error).toHaveBeenCalledWith('Failed to get merchant details:', expect.any(Error));
        });
    });
});

'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from './auth';

export async function getSystemModules() {
    try {
        const modules = await prisma.systemSettings.findMany({
            where: {
                key: { startsWith: 'module_' }
            }
        });

        // Default to true if not found in DB
        const statusMap = {
            delivery: true,
            transport: true,
            housing: true,
            deals: true
        };

        modules.forEach(m => {
            const modName = m.key.replace('module_', '');
            statusMap[modName] = m.value === 'true';
        });

        return { success: true, modules: statusMap };
    } catch (error) {
        console.error('getSystemModules error:', error);
        return { success: false, error: 'Failed to fetch module settings' };
    }
}

export async function toggleSystemModule(moduleName, isActive) {
    try {
        const user = await getCurrentUser();
        // Master override needed
        if (!user || user.role !== 'SUPER_ADMIN') {
            return { success: false, error: 'Unauthorized. Only Master Admin can toggle global modules.' };
        }

        const key = `module_${moduleName.toLowerCase()}`;
        const value = isActive ? 'true' : 'false';

        await prisma.systemSettings.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });

        return { success: true, status: isActive };
    } catch (error) {
        console.error('toggleSystemModule error:', error);
        return { success: false, error: 'Failed to update module settings.' };
    }
}

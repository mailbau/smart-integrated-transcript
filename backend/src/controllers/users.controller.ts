import { Request, Response } from 'express';
import { prisma } from '../config/db';

export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                nim: true,
                role: true,
                createdAt: true,
                _count: {
                    select: {
                        requests: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
}

export async function getUserById(req: Request, res: Response) {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                nim: true,
                role: true,
                dob: true,
                createdAt: true,
                requests: {
                    select: {
                        id: true,
                        course: true,
                        purpose: true,
                        type: true,
                        status: true,
                        createdAt: true,
                        updatedAt: true
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                },
                _count: {
                    select: {
                        requests: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ message: 'Failed to fetch user' });
    }
}

export async function getUserStats(req: Request, res: Response) {
    try {
        const stats = await prisma.user.aggregate({
            _count: {
                id: true
            },
            where: {
                role: 'USER'
            }
        });

        const requestStats = await prisma.request.groupBy({
            by: ['status'],
            _count: {
                status: true
            }
        });

        const totalRequests = requestStats.reduce((acc, stat) => acc + stat._count.status, 0);
        const pendingRequests = requestStats.find(stat => stat.status === 'SUBMITTED' || stat.status === 'UNDER_REVIEW')?._count.status || 0;
        const completedRequests = requestStats.find(stat => stat.status === 'COMPLETED')?._count.status || 0;

        res.json({
            stats: {
                totalUsers: stats._count.id,
                totalRequests,
                pendingRequests,
                completedRequests
            }
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ message: 'Failed to fetch user stats' });
    }
}

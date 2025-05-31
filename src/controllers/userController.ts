import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/auth.types';

const prisma = new PrismaClient();

// Interface for query parameters
interface UserQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  role?: string;
}

export class UserController {
  // GET /api/users - Get all users (Admin only)
  static async getAllUsers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { 
        page = '1', 
        limit = '10', 
        search, 
        role 
      }: UserQueryParams = req.query;

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Build where clause for filtering
      const where: any = {};

      // Search filter (username, email, first_name, last_name)
      if (search) {
        where.OR = [
          { username: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name: { contains: search, mode: 'insensitive' } },
          { display_name: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Role filter
      if (role) {
        where.role = {
          role_name: role.toUpperCase()
        };
      }

      // Get users with pagination
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id_user: true,
            username: true,
            email: true,
            first_name: true,
            last_name: true,
            display_name: true,
            phonenumber: true,
            is_verified: true,
            created_at: true,
            updated_at: true,
            role: {
              select: {
                id_role: true,
                role_name: true
              }
            },
            _count: {
              select: {
                posts: true,
                approved_posts: true
              }
            }
          },
          orderBy: {
            created_at: 'desc'
          },
          skip,
          take: limitNum
        }),
        prisma.user.count({ where })
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.json({
        success: true,
        data: users,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      });

    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/users/:id - Get user by ID (Admin only)
  static async getUserById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id_user: id },
        select: {
          id_user: true,
          username: true,
          email: true,
          first_name: true,
          last_name: true,
          display_name: true,
          phonenumber: true,
          is_verified: true,
          created_at: true,
          updated_at: true,
          role: {
            select: {
              id_role: true,
              role_name: true
            }
          },
          posts: {
            select: {
              id_post: true,
              title: true,
              status: true,
              created_at: true
            },
            orderBy: {
              created_at: 'desc'
            },
            take: 10 // Limit to last 10 posts
          },
          approved_posts: {
            select: {
              id_post: true,
              title: true,
              approved_at: true
            },
            orderBy: {
              approved_at: 'desc'
            },
            take: 10 // Limit to last 10 approved posts
          },
          _count: {
            select: {
              posts: true,
              approved_posts: true
            }
          }
        }
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        });
        return;
      }

      res.json({
        success: true,
        data: user
      });

    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/users/statistics - Get user statistics (Admin only)
  static async getUserStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const [totalUsers, adminCount, userCount, moderatorCount, verifiedCount, unverifiedCount] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({
          where: {
            role: {
              role_name: 'ADMIN'
            }
          }
        }),
        prisma.user.count({
          where: {
            role: {
              role_name: 'USER'
            }
          }
        }),
        prisma.user.count({
          where: {
            role: {
              role_name: 'MODERATOR'
            }
          }
        }),
        prisma.user.count({
          where: { is_verified: true }
        }),
        prisma.user.count({
          where: { is_verified: false }
        })
      ]);

      // Get recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentRegistrations = await prisma.user.count({
        where: {
          created_at: {
            gte: thirtyDaysAgo
          }
        }
      });

      res.json({
        success: true,
        data: {
          total: totalUsers,
          byRole: {
            admin: adminCount,
            user: userCount,
            moderator: moderatorCount
          },
          byVerification: {
            verified: verifiedCount,
            unverified: unverifiedCount
          },
          recentRegistrations: {
            count: recentRegistrations,
            period: 'last_30_days'
          }
        }
      });

    } catch (error) {
      console.error('Error fetching user statistics:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching user statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

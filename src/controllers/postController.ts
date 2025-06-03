import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { deleteImageFromGCS } from '../services/uploadService';

const prisma = new PrismaClient();

// Interface สำหรับ authenticated user
interface AuthenticatedUser {
  id_user: string;
  username: string;
  email: string;
  role: {
    role_name: string;
    role_id: string;
  };
}

// Extended Request interface with authenticated user
interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Interface สำหรับ Post data
interface PostData {
  title: string;
  body: string;
  id_place: string;
  image?: string; // Cover image
  gallery_images?: string[]; // Multiple images (ถ้าต้องการ)
}

// Interface สำหรับ Query parameters
interface PostQueryParams {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  id_user?: string;
  id_place?: string;
  place_type_id?: string;
  province_id?: string;
  placeType?: string;
  gg_ref?: string;
  distinct?: string;
}

// ดึงข้อมูล posts ทั้งหมด พร้อม pagination และ filtering
export const getAllPosts = async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '10',
      search,
      status,
      id_user,
      id_place,
      place_type_id,
      province_id,
      gg_ref,
    }: PostQueryParams = req.query;
      console.log(' id_place:', id_place)

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // สร้าง where clause สำหรับ filtering
    const where: any = {};

    // กรองตาม search (ค้นหาใน title หรือ body)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { body: { contains: search, mode: 'insensitive' } }
      ];
    }

    // กรองตาม status
    if (status) {
      where.status = status;
    }

    // กรองตาม user
    if (id_user) {
      where.id_user = id_user;
    }

    // กรองตาม place
    if (id_place) {
      where.id_place = id_place;
    }
    // กรองตาม gg_ref (Google Maps reference)
    if (gg_ref) {
      where.gg_ref = gg_ref;
    }

    // กรองตาม place_type_id หรือ province_id
    if (place_type_id || province_id) {
      where.place = {};

      if (place_type_id) {
        where.place.place_type_id = place_type_id;
      }

      if (province_id) {
        where.place.province_id = province_id;
      }
    }

    // ดึงข้อมูล posts
    const posts = await prisma.post.findMany({
      where,
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limitNum
    });
    console.log(' posts:', posts)

    // นับจำนวน posts ทั้งหมดสำหรับ pagination
    const totalPosts = await prisma.post.count({ where });
    const totalPages = Math.ceil(totalPosts / limitNum);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล posts'
    });
  }
};

// ดึงข้อมูล post ตาม ID
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id_post: id },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ post ที่ระบุ'
      });
    }

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล post'
    });
  }
};

// สร้าง post ใหม่
export const createPost = async (req: AuthRequest, res: Response) => {
  try {
    const { title, body, id_place, image, gallery_images }: PostData = req.body;
    const userId = req.user?.id_user;

    // Validate required fields
    if (!title || !body || !id_place) {
      return res.status(400).json({
        success: false,
        message: 'กรุณากรอกข้อมูลให้ครบถ้วน (title, body, id_place)'
      });
    }

    // Validate image URLs if provided
    if (image && !image.startsWith('https://storage.googleapis.com/')) {
      return res.status(400).json({
        success: false,
        message: 'URL รูปภาพไม่ถูกต้อง กรุณาใช้ endpoint upload-image ก่อน'
      });
    }

    // Validate gallery images URLs if provided
    if (gallery_images && gallery_images.length > 0) {
      const invalidUrls = gallery_images.filter(url => !url.startsWith('https://storage.googleapis.com/'));
      if (invalidUrls.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'URL รูปภาพ gallery ไม่ถูกต้อง'
        });
      }
    }

    // ตรวจสอบว่า place มีอยู่จริง
    const place = await prisma.place.findUnique({
      where: { id_place }
    });

    if (!place) {
      return res.status(400).json({
        success: false,
        message: 'ไม่พบสถานที่ที่ระบุ'
      });
    }

    // สร้าง post ใหม่
    const newPost = await prisma.post.create({
      data: {
        title,
        body,
        id_place,
        id_user: userId!,
        image,
        // gallery_images: gallery_images ? JSON.stringify(gallery_images) : null, // ถ้าต้องการเก็บ JSON
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      message: 'สร้าง post สำเร็จ',
      data: newPost
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการสร้าง post'
    });
  }
};

// อัปเดต post
export const updatePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, body, image, status, id_place } = req.body;
    const userId = req.user?.id_user;
    const userRole = req.user?.role.role_name;

    // ตรวจสอบว่า post มีอยู่จริง
    const existingPost = await prisma.post.findUnique({
      where: { id_post: id }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ post ที่ระบุ'
      });
    }

    // ตรวจสอบสิทธิ์ในการแก้ไข content (เฉพาะเจ้าของ post หรือ admin/moderator)
    if (existingPost.id_user !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ในการแก้ไข post นี้'
      });
    }

    // ตรวจสอบสิทธิ์ในการเปลี่ยน status (เฉพาะ admin/moderator)
    if (status && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ในการเปลี่ยนสถานะ post'
      });
    }

    // ตรวจสอบ status values
    if (status && !['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status ต้องเป็น pending, approved หรือ rejected'
      });
    }

    // ตรวจสอบว่า place ใหม่มีอยู่จริง (ถ้ามีการส่ง id_place มา)
    if (id_place) {
      const place = await prisma.place.findUnique({
        where: { id_place }
      });

      if (!place) {
        return res.status(400).json({
          success: false,
          message: 'ไม่พบสถานที่ที่ระบุ'
        });
      }
    }

    // Validate image URL format if provided
    if (image && image !== null && !image.startsWith('https://storage.googleapis.com/')) {
      return res.status(400).json({
        success: false,
        message: 'URL รูปภาพไม่ถูกต้อง กรุณาใช้ endpoint upload-image ก่อน'
      });
    }

    // ถ้ามีการเปลี่ยนรูปภาพ ให้ลบรูปเก่าออกจาก GCS
    if (image !== existingPost.image && existingPost.image) {
      await deleteImageFromGCS(existingPost.image);
    }

    // อัปเดต post
    const updatedPost = await prisma.post.update({
      where: { id_post: id },
      data: {
        ...(title && { title }),
        ...(body && { body }),
        ...(image !== undefined && { image }),
        ...(status && { status }),
        ...(id_place && { id_place })
      },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'อัปเดต post สำเร็จ',
      data: updatedPost
    });

  } catch (error) {
    console.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอัปเดต post'
    });
  }
};

// ลบ post
export const deletePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id_user;
    const userRole = req.user?.role.role_name;

    // ตรวจสอบว่า post มีอยู่จริง
    const existingPost = await prisma.post.findUnique({
      where: { id_post: id }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ post ที่ระบุ'
      });
    }

    // ตรวจสอบสิทธิ์ (เฉพาะเจ้าของ post หรือ admin/moderator)
    if (existingPost.id_user !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ในการลบ post นี้'
      });
    }

    // ลบรูปภาพจาก GCS ถ้ามี
    if (existingPost.image) {
      await deleteImageFromGCS(existingPost.image);
    }

    // ลบ post
    await prisma.post.delete({
      where: { id_post: id }
    });

    res.json({
      success: true,
      message: 'ลบ post สำเร็จ'
    });

  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการลบ post'
    });
  }
};

// ดึงข้อมูล posts ของ user คนใดคนหนึ่ง
export const getPostsByUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '10' }: PostQueryParams = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await prisma.post.findMany({
      where: { id_user: userId },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limitNum
    });

    const totalPosts = await prisma.post.count({
      where: { id_user: userId }
    });

    const totalPages = Math.ceil(totalPosts / limitNum);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล posts ของ user'
    });
  }
};

// ดึงข้อมูล posts ของสถานที่ใดสถานที่หนึ่ง
export const getPostsByPlace = async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params;
    const { page = '1', limit = '10' }: PostQueryParams = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await prisma.post.findMany({
      where: { id_place: placeId },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limitNum
    });

    const totalPosts = await prisma.post.count({
      where: { id_place: placeId }
    });

    const totalPages = Math.ceil(totalPosts / limitNum);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching place posts:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล posts ของสถานที่'
    });
  }
};

// ดึงข้อมูล posts ตาม place type
export const getPostsByPlaceType = async (req: Request, res: Response) => {
  try {
    const { placeTypeId } = req.params;
    const { page = '1', limit = '10' }: PostQueryParams = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await prisma.post.findMany({
      where: {
        place: {
          place_type_id: placeTypeId
        }
      },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limitNum
    });

    const totalPosts = await prisma.post.count({
      where: {
        place: {
          place_type_id: placeTypeId
        }
      }
    });

    const totalPages = Math.ceil(totalPosts / limitNum);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching posts by place type:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล posts ตาม place type'
    });
  }
};

// อนุมัติ post (สำหรับ admin/moderator)
export const approvePost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' หรือ 'rejected'
    const userRole = req.user?.role.role_name;

    // ตรวจสอบสิทธิ์ (เฉพาะ admin/moderator)
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ในการอนุมัติ post'
      });
    }

    // ตรวจสอบ status
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status ต้องเป็น approved หรือ rejected'
      });
    }

    // ตรวจสอบว่า post มีอยู่จริง
    const existingPost = await prisma.post.findUnique({
      where: { id_post: id }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบ post ที่ระบุ'
      });
    }

    // อัปเดต status
    const updatedPost = await prisma.post.update({
      where: { id_post: id },
      data: { status },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      }
    });

    res.json({
      success: true,
      message: `${status === 'approved' ? 'อนุมัติ' : 'ปฏิเสธ'} post สำเร็จ`,
      data: updatedPost
    });

  } catch (error) {
    console.error('Error approving post:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการอนุมัติ post'
    });
  }
};

// ดึงข้อมูล posts ที่รออนุมัติ (สำหรับ admin/moderator)
export const getPendingPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '10' }: PostQueryParams = req.query;
    const userRole = req.user?.role.role_name;

    // ตรวจสอบสิทธิ์ (เฉพาะ admin/moderator)
    if (userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      return res.status(403).json({
        success: false,
        message: 'คุณไม่มีสิทธิ์ในการดู posts ที่รออนุมัติ'
      });
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const posts = await prisma.post.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true
          }
        }
      },
      orderBy: {
        created_at: 'asc'
      },
      skip,
      take: limitNum
    });

    const totalPosts = await prisma.post.count({
      where: { status: 'pending' }
    });

    const totalPages = Math.ceil(totalPosts / limitNum);

    res.json({
      success: true,
      data: posts,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: totalPosts,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error fetching pending posts:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล posts ที่รออนุมัติ'
    });
  }
};

// ดึงข้อมูล posts ตาม province พร้อม weather data
enum PlaceType {
  RECOMMENDED = 'recommended',
  STAY = 'stay',
  CAMP = 'camp'
}
export const getPostsByProvince = async (req: Request, res: Response) => {
  try {
    const { provinceId } = req.params;
    const { page = '1', limit = '10', placeType = '', distinct = 'f'  }: PostQueryParams = req.query;

    console.log('Fetching posts for province:', { params: req.params, query: req.query });

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // ตรวจสอบว่า province มีอยู่จริง
    const province = await prisma.msProvince.findUnique({
      where: { id_province: provinceId }
    });

    if (!province) {
      return res.status(404).json({
        success: false,
        message: 'ไม่พบจังหวัดที่ระบุ'
      });
    }

    // สร้าง where clause สำหรับ filtering ตาม place type
    const whereClause: any = {
      place: {
        province_id: provinceId
      }
    };

    // กรองตาม placeType
    if (placeType) {
      if (placeType === 'recommended') {
        // แสดงเฉพาะ stay และ camp (ไม่รวม recommended)
        whereClause.place.place_type = {
          type_name: {
            notIn: ['stay', 'camp']
          }
        };
      } else if (placeType === 'stay') {
        // แสดงเฉพาะ stay
        whereClause.place.place_type = {
          type_name: 'stay'
        };
      } else if (placeType === 'camp') {
        // แสดงเฉพาะ camp
        whereClause.place.place_type = {
          type_name: 'camp'
        };
      }
    }
    // ถ้า placeType เป็น null หรือ undefined จะแสดงทั้งหมด
    console.log('Where clause for posts by province:', whereClause);
    // ดึงข้อมูล posts ของ province นั้น
    const posts = await prisma.post.findMany({
      where: {
        ...whereClause,
        status: 'approved',
        // distinct: distinct === 't' ? ['id_place'] : undefined // ถ้า distinct เป็น true จะไม่ซ้ำ id_place
      },
      distinct:  distinct === 't' ? ['id_place'] : undefined, // ถ้า distinct เป็น true จะไม่ซ้ำ id_place
      // include: {
      //   place['id_place'], // ถ้า distinct เป็น true จะไม่ซ้ำ id_place
      
      // }
      // where: {
      //   place: {
      //     place_type: {
      //       type_name: {
      //         notIn: ['recommended'] // แสดงเฉพาะ stay และ camp
      //       }
      //     }
      //   }
      // },
      include: {
        user: {
          select: {
            id_user: true,
            username: true,
            email: true
          }
        },
        place: {
          include: {
            place_type: true,
            province: true,
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limitNum
    });

    const totalPosts = await prisma.post.count({
      where: whereClause
    });

    const totalPages = Math.ceil(totalPosts / limitNum);

    res.json({
      success: true,
      data: {
        province,
        posts,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalItems: totalPosts,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts by province:', error);
    res.status(500).json({
      success: false,
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล posts ตาม province'
    });
  }
};

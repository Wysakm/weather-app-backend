import { NextFunction, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class PlaceTypeController {
  // GET /api/place-types - Get all place types
  static async getAllPlaceTypes(req: Request, res: Response) {
    try {
      const placeTypes = await prisma.placeType.findMany({
        include: {
          _count: {
            select: { places: true }
          }
        },
        orderBy: {
          type_name: 'asc'
        }
      });

      res.status(200).json({
        success: true,
        data: placeTypes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch place types',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // GET /api/place-types/:id - Get place type by ID
  static async getPlaceTypeById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const placeType = await prisma.placeType.findUnique({
        where: { id_place_type: id },
        include: {
          places: {
            select: {
              id_place: true,
              name_place: true,
              latitude: true,
              longitude: true,
              province: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      });

      if (!placeType) {

        next({
          success: false,
          error: 'Place type not found'
        })
      }

      res.status(200).json({
        success: true,
        data: placeType
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to fetch place type',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // POST /api/place-types - Create new place type
  static async createPlaceType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type_name } = req.body;

      if (!type_name || typeof type_name !== 'string') {
        next({
          success: false,
          error: 'type_name is required and must be a string'
        });
      }

      // Check if place type already exists
      const existingPlaceType = await prisma.placeType.findFirst({
        where: {
          type_name: {
            equals: type_name,
            mode: 'insensitive'
          }
        }
      });

      if (existingPlaceType) {
      next ({
          success: false,
          error: 'Place type with this name already exists'
        });
      }

      const placeType = await prisma.placeType.create({
        data: {
          type_name: type_name.trim()
        }
      });

      res.status(201).json({
        success: true,
        data: placeType
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to create place type',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // PUT /api/place-types/:id - Update place type
  static async updatePlaceType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { type_name } = req.body;

      if (!type_name || typeof type_name !== 'string') {
        next({
          success: false,
          error: 'type_name is required and must be a string'
        });
      }

      // Check if another place type with the same name exists
      const existingPlaceType = await prisma.placeType.findFirst({
        where: {
          type_name: {
            equals: type_name,
            mode: 'insensitive'
          },
          NOT: {
            id_place_type: id
          }
        }
      });

      if (existingPlaceType) {
        next({
          success: false,
          error: 'Place type with this name already exists'
        });
      }

      const placeType = await prisma.placeType.update({
        where: { id_place_type: id },
        data: { type_name: type_name.trim() }
      });

      res.status(200).json({
        success: true,
        data: placeType
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        next ({
          success: false,
          error: 'Place type not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update place type',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // DELETE /api/place-types/:id - Delete place type
  static async deletePlaceType(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      // Check if place type has associated places
      const placeCount = await prisma.place.count({
        where: { place_type_id: id }
      });

      if (placeCount > 0) {
        next({
          success: false,
          error: `Cannot delete place type with ${placeCount} associated places`
        });
      }

      await prisma.placeType.delete({
        where: { id_place_type: id }
      });

      res.status(200).json({
        success: true,
        message: 'Place type deleted successfully'
      });
    } catch (error: any) {
      if (error.code === 'P2025') {
        next({
          success: false,
          error: 'Place type not found'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to delete place type',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}
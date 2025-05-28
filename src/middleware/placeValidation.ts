import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

const placeSchema = Joi.object({
  gg_ref: Joi.string().optional().allow(null),
  name_place: Joi.string().required().max(255),
  place_type_id: Joi.string().uuid().required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
  province_id: Joi.string().uuid().required(),
  district: Joi.string().optional().allow(null).max(255),
  sub_district: Joi.string().optional().allow(null).max(255),
  place_image: Joi.string().uri().optional().allow(null)
});

const placeUpdateSchema = Joi.object({
  gg_ref: Joi.string().optional().allow(null),
  name_place: Joi.string().optional().max(255),
  place_type_id: Joi.string().uuid().optional(),
  latitude: Joi.number().min(-90).max(90).optional(),
  longitude: Joi.number().min(-180).max(180).optional(),
  province_id: Joi.string().uuid().optional(),
  district: Joi.string().optional().allow(null).max(255),
  sub_district: Joi.string().optional().allow(null).max(255),
  place_image: Joi.string().uri().optional().allow(null)
});

export const validatePlace = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = placeSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
    return;
  }
  next();
};

export const validatePlaceUpdate = (req: Request, res: Response, next: NextFunction): void => {
  const { error } = placeUpdateSchema.validate(req.body);
  if (error) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: error.details.map(detail => detail.message)
    });
    return;
  }
  next();
};
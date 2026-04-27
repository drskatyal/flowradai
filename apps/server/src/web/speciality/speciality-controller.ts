import { Response, NextFunction } from 'express';
import logger from '../../core/logger';
import SpecialityService from './speciality-service';
import { AuthenticatedRequest } from '../middlewares/clerk-authentication';
import { ISpecialityModel } from "./speciality-model";
import LZString from "lz-string";

class SpecialityController {
  async createSpeciality(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const decompressed = JSON.parse(LZString.decompressFromBase64(req.body.data));
      const specialityData = {
        userId: userId,
        name: decompressed.name,
        description: decompressed.description,
        active: decompressed.active ?? true,
        specialityButtonLabel: decompressed.specialityButtonLabel,
        isButton: decompressed.isButton
      } as ISpecialityModel;

      const { name, description, specialityButtonLabel, isButton, ...rest } = decompressed;

      const speciality = await SpecialityService.createSpeciality(specialityData, rest);
      res.status(200).json({ message: 'Speciality created successfully', speciality});
    } catch (error) {
      logger.error('Error creating speciality', error);
      res.status(500).json({
        message: 'We encountered an issue creating your speciality. Please try again in a moment.',
      });
    }
  }

  async getSpecialities(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { search = '', limit = 10, skip = 0, status = 'all' } = req.query;

      const result = await SpecialityService.getSpecialities(
        String(search),
        Number(limit),
        Number(skip),
        String(status)
      );

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error fetching specialities', error);
      res.status(500).json({
        message: 'We encountered an issue fetching specialities. Please try again in a moment.',
      });
    }
  }

  async getSpecialityById(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const speciality = await SpecialityService.getSpecialityById(id);

      if (!speciality) {
        return res.status(404).json({ message: 'Speciality not found' });
      }

      res.status(200).json(speciality);
    } catch (error) {
      logger.error('Error fetching speciality by ID', error);
      res.status(500).json({
        message: 'We encountered an issue fetching the speciality. Please try again in a moment.',
      });
    }
  }

  async updateSpeciality(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const decompressed = JSON.parse(LZString.decompressFromBase64(req.body.data));
      const updated = await SpecialityService.updateSpeciality(id, decompressed);

      if (!updated) {
        return res.status(404).json({ message: 'Speciality not found' });
      }

      res.status(200).json({ message: 'Speciality updated successfully', speciality: updated });
    } catch (error) {
      logger.error('Error updating speciality', error);
      res.status(500).json({
        message: 'We encountered an issue updating the speciality. Please try again in a moment.',
      });
    }
  }

  async deleteSpeciality(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const deleted = await SpecialityService.deleteSpeciality(id);

      if (!deleted) {
        return res.status(404).json({ message: 'Speciality not found' });
      }

      res.status(200).json({ message: 'Speciality deleted successfully' });
    } catch (error) {
      logger.error('Error deleting speciality', error);
      res.status(500).json({
        message: 'We encountered an issue deleting the speciality. Please try again in a moment.',
      });
    }
  }

  async getSpecilalityList (
    req: AuthenticatedRequest, 
    res: Response, 
    _next: NextFunction
  ) {
    try {
      const specialities = await SpecialityService.fetchSpecialityList();
      if (!specialities) {
        return res.status(404).json({ message: 'No specialities found' });
      }
      return res.status(200).json({ message: 'Speciality list fetched successfully', specialities });
    } catch (error) {
      logger.error('Error fetching speciality list', error);
      res.status(500).json({
        message: 'We encountered an issue fetching the speciality list. Please try again in a moment.',
      });
    }
  }
}

export default new SpecialityController();

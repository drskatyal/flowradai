import { NextFunction, Response } from 'express';
import logger from '../../core/logger';
import DocumentService from './document-service';
import { AuthenticatedRequest } from '../middlewares/clerk-authentication';
import { IDocumentModel } from './document-model';
import mongoose from 'mongoose';
import { DocumentQuery } from './document-service';

class DocumentController {
  async createDocument(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const userRole = req.auth().sessionClaims?.user?.role;

      // Only admin users can create documents
      if (userRole !== 'admin') {
        return res.status(403).json({
          message: 'Only administrators can create documents'
        });
      }

      const document = {
        title: req.body.title,
        description: req.body.description,
        userId,
        category: req.body.category,
        prompt: req.body.prompt,
        ...(req.body.specialityId && mongoose.Types.ObjectId.isValid(req.body.specialityId)
          ? { specialityId: req.body.specialityId }
          : {}),
      } as IDocumentModel;

      const response = await DocumentService.createDocument(document);

      res
        .status(200)
        .json({ message: 'Document created successfully', response });
    } catch (error) {
      logger.error('Error creating document', error);
      res.status(500).json({
        message: 'We encountered an issue creating your document. Please try again in a moment.'
      });
    }
  }

  async getDocuments(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const userId = req.auth().sessionClaims.internalId;
      const userRole = req.auth().sessionClaims?.user?.role;
      const { search = '', limit = 10, skip = 0, specialtyIds = '', categories = '' } = req.query;

      // Parse specialtyIds if provided
      const parsedSpecialtyIds = specialtyIds && typeof specialtyIds === 'string' && specialtyIds.length > 0
        ? specialtyIds.split(',')
        : [];

      // Parse categories if provided
      const parsedCategories = categories && typeof categories === 'string' && categories.length > 0
        ? categories.split(',')
        : [];

      // All users (admin and clients) can view documents
      // Admins see all documents, clients see all documents (since they're for public use)

      const query: DocumentQuery = {
        userId,
        search: search as string,
        limit: Number(limit),
        skip: Number(skip),
        isAdmin: true, // Allow all users to see all documents since they're for client use
        specialityIds: parsedSpecialtyIds,
        categories: parsedCategories,
      };

      const response = await DocumentService.getDocuments(query);

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching documents', error);
      res.status(500).json({
        message: 'We encountered an issue fetching documents. Please try again in a moment.'
      });
    }
  }

  async getDocumentById(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;

      const document = await DocumentService.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      // All authenticated users can view documents since they're for client use
      res.status(200).json(document);
    } catch (error) {
      logger.error('Error fetching document', error);
      res.status(500).json({
        message: 'We encountered an issue fetching the document. Please try again in a moment.'
      });
    }
  }

  async updateDocument(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userRole = req.auth().sessionClaims?.user?.role;

      // Only admin users can update documents
      if (userRole !== 'admin') {
        return res.status(403).json({
          message: 'Only administrators can update documents'
        });
      }

      // Get the document to check if it exists
      const document = await DocumentService.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      const updatedDocument = await DocumentService.updateDocument(id, req.body);

      res.status(200).json({
        message: 'Document updated successfully',
        document: updatedDocument
      });
    } catch (error) {
      logger.error('Error updating document', error);
      res.status(500).json({
        message: 'We encountered an issue updating the document. Please try again in a moment.'
      });
    }
  }

  async deleteDocument(
    req: AuthenticatedRequest,
    res: Response,
    _next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const userRole = req.auth().sessionClaims?.user?.role;

      // Only admin users can delete documents
      if (userRole !== 'admin') {
        return res.status(403).json({
          message: 'Only administrators can delete documents'
        });
      }

      // Get the document to check if it exists
      const document = await DocumentService.getDocumentById(id);

      if (!document) {
        return res.status(404).json({ message: 'Document not found' });
      }

      await DocumentService.deleteDocument(id);

      res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
      logger.error('Error deleting document', error);
      res.status(500).json({
        message: 'We encountered an issue deleting the document. Please try again in a moment.'
      });
    }
  }
}

export default new DocumentController();
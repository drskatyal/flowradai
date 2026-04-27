import mongoose from "mongoose";
import logger from "../../core/logger";
import DocumentModel, { IDocumentModel } from "./document-model";

export interface DocumentQuery {
  userId: string;
  search: string;
  limit: number;
  skip: number;
  isAdmin: boolean;
  specialityIds: string[];
  categories: string[];
}

export class DocumentService {
  async createDocument(document: IDocumentModel): Promise<IDocumentModel> {
    try {
      const newDocument = new DocumentModel({
        title: document.title,
        description: document.description,
        userId: document.userId,
        specialityId: document.specialityId,
        category: document.category,
        prompt: document.prompt
      });

      const savedDocument = await newDocument.save();
      return savedDocument;
    } catch (error) {
      logger.error("Error creating document:", error);
      throw new Error("Something went wrong while creating the document. Please try again later.");
    }
  }

  async getDocuments(
    { userId,
      search = '',
      limit = 10,
      skip = 0,
      isAdmin = false,
      specialityIds = [],
      categories = [], }: DocumentQuery
  ): Promise<{ documents: IDocumentModel[]; total: number }> {
    try {
      // Build query based on user role and search criteria
      let query: any = {};

      // If not admin, only show user's own documents
      if (!isAdmin) {
        query.userId = userId;
      }

      const trimmedQuery = search.trim();

      const searchCondition = trimmedQuery
        ? { title: { $regex: trimmedQuery, $options: 'i' } }
        : {};

      // Add specialty filter if provided
      const specialtyFilter = specialityIds.length > 0
        ? {
          specialityId: {
            $in: specialityIds.map(id => {
              try {
                return new mongoose.Types.ObjectId(id);
              } catch (e) {
                return id; // In case it's already an ObjectId or invalid ID
              }
            })
          }
        }
        : {};

      // Add category filter if provided
      const categoryFilter = categories.length > 0
        ? { category: { $in: categories } }
        : {};

      query = {
        ...searchCondition,
        ...specialtyFilter,
        ...categoryFilter
      }

      // Execute query with pagination
      const documents = await DocumentModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)

      // Get total count for pagination
      const total = await DocumentModel.countDocuments(query);

      return { documents, total };
    } catch (error) {
      logger.error("Error fetching documents:", error);
      throw new Error("Something went wrong while fetching documents. Please try again later.");
    }
  }

  async getDocumentById(id: string): Promise<IDocumentModel | null> {
    try {
      const document = await DocumentModel.findById(id);
      return document;
    } catch (error) {
      logger.error("Error fetching document by ID:", error);
      throw new Error("Something went wrong while fetching the document. Please try again later.");
    }
  }

  async updateDocument(id: string, updateData: Partial<IDocumentModel>): Promise<IDocumentModel | null> {
    try {
      // Remove fields that shouldn't be updated
      const { userId, ...allowedUpdates } = updateData;

      const updatedDocument = await DocumentModel.findByIdAndUpdate(
        id,
        allowedUpdates,
        { new: true, runValidators: true }
      );

      return updatedDocument;
    } catch (error) {
      logger.error("Error updating document:", error);
      throw new Error("Something went wrong while updating the document. Please try again later.");
    }
  }

  async deleteDocument(id: string): Promise<boolean> {
    try {
      const result = await DocumentModel.findByIdAndDelete(id);
      return Boolean(result);
    } catch (error) {
      logger.error("Error deleting document:", error);
      throw new Error("Something went wrong while deleting the document. Please try again later.");
    }
  }

  async getDocumentsByUserId(userId: string): Promise<IDocumentModel[]> {
    try {
      const documents = await DocumentModel
        .find({ userId })
        .sort({ createdAt: -1 })

      return documents;
    } catch (error) {
      logger.error("Error fetching documents by user ID:", error);
      throw new Error("Something went wrong while fetching user documents. Please try again later.");
    }
  }

  async searchDocuments(searchTerm: string, userId?: string): Promise<IDocumentModel[]> {
    try {
      let query: any = {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } }
        ]
      };

      // If userId is provided, filter by user
      if (userId) {
        query.userId = userId;
      }

      const documents = await DocumentModel
        .find(query)
        .sort({ createdAt: -1 })

      return documents;
    } catch (error) {
      logger.error("Error searching documents:", error);
      throw new Error("Something went wrong while searching documents. Please try again later.");
    }
  }

  validateDocumentInput(title: string, description: string, userId: string): boolean {
    return Boolean(
      title &&
      title.trim().length > 0 &&
      description &&
      description.trim().length > 0 &&
      userId &&
      userId.trim().length > 0
    );
  }

  async getDocumentCount(userId?: string): Promise<number> {
    try {
      const query = userId ? { userId } : {};
      const count = await DocumentModel.countDocuments(query);
      return count;
    } catch (error) {
      logger.error("Error getting document count:", error);
      throw new Error("Something went wrong while getting document count.");
    }
  }
}

export default new DocumentService();
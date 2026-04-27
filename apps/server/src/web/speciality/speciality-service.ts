import SpecialityModel, { ISpecialityModel } from "./speciality-model";
import PromptModel, { IPromptModel } from "./speciality-prompt-model";
import logger from "../../core/logger";

class SpecialityService {
  async createSpeciality(data: ISpecialityModel, prompts: object): Promise<ISpecialityModel> {
    try {
      const speciality = new SpecialityModel(data);
      await speciality.save();

      if (speciality && prompts) {
        const specialityPrompt = new PromptModel({
          specialityId: speciality._id,
          ...prompts,
        });
        await specialityPrompt.save();
      }

      const populatedSpeciality = await SpecialityModel.findById(speciality._id).populate('prompt');
      if (!populatedSpeciality) {
        throw new Error('Failed to create speciality');
      }

      return populatedSpeciality as ISpecialityModel;
    } catch (error) {
      logger.error('Error in createSpeciality', error);
      throw new Error(`Error creating speciality: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSpecialityById(id: string): Promise<ISpecialityModel | null> {
    try {
      if (!id) {
        throw new Error('Speciality ID is required');
      }
      const speciality = await SpecialityModel.findById(id).populate('prompt');
      return speciality;
    } catch (error) {
      logger.error('Error in getSpecialityById', error);
      throw new Error(`Error fetching speciality: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSpeciality(id: string, data: Partial<ISpecialityModel>): Promise<ISpecialityModel | null> {
    try {
      if (!id) {
        throw new Error('Speciality ID is required');
      }
      await this.updateSpecialityPrompt(id, data);
      const updatedSpeciality = await SpecialityModel.findByIdAndUpdate(id, data, { new: true });
      if (!updatedSpeciality) {
        throw new Error('Speciality not found');
      }
      return updatedSpeciality;
    } catch (error) {
      logger.error('Error in updateSpeciality', error);
      throw new Error(`Error updating speciality: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteSpeciality(id: string): Promise<ISpecialityModel | null> {
    try {
      if (!id) {
        throw new Error('Speciality ID is required');
      }
      const deletedSpeciality = await SpecialityModel.findByIdAndDelete(id);
      if (!deletedSpeciality) {
        throw new Error('Speciality not found');
      }
      return deletedSpeciality;
    } catch (error) {
      logger.error('Error in deleteSpeciality', error);
      throw new Error(`Error deleting speciality: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSpecialities(
    query: string = '',
    limit: number = 10,
    skip: number = 0,
    status: string = 'all'
  ): Promise<{
    specialities: ISpecialityModel[],
    count: number
  }> {
    try {
      const trimmedQuery = query.trim();
      const validStatus = ['all', 'active', 'inactive'].includes(status) ? status : 'all';

      let searchCondition: any = {};

      if (trimmedQuery) {
        searchCondition.name = { $regex: trimmedQuery, $options: 'i' };
      }

      if (validStatus !== 'all') {
        searchCondition.active = validStatus === 'active';
      }

      const [specialities, count] = await Promise.all([
        SpecialityModel.find(searchCondition)
          .populate("prompt")
          .sort({ name: 1 })
          .limit(limit)
          .skip(skip),
        SpecialityModel.countDocuments(searchCondition)
      ]);

      return { specialities, count };
    } catch (error) {
      logger.error('Error in getSpecialities', error);
      throw new Error(`Error fetching specialities: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateSpecialityPrompt(id: string, data: any) {
    try {
      if (!id) {
        throw new Error('Speciality ID is required');
      }

      const promptFields = {
        elaborateInstruction: data.elaborateInstruction,
        structuredReportingApproachInstruction: data.structuredReportingApproachInstruction,
        regularInstruction: data.regularInstruction,
        defaultGrokInstructions: data.defaultGrokInstructions,
        defaultOpenaiInstructions: data.defaultOpenaiInstructions,
        defaultGeminiInstructions: data.defaultGeminiInstructions,
        reportModificationInstructions: data.reportModificationInstructions,
        templateRegularInstruction: data.templateRegularInstruction,
        textCorrectionInstruction: data.textCorrectionInstruction,
        refinementInstruction: data.refinementInstruction,
        disabledRefinementInstructions: data.disabledRefinementInstructions,
        actionModeRefinementInstruction: data.actionModeRefinementInstruction,
        wishperInstruction: data.wishperInstruction,
        reportErrorValidationInstruction: data.reportErrorValidationInstruction,
        reportGuidelineInstruction: data.reportGuidelineInstruction
      };

      const cleanedPromptFields = Object.fromEntries(
        Object.entries(promptFields).filter(([_, value]) => value !== undefined)
      );

      const prompt = await PromptModel.findOneAndUpdate(
        { specialityId: id },
        cleanedPromptFields,
        { new: true }
      );

      if (!prompt) {
        throw new Error('Failed to update prompt');
      }

      return prompt;
    } catch (error) {
      logger.error('Error in updateSpecialityPrompt', error);
      throw new Error(`Error updating speciality prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getPromptBySpecialityId(specialityId: string): Promise<IPromptModel | null> {
    try {
      if (!specialityId) {
        throw new Error('Speciality ID is required');
      }
      const prompt = await PromptModel.findOne({ specialityId: specialityId });
      return prompt;
    } catch (error) {
      logger.error('Error fetching getPromptBySpecialityId', error);
      throw new Error(`Error fetching prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fetchSpecialityList(): Promise<ISpecialityModel[] | null> {
    try {
      const specialities = await SpecialityModel.find({ active: true });
      if (!specialities) {
        throw new Error('No specialities found');
      }
      return specialities as ISpecialityModel[];
    } catch (error) {
      logger.error('Error fetching speciality list', error);
      throw new Error(`Error fetching speciality list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default new SpecialityService();

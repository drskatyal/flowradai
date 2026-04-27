import CustomProfileModel from "./custom-profile-model";

class CustomProfileService {
  async getCustomProfile(userId: string) {
    const profile = await CustomProfileModel.findOne({ userId });
    return profile;
  }

  async createOrUpdateCustomProfile(userId: string, content: string ) {
    const profile = await CustomProfileModel.findOneAndUpdate({ userId }, { content }, { upsert: true, new: true });
    return profile;
  }
}

export default new CustomProfileService();
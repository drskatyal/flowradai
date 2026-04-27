import ThreadModel, { IThreadModel } from "./thread-model";

class ThreadService {
  async createThread(threadData: IThreadModel): Promise<IThreadModel> {
    const thread = new ThreadModel(threadData);
    return thread.save();
  }

  async getUserThreads(userId: string): Promise<IThreadModel[]> {
    return ThreadModel.find({ userId });
  }

  async getLastUserThread(userId: string): Promise<IThreadModel | null> {
    return ThreadModel.findOne({ userId }).sort({ createdAt: -1 });
  }

  async getThreadById(
    id: string,
    userId: string
  ): Promise<IThreadModel | null> {
    return ThreadModel.findOne({ threadId: id, userId });
  }

  async updateThread(
    id: string,
    updateData: Partial<IThreadModel>,
    userId: string
  ): Promise<IThreadModel | null> {
    return ThreadModel.findOneAndUpdate({ threadId: id, userId }, updateData, {
      new: true,
    });
  }

  async deleteThread(id: string, userId: string): Promise<IThreadModel | null> {
    const thread = await ThreadModel.findOne({ threadId: id, userId });
    if (thread) {
      thread.isDeleted = true; // mark as deleted
      await thread.save();     // persist change
      return thread;
    }
    return null;
  }

  async getReportStats(
    userId: string,
    filter: 'daily' | 'weekly' | 'monthly' | 'all',
    timezoneOffset: number = 0
  ) {
    let dateFilter: any = {};
    const now = new Date();
    const localTimeMs = now.getTime() - (timezoneOffset * 60 * 1000);
    const localDate = new Date(localTimeMs);

    // Reuse logic from getReportHistory
    if (filter === 'daily') {
      localDate.setUTCHours(0, 0, 0, 0);
      const startUtc = new Date(localDate.getTime() + (timezoneOffset * 60 * 1000));
      const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
      dateFilter = { $gte: startUtc, $lt: endUtc };
    } else if (filter === 'weekly') {
      const startUtc = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: startUtc };
    } else if (filter === 'monthly') {
      const startUtc = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: startUtc };
    }

    const matchStage: any = {
      userId,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false },
        { status: { $ne: 'deleted' } }
      ]
    };

    if (filter !== 'all') {
      matchStage.createdAt = dateFilter;
    }

    const count = await ThreadModel.countDocuments(matchStage);

    return {
      reportsGenerated: count,
      creditsUsed: count, // Rule: 1 credit per thread
    };
  }

  async getReportHistory(
    userId: string,
    filter: 'daily' | 'weekly' | 'monthly' | 'all',
    timezoneOffset: number = 0,
    page: number = 1,
    limit: number = 10
  ) {
    let dateFilter: any = {};
    const now = new Date();
    const localTimeMs = now.getTime() - (timezoneOffset * 60 * 1000);
    const localDate = new Date(localTimeMs);

    // Depending on filter, set the start date bound
    if (filter === 'daily') {
      localDate.setUTCHours(0, 0, 0, 0);
      const startUtc = new Date(localDate.getTime() + (timezoneOffset * 60 * 1000));
      const endUtc = new Date(startUtc.getTime() + 24 * 60 * 60 * 1000);
      dateFilter = { $gte: startUtc, $lt: endUtc };
    } else if (filter === 'weekly') {
      const startUtc = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: startUtc };
    } else if (filter === 'monthly') {
      const startUtc = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { $gte: startUtc };
    }

    const matchQuery: any = {
      userId,
      $or: [
        { isDeleted: { $exists: false } },
        { isDeleted: false },
        { status: { $ne: 'deleted' } }
      ]
    };

    if (filter !== 'all') {
      matchQuery.createdAt = dateFilter;
    }

    const skip = (page - 1) * limit;

    const [threads, total] = await Promise.all([
      ThreadModel.find(matchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('name createdAt threadId status'),
      ThreadModel.countDocuments(matchQuery)
    ]);

    // Map to simple DTO
    return {
      data: threads.map(t => ({
        threadId: t.threadId,
        name: t.name || 'Untitled Thread',
        createdAt: t.createdAt,
        creditsUsed: 1
      })),
      total,
      page,
      limit
    };
  }
}

export default new ThreadService();

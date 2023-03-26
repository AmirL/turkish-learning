import { db } from '~/utils/db.server';

export class StudySessionService {
  static async getUserStudyingLanguages(user_id: number) {
    const languagesData = await db.studySession.groupBy({
      by: ['language'],
      _max: {
        date: true,
      },
      orderBy: {
        _max: {
          date: 'desc',
        },
      },
      where: {
        user_id,
      },
    });

    return languagesData.map((language) => language.language);
  }

  static async getUserSessions(user_id: number, date: Date) {
    return await db.studySession.findMany({
      where: {
        user_id,
        date: {
          gte: date,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });
  }
}

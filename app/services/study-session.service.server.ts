import { db } from '~/utils/db.server';
import { WordProgressService } from './word-progress.service.server';

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

  static async updateStudySession(user_id: number, language: string, correct: boolean) {
    // get date at 00:00:00 by UTC
    const sessionDate = new Date();
    sessionDate.setUTCHours(0, 0, 0, 0);

    const knownWords = await WordProgressService.getWordsCountWithLevel(user_id, 5, language);
    const wellKnownWords = await WordProgressService.getWordsCountWithLevel(user_id, 8, language);

    const todaySession = await db.studySession.findUnique({
      where: { user_id_date_language: { user_id, date: sessionDate, language } },
    });

    // calculate ratio and round to decimal percent
    const ratio = todaySession ? todaySession.correct / (todaySession.correct + todaySession.wrong) : 0;
    const roundedRatio = Math.round(ratio * 100);

    // update user session progress
    await db.studySession.upsert({
      where: { user_id_date_language: { user_id, date: sessionDate, language } },
      update: {
        known: knownWords,
        wellKnown: wellKnownWords,
        correct: {
          increment: correct ? 1 : 0,
        },
        wrong: {
          increment: correct ? 0 : 1,
        },
        shown: { increment: 1 },
        ratio: roundedRatio,
        language,
      },
      create: {
        user_id,
        known: knownWords,
        wellKnown: wellKnownWords,
        date: sessionDate,
        correct: correct ? 1 : 0,
        wrong: correct ? 0 : 1,
        shown: 1,
        ratio: correct ? 100 : 0,
        language,
      },
    });
  }
}

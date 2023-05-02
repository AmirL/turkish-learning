import { db } from '~/utils/db.server';

export class StudySessionRepository {
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

  static async findByDate(user_id: number, date: Date, language: string) {
    return await db.studySession.findUnique({
      where: { user_id_date_language: { user_id, date, language } },
    });
  }

  static async writeStudySession(input: WriteStudySessionInput) {
    const { user_id, date, language, known, wellKnown, correct } = input;

    const todaySession = await StudySessionRepository.findByDate(user_id, date, language);

    // calculate ratio and round to decimal percent
    const ratio = todaySession ? todaySession.correct / (todaySession.correct + todaySession.wrong) : 0;
    const roundedRatio = Math.round(ratio * 100);

    await db.studySession.upsert({
      where: { user_id_date_language: { user_id, date, language: language } },
      update: {
        known: known,
        wellKnown,
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
        known: known,
        wellKnown: wellKnown,
        date: date,
        correct: correct ? 1 : 0,
        wrong: correct ? 0 : 1,
        shown: 1,
        ratio: correct ? 100 : 0,
        language,
      },
    });
  }
}

interface WriteStudySessionInput {
  user_id: number;
  date: Date;
  language: string;
  known: number;
  wellKnown: number;
  correct: boolean;
}

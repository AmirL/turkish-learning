import { WordProgressRepository } from './database/word-progress.repository.server';
import { StudySessionRepository } from './database/study-session.repository.server';

export class StudySessionService {
  static async updateStudySession(user_id: number, language: string, correct: boolean) {
    // get date at 00:00:00 by UTC
    const sessionDate = new Date();
    sessionDate.setUTCHours(0, 0, 0, 0);

    const knownWords = await WordProgressRepository.getWordsCountWithLevel(user_id, 5, language);
    const wellKnownWords = await WordProgressRepository.getWordsCountWithLevel(user_id, 8, language);

    // update user session progress
    await StudySessionRepository.writeStudySession({
      user_id,
      date: sessionDate,
      language,
      known: knownWords,
      wellKnown: wellKnownWords,
      correct,
    });
  }
}

import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import invariant from 'ts-invariant';

import { requireUser } from '~/utils/auth.server';
import { getLanguageLabel } from '~/utils/strings';
import { Box } from '@mui/material';
import { WordProgressService } from '~/services/word-progress.service.server';
import { sortRandom } from '~/utils/arrays';
import { StudyingTopic } from '~/components/studying/StudyingTopic';
import { WordRepository } from '~/services/database/word.repository.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Study',
  simpleBackground: true,
};

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);

  invariant(params.topicId, 'Topic ID is required');
  const topicId = parseInt(params.topicId);

  const topic = await db.topic.findUnique({
    where: { id: Number(topicId) },
  });
  invariant(topic, 'Topic not found');

  let topicWords = await WordRepository.getWordsByTopicId(topicId);
  invariant(topicWords.length > 0, 'No words in topic');

  let words = await WordProgressService.getWordsProgress(topicWords, user.id, user.learningMode);
  invariant(words.length > 0, 'No words to study');

  words = sortRandom(words);

  return {
    words,
    topic,
    user,
  };
}

export default function Topic() {

  const { topic, words } = useLoaderData<typeof loader>();

  return (
    <Box>
      <h2>{topic.name}</h2>
      <h3>
        {getLanguageLabel(topic.languageSource)} - {getLanguageLabel(topic.languageTarget)}
      </h3>
      <StudyingTopic topic_id={topic.id} words={words} />
    </Box>
  );
}

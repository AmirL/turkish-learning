import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { invariant } from '@remix-run/router';
import { getWordForStudying } from '~/models/words.server';
import { requireUser } from '~/utils/auth.server';
import StudyingWords from '~/components/StudyingWords';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Study',
  simpleBackground: true,
};

export async function loader({ request, params }: LoaderArgs) {
  const user = await requireUser(request);

  const { topicId } = params;

  invariant(topicId, 'Topic ID is required');

  const topic = await db.topic.findUnique({
    where: { id: Number(topicId) },
  });

  invariant(topic, 'Topic not found');

  const words = await getWordForStudying(topic.id, user.id);

  invariant(words.length > 0, 'No words to study');

  const totalWords = words.length;

  // remove words with level 5 and higher
  const wordToStudy = words.filter((word) => word.level < 5);

  return {
    totalWords,
    topic,
    words: wordToStudy,
  };
}

export default function StudyingTopic() {
  const { topic, words, totalWords } = useLoaderData<typeof loader>();

  return <StudyingWords topic={topic} words={words} totalWords={totalWords} />;
}

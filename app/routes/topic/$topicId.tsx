import { Box, LinearProgress, List, ListItem } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { invariant } from '@remix-run/router';
import { getLanguageLabel } from '~/utils/strings';

export async function loader({ request, params }: LoaderArgs) {
  const { topicId } = params;

  invariant(topicId, 'Topic ID is required');

  const topic = await db.topic.findUnique({
    where: { id: Number(topicId) },
  });

  invariant(topic, 'Topic not found');

  const words = await db.word.findMany({
    where: {
      topic_id: Number(topicId),
    },
  });

  invariant(words.length > 0, 'No words found for this topic');

  return {
    topic,
    words,
  };
}

export default function StudyingTopic() {
  const { topic, words } = useLoaderData<typeof loader>();

  const progress = 0.3;

  return (
    <Box>
      <h1>{topic.name}</h1>
      <h2>
        {getLanguageLabel(topic.languageSource)}-{getLanguageLabel(topic.languageTarget)}
      </h2>
      <LinearProgress variant="determinate" value={progress * 100} />

      <List>
        {words.map((word) => {
          return (
            <ListItem key={word.id}>
              <Box>{word.word}</Box>
              <Box>{word.translation}</Box>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

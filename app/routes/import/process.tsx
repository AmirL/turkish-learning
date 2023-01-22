/* @file
process parsed data from previous step (from preview), and create actually words in database
*/
import type { ActionFunction } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { invariant, json } from '@remix-run/router';

import type { Row } from '.';
import { db } from '~/utils/db.server';
import { Link, useActionData } from '@remix-run/react';
import { Box } from '@mui/system';
import { Button, Typography } from '@mui/material';

function IsRowType(row: any): row is Row {
  return row.word && row.translation && row.languageSource && row.languageTarget && row.topic;
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  invariant(user.editor === true, 'Only editors can import words');

  const form = await request.formData();

  const data = form.get('data') as string;
  const table = JSON.parse(data);

  invariant(Array.isArray(table), 'Data is not an array');
  invariant(table.length > 0, 'Data is an empty array');
  invariant(table.every(IsRowType), 'Data is not an array of rows');

  // get topics ids
  const topics = table.map((row) => row.topic);
  const uniqueTopics = [...new Set(topics)];
  await db.topic.createMany({
    data: uniqueTopics.map((topic) => ({ name: topic })),
    skipDuplicates: true,
  });

  const topicsIds = await getTopicsIds(uniqueTopics);

  // prepare words objetcs
  const words = table.map((row) => {
    return {
      word: row.word,
      translation: row.translation,
      languageSource: row.languageSource,
      languageTarget: row.languageTarget,
      topicId: topicsIds[row.topic],
    };
  });

  const result = await db.word.createMany({
    data: words,
    skipDuplicates: true,
  });

  const skipped = words.length - result.count;

  return json({ created: result.count, skipped });
};

async function getTopicsIds(uniqueTopics: string[]) {
  const topicsIds = await db.topic.findMany({
    where: { name: { in: uniqueTopics } },
    select: { id: true, name: true },
  });

  const topicIdsMap = topicsIds.reduce((acc, topic) => {
    if (topic.name) {
      acc[topic.name] = topic.id;
    }
    return acc;
  }, {} as Record<string, number>);
  return topicIdsMap;
}

export default function ImportFromCsv() {
  const data = useActionData<typeof action>();

  return (
    <Box>
      <h1>Import Completed</h1>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">Words created: {data?.created}</Typography>
        <Typography variant="body1">Words skipped: {data?.skipped}</Typography>
      </Box>
      <Link to="/">
        <Button variant="contained">Go back</Button>
      </Link>
    </Box>
  );
}

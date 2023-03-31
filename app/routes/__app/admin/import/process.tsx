/* @file
process parsed data from previous step (from preview), and create actually words in database
*/
import type { ActionFunction } from '@remix-run/node';
import { requireUser } from '~/utils/auth.server';
import { json } from '@remix-run/router';
import invariant from 'ts-invariant';

import { Link, useActionData } from '@remix-run/react';
import { Box } from '@mui/system';
import { Button, Typography } from '@mui/material';
import type { ImportWordRow } from '~/services/word.service.server';
import { WordService } from '~/services/word.service.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

function IsRowType(row: any): row is ImportWordRow {
  return row.word && row.translation && row.languageSource && row.languageTarget && row.topic;
}

export const action: ActionFunction = async ({ request }) => {
  const user = await requireUser(request);

  invariant(user.isEditor === true, 'Only editors can import words');

  const form = await request.formData();

  const data = form.get('data') as string;
  const table = JSON.parse(data);

  invariant(Array.isArray(table), 'Data is not an array');
  invariant(table.length > 0, 'Data is an empty array');
  invariant(table.every(IsRowType), 'Data is not an array of rows');

  const result = await WordService.importWords(table);
  return json(result);
};

export default function ImportFromCsv() {
  const data = useActionData<typeof action>();

  return (
    <Box>
      <h1>Import Completed</h1>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1">Words created: {data?.created}</Typography>
        <Typography variant="body1">Words skipped: {data?.skipped}</Typography>
      </Box>
      <Link to="/admin/import">
        <Button variant="contained">Go back</Button>
      </Link>
    </Box>
  );
}

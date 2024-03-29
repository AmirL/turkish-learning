import { Alert, Button, Grid, TextField, Typography } from '@mui/material';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useLoaderData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/router';
import invariant from 'ts-invariant';
import { AdminEditDialog } from '~/components/AdminEditDialog';

import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';
import { getLanguageLabel } from '~/utils/strings';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const word = await db.word.findUnique({
    where: { id: Number(params.id) },
    include: {
      topic: true,
    },
  });

  invariant(word, 'Word not found');

  return { status: 200, word };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);

  if (!user.isAdmin) {
    return badRequest({ error: 'You must be an admin to access this page', success: false });
  }

  const word = await db.word.findUnique({
    where: { id: Number(params.id) },
  });

  if (!word) {
    return badRequest({ error: 'Word not found', success: false });
  }

  const formData = await request.formData();

  const wordSource = formData.get('word');
  const translation = formData.get('translation');
  const intent = formData.get('intent');

  if (typeof wordSource !== 'string' || typeof translation !== 'string') {
    return badRequest({ error: 'Invalid form data', success: false });
  }

  if (intent === 'delete') {
    await db.word.delete({
      where: { id: Number(params.id) },
    });

    return redirect(`/admin/words/`);
  }

  await db.word.update({
    where: { id: Number(params.id) },
    data: {
      word: wordSource,
      translation,
    },
  });

  return json({ error: null, success: true });
}

export default function EditUser() {
  const { word } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  return (
    <>
      <AdminEditDialog title={`Edit Word: ${word.word}`} link="/admin/words">
        <Form method="post">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {data?.success ? <Alert severity="success">Word updated successfully</Alert> : null}
              {data?.error ? <Alert severity="error">{data.error}</Alert> : null}
            </Grid>
            {word.topic ? (
              <Grid item xs={12} sx={{ mb: 2 }}>
                <Typography variant="h6">
                  {word.topic.name}
                  {word.topic.languageSource ? ` ${getLanguageLabel(word.topic.languageSource)}` : null} &rarr;{' '}
                  {word.topic.languageTarget ? ` ${getLanguageLabel(word.topic.languageTarget)}` : null}
                </Typography>
              </Grid>
            ) : null}
            <Grid item xs={12}>
              <TextField label="Original word" name="word" defaultValue={word.word} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Translation" name="translation" defaultValue={word.translation} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" type="submit" name="intent" value="update">
                Update
              </Button>
              <Button variant="contained" type="submit" name="intent" value="delete" color="error" sx={{ ml: 2 }}>
                Delete
              </Button>
            </Grid>
          </Grid>
        </Form>
      </AdminEditDialog>
    </>
  );
}

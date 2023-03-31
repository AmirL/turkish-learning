import {
  Alert,
  Box,
  Button,
  DialogContent,
  DialogTitle,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from '@mui/material';
import { json, redirect } from '@remix-run/node';
import { Form, Link, useActionData, useLoaderData } from '@remix-run/react';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/router';
import invariant from 'ts-invariant';
import CloseDialogButton from '~/components/CloseDialogButton';

import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';
import { getLanguageLabel } from '~/utils/strings';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export async function loader({ request, params }: LoaderFunctionArgs) {
  const topic = await db.topic.findUnique({
    where: { id: Number(params.id) },
  });

  invariant(topic, 'Topic not found');

  return { status: 200, topic };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);

  if (!user.isAdmin) {
    return badRequest({ error: 'You must be an admin to access this page', success: false });
  }

  const topic = await db.topic.findUnique({
    where: { id: Number(params.id) },
  });

  if (!topic) {
    return badRequest({ error: 'Topic not found', success: false });
  }

  const formData = await request.formData();

  const name = formData.get('name');
  const languageSource = formData.get('languageSource');
  const languageTarget = formData.get('languageTarget');

  if (typeof name !== 'string' || typeof languageSource !== 'string' || typeof languageTarget !== 'string') {
    return badRequest({ error: 'Invalid form data', success: false });
  }

  const intent = formData.get('intent');

  if (intent === 'delete') {
    await db.topic.delete({
      where: { id: Number(params.id) },
    });
    return redirect('/admin/topics');
  }

  await db.topic.update({
    where: { id: Number(params.id) },
    data: {
      name,
      languageSource,
      languageTarget,
    },
  });

  return json({ error: null, success: true });
}

export default function EditUser() {
  const { topic } = useLoaderData<typeof loader>();
  const data = useActionData<typeof action>();

  const languages = [
    { value: 'en', label: getLanguageLabel('en') },
    { value: 'tr', label: getLanguageLabel('tr') },
    { value: 'ru', label: getLanguageLabel('ru') },
  ];

  return (
    <>
      <DialogTitle>Edit Topic {topic.name}</DialogTitle>
      <DialogContent sx={{ textAlign: 'center' }}>
        <Form method="post">
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {data?.success ? <Alert severity="success">Topic updated successfully</Alert> : null}
              {data?.error ? <Alert severity="error">{data.error}</Alert> : null}
            </Grid>
            <Grid item xs={12}>
              <TextField label="name" name="name" defaultValue={topic.name} fullWidth />
            </Grid>
            <Grid item xs={12}>
              <InputLabel id="languageSource">Source Language</InputLabel>
              <Select label="languageSource" name="languageSource" defaultValue={topic.languageSource} fullWidth>
                {languages.map((language) => (
                  <MenuItem key={language.value} value={language.value}>
                    {language.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <InputLabel id="languageTarget">Target Language</InputLabel>
              <Select label="languageTarget" name="languageTarget" defaultValue={topic.languageTarget} fullWidth>
                {languages.map((language) => (
                  <MenuItem key={language.value} value={language.value}>
                    {language.label}
                  </MenuItem>
                ))}
              </Select>
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
        <Link to="/admin/topics">
          <CloseDialogButton />
        </Link>
      </DialogContent>
    </>
  );
}

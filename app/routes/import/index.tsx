/* @file Form to import words from a CSV file. Only for editors */
import { Button, Card, CardContent, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import type { LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form } from '@remix-run/react';
import { requireUser } from '~/utils/auth.server';

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (user.editor === false) {
    return redirect('/');
  }
  return json({});
};

export default function ImportFromCsv() {
  return (
    <>
      <h1>Import from CSV</h1>
      <Box sx={{ justifyContent: 'center' }}>
        <Typography variant="body1">The CSV file should have the following format:</Typography>
        <Typography variant="body1">
          <code>word,definition</code>
        </Typography>

        <Form method="post" encType="multipart/form-data">
          <Stack spacing={2} sx={{ mt: 4 }}>
            <input type="file" name="file" />
            <Button type="submit" variant="contained">
              Import
            </Button>
          </Stack>
        </Form>
      </Box>
    </>
  );
}

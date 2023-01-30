/* @file Form to import words from a CSV file. Only for editors */
import { Button, Typography } from '@mui/material';
import { Box, Stack } from '@mui/system';
import type { ActionArgs, ActionFunction, LoaderFunction } from '@remix-run/node';
import { json, redirect } from '@remix-run/node';
import { Form, useActionData, useTransition } from '@remix-run/react';
import { requireUser } from '~/utils/auth.server';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';

import { invariant } from '@remix-run/router';
import Papa from 'papaparse';
import style from '~/css/importCsv.css';

export function links() {
  return [{ rel: 'stylesheet', href: style }];
}

export const loader: LoaderFunction = async ({ request }) => {
  const user = await requireUser(request);
  if (user.isEditor === false) {
    return redirect('/');
  }

  return json({});
};

export type Row = {
  word: string;
  translation: string;
  languageSource: string;
  languageTarget: string;
  topic: string;
};

export const action: ActionFunction = async ({ request }: ActionArgs) => {
  const user = await requireUser(request);

  invariant(user.isEditor === true, 'Only editors can import words');

  const form = await request.formData();
  const file = form.get('file') as File;

  if (!file) {
    return json({ error: 'No file uploaded', table: null });
  }

  const text = await file.text();
  if (!text) {
    return json({ errors: ['No text in file'], table: null });
  }

  const parsed = Papa.parse<Row[]>(text, { header: true });

  if (parsed.errors.length > 0) {
    console.log(parsed.errors);
    const errors = parsed.errors.map((error) => `row ${error.row}:  ${error.message}`);
    return json({ errors, table: null });
  }

  return json({ table: parsed.data, error: null });
};

export default function ImportFromCsv() {
  const data = useActionData<typeof action>();
  const transtion = useTransition();

  return (
    <>
      <Box sx={{ justifyContent: 'center' }}>
        {data?.errors ? (
          <Box sx={{ mb: 5 }}>
            {data.errors.map((error: String, index: number) => (
              <Typography color={'error'} key={index}>
                {error}
              </Typography>
            ))}
          </Box>
        ) : null}
        {data?.table ? (
          <Box sx={{ mb: 10 }}>
            <PreviewImportedData table={data.table} />
            <PreviewImportForm table={data.table} />
          </Box>
        ) : null}

        {data?.errors || !data?.table ? (
          <Box sx={{ mb: 10 }}>
            <CsvTableExample />
          </Box>
        ) : null}

        <Form method="post" encType="multipart/form-data">
          <Stack spacing={2} sx={{ mt: 4 }}>
            <input type="file" name="file" />
            <Button type="submit" variant="contained" disabled={transtion.state === 'submitting'}>
              {transtion.state === 'submitting' ? 'Submitting...' : 'Preview'}
            </Button>
          </Stack>
        </Form>
      </Box>
    </>
  );
}
function PreviewImportForm({ table }: { table: Row[] }) {
  return (
    <Form method="post" action="process">
      <Stack spacing={2} sx={{ mt: 2 }}>
        <input type="hidden" name="data" value={JSON.stringify(table)} />
        <Button type="submit" variant="contained">
          Import
        </Button>
      </Stack>
    </Form>
  );
}

function PreviewTable({ table }: { table: Row[] }) {
  // show topic, languageSource, languageTarget before the table
  // and render the table without these columns
  const { topic, languageSource, languageTarget } = table[0];

  return (
    <Box sx={{ mb: 10 }}>
      <Typography variant="h4">
        {topic} {languageSource} - {languageTarget}
      </Typography>
      <Table stickyHeader className="preview">
        <TableHead>
          <TableRow>
            <TableCell>word</TableCell>
            <TableCell>translation</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {table.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.word}</TableCell>
              <TableCell>{row.translation}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

function PreviewImportedData({ table }: { table: Row[] }) {
  // group rows by topic, languageSource, languageTarget
  const grouped = table.reduce((acc, row) => {
    const key = `${row.topic}-${row.languageSource}-${row.languageTarget}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(row);
    return acc;
  }, {} as Record<string, Row[]>);

  // render table for each group
  return (
    <>
      {Object.entries(grouped).map(([key, rows]) => (
        <PreviewTable key={key} table={rows} />
      ))}
    </>
  );
}

function CsvTableExample() {
  return (
    <>
      <Typography variant="subtitle2">The CSV file should have the following format:</Typography>
      <Table className="format-example" size="small">
        <TableHead>
          <TableRow>
            <TableCell>word</TableCell>
            <TableCell>translation</TableCell>
            <TableCell>languageSource</TableCell>
            <TableCell>languageTarget</TableCell>
            <TableCell>topic</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>Word</TableCell>
            <TableCell>Перевод</TableCell>
            <TableCell>en</TableCell>
            <TableCell>ru</TableCell>
            <TableCell>Simple Words</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  );
}

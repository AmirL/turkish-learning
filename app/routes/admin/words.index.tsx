// @file  list of all words with pagination, and search by word

import { Box, Pagination, Table, TextField } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { invariant } from '@remix-run/router';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import UserAvatar from '~/components/UserAvatar';
import EditIcon from '@mui/icons-material/Edit';
import { getLanguageLabel } from '~/utils/strings';

const perPage = 10;

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  invariant(user.isAdmin, 'You must be an admin to access this page');

  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 0;

  const search = url.searchParams.get('search') ?? '';

  const where =
    search.length > 0
      ? {
          OR: [
            {
              word: {
                contains: search,
              },
            },
            {
              translation: {
                contains: search,
              },
            },
          ],
        }
      : undefined;

  const pages = Math.floor((await db.word.count({ where })) / perPage) + 1;

  const words = await db.word.findMany({
    where,
    include: { topic: true },
    skip: page * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
  });

  return { words, pages, page, status: 200 };
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { words, pages, page } = useLoaderData<typeof loader>();

  const onPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const page = (value - 1).toString();
    setSearchParams({ page });
  };

  // format date to dd.mm.YY hh:mm
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  return (
    <>
      <h1>Words</h1>
      <Box sx={{ mb: 3 }}>
        <Form method="get">
          <TextField label="Search" name="search" fullWidth defaultValue={searchParams.get('search')} />
        </Form>
      </Box>
      <Pagination count={pages} defaultPage={page + 1} onChange={onPageChange} color="primary" />
      <Table>
        <TableHead>
          <TableRow>
            <TableCell> </TableCell>
            <TableCell>Word</TableCell>
            <TableCell>Translation</TableCell>
            <TableCell>Topic</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {words.map((word) => (
            <TableRow key={word.id}>
              <TableCell>
                <Link to={`/admin/words/edit/${word.id}`}>
                  <EditIcon color="primary" />
                </Link>
              </TableCell>
              <TableCell>{word.word}</TableCell>
              <TableCell>{word.translation}</TableCell>
              <TableCell>
                {word.topic ? (
                  <Box>
                    {word.topic.name}
                    <br /> {getLanguageLabel(word.topic.languageSource)}
                    {' → '}
                    {getLanguageLabel(word.topic.languageTarget)}
                  </Box>
                ) : null}
              </TableCell>
              <TableCell>{dateFormatter.format(new Date(word.createdAt))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

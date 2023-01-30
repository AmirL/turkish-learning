// @file  list of all topics with pagination, and search by name

import { Box, Pagination, Table, TextField } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { invariant } from '@remix-run/router';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getLanguageLabel } from '~/utils/strings';

const perPage = 10;

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 0;

  const search = url.searchParams.get('search') ?? '';

  const where =
    search.length > 0
      ? {
          name: {
            contains: search,
          },
        }
      : undefined;

  const pages = Math.floor((await db.topic.count({ where })) / perPage) + 1;

  const topics = await db.topic.findMany({
    where,
    skip: page * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
  });

  return { topics, pages, page, status: 200 };
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { topics, pages, page } = useLoaderData<typeof loader>();

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
      <h2>Topics</h2>
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
            <TableCell>Title</TableCell>
            <TableCell>Language Source</TableCell>
            <TableCell>Language Target</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell>
                <Link to={`/admin/topics/edit/${topic.id}`}>
                  <EditIcon color="primary" />
                </Link>
              </TableCell>
              <TableCell>{topic.name}</TableCell>
              <TableCell>{getLanguageLabel(topic.languageSource)}</TableCell>
              <TableCell>{getLanguageLabel(topic.languageTarget)}</TableCell>
              <TableCell>{dateFormatter.format(new Date(topic.createdAt))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

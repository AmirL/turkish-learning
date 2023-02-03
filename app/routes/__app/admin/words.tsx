// @file  list of all words with pagination, and search by word

import type { SelectChangeEvent } from '@mui/material';
import { Dialog } from '@mui/material';
import { Box, MenuItem, Pagination, Select, Table, TextField } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { Form, Link, useLoaderData, useOutlet, useSearchParams } from '@remix-run/react';
import { db } from '~/utils/db.server';

import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getLanguageLabel } from '~/utils/strings';
import { useRef } from 'react';
export { ErrorBoundary } from '~/components/ErrorBoundary';

const perPage = 10;

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 0;

  const search = url.searchParams.get('search') ?? false;
  const topic = url.searchParams.get('topic') ?? 'all';

  let where = {};

  if (search) {
    where = {
      ...where,
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
    };
  }

  if (topic !== 'all') {
    where = {
      ...where,
      topic_id: parseInt(topic, 10),
    };
  }

  const pages = Math.floor((await db.word.count({ where })) / perPage) + 1;

  console.log(topic);

  const words = await db.word.findMany({
    where,
    include: { topic: true },
    skip: page * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
  });

  const topics = await db.topic.findMany();

  return { words, pages, page, topics, status: 200 };
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { words, pages, page, topics } = useLoaderData<typeof loader>();

  const deferred = useRef<ReturnType<typeof setTimeout>>();
  const defer = (fn: () => void) => {
    if (deferred.current) {
      clearTimeout(deferred.current);
    }
    deferred.current = setTimeout(fn, 200);
  };

  const onPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    const pageChanged = (value - 1).toString();
    searchParams.set('page', pageChanged);
    setSearchParams(searchParams);
  };

  const onSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchChanged = event.target.value;

    defer(() => {
      searchParams.set('search', searchChanged);
      setSearchParams(searchParams);
    });
  };

  const onTopicChange = (event: SelectChangeEvent) => {
    const topicChanged = event.target.value;

    defer(() => {
      searchParams.set('topic', topicChanged);
      setSearchParams(searchParams);
    });
  };

  // format date to dd.mm.YY hh:mm
  const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  const outlet = useOutlet();

  return (
    <>
      <Box sx={{ mb: 3 }}>
        <Form method="get">
          <TextField
            label="Search"
            name="search"
            onChange={onSearchChange}
            fullWidth
            defaultValue={searchParams.get('search')}
          />
          <Select
            sx={{ mt: 2 }}
            onChange={onTopicChange}
            label="Topic"
            name="topic"
            fullWidth
            value={searchParams.get('topic') ?? 'all'}
          >
            <MenuItem value="all">All</MenuItem>
            {topics.map((topic) => (
              <MenuItem key={topic.id} value={topic.id}>
                {topic.name}
              </MenuItem>
            ))}
          </Select>
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
      <Dialog open={!!outlet}>{outlet}</Dialog>
    </>
  );
}

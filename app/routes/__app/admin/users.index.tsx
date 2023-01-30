// @file  list of all users with pagination, and search by username

import { Box, Pagination, Table, TextField } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { Form, Link, useLoaderData, useSearchParams } from '@remix-run/react';
import { invariant } from '@remix-run/router';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

import { TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import UserAvatar from '~/components/UserAvatar';
import EditIcon from '@mui/icons-material/Edit';

const perPage = 10;

export async function loader({ request }: LoaderArgs) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 0;

  const search = url.searchParams.get('search') ?? '';

  const where =
    search.length > 0
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              email: {
                contains: search,
              },
            },
          ],
        }
      : undefined;

  const pages = Math.floor((await db.user.count({ where })) / perPage) + 1;

  const users = await db.user.findMany({
    where,
    skip: page * perPage,
    take: perPage,
    orderBy: { createdAt: 'desc' },
  });

  return { users, pages, page, status: 200 };
}

export default function AdminUsers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { users, pages, page } = useLoaderData<typeof loader>();

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
      <h2>Admin Users</h2>
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

            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Created At</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Link to={`/admin/users/edit/${user.id}`}>
                  <EditIcon color="primary" />
                </Link>
              </TableCell>
              <TableCell>
                <UserAvatar user={user} />
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                {user.isAdmin ? 'Admin' : ''}
                <br />
                {user.isEditor ? 'Editor' : 'User'}
                <br />
              </TableCell>
              <TableCell>{dateFormatter.format(new Date(user.createdAt))}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

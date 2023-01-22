import { useLoaderData } from '@remix-run/react';

import { requireUser } from '~/utils/auth.server';

import type { LoaderArgs } from '@remix-run/node';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  // await db.user.update({ where: { id: user.id }, data: { editor: true } });

  return { user };
}
export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Words Learning</h1>
    </div>
  );
}

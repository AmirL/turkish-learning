import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import invariant from 'ts-invariant';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);

  const { muteSpeach } = await request.json();
  // check muteSpeach is a boolean
  invariant(typeof muteSpeach === 'boolean', 'muteSpeach is required');

  await db.user.update({
    where: { id: user.id },
    data: { muteSpeach },
  });

  return json({ success: true });
}

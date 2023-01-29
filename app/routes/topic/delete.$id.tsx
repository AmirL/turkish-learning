// @file Delete a topic with all words inside it, and all stats related to it by a post request

import type { ActionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { useActionData } from '@remix-run/react';
import { invariant } from '@remix-run/router';
import { requireUser } from '~/utils/auth.server';
import { db } from '~/utils/db.server';

export async function action({ request, params }: ActionArgs) {
  const user = await requireUser(request);

  // TODO add a check for the user's role
  invariant(user.isAdmin, 'You must be an admin to delete a topic');

  // invariant(params.id, 'Word ID is required');

  const topic = await db.topic.findUnique({
    where: { id: Number(params.id) },
  });

  invariant(topic, 'Topic not found');

  const result = await db.topic.delete({
    where: { id: Number(params.id) },
  });

  return json({ result });
}

// show deletion result message

export default function DeleteTopic() {
  const data = useActionData<typeof action>();

  invariant(data, 'Only for POST requests');

  invariant(data.result, 'Topic not deleted');

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <h1 className="text-2xl font-bold">Topic deleted</h1>
    </div>
  );
}

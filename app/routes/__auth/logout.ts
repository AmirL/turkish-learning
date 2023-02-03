import type { ActionFunction, LoaderFunction } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import authenticator from '~/utils/auth.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const action: ActionFunction = async ({ request }) => {
  await authenticator.logout(request, { redirectTo: '/login' });
};

export const loader: LoaderFunction = async () => {
  return redirect('/');
};

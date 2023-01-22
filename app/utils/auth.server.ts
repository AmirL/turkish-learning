import { Authenticator } from 'remix-auth';
import { FormStrategy } from 'remix-auth-form';
import { sessionStorage } from '~/utils/session.server';
import { invariant, redirect } from '@remix-run/router';
import type { User } from '~/models/user.server';
import { verifyLogin } from '~/models/user.server';

// Create an instance of the authenticator, pass a Type, User,  with what
// strategies will return and will store in the session
const authenticator = new Authenticator<User | Error | null>(sessionStorage);

authenticator.use(
  new FormStrategy(async ({ form, context }) => {
    // Here you can use `form` to access and input values from the form.
    // and also use `context` to access more things from the server
    let username = form.get('email');
    let password = form.get('password');

    // throw new Error('Not implemented');
    invariant(typeof username === 'string', 'username must be a string');
    invariant(username.length > 0, 'username must not be empty');

    invariant(typeof password === 'string', 'password must be a string');
    invariant(password.length > 0, 'password must not be empty');

    const user = await verifyLogin(username, password);
    invariant(user, 'Invalid username or password');

    return user;
  })
);

export default authenticator;

/**
 * @param request
 * @param refreshUser - load the user from the database to get the latest data
 * @returns user
 */
export async function getLoggedUser(request: Request) {
  const user = await authenticator.isAuthenticated(request);

  if (user instanceof Error) {
    throw redirect('/login');
  }

  return user;
}

/**
 * @param request
 * @param refreshUser - load the user from the database to get the latest data
 * @returns user
 */
export async function requireUser(request: Request) {
  const user = await authenticator.isAuthenticated(request, { failureRedirect: '/login' });

  if (user instanceof Error || !user) {
    throw redirect('/login');
  }

  return user;
}

export async function login(user: User, request: Request, redirectTo: FormDataEntryValue | null) {
  let session = await sessionStorage.getSession(request.headers.get('Cookie'));

  session.set(authenticator.sessionKey, user);
  session.set(authenticator.sessionStrategyKey, 'form');
  return redirect(typeof redirectTo === 'string' ? redirectTo : '/', {
    headers: { 'Set-Cookie': await sessionStorage.commitSession(session) },
  });
}

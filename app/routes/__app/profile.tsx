import { Box, Button, InputLabel, MenuItem, Select, Typography } from '@mui/material';
import { Container } from '@mui/system';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/router';
import invariant from 'ts-invariant';

import { json } from '@remix-run/node';
import { Form, useLoaderData, useTransition } from '@remix-run/react';
import UserAvatar from '~/components/UserAvatar';
import { requireUser } from '~/utils/auth.server';
import { getLanguageLabel } from '~/utils/strings';
import { UserService } from '~/services/user.service.server';
import { AvatarService } from '~/services/avatar.service.server';
import { TopicProgressService } from '~/services/topic-progress.service.server';
import { UserRepository } from '~/services/database/user.repository.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Profile',
};

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  return { user };
}

export async function action({ request, params }: ActionFunctionArgs) {
  const user = await requireUser(request);

  const formData = await request.formData();

  const action = formData.get('action');

  switch (action) {
    case 'avatar':
      const newAvatar = await AvatarService.generateRandomAvatarImage();
      await UserRepository.update(user.id, { avatar: newAvatar });
      break;
    case 'settings':
      const learningMode = formData.get('learningMode');
      // check if learningMode is 0, 1 or 2
      invariant(
        learningMode && learningMode.length === 1 && learningMode >= '0' && learningMode <= '2',
        'Invalid learning mode'
      );

      await UserRepository.update(user.id, { learningMode: Number(learningMode) });
      await TopicProgressService.recalcTopicProgress(user.id, Number(learningMode));
      break;
    default:
      break;
  }

  return json({}, 200);
}

export default function UserProfile() {
  const data = useLoaderData<typeof loader>();
  const avatarSize = 100;
  const transition = useTransition();

  const loading = transition.state === 'loading' || transition.state === 'submitting';

  const languages = ['ru', 'en', 'tr'];
  type option = { value: string; label: string };
  const languageOptions = languages.map<option>((lang) => ({ value: lang, label: getLanguageLabel(lang) }));
  const learningModes = [
    { value: '0', label: `From Target to ${getLanguageLabel(data.user.nativeLanguage)}` },
    { value: '1', label: `From ${getLanguageLabel(data.user.nativeLanguage)} to Target` },
    { value: '2', label: 'Both' },
  ];

  return (
    <>
      <Container sx={{ mt: 5 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <UserAvatar avatar={data.user.avatar} sx={{ width: avatarSize, height: avatarSize, mb: 2 }} />
          <Form method="post">
            <Button variant="contained" type="submit" color="primary" disabled={loading} value="avatar" name="action">
              Generate new avatar
            </Button>
          </Form>
        </Box>
        <Typography variant="subtitle1">Name: {data.user.name}</Typography>
        <Typography variant="subtitle1">Email: {data.user.email}</Typography>
      </Container>

      <Container sx={{ mt: 15 }}>
        <Typography variant="h4">Settings</Typography>
        <Form method="post">
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 3 }}>
            <InputLabel id="nativeLanguage">Native language</InputLabel>
            {/* changing native language is not supported yet */}
            <Select name="nativeLanguage" value={data.user.nativeLanguage} label="Native language" disabled>
              {languageOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 3 }}>
            <InputLabel id="learningMode">Learning mode</InputLabel>
            <Select name="learningMode" defaultValue={data.user.learningMode} label="Learning mode">
              {learningModes.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 3 }}>
            <Button variant="contained" type="submit" color="primary" disabled={loading} value="settings" name="action">
              Save
            </Button>
          </Box>
        </Form>
      </Container>

      <Container sx={{ mt: 15 }}>
        <Form action="/logout" method="post">
          <Button variant="contained" type="submit" color="error">
            Logout
          </Button>
        </Form>
      </Container>
    </>
  );
}

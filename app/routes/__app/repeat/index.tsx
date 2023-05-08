// @file select language to repeat words from

import { Button, Stack } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { userStore } from '~/routes/__app';
import { WordProgressRepository } from '~/services/database/word-progress.repository.server';
import { requireUser } from '~/utils/auth.server';
import { getLanguageLabel } from '~/utils/strings';
import { useTranslation } from '~/utils/useTranslation';

export const handle = {
  title: 'Repeat',
  simpleBackground: true,
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const repeatLanguages = await WordProgressRepository.languagesToRepeat(user.id, user.learningMode);

  return {
    languages: repeatLanguages,
  };
}

export default function SelectLanguage() {
  const { languages } = useLoaderData<typeof loader>();

  // const repeatCount = languages.reduce((acc, lang) => acc + parseInt(lang.count, 10), 0);
  // userStore.setRepeatCount(repeatCount);

  const t = useTranslation();

  return (
    <div>
      <h1>{t('Select language to repeat')}</h1>
      <Stack spacing={3}>
        {languages.map((language) => (
          <Button key={language.language} variant="contained" component={Link} to={`/repeat/${language.language}`}>
            {`${getLanguageLabel(language.language)} - ${language.count}`}
          </Button>
        ))}
      </Stack>
    </div>
  );
}

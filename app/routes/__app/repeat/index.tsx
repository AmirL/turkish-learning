// @file select language to repeat words from

import { Button, Stack } from '@mui/material';
import type { LoaderArgs } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { useContext, useEffect } from 'react';
import { AppContext } from '~/components/AppContext';
import { languagesToRepeat } from '~/models/words.server';
import { requireUser } from '~/utils/auth.server';
import { getLanguageLabel } from '~/utils/strings';

export const handle = {
  title: 'Repeat',
  simpleBackground: true,
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  const repeatLanguages = await languagesToRepeat(user.id);

  return {
    languages: repeatLanguages,
  };
}

export default function SelectLanguage() {
  const { languages } = useLoaderData<typeof loader>();

  const appContext = useContext(AppContext);

  useEffect(() => {
    const repeatCount = languages.reduce((acc, lang) => acc + parseInt(lang.count, 10), 0);
    appContext.setRepeatCount?.(repeatCount);
  }, []);

  return (
    <div>
      <h1>Select language to repeat</h1>
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
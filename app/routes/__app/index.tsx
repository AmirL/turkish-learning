import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData, useTransition } from '@remix-run/react';
import { requireUser } from '~/utils/auth.server';
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { styled } from '@mui/system';
import { getLanguageLabel } from '~/utils/strings';
import WordsCountIcon from '@mui/icons-material/FeaturedPlayList';
import type { TopicInfo } from '~/services/topic-progress.service.server';
import { TopicProgressService } from '~/services/topic-progress.service.server';
export { ErrorBoundary } from '~/components/ErrorBoundary';

export const handle = {
  title: 'Topics',
};

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  // get topics from db and group them by language source
  const topics = await TopicProgressService.getTopics(user.id);

  // get unique language sources from these topics
  const languages = [...new Set(topics.map((topic) => topic.languageSource))];

  return { user, topics, languages };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();
  const transtion = useTransition();

  const disabled = transtion.state !== 'idle';

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      {data.languages.map((language) => {
        return (
          <div key={language}>
            {/* center language source subheader */}
            <h2 style={{ textAlign: 'center' }}>{getLanguageLabel(language)}</h2>
            <ListTopics
              topics={data?.topics.filter((topic) => topic.languageSource === language)}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
}

const ListStyled = styled(ListItem)({
  backgroundColor: '#fff',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#E9E8E4',
  borderRadius: '16px',
  padding: '16px',
  marginBottom: '16px',
  // shadow
  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  '&.completed': {
    backgroundColor: '#E3F0EE',
    borderColor: '#DAE5E8',
    color: '#43764E',
  },
  // change color if has disabled class
  '&.disabled': {
    backgroundColor: '#E8EDF1',
    borderColor: '#E8EDF1',
  },
});

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: '#202B57',
  // bold
  fontWeight: 'bold',
  // disabe pointer icon when has disabled class
  '&.disabled': {
    pointerEvents: 'none',
  },
});

function ListTopics({ topics, disabled }: { topics: SerializeFrom<TopicInfo>[]; disabled: boolean }) {
  return (
    <List sx={{ width: '100%' }} className="topics">
      {topics.map((topic) => {
        return (
          <StyledLink key={topic.id} to={`/topic/${topic.id}`} className={disabled ? 'disabled' : ''}>
            <ListStyled
              sx={{ mb: 1.5 }}
              // set class name disabled or completed depends on topic status
              className={disabled ? 'disabled' : topic.completed ? 'completed' : ''}
            >
              <ListItemText>
                <Typography sx={{ fontWeight: 'bold' }}>{topic.name} </Typography>
              </ListItemText>
              <ListItemIcon>
                {topic.completed ? (
                  <CheckBoxIcon sx={{ color: '#489471' }} />
                ) : (
                  <>
                    <WordsCountIcon sx={{ mr: 1 }} /> {topic.wordsCount}
                  </>
                )}
              </ListItemIcon>
            </ListStyled>
          </StyledLink>
        );
      })}
    </List>
  );
}

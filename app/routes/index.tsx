import type { LoaderArgs, SerializeFrom } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { requireUser } from '~/utils/auth.server';
import { List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { styled } from '@mui/system';
import type { TopicInfo } from '~/models/topics.server';
import { getTopics } from '~/models/topics.server';
import { getLanguageLabel } from '~/utils/strings';

export async function loader({ request }: LoaderArgs) {
  const user = await requireUser(request);

  // get topics from db and group them by language source
  const topics = await getTopics(user.id);

  // get unique language sources from these topics
  const languages = [...new Set(topics.map((topic) => topic.languageSource))];

  return { user, topics, languages };
}

export default function Index() {
  const data = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', lineHeight: '1.4' }}>
      <h1>Topics</h1>
      {data.languages.map((language) => {
        return (
          <div key={language}>
            {/* center language source subheader */}
            <h2 style={{ textAlign: 'center' }}>{getLanguageLabel(language)}</h2>
            <ul>
              <ListTopics topics={data?.topics.filter((topic) => topic.languageSource === language)} />
            </ul>
          </div>
        );
      })}
    </div>
  );
}

const ListStyled = styled(ListItem)({
  backgroundColor: '#42a5f5',
  borderWidth: '1px',
  borderStyle: 'solid',
  borderColor: '#42a5f5',
  borderRadius: '4px',
  // darker on hover and touch
  '&:hover': {
    backgroundColor: '#1e88e5',
    borderColor: '#1e88e5',
  },
  '&:active': {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
});

const StyledLink = styled(Link)({
  textDecoration: 'none',
  color: 'white',
});

function ListTopics({ topics }: { topics: SerializeFrom<TopicInfo>[] }) {
  return (
    <List sx={{ width: '100%' }}>
      {topics.map((topic) => {
        return (
          <StyledLink key={topic.id} to={`/topic/${topic.id}`}>
            <ListStyled sx={{ mb: 1 }}>
              <ListItemText>
                <Typography sx={{ fontWeight: 'bold' }}>{topic.name} </Typography>({topic.wordsCount} words)
              </ListItemText>
              <ListItemIcon>
                {topic.completed ? (
                  <CheckBoxIcon sx={{ color: 'white' }} />
                ) : (
                  <CheckBoxOutlineBlankIcon sx={{ color: 'white' }} />
                )}
              </ListItemIcon>
            </ListStyled>
          </StyledLink>
        );
      })}
    </List>
  );
}

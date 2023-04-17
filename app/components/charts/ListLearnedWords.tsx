import { Link } from '@remix-run/react';
import { Box } from '@mui/system';

import type { TotalWordsCount } from '~/services/word-progress.service.server';

interface ListLearnedWordsProps {
  total: TotalWordsCount[];
  lastLearnedWords: KnowWords[];
  language: string;
  title: string;
  backgroundColor: string;
}

export function ListLearnedWords({ total, lastLearnedWords, language, title, backgroundColor }: ListLearnedWordsProps) {
  // find data for current language
  const learned = total.find((word) => word.language === language);
  const totalLearned = learned?.count || 0;

  const words = getWordsByLanguage(lastLearnedWords, language);

  return (
    <Box sx={{ backgroundColor, padding: '1rem', borderRadius: '0.5rem', mt: 3 }}>
      <h3>{`${title} - ${totalLearned}`}</h3>
      {words.map((word) => {
        return <div key={word.word.id}>{word.word.word}</div>;
      })}
      <Box sx={{ mt: 1 }}>
        <Link to={`/words?language=${language}`}>Show all</Link>
      </Box>
    </Box>
  );
}

type KnowWords = {
  word: {
    id: number;
    word: string;
    topic: {
      languageSource: string;
    };
  };
};

function getWordsByLanguage(words: KnowWords[], language: string, limit = 10) {
  const result = words.filter((word) => {
    return word.word.topic.languageSource === language;
  });
  return result.slice(0, limit);
}

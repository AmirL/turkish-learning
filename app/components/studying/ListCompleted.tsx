import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

type IProps = {
  /**
   * List of completed words with fields:
   * - word
   * - translation
   * - level
   * - nextReview
   */
  words?: {
    word: string;
    translation: string;
    level: number;
    nextReview: string | null;
  }[];
};

/**
 * List of completed words for a topic
 */
export function ListCompleted({ words }: IProps) {
  return (
    <TableContainer component={Paper} sx={{ mt: 4 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Word</TableCell>
            <TableCell>Translation</TableCell>
            <TableCell>Level</TableCell>
            <TableCell>Next review</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {words?.map((word, index) => (
            <TableRow key={index}>
              <TableCell>{word.word}</TableCell>
              <TableCell>{word.translation}</TableCell>
              <TableCell>{word.level}</TableCell>
              <TableCell>
                <NextReviewFormatted nextReview={word.nextReview} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function NextReviewFormatted({ nextReview }: { nextReview: string | null }) {
  const getDaysLeft = () => {
    if (!nextReview) {
      return '';
    }

    const today = new Date();
    const reviewDate = new Date(nextReview);
    const timeDiff = reviewDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    return daysDiff <= 0 ? 'Today' : `in ${daysDiff} days`;
  };

  return <>{getDaysLeft()}</>;
}
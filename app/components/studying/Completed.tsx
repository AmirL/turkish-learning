import { Box, Button } from '@mui/material';
import styled from '@emotion/styled';
import { Link } from '@remix-run/react';
import { useTranslation } from '~/utils/useTranslation';

const H1Styled = styled.h1`
  font-size: 3rem;
`;

export type CompletedProps = {
  to?: string;
};

/**
 * Shows a message that the user has completed the task
 * with a button to go back to the previous page
 */
export function Completed({ to = '/' }: CompletedProps) {
  const t = useTranslation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <H1Styled>{t('Completed')}!</H1Styled>
      <Link to={to}>
        <Button variant="contained">{t('Go back')}</Button>
      </Link>
    </Box>
  );
}

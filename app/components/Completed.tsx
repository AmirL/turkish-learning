import { Box, Button } from '@mui/material';
import styled from '@emotion/styled';
import { Link } from '@remix-run/react';

const H1Styled = styled.h1`
  font-size: 3rem;
`;

export function Completed({ to = '/' }: { to?: string }) {
  return (
    // big congrats in justifying center
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <H1Styled>Completed!</H1Styled>
      <Link to={to}>
        <Button variant="contained">Go back</Button>
      </Link>
    </Box>
  );
}

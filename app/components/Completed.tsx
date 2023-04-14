import { Box, Button } from '@mui/material';
import styled from '@emotion/styled';
import { Link } from '@remix-run/react';
const H1Styled = styled.h1`
  font-size: 3rem;
`;

type IProps = {
  to?: string;
};

export function Completed({ to = '/' }: IProps) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <H1Styled>Completed!</H1Styled>
      <Link to={to}>
        <Button variant="contained">Go back</Button>
      </Link>
    </Box>
  );
}

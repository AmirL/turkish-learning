import { Button } from '@mui/material';

/**
 * Default button to close a popup dialog
 */
export default function CloseDialogButton() {
  return (
    <Button variant="text" sx={{ mt: 10 }} color="primary">
      Close
    </Button>
  );
}

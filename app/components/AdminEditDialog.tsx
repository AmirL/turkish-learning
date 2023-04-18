import { Button, Dialog, DialogContent, DialogTitle } from '@mui/material';
import { Link } from '@remix-run/react';

interface IAdminEditDialogProps {
  title: string;
  link: string;
  children: React.ReactNode;
}

export function AdminEditDialog({ title, link, children }: IAdminEditDialogProps) {
  return (
    <>
      <Dialog open>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          {children}
          <Link to={link}>
            <Button variant="text" sx={{ mt: 10 }} color="primary">
              Close
            </Button>
          </Link>
        </DialogContent>
      </Dialog>
    </>
  );
}

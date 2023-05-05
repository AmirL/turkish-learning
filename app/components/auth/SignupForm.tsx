import { Button, Grid, TextField, Typography, InputLabel, Select, MenuItem } from '@mui/material';
import { UserLanguages, getLanguageLabel } from '~/utils/strings';

interface SignupFormProps {
  actionData: {
    formError?: string;
    fields?: {
      name?: string;
      nativeLanguage?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };
    fieldErrors?: {
      name?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    };
  };
  transtionState: string;
}

export function SignupForm({ actionData, transtionState }: SignupFormProps) {
  const submitText = transtionState !== 'idle' ? 'Signing up...' : 'Sign Up';
  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          {actionData?.formError ? (
            <Typography color="error" sx={{ textAlign: 'left' }}>
              {actionData.formError}
            </Typography>
          ) : null}
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="name"
            variant="outlined"
            label="Student name"
            name="name"
            required
            fullWidth
            autoComplete="name"
            defaultValue={actionData?.fields?.name}
            error={!!actionData?.fieldErrors?.name}
            helperText={actionData?.fieldErrors?.name}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="email"
            variant="outlined"
            label="Email"
            name="email"
            required
            fullWidth
            autoComplete="email"
            defaultValue={actionData?.fields?.email}
            error={!!actionData?.fieldErrors?.email}
            helperText={actionData?.fieldErrors?.email}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="password"
            variant="outlined"
            label="Password"
            name="password"
            type={'password'}
            required
            fullWidth
            autoComplete="current-password"
            error={!!actionData?.fieldErrors?.password}
            helperText={actionData?.fieldErrors?.password}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            id="confirmPassword"
            variant="outlined"
            label="Confirm Password"
            name="confirmPassword"
            type={'password'}
            required
            fullWidth
            autoComplete="current-password"
            error={!!actionData?.fieldErrors?.confirmPassword}
            helperText={actionData?.fieldErrors?.confirmPassword}
          />
        </Grid>
        <Grid item xs={12}>
          <InputLabel id="nativeLanguageLabel">Native Language</InputLabel>
          <Select
            sx={{ width: '100%' }}
            labelId="nativeLanguageLabel"
            id="nativeLanguage"
            name="nativeLanguage"
            label="Native Language"
            defaultValue={'en'}
          >
            {UserLanguages.map((lang) => (
              <MenuItem key={lang} value={lang}>
                {getLanguageLabel(lang)}
              </MenuItem>
            ))}
          </Select>
        </Grid>
        <Grid item xs={12} justifyContent="center" display="flex">
          <Button type="submit" variant="contained" disabled={transtionState !== 'idle'}>
            {submitText}
          </Button>
        </Grid>
      </Grid>
    </>
  );
}

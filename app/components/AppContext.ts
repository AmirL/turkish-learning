import type { User } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { createContext } from 'react';
import type { TranslatedStrings } from '~/utils/useTranslation';

export type AppContextType = {
  repeatCount: number;
  setRepeatCount?: (count: number) => void;
  user: SerializeFrom<User>;
  translated?: TranslatedStrings;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);

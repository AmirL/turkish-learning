import type { User } from '@prisma/client';
import type { SerializeFrom } from '@remix-run/node';
import { createContext } from 'react';

type AppContextType = {
  repeatCount: number;
  setRepeatCount?: (count: number) => void;
  user: SerializeFrom<User>;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);

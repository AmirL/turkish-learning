import { createContext } from 'react';

type AppContextType = {
  repeatCount: number;
  setRepeatCount?: (count: number) => void;
};

export const AppContext = createContext<AppContextType>({} as AppContextType);

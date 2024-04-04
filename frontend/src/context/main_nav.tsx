import { createContext } from 'react';

export const NavigatorContext = createContext({
    seeNodeInExplorer: (nodeId: number) => {},
})
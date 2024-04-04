import { createContext } from 'react';

export type TooltipsLevel = "beginner" | "normal" | "none" 

export const TooltipsLevelContext = createContext<{tooltipsLevel: TooltipsLevel, setTooltipsLevel: (level: TooltipsLevel) => void}>({
    tooltipsLevel: "normal",
    setTooltipsLevel: (level: TooltipsLevel) => {}
})
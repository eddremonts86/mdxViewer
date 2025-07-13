import { useMemo } from "react";

import { useTheme } from "@/components/theme/theme-provider";
import type { EffectiveTheme } from "@/types/markdown";
import { getEffectiveTheme } from "@/utils/markdownUtils";

/**
 * Hook to get the effective theme for syntax highlighting
 */
export const useEffectiveTheme = (): EffectiveTheme => {
    const { theme } = useTheme();

    return useMemo(() => getEffectiveTheme(theme), [theme]);
};

/**
 * @deprecated Använd createAppTheme från '@/lib/theme' tillsammans med ColorModeProvider.
 * Behålls för enklare import i tester som fortfarande förväntar sig default export.
 */
import { createAppTheme } from '@/lib/theme/createAppTheme';

export default createAppTheme('dark');

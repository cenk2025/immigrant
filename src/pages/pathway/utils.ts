import { useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import type { Bilingual } from '../../data/pathwayData';

/** Returns a picker for bilingual content in the current UI language. */
export function usePick() {
    const { language } = useLanguage();
    return useCallback((b: Bilingual) => b[language] || b.en, [language]);
}

/** Fills `{name}` placeholders in a translated string. */
export function fmt(template: string, vars: Record<string, string | number>): string {
    return template.replace(/\{(\w+)\}/g, (_, k: string) => (k in vars ? String(vars[k]) : `{${k}}`));
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Whole days from today to an ISO date (negative when the date is in the past). */
export function daysFromToday(isoDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(`${isoDate}T00:00:00`);
    return Math.round((target.getTime() - today.getTime()) / DAY_MS);
}

/** Only allow http(s) and mailto links from user-written content. */
export function safeUrl(url: string | null | undefined): string | null {
    if (!url) return null;
    const trimmed = url.trim();
    try {
        const parsed = new URL(trimmed);
        return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? parsed.href : null;
    } catch {
        return null;
    }
}

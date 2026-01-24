export const timeUnits = {
    y: { d: 365, h: 8760, m: 525600, s: 31536000, ms: 31536000.0e3 },
    d: { h: 24, m: 1440, s: 86400, ms: 86400.0e3 },
    h: { m: 60, s: 3600, ms: 3600.0e3 },
    m: { s: 60, ms: 60.0e3 },
    s: { ms: 1.0e3 }
} as const;

/**
 * Formats seconds into a human readable string (e.g. 1h 30m)
 * @param seconds Total seconds
 * @returns Formatted string
 */
export function formatSeconds(seconds: number): string {
    if (seconds <= 0) return "0s";

    const h = Math.floor(seconds / timeUnits.h.s);
    const m = Math.floor((seconds % timeUnits.h.s) / timeUnits.m.s);
    const s = Math.floor(seconds % timeUnits.m.s);

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0) parts.push(`${s}s`);

    return parts.length > 0 ? parts.join(" ") : "0s";
}

/**
 * Parses a Unix timestamp into a time remaining string
 * @param recoveryTs Unix timestamp in seconds
 */
export function formatTimeRemaining(recoveryTs: number): string {
    const diff = recoveryTs - Math.floor(Date.now() / 1000);
    if (diff <= 0) return "Full";
    return formatSeconds(diff);
}

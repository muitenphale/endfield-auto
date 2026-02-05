import logger from "./logger";

export async function syncTime(): Promise<number> {
    const PROBE_URL = "https://as.gryphline.com/user/info/v1/basic";

    try {
        const start = Date.now();
        const response = await fetch(PROBE_URL, {
            method: "HEAD",
            cache: "no-store"
        });

        const serverDateStr = response.headers.get("Date");
        if (!serverDateStr) {
            throw new Error("No Date header in server response");
        }

        const serverTime = new Date(serverDateStr).getTime();
        const localTime = Date.now();

        const rtt = localTime - start;
        const offset = (serverTime + (rtt / 2)) - localTime;

        const offsetSeconds = Math.round(offset / 1000);
        if (Math.abs(offsetSeconds) > 2) {
            logger.warn(`Clock drift detected: Server is ${offsetSeconds > 0 ? "+" : ""}${offsetSeconds}s from local clock. Auto-correcting...`);
        } else {
            logger.debug(`Clock sync successful. Offset: ${offsetSeconds}s`);
        }

        return offset;
    } catch (error) {
        logger.debug(`Failed to sync time with server: ${error}. Using local clock.`);
        return 0;
    }
}

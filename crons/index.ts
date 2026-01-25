import { CronJob } from "cron";
import checkInCron from "./check-in";
import checkInRecallCron from "./check-in-recall";
import cacheCleanupCron from "./cache-cleanup";
import staminaCheckCron from "./stamina-check";
import dailyCheckCron from "./daily-check";

const definitions = [
    checkInCron,
    checkInRecallCron,
    cacheCleanupCron,
    staminaCheckCron,
    dailyCheckCron
];

export type CronDefinition = {
    name: string;
    expression: string | (() => string);
    description: string;
    code: (this: CronWrapper) => void | Promise<void>;
};

class CronWrapper {
    public readonly name: string;
    public readonly description: string | null;
    public readonly expression: string;
    public readonly job: CronJob;

    constructor (def: CronDefinition) {
        this.name = def.name;

        const configSchedule = ak.Config.crons.find(c => c.name === this.name)?.scheduleTime;
        this.expression = configSchedule || (typeof def.expression === "function" ? def.expression() : def.expression);

        this.description = def.description;

        const fn = def.code.bind(this);
        this.job = CronJob.from({
            cronTime: this.expression,
            onTick: () => fn(),
            start: true
        });
    }

    stop () {
        void this.job.stop();
    }
}

type InitOptions = {
    disableAll?: boolean;
    blacklist?: string[];
    whitelist?: string[];
};

export default function initializeCrons (options: InitOptions = {}): CronWrapper[] {
    const {
        disableAll,
        blacklist = [],
        whitelist = []
    } = options;

    if (disableAll) {
        return [];
    }
    else if (whitelist.length > 0 && blacklist.length > 0) {
        throw new Error("Cannot combine blacklist and whitelist for crons");
    }

    const crons = [];
    for (const definition of definitions) {
        if (blacklist.length > 0 && blacklist.includes(definition.name)) {
            continue;
        }
        else if (whitelist.length > 0 && !whitelist.includes(definition.name)) {
            continue;
        }

        const cron = new CronWrapper(definition as CronDefinition);
        crons.push(cron);
        ak.Logger.info(`Cron scheduled: ${cron.name} at ${cron.expression}`);
    }

    return crons;
}

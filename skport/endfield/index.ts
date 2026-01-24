import { Game, type SignInResult, type StoredAccount, getProfile, type ApiResponse } from "../template";
import type { Account } from "../../utils/config";
import * as cache from "../cache";

export class Endfield extends Game {
    name = "endfield";

    constructor() {
        super();
        Game.list.set(this.name, this);
    }

    async init(): Promise<void> {
        ak.Logger.info(`Initializing ${this.name} accounts...`);

        for (const account of ak.Config.accounts) {
            const profile = await getProfile(account);

            const roleParts = account.sk_game_role.split("_");
            const uid = roleParts[1] || account.sk_game_role;

            const stored: StoredAccount = {
                account,
                profile,
                uid,
                lastUpdated: Date.now(),
            };

            try {
                const gameStats = await this.fetchGameStats(account);
                if (gameStats) {
                    stored.game = gameStats;
                    if (gameStats.nickname) {
                        if (stored.profile) {
                            stored.profile.nickname = gameStats.nickname;
                        } else {
                            stored.profile = {
                                userId: "",
                                nickname: gameStats.nickname,
                                avatar: "",
                            };
                        }
                    }
                }
            } catch {
                // Ignore silent errors at boot
            }

            this.accounts.push(stored);

            if (profile || (stored.game?.nickname)) {
                const stats = stored.game ? ` (Lv.${stored.game.level}, ${stored.game.charCount} Chars)` : "";
                const name = stored.profile?.nickname || account.name;
                ak.Logger.info(`  ${account.name}: ${name}${stats} (UID: ${uid})`);
            } else {
                ak.Logger.warn(`  ${account.name}: Could not fetch profile (UID: ${uid})`);
            }
        }

        ak.Logger.info(`Initialized ${this.accounts.length} ${this.name} account(s)`);
    }

    async checkIn(): Promise<SignInResult[]> {
        const { CheckIn } = await import("./check-in");
        const ci = new CheckIn(this);
        return await ci.execute();
    }

    async fetchGameStats(account: Account, options: { bypassCache?: boolean } = {}): Promise<StoredAccount["game"] | null> {
        const cacheKey = `stats:endfield:${account.name}`;

        if (!options.bypassCache) {
            const cached = cache.get<StoredAccount["game"]>(cacheKey);
            if (cached) return cached;
        }

        try {
            const detailResponse = await ak.Got<ApiResponse<{ detail: {
                base: { name: string; level: number; worldLevel: number; charNum: number; weaponNum: number };
                spaceShip: { rooms: Array<{ id: string; level: number }> };
                dungeon: { curStamina: string | number; maxStamina: string | number; maxTs?: string | number };
                bpSystem: { curLevel: number; maxLevel: number };
                dailyMission: { dailyActivation: number; maxDailyActivation: number };
            } }>>("SKPortApp", {
                url: "game/endfield/card/detail",
                method: "GET",
            }, { account });

            if (detailResponse.code === 0 && detailResponse.data?.detail) {
                const d = detailResponse.data.detail;
                const stats: StoredAccount["game"] = {
                    nickname: d.base.name,
                    level: d.base.level,
                    worldLevel: d.base.worldLevel,
                    charCount: d.base.charNum,
                    weaponCount: d.base.weaponNum,
                    serverName: "Asia",
                    stamina: {
                        current: Number(d.dungeon.curStamina),
                        max: Number(d.dungeon.maxStamina),
                        recoveryTime: d.dungeon.maxTs ? Number(d.dungeon.maxTs) : undefined,
                    },
                    bp: {
                        level: d.bpSystem.curLevel,
                        maxLevel: d.bpSystem.maxLevel,
                    },
                    daily: {
                        activation: d.dailyMission.dailyActivation,
                        maxActivation: d.dailyMission.maxDailyActivation,
                    },
                };

                cache.set(cacheKey, stats, 10 * 60 * 1000);
                return stats;
            }
            return null;
        } catch (error) {
            ak.Logger.debug(`fetchGameStats failed: ${error}`);
            return null;
        }
    }
}

export default Endfield;

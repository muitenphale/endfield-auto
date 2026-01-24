import type { GotModule, GotModuleOptions } from "../../classes/got.js";
import type { Account } from "../../utils/config.js";

export interface SKPortOptions {
    account: Account;
    includeGameRole?: boolean;
}

/**
 * Base SKPort Got module - contains shared auth headers
 * Children: SKPortWeb, SKPortApp
 */
const skportGot: GotModule = {
    name: "SKPort",
    optionsType: "function",
    options: (...args: unknown[]): GotModuleOptions => {
        const opts = args[0] as SKPortOptions;
        const { account, includeGameRole = true } = opts;
        const timestamp = Math.floor(Date.now() / 1000).toString();

        const headers: Record<string, string> = {
            "cred": account.cred,
            "priority": "u=1, i",
            "sk-language": "en",
            "timestamp": timestamp,
            "vname": "1.0.0",
        };

        if (includeGameRole) {
            headers["sk-game-role"] = account.sk_game_role;
        }

        return { headers };
    },
    parent: "Global",
    description: "Base SKPort API client with authentication headers",
};

export default skportGot;

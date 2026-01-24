import * as cache from "../../skport/cache";

export default {
    name: "cache-cleanup",
    expression: "* * * * *",
    description: "Cleanup expired cache entries every minute",
    code: async () => {
        cache.cleanup();
    }
};

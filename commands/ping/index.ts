import type { CommandModule, CommandContext } from "../../classes/command.js";

const ping: CommandModule = {
    name: "ping",
    description: "Check if the bot is alive",
    aliases: ["p"],
    run: async (ctx: CommandContext) => {
        await ctx.ephemeral("Pong! 🏓");
    }
};

export default ping;

import { readdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import type { CommandModule } from "../classes/command";
import logger from "../utils/logger";

const __dirname = dirname(fileURLToPath(import.meta.url));

export async function loadCommands(): Promise<CommandModule[]> {
    const commands: CommandModule[] = [];
    const items = readdirSync(__dirname, { withFileTypes: true });

    for (const item of items) {
        if (item.isDirectory()) {
            const dirName = item.name;
            const indexPath = join(__dirname, dirName, "index.ts");
            const indexJsPath = join(__dirname, dirName, "index.js");

            if (existsSync(indexPath) || existsSync(indexJsPath)) {
                const fileToImport = existsSync(indexJsPath) ? indexJsPath : indexPath;
                const moduleUrl = pathToFileURL(fileToImport).href;

                try {
                    const mod = await import(moduleUrl);
                    const command = mod.default || mod;
                    if (command && typeof command === "object" && "name" in command) {
                        commands.push(command as CommandModule);
                    }
                } catch (error) {
                    logger.error(`Failed to load command from ${dirName}:`, { error });
                }
            }
        }
    }

    return commands;
}

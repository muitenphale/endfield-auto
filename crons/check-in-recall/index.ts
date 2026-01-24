import type { CheckInResult } from "../../skport/endfield/check-in";

const ENDFIELD_ICON = "https://play-lh.googleusercontent.com/IHJeGhqSpth4VzATp_afjsCnFRc-uYgGC1EV3b2tryjyZsVrbcaeN5L_m8VKwvOSpIu_Skc49mDpLsAzC6Jl3mM";
const EMBED_COLOR_SUCCESS = 0xFFD700;
const EMBED_COLOR_ALREADY = 0x3498DB;
const EMBED_COLOR_ERROR = 0xE74C3C;

function buildDiscordEmbed(result: CheckInResult) {
    const { name, status, rewards, profile, error } = result;
    const nickname = profile.nickname || name;
    const avatar = profile.avatar || ENDFIELD_ICON;

    let title: string;
    let description: string;
    let color: number;
    let fields: Array<{ name: string; value: string; inline: boolean }> = [];
    let thumbnail = ENDFIELD_ICON;

    switch (status) {
    case "claimed":
        color = EMBED_COLOR_SUCCESS;
        title = "Daily Sign-in Claimed";
        description = `Successfully claimed rewards for **${nickname}**`;
        if (rewards.length > 0) {
            const rewardsText = rewards
                .map((r) => `- **${r.name}** x${r.count}`)
                .join("\n");
            fields = [{ name: "Rewards", value: rewardsText, inline: false }];
            thumbnail = rewards[0]?.icon || ENDFIELD_ICON;
        }
        break;
    case "already_claimed":
        color = EMBED_COLOR_ALREADY;
        title = "Already Signed In";
        description = `**${nickname}** has already claimed today's rewards`;
        break;
    case "error":
    default:
        color = EMBED_COLOR_ERROR;
        title = "Sign-in Failed";
        description = `Could not complete sign-in for **${nickname}**`;
        if (error) {
            fields = [{ name: "Error", value: error, inline: false }];
        }
        break;
    }

    return {
        title,
        description,
        color,
        thumbnail: { url: thumbnail },
        fields,
        footer: { text: `Account: ${name}`, icon_url: avatar },
        timestamp: new Date().toISOString(),
    };
}

export default {
    name: "check-in-recall",
    expression: "0 23 * * *",
    description: "Safety check for missed sign-ins 1 hour before midnight",
    code: async () => {
        ak.Logger.info("Running sign-in recall check...");

        const endfield = ak.SKPort.get("endfield");
        if (!endfield) {
            ak.Logger.error("Endfield game instance not found");
            return;
        }

        const results = await endfield.checkIn();

        const needsNotification = results.some(r => r.status === "claimed" || r.status === "error");

        if (needsNotification) {
            ak.Logger.info("=".repeat(50));
            ak.Logger.info("Sign-in recall summary");

            for (const result of results) {
                if (result.status === "already_claimed") continue;

                let status: string;
                switch (result.status) {
                case "claimed":
                    status = "Claimed (Missed earlier!)";
                    break;
                default:
                    status = "Error";
                }
                ak.Logger.info(`  ${status} - ${result.name}`);
            }

            for (const platform of ak.Platforms.values()) {
                if (platform.isConfigured()) {
                    for (const result of results) {
                        if (result.status === "already_claimed") continue;

                        if (platform.name === "Discord") {
                            const embed = buildDiscordEmbed(result);
                            await platform.send({ embeds: [embed] });
                        } else {
                            await platform.send(`${result.name}: ${result.status}`);
                        }
                    }
                }
            }
        } else {
            ak.Logger.info("All accounts already signed in. No recall action needed.");
        }
    }
};

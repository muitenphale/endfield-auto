/**
 * Arknights: Endfield Google Apps Script Check-in Support
 *
 * This script is a standalone Google Apps Script (GAS) that performs
 * daily check-ins for Arknights: Endfield accounts.
 */

const ACCOUNTS = [
    {
        name: "My Account 1",
        cred: "YOUR_CRED_HERE",
        sk_game_role: "YOUR_ROLE_HERE"
    }
];

const DISCORD_WEBHOOK_URL = "";

const BASE_URL = "https://zonai.skport.com/web/v1";
const ENDPOINT = "game/endfield/attendance";

const ENDFIELD_ICON = "https://play-lh.googleusercontent.com/IHJeGhqSpth4VzATp_afjsCnFRc-uYgGC1EV3b2tryjyZsVrbcaeN5L_m8VKwvOSpIu_Skc49mDpLsAzC6Jl3mM";
const COLOR_SUCCESS = 0xFFD700;
const COLOR_ALREADY = 0x3498DB;
const COLOR_ERROR = 0xE74C3C;

function main() {
    ACCOUNTS.forEach(account => {
        try {
            processAccount(account);
        } catch (e) {
            console.error(`Error [${account.name}]: ${e.message}`);
            sendNotification(account, "Sign-in Failed", e.message, COLOR_ERROR);
        }
    });
}

function processAccount(account) {
    const { cred, sk_game_role } = account;
    if (!cred || !sk_game_role) throw new Error("Missing credentials");

    const headers = {
        "cred": cred,
        "sk-game-role": sk_game_role,
        "platform": "3",
        "sk-language": "en",
        "timestamp": Math.floor(Date.now() / 1000).toString(),
        "vname": "1.0.0",
        "Referer": "https://game.skport.com/",
        "Origin": "https://game.skport.com",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36"
    };

    const checkResponse = UrlFetchApp.fetch(`${BASE_URL}/${ENDPOINT}`, {
        method: "get",
        headers: headers,
        muteHttpExceptions: true
    });

    const checkData = JSON.parse(checkResponse.getContentText());
    if (checkData.code !== 0) throw new Error(checkData.message);

    if (checkData.data.hasToday) {
        sendNotification(account, "Already Signed In", `**${account.name}** has already claimed today's rewards`, COLOR_ALREADY);
        return;
    }

    const claimResponse = UrlFetchApp.fetch(`${BASE_URL}/${ENDPOINT}`, {
        method: "post",
        headers: headers,
        muteHttpExceptions: true
    });

    const claimData = JSON.parse(claimResponse.getContentText());
    if (claimData.code !== 0) throw new Error(claimData.message);

    const rewardsText = claimData.data.awardIds.map(award => {
        const info = claimData.data.resourceInfoMap[award.id];
        return info ? `- **${info.name}** x${info.count}` : award.id;
    }).join("\n");

    const firstRewardIcon = claimData.data.awardIds[0] ? claimData.data.resourceInfoMap[claimData.data.awardIds[0].id]?.icon : null;

    sendNotification(account, "Daily Sign-in Claimed", `Successfully claimed rewards for **${account.name}**\n\n${rewardsText}`, COLOR_SUCCESS, firstRewardIcon);
}

function sendNotification(account, title, description, color, thumbnail) {
    if (!DISCORD_WEBHOOK_URL) return;

    const payload = {
        embeds: [{
            title: title,
            description: description,
            color: color,
            thumbnail: { url: thumbnail || ENDFIELD_ICON },
            footer: { text: "SKPort Auto Check-In", icon_url: ENDFIELD_ICON },
            timestamp: new Date().toISOString()
        }]
    };

    UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, {
        method: "post",
        contentType: "application/json",
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
    });
}

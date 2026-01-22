#!/usr/bin/env python3
"""
Arknights: Endfield Daily Sign-in Script
Supports multiple accounts and Discord webhook notifications
"""

import requests
import time
import json
import os
from datetime import datetime, timezone

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")
BASE_URL = "https://zonai.skport.com/web/v1"

ENDFIELD_ICON = "https://play-lh.googleusercontent.com/IHJeGhqSpth4VzATp_afjsCnFRc-uYgGC1EV3b2tryjyZsVrbcaeN5L_m8VKwvOSpIu_Skc49mDpLsAzC6Jl3mM"
EMBED_COLOR_SUCCESS = 0xFFD700
EMBED_COLOR_ALREADY = 0x3498DB
EMBED_COLOR_ERROR = 0xE74C3C


def load_config():
    """Load configuration from config.json"""
    if not os.path.exists(CONFIG_PATH):
        print(f"❌ Config file not found: {CONFIG_PATH}")
        print("Please create config.json with your credentials:")
        print("""{
    "accounts": [
        {
            "name": "Account1",
            "cred": "YOUR_CRED_TOKEN",
            "sk_game_role": "YOUR_GAME_ROLE"
        }
    ],
    "discord_webhook": "OPTIONAL_WEBHOOK_URL"
}""")
        exit(1)

    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def get_headers(account, include_game_role=True):
    """Generate request headers for a specific account"""
    timestamp = str(int(time.time()))

    headers = {
        "accept": "*/*",
        "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json",
        "cred": account["cred"],
        "platform": "3",
        "priority": "u=1, i",
        "sec-ch-ua": '"Google Chrome";v="143", "Chromium";v="143", "Not A(Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "sk-language": "en",
        "timestamp": timestamp,
        "vname": "1.0.0",
        "Referer": "https://game.skport.com/",
        "Origin": "https://game.skport.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
    }

    if include_game_role:
        headers["sk-game-role"] = account["sk_game_role"]

    return headers


def check_attendance(account):
    """Check current attendance status"""
    print("  Checking attendance status...")

    url = f"{BASE_URL}/game/endfield/attendance"
    headers = get_headers(account)

    try:
        response = requests.get(url, headers=headers)
        data = response.json()

        if data.get("code") == 0:
            has_today = data.get("data", {}).get("hasToday", False)
            return data, not has_today
        else:
            print(f"  ❌ Error: {data.get('message', 'Unknown error')}")
            return data, False

    except Exception as e:
        print(f"  ❌ Request failed: {e}")
        return None, False


def claim_attendance(account):
    """Claim daily attendance reward - returns (success, rewards_list)"""
    print("  Claiming attendance reward...")

    url = f"{BASE_URL}/game/endfield/attendance"
    headers = get_headers(account)

    try:
        response = requests.post(url, headers=headers)
        data = response.json()

        if data.get("code") == 0:
            print("  ✅ Successfully claimed attendance!")
            awards = data.get("data", {}).get("awardIds", [])
            resource_map = data.get("data", {}).get("resourceInfoMap", {})

            rewards = []
            if awards:
                print("  🎁 Rewards received:")
                for award in awards:
                    award_id = award.get("id")
                    info = resource_map.get(award_id, {})
                    name = info.get("name", award_id)
                    count = info.get("count", 1)
                    icon = info.get("icon", "")
                    print(f"     - {name} x{count}")
                    rewards.append({"name": name, "count": count, "icon": icon})
            return True, rewards
        else:
            print(f"  ❌ Error: {data.get('message', 'Unknown error')}")
            return False, []

    except Exception as e:
        print(f"  ❌ Request failed: {e}")
        return False, []


def get_profile(account):
    """Get user profile info"""
    url = f"{BASE_URL}/wiki/me"
    headers = get_headers(account, include_game_role=False)

    try:
        response = requests.get(url, headers=headers)
        data = response.json()

        if data.get("code") == 0:
            user = data.get("data", {}).get("user", {})
            return {
                "nickname": user.get("nickname", "Unknown"),
                "user_id": user.get("userId", "Unknown"),
                "avatar": user.get("avatar", ENDFIELD_ICON),
            }
        else:
            return None

    except Exception:
        return None


def is_valid_webhook(url):
    """Check if webhook URL is valid"""
    if url is None:
        return False
    if not isinstance(url, str):
        return False
    if not url.strip():
        return False
    if not url.startswith("http"):
        return False
    return True


def send_discord_webhook(webhook_url, account_results):
    """Send results to Discord webhook with rich embeds"""
    if not is_valid_webhook(webhook_url):
        return

    print("\n📤 Sending Discord notification...")

    embeds = []

    for result in account_results:
        name = result["name"]
        status = result["status"]  # "claimed", "already_claimed", "error"
        rewards = result.get("rewards", [])
        profile = result.get("profile", {})
        nickname = profile.get("nickname", name)
        avatar = profile.get("avatar", ENDFIELD_ICON)

        if status == "claimed":
            color = EMBED_COLOR_SUCCESS
            title = "✅ Daily Sign-in Claimed!"
            description = f"Successfully claimed rewards for **{nickname}**"

            if rewards:
                rewards_text = "\n".join(
                    [f"• **{r['name']}** x{r['count']}" for r in rewards]
                )
                fields = [
                    {"name": "🎁 Rewards", "value": rewards_text, "inline": False}
                ]
            else:
                fields = []

            thumbnail = (
                rewards[0]["icon"]
                if rewards and rewards[0].get("icon")
                else ENDFIELD_ICON
            )

        elif status == "already_claimed":
            color = EMBED_COLOR_ALREADY
            title = "📅 Already Signed In"
            description = f"**{nickname}** has already claimed today's rewards"
            fields = []
            thumbnail = ENDFIELD_ICON

        else:  # error
            color = EMBED_COLOR_ERROR
            title = "❌ Sign-in Failed"
            description = f"Could not complete sign-in for **{nickname}**"
            error_msg = result.get("error", "Unknown error")
            fields = [{"name": "Error", "value": error_msg, "inline": False}]
            thumbnail = ENDFIELD_ICON

        embed = {
            "title": title,
            "description": description,
            "color": color,
            "thumbnail": {"url": thumbnail},
            "fields": fields,
            "footer": {"text": f"Account: {name}", "icon_url": avatar},
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }

        embeds.append(embed)

    payload = {
        "username": "Endfield Sign-in",
        "avatar_url": ENDFIELD_ICON,
        "embeds": embeds[:10],
    }

    try:
        response = requests.post(webhook_url, json=payload)
        if response.status_code == 204:
            print("  ✅ Discord notification sent!")
        else:
            print(f"  ⚠️ Discord webhook returned: {response.status_code}")
    except Exception as e:
        print(f"  ❌ Failed to send Discord notification: {e}")


def process_account(account, index):
    """Process a single account - returns result dict for webhook"""
    name = account.get("name", f"Account {index + 1}")

    print("\n" + "=" * 50)
    print(f"📱 Account: {name}")
    print("=" * 50)

    result = {
        "name": name,
        "status": "error",
        "rewards": [],
        "profile": {},
        "error": None,
    }

    if not account.get("cred") or not account.get("sk_game_role"):
        print("  ❌ Missing cred or sk_game_role in config")
        result["error"] = "Missing cred or sk_game_role in config"
        return result

    role_parts = account["sk_game_role"].split("_")
    uid = role_parts[1] if len(role_parts) >= 2 else account["sk_game_role"]
    print(f"  UID: {uid}")

    profile = get_profile(account)
    if profile:
        result["profile"] = profile
        print(f"  ✅ Logged in as: {profile['nickname']} (ID: {profile['user_id']})")
    else:
        print("  ⚠️  Could not verify profile. Continuing anyway...")

    attendance_data, can_claim = check_attendance(account)

    if can_claim:
        success, rewards = claim_attendance(account)
        if success:
            result["status"] = "claimed"
            result["rewards"] = rewards
        else:
            result["status"] = "error"
            result["error"] = "Failed to claim attendance"
    elif attendance_data and attendance_data.get("code") == 0:
        print("  📅 Already signed in today. Nothing to claim.")
        result["status"] = "already_claimed"
    else:
        print("  ⚠️  Could not determine attendance status.")
        result["error"] = "Could not determine attendance status"

    return result


def main():
    print("=" * 50)
    print("🎮 Arknights: Endfield Daily Sign-in")
    print("=" * 50)

    config = load_config()
    accounts = config.get("accounts", [])
    webhook_url = config.get("discord_webhook")

    if not accounts:
        print("❌ No accounts found in config.json")
        print("Please add accounts to the 'accounts' array.")
        exit(1)

    print(f"\nFound {len(accounts)} account(s) in config")
    if is_valid_webhook(webhook_url):
        print("📣 Discord notifications enabled")

    account_results = []
    for i, account in enumerate(accounts):
        result = process_account(account, i)
        account_results.append(result)

        if i < len(accounts) - 1:
            time.sleep(1)

    # Summary
    print("📊 Summary")
    print("=" * 50)
    for result in account_results:
        if result["status"] == "claimed":
            status = "✅ Claimed"
        elif result["status"] == "already_claimed":
            status = "📅 Already claimed"
        else:
            status = "❌ Error"
        print(f"  {status} - {result['name']}")

    success_count = sum(
        1 for r in account_results if r["status"] in ["claimed", "already_claimed"]
    )
    print(
        f"\n  Total: {success_count}/{len(account_results)} accounts processed successfully"
    )

    if is_valid_webhook(webhook_url):
        send_discord_webhook(webhook_url, account_results)


if __name__ == "__main__":
    main()

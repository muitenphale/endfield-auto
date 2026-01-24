<p align="center">
  <img src="https://play-lh.googleusercontent.com/IHJeGhqSpth4VzATp_afjsCnFRc-uYgGC1EV3b2tryjyZsVrbcaeN5L_m8VKwvOSpIu_Skc49mDpLsAzC6Jl3mM" width="128" height="128" alt="Endfield Field Assistant">
</p>

<h1 align="center">Protocol Assistant: Endfield</h1>

<p align="center">
  An advanced automation and monitoring suite for <b>Arknights: Endfield</b> via SKPort.
</p>

<p align="center">
  <a href="#key-features">Features</a> •
  <a href="#deployment">Deployment</a> •
  <a href="#field-commands">Commands</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#obtaining-credentials">Credentials</a>
</p>

---

## Key Features

-   Automated Attendance: Executes daily sign-ins across all configured accounts.
-   Stamina Monitoring: Tracks current stamina and calculates exactly when it will reach maximum capacity.
-   Interactive Terminal: Real-time insights into level, world level, BP progress, and daily mission activation.
-   Discord Integration: Slash Command support and rich webhook notifications.
-   Multi-Account: Manage multiple Arknights: Endfield accounts from a single instance.

---

## Deployment

### Prerequisites
-   [Bun](https://bun.sh/) (Recommended) or [Node.js](https://nodejs.org/) (v18+)
-   An Arknights: Endfield account

### Setup
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/torikushiii/endfield-auto.git
    cd endfield-auto
    ```

2.  **Install Dependencies**:
    ```bash
    bun install
    # or
    npm install
    ```

3.  **Initialize Configuration**:
    Copy the example config and fill in your details:
    ```bash
    cp example.config.json config.json
    ```

4.  **Start the Assistant**:
    ```bash
    bun index.ts
    # or
    npm start
    ```

---

## Field Commands

The assistant provides powerful Discord Slash Commands for manual monitoring and operations.

| Command | Alias | Description |
| :--- | :--- | :--- |
| `/terminal [account]` | `/stats`, `/stamina` | Displays full protocol status (Stamina, BP, Dailies, Progression). Supports account filtering. |
| `/check-in` | `/ci` | Manually triggers the daily attendance claim for all accounts. |

---

## Configuration

The `config.json` is the central brain of the assistant.

```json
{
    "accounts": [
        {
            "name": "Operator-Alpha",
            "cred": "YOUR_CRED_TOKEN",
            "sk_game_role": "SERVER_UID_REST"
        }
    ],
    "platforms": [
        {
            "id": "discord_bot",
            "type": "discord",
            "active": true,
            "token": "BOT_TOKEN",
            "botId": "APPLICATION_ID"
        }
    ],
    "tasks": [
        {
            "name": "check-in",
            "scheduleTime": "30 1 * * *"
        }
    ]
}
```

### Configuration Breakdown
-   **`accounts`**: Your Endfield credentials.
-   **`platforms`**: Discord integration settings. Supports `discord` (bot with commands) or `webhook` (notifications only).
-   **`tasks`**: Cron schedules for automated operations.

---

## Obtaining Credentials

To connect the assistant to your account:

1.  Log in to the [SKPort Endfield Portal](https://game.skport.com/endfield/sign-in).
2.  Open **Developer Tools** (F12) -> **Network Tab**.
3.  Perform any action (or refresh) and find a request to `zonai.skport.com`.
4.  Copy the `cred` and `sk-game-role` (or `uid` as part of the role string) from the **Request Headers**.

---

## Disclaimer

This is an unofficial tool and is not affiliated with Hypergryph, Gryphline, or SKPort. Use of this tool may violate the terms of service. The authors are not responsible for any consequences of using this tool.

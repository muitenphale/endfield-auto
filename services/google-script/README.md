# Arknights: Endfield Google Script Check-in

A standalone Google Apps Script (GAS) service for Arknights: Endfield daily check-ins. This script allows you to automate your check-ins without hosting a server.

## Features

- **Standalone**: No server required, runs entirely on Google's infrastructure.
- **Multi-account Support**: Add multiple credentials to the `ACCOUNTS` array.
- **Discord Notifications**: Optional webhook integration for success/status alerts.
- **Easy Setup**: Just copy-paste and configure.

## Setup Instructions

1.  **Open Google Apps Script**:
    - Go to [script.google.com](https://script.google.com/).
    - Click **Check New Project**.
2.  **Paste the Script**:
    - Open `services/google-script/index.js` in your local project.
    - Copy the entire content.
    - Delete any default code in the Google Script editor and paste the content.
3.  **Configure Accounts**:
    - Locate the `ACCOUNTS` array at the top of the script.
    - Fill in your `name`, `cred`, and `sk_game_role`.
    - You can find these values in your `config.json` file.
4.  **(Optional) Discord Webhook**:
    - If you want notifications, paste your Discord Webhook URL into `DISCORD_WEBHOOK_URL`.
5.  **Save & Test**:
    - Click the **Save** icon (rename the project to something like `Endfield Check-in`).
    - Select the `main` function in the toolbar and click **Run**.
    - Grant necessary permissions (Google will ask for permission to use `UrlFetch`).
    - Check the **Execution Log** at the bottom to see if it worked.
6.  **Automate**:
    - Click the **Triggers** icon (clock icon on the left sidebar).
    - Click **+ Add Trigger**.
    - Choose `main` as the function to run.
    - Select **Time-driven** event source.
    - Select **Day timer** and choose a preferred time (e.g., 1am to 2am).
    - Click **Save**.

## Integration with this Project

The Google Script is a **separate module** and does not connect to the main Node.js/Bun project. It is intended as an alternative or redundant way to perform check-ins.

You can copy your account information directly from your `config.json` to the script's `ACCOUNTS` array.

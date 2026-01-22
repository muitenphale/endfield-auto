#!/usr/bin/env python3
"""
SKPort Auto Scheduler
Runs the sign-in script at specified times using Python-based scheduling
"""

import schedule
import time
import subprocess
import os
import json
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
MAIN_SCRIPT = os.path.join(SCRIPT_DIR, "main.py")
CONFIG_PATH = os.path.join(SCRIPT_DIR, "config.json")


def load_config():
    """Load configuration from config.json"""
    if not os.path.exists(CONFIG_PATH):
        print(f"❌ Config file not found: {CONFIG_PATH}")
        return {}

    with open(CONFIG_PATH, "r") as f:
        return json.load(f)


def run_signin():
    """Execute the main sign-in script"""
    print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Running sign-in...")
    print("=" * 50)

    try:
        result = subprocess.run(
            [sys.executable, MAIN_SCRIPT], cwd=SCRIPT_DIR, capture_output=False
        )
        if result.returncode == 0:
            print(
                f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Sign-in completed successfully"
            )
        else:
            print(
                f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Sign-in completed with errors"
            )
    except Exception as e:
        print(f"\n[{time.strftime('%Y-%m-%d %H:%M:%S')}] Error running sign-in: {e}")


def main():
    config = load_config()
    schedule_time = config.get("schedule_time", "00:00")

    schedule.every().day.at(schedule_time).do(run_signin)

    print("=" * 50)
    print("SKPort Auto Scheduler")
    print("=" * 50)
    print("\nScheduled jobs:")
    for job in schedule.get_jobs():
        print(f"  - {job}")
    print(f"\nNext run: {schedule.next_run()}")
    print("\nScheduler is running. Press Ctrl+C to stop.")
    print("-" * 50)

    run_signin()

    while True:
        schedule.run_pending()
        time.sleep(60)


if __name__ == "__main__":
    main()

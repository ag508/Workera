from playwright.sync_api import sync_playwright
import time
import os

def run():
    if not os.path.exists('/home/jules/verification'):
        os.makedirs('/home/jules/verification')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Landing Page
        print("Navigating to Landing Page...")
        try:
            page.goto("http://localhost:3000", timeout=60000)
            # wait for specific text to ensure hydration
            page.wait_for_selector('text=Recruitment Automation')
            page.screenshot(path="/home/jules/verification/landing.png", full_page=True)
            print("Landing screenshot saved.")
        except Exception as e:
            print(f"Landing failed: {e}")

        # Dashboard
        print("Navigating to Dashboard...")
        try:
            page.goto("http://localhost:3000/dashboard", timeout=60000)
            page.wait_for_selector('text=Activity Feed')
            page.screenshot(path="/home/jules/verification/dashboard.png", full_page=True)
            print("Dashboard screenshot saved.")
        except Exception as e:
            print(f"Dashboard failed: {e}")

        # Candidates
        print("Navigating to Candidates...")
        try:
            page.goto("http://localhost:3000/dashboard/candidates", timeout=60000)
            page.wait_for_selector('text=Candidates')
            page.screenshot(path="/home/jules/verification/candidates.png", full_page=True)
            print("Candidates screenshot saved.")
        except Exception as e:
            print(f"Candidates failed: {e}")

        browser.close()

if __name__ == "__main__":
    run()

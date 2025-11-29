from playwright.sync_api import sync_playwright
import time
import os

def run():
    if not os.path.exists("verification"):
        os.makedirs("verification")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Context 1: Public & Dashboard
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        # Landing
        try:
            print("Capturing Landing...")
            page.goto("http://localhost:3000")
            time.sleep(2)
            page.screenshot(path="verification/01_landing_v2.png", full_page=True)
        except Exception as e: print(e)

        # Demo Jobs (Static)
        try:
            print("Capturing Demo Jobs...")
            page.goto("http://localhost:3000/demo")
            time.sleep(2)
            page.screenshot(path="verification/99_demo_jobs.png", full_page=True)
        except Exception as e: print(e)

        # Dashboard Jobs (Real/Fallback)
        try:
            print("Capturing Dashboard Jobs...")
            page.goto("http://localhost:3000/dashboard/jobs")
            time.sleep(2)
            page.screenshot(path="verification/06_dashboard_jobs_v2.png", full_page=True)
        except Exception as e: print(e)

        # Dashboard Candidates
        try:
            print("Capturing Candidates...")
            page.goto("http://localhost:3000/dashboard/candidates")
            time.sleep(2)
            page.screenshot(path="verification/04_dashboard_candidates_v2.png", full_page=True)
        except Exception as e: print(e)

        page.close()
        context.close()
        browser.close()

if __name__ == "__main__":
    run()

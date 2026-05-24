#!/usr/bin/env python3
"""
ZAMZAM CARS — One-command setup script.

What this does:
    1. Verifies zamzamcar.zip is in the same folder
    2. Extracts it to ./zamzamcar/
    3. Checks for Node.js
    4. Installs dependencies (auto-detects pnpm/npm/yarn)
    5. Offers to start the dev server

Usage:
    1. Download zamzamcar.zip and setup.py to the same folder
    2. Open terminal there
    3. Run:  python3 setup.py
       (on Windows:  python setup.py)
"""

import os
import sys
import shutil
import subprocess
import zipfile
from pathlib import Path


# ── Colors for terminal output ──────────────────────────────────────────────
class C:
    GREEN = "\033[92m"
    BLUE = "\033[94m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    END = "\033[0m"

    @staticmethod
    def disable_on_windows():
        if sys.platform == "win32" and not os.environ.get("WT_SESSION"):
            for attr in ("GREEN", "BLUE", "YELLOW", "RED", "BOLD", "END"):
                setattr(C, attr, "")


C.disable_on_windows()


def header(text):
    print(f"\n{C.BOLD}{C.BLUE}━━━ {text} ━━━{C.END}\n")


def success(text):
    print(f"{C.GREEN}✓{C.END} {text}")


def warn(text):
    print(f"{C.YELLOW}⚠{C.END}  {text}")


def error(text):
    print(f"{C.RED}✗{C.END} {text}")


def info(text):
    print(f"  {text}")


def fail(text):
    error(text)
    print(f"\n{C.RED}Setup aborted.{C.END}\n")
    sys.exit(1)


# ── Steps ───────────────────────────────────────────────────────────────────

def step_check_zip():
    """Verify zamzamcar.zip exists in current directory."""
    header("Step 1/4: Locate project archive")

    zip_path = Path.cwd() / "zamzamcar.zip"
    if not zip_path.exists():
        error("zamzamcar.zip not found in this folder.")
        info(f"Current folder: {Path.cwd()}")
        info("")
        info("Download zamzamcar.zip from Claude and put it next to this script,")
        info("then run this script again.")
        sys.exit(1)

    size_kb = zip_path.stat().st_size // 1024
    success(f"Found zamzamcar.zip ({size_kb} KB)")
    return zip_path


def step_extract(zip_path):
    """Extract zip to ./zamzamcar/"""
    header("Step 2/4: Extract project files")

    target = Path.cwd() / "zamzamcar"

    if target.exists():
        warn(f"Folder '{target.name}' already exists.")
        choice = input("  Overwrite? (y/N): ").strip().lower()
        if choice != "y":
            info("Keeping existing folder. Skipping extraction.")
            return target
        shutil.rmtree(target)
        success("Removed old folder")

    print(f"  Extracting to: {target}")
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            zf.extractall(Path.cwd())
        file_count = sum(1 for _ in target.rglob("*") if _.is_file())
        success(f"Extracted {file_count} files")
    except zipfile.BadZipFile:
        fail("zamzamcar.zip is corrupted. Re-download it from Claude.")

    return target


def step_check_node():
    """Verify Node.js 20+ is installed."""
    header("Step 3/4: Check Node.js")

    try:
        result = subprocess.run(
            ["node", "--version"],
            capture_output=True,
            text=True,
            check=True,
        )
        version = result.stdout.strip()
        success(f"Node.js {version} installed")

        # Parse version: "v20.10.0" → 20
        major = int(version.lstrip("v").split(".")[0])
        if major < 20:
            warn(f"Node.js {version} is older than recommended (v20+).")
            warn("Next.js 15 may not work correctly. Consider upgrading.")
            info("Download: https://nodejs.org")
    except (subprocess.CalledProcessError, FileNotFoundError):
        error("Node.js is not installed.")
        info("")
        info("Install Node.js 20+ from: https://nodejs.org")
        info("Then run this script again.")
        sys.exit(1)


def detect_package_manager():
    """Pick the best available package manager."""
    for cmd in ("pnpm", "npm", "yarn"):
        if shutil.which(cmd):
            return cmd
    return None


def step_install(project_dir):
    """Run package install."""
    header("Step 4/4: Install dependencies")

    pm = detect_package_manager()
    if pm is None:
        error("No package manager found (npm/pnpm/yarn).")
        info("npm should come with Node.js — reinstall Node.js from nodejs.org.")
        sys.exit(1)

    success(f"Using package manager: {pm}")
    info("This takes 1-3 minutes the first time...")
    print()

    try:
        # shell=True on Windows so .cmd files resolve properly
        is_windows = sys.platform == "win32"
        subprocess.run(
            [pm, "install"],
            cwd=project_dir,
            check=True,
            shell=is_windows,
        )
        print()
        success("Dependencies installed")
    except subprocess.CalledProcessError:
        error("Install failed. Common fixes:")
        info("  • Check your internet connection")
        info(f"  • Run manually:  cd zamzamcar && {pm} install")
        info("  • Delete node_modules and try again")
        sys.exit(1)

    return pm


def step_offer_dev_server(project_dir, pm):
    """Optionally start the dev server."""
    header("All done! 🎉")

    print(f"  Project folder:  {C.BOLD}{project_dir}{C.END}")
    print(f"  Package manager: {pm}")
    print()
    print(f"{C.BOLD}Next steps:{C.END}")
    print(f"  1. Start dev server:  cd zamzamcar && {pm} dev")
    print(f"  2. Open browser:      http://localhost:3000")
    print()
    print("To deploy to Vercel, see DEPLOYMENT-GUIDE.md")
    print()

    choice = input("Start dev server now? (Y/n): ").strip().lower()
    if choice in ("", "y", "yes"):
        print()
        info("Starting dev server... (press Ctrl+C to stop)")
        print()
        try:
            is_windows = sys.platform == "win32"
            subprocess.run(
                [pm, "dev"],
                cwd=project_dir,
                shell=is_windows,
            )
        except KeyboardInterrupt:
            print("\n\nDev server stopped.")


# ── Main ────────────────────────────────────────────────────────────────────

def main():
    print(f"\n{C.BOLD}🚀 ZAMZAM CARS — Setup{C.END}")
    print("=" * 40)

    try:
        zip_path = step_check_zip()
        project_dir = step_extract(zip_path)
        step_check_node()
        pm = step_install(project_dir)
        step_offer_dev_server(project_dir, pm)
    except KeyboardInterrupt:
        print(f"\n\n{C.YELLOW}Cancelled by user.{C.END}\n")
        sys.exit(0)


if __name__ == "__main__":
    main()

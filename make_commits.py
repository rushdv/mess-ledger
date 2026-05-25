import subprocess
import os
import sys

# Change directory to script folder to be sure
os.chdir("/run/media/kali/Lab/Dev Stack/My Projects/mess-ledger")

def run_cmd(cmd):
    print(f"Executing: {cmd}")
    res = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if res.returncode != 0:
        print("Error details:")
        print("STDOUT:", res.stdout)
        print("STDERR:", res.stderr)
        return False
    return True

def commit_and_push(msg):
    if not run_cmd("git add -A"):
        return False
    # Check if there are changes
    status_res = subprocess.run("git diff --cached --quiet", shell=True)
    if status_res.returncode == 0:
        print(f"No changes to commit for: {msg}")
        return False
    if not run_cmd(f'git commit -m "{msg}"'):
        return False
    print("Attempting git push...")
    push_res = run_cmd("git push origin main")
    if not push_res:
        print("WARNING: git push failed. Continuing with local commits.")
    return True

# Helper to search and replace in a file
def replace_in_file(filepath, find_str, replace_str):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    if find_str not in content:
        print(f"Error: Target text not found in {filepath}: {find_str!r}")
        return False
    new_content = content.replace(find_str, replace_str)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    return True

commits = [
    # Commit 1 (already done manually - select-mess page fix)
    
    # 2. Update clone URL in README
    {
        "file": "README.md",
        "find": "git clone https://github.com/yourusername/mess-ledger.git",
        "replace": "git clone https://github.com/rushdv/mess-ledger.git",
        "msg": "docs: update clone url in README"
    },
    # 3. Update Vercel deploy link in README
    {
        "file": "README.md",
        "find": "repository-url=https://github.com/yourusername/mess-ledger",
        "replace": "repository-url=https://github.com/rushdv/mess-ledger",
        "msg": "docs: update Vercel deploy link in README"
    },
    # 4. Update bug report link in README
    {
        "file": "README.md",
        "find": "- 🐛 [Report a Bug](https://github.com/yourusername/mess-ledger/issues/new?labels=bug)",
        "replace": "- 🐛 [Report a Bug](https://github.com/rushdv/mess-ledger/issues/new?labels=bug)",
        "msg": "docs: update bug report link in README"
    },
    # 5. Update feature request link in README
    {
        "file": "README.md",
        "find": "- ✨ [Request a Feature](https://github.com/yourusername/mess-ledger/issues/new?labels=enhancement)",
        "replace": "- ✨ [Request a Feature](https://github.com/rushdv/mess-ledger/issues/new?labels=enhancement)",
        "msg": "docs: update feature request link in README"
    },
    # 6. Update Star History repos parameter in README
    {
        "file": "README.md",
        "find": "repos=yourusername/mess-ledger",
        "replace": "repos=rushdv/mess-ledger",
        "msg": "docs: update Star History repos parameter in README"
    },
    # 7. Update Star History link URL in README
    {
        "file": "README.md",
        "find": "https://star-history.com/#yourusername/mess-ledger",
        "replace": "https://star-history.com/#rushdv/mess-ledger",
        "msg": "docs: update Star History link URL in README"
    },
    # 8. Update author GitHub profile link in README
    {
        "file": "README.md",
        "find": "- GitHub: [@yourusername](https://github.com/rushdv/)",
        "replace": "- GitHub: [@rushdv](https://github.com/rushdv)",
        "msg": "docs: update author GitHub profile link in README"
    },
    # 9. Update author name in README
    {
        "file": "README.md",
        "find": "**Your Name**",
        "replace": "**Shihab Shahriar Rashu**",
        "msg": "docs: update author name in README"
    },
    # 10. Update author website link text in README
    {
        "file": "README.md",
        "find": "[yourwebsite.com](https://shihabshahriarrashu.vercel.app/)",
        "replace": "[shihabshahriarrashu.vercel.app](https://shihabshahriarrashu.vercel.app/)",
        "msg": "docs: update author website link text in README"
    },
    # 11. Fix broken unicode symbol for Advanced Features in README
    {
        "file": "README.md",
        "find": "###  Advanced Features",
        "replace": "### 🚀 Advanced Features",
        "msg": "docs: fix Advanced Features section emoji in README"
    },
    # 12. Fix broken unicode symbol for How It Works in README
    {
        "file": "README.md",
        "find": "##  How It Works",
        "replace": "## ⚙️ How It Works",
        "msg": "docs: fix How It Works section emoji in README"
    },
    # 13. Fix broken unicode symbol for License in README
    {
        "file": "README.md",
        "find": "##  License",
        "replace": "## 📄 License",
        "msg": "docs: fix License section emoji in README"
    },
    # 14. Add make_commits.py to gitignore
    {
        "file": ".gitignore",
        "find": "fix-*.sh",
        "replace": "fix-*.sh\nmake_commits.py",
        "msg": "chore: add make_commits.py to gitignore"
    },
    # 15. Add description comment to Providers component
    {
        "file": "src/app/providers.tsx",
        "find": '"use client";',
        "replace": '"use client";\n\n// Global providers for Next.js App (Theme & Session management)',
        "msg": "chore: add description comment to Providers component"
    },
    # 16. Add layout comments and docstrings
    {
        "file": "src/app/layout.tsx",
        "find": 'import "./globals.css";',
        "replace": 'import "./globals.css";\n\n// Root layout wrapper that sets up global HTML structure, fonts, and themes',
        "msg": "chore: add layout comments and docstrings"
    },
    # 17. Add comments to prisma client helper
    {
        "file": "src/lib/prisma.ts",
        "find": 'const globalForPrisma =',
        "replace": '// Prevent multiple instances of Prisma Client in development mode\nconst globalForPrisma =',
        "msg": "chore: add comments to prisma client helper"
    },
    # 18. Document cn utility in utils.ts
    {
        "file": "src/lib/utils.ts",
        "find": 'export function cn(',
        "replace": '// Combines tailwind classes safely using clsx and tailwind-merge\nexport function cn(',
        "msg": "chore: document cn utility in utils.ts"
    },
    # 19. Document formatCurrency utility in utils.ts
    {
        "file": "src/lib/utils.ts",
        "find": 'export function formatCurrency(',
        "replace": '// Formats a number as Bangladeshi Taka (BDT)\nexport function formatCurrency(',
        "msg": "chore: document formatCurrency utility in utils.ts"
    },
    # 20. Document formatDate utility in utils.ts
    {
        "file": "src/lib/utils.ts",
        "find": 'export function formatDate(',
        "replace": '// Formats a Date object or string as DD MMM YYYY (e.g. 26 May 2026)\nexport function formatDate(',
        "msg": "chore: document formatDate utility in utils.ts"
    },
    # 21. Add documentation to WelcomeModal component
    {
        "file": "src/components/welcome-modal.tsx",
        "find": 'export function WelcomeModal(',
        "replace": '// WelcomeModal component provides an onboarding guide for new and joined mess members\nexport function WelcomeModal(',
        "msg": "chore: add documentation to WelcomeModal component"
    },
    # 22. Add description comment to DashboardWelcome component
    {
        "file": "src/components/dashboard-welcome.tsx",
        "find": 'export function DashboardWelcome()',
        "replace": '// DashboardWelcome wrapper that triggers the welcome modal check on dashboard load\nexport function DashboardWelcome()',
        "msg": "chore: add description comment to DashboardWelcome component"
    },
    # 23. Add configuration comments in next.config.mjs
    {
        "file": "next.config.mjs",
        "find": 'const nextConfig = {',
        "replace": '// Next.js configuration with experimental serverActions allowedOrigins setting\nconst nextConfig = {',
        "msg": "chore: add configuration comments in next.config.mjs"
    },
    # 24. Add comments to tailwind config
    {
        "file": "tailwind.config.ts",
        "find": 'const config: Config = {',
        "replace": '// Tailwind CSS configuration using design system variables (shadcn/ui)\nconst config: Config = {',
        "msg": "chore: add comments to tailwind config"
    },
    # 25. Add description comment to PostCSS configuration
    {
        "file": "postcss.config.mjs",
        "find": 'const config = {',
        "replace": '// PostCSS configuration with Tailwind CSS and Autoprefixer\nconst config = {',
        "msg": "chore: add description comment to PostCSS configuration"
    }
]

print(f"Starting to make {len(commits)} commits...")
for idx, c in enumerate(commits, start=2):
    print(f"\n--- Commit {idx}: {c['msg']} ---")
    if replace_in_file(c['file'], c['find'], c['replace']):
        if commit_and_push(c['msg']):
            print(f"Successfully committed {c['msg']}")
        else:
            print(f"Failed to commit {c['msg']}")
    else:
        print(f"Failed to replace in file {c['file']}")

print("\nAll commits processed!")

Infinity: The Workspace-as-a-Service Engine 🚀
Infinity is a portable, modular, and resilient development ecosystem for Termux. Designed to grant you total freedom over your workspace, Infinity mirrors a professional-grade development environment without risking your base PREFIX.
Why Infinity?
 * Workspace Independence: Keep your $TOOLS bin separate from system files. Never break your shell configuration again.
 * Modular Ecosystem: Manage your tools, scripts, and environment variables as independent, versioned Debian packages.
 * Safe Bootstrapping: Install once, bootstrap your entire environment structure, and maintain it seamlessly with pkg upgrade.
 * Freedom: Delete, upgrade, or migrate your environment without leaving debris in your Android system.
Quick Start
To initialize your Infinity environment:
# 1. Add the repository
echo "deb [trusted=yes] https://corpustheking.github.io/infinity stable main" > $PREFIX/etc/apt/sources.list.d/infinity.list

# 2. Update and install core
pkg update && pkg install infinity-core

# 3. Bootstrap your workspace
infinity-init

Features
 * idoc (Instant Documentation): Every tool included in Infinity has its own documentation. Access them instantly with idoc <tool_name>.
 * Dynamic Aliasing: Easily map tools to your preferred commands without modifying global files using infinity-alias.
 * Transparent Logging: Nothing is hidden or suppressed. See every step of your environment loading process for total transparency.
 * Health Monitoring: Use infinity-check to verify symlinks, environment variables, and shell loader integrity.
Support the Developer
Infinity is built to provide power and freedom. If this workspace engine has saved you time or improved your workflow, please consider supporting the project.
Click here to Sponsor Infinity
Your contributions go directly toward:
 * Research and development of new workspace modules.
 * Infrastructure and server-side syncing costs.
 * Maintaining the open-core tools you rely on daily.
Built with passion for the Termux community.

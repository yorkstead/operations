---
Title: Standard Operating Procedures (SOPs)
Date: 2026-09-04
Type: Operational Manual
Status: Active
Category: Operations & Logs
Tags: [sop, procedures, deployment, tablet-setup, operations]
---

# 📅 Operations Manual: Standard Operating Procedures (SOPs)

## SOP-01: Forklift Tablet Provisioning & Lockdown
1. **Unbox & Initial Setup:** Power on HOTWAV R9 Pro tablet. Connect to office Wi-Fi during initial setup.
2. **Enable Developer Mode & Kiosk Profile:** Enable Android Fully Kiosk Browser or Google Chrome PWA mode.
3. **Set Home URL:** Point default URL to `rework.denverexpressco.com/dock` (or staging URL).
4. **Display Configuration:**
   * Screen timeout set to "Never while plugged into external power" (or 30 minutes on battery).
   * Brightness set to 80% with Adaptive Brightness enabled.
   * Enable "Touch Sensitivity / Glove Mode" in Display Settings.
5. **Mounting Procedure:**
   * Secure RAM Tough-Claw clamp to overhead operator cage pillar at eye level, angled 15 degrees downward.
   * Verify clamp does not obstruct driver's line of sight through the mast or mast-tilt hydraulics.

---

## SOP-02: Client Domain & DNS Verification
1. Coordinate with client web administrator or agency (SpinFlow.ai).
2. Create CNAME record: `rework.denverexpressco.com` -> `cname.vercel-dns.com`.
3. Verify SSL certificate auto-generation within 15 minutes.
4. Conduct end-to-end reservation and intake test through production URL.

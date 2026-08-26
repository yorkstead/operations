# Demo Architecture

Demos are interactive product environments, not screenshots or hardcoded UI.

Use dedicated demo organizations and preferably an isolated environment/database. Demo identity, routes, and data are visibly marked. Demo data is synthetic, coherent, deterministic, resettable, and contains chronological relationships among customers, quotes, jobs, material, operations, issues, packaging, and shipments.

Allow useful mutations. Intercept external side effects such as email, SMS, payments, carrier booking, webhooks, and destructive exports; simulate them clearly and audit the simulation. Never place production credentials in demo environments.

Initial scenarios: Front Range Architectural Products (manufacturing), Summit Facility Services (commercial cleaning), Mile High Signworks (sign fabrication/installation), and Peak Mobile Detail (mobile detailing). Every scenario has a narrative, personas, starting state, guided path, expected outcomes, reset contract, and accessibility/mobile verification.


# Customization

Customer variation is configuration, not forks.

Support organization profile, terminology, enabled modules, role capabilities, workflow statuses/transitions, forms/fields where justified, notification policies, document templates, integration settings, and limited approved accent/identity fields.

Configuration is versioned, validated, auditable, exportable, and migratable. Defaults must be safe. Do not turn core invariants, authorization, accounting truth, tenant isolation, or visual foundations into arbitrary configuration. New bespoke behavior requires a module extension point or an ADR—not customer-specific conditionals scattered through the application.


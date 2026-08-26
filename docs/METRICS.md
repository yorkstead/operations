# Metrics

Metrics support decisions; they are not decoration.

Each metric definition must state business question, owner, formula, grain, source of truth, inclusion/exclusion rules, unit/timezone, freshness, target/guardrail, permissions, and known limitations. Prefer operational measures such as quote cycle time, schedule adherence, throughput, WIP age, inventory accuracy, shortages, first-pass yield, scrap/rework, downtime, on-time shipment, and administrative touch time.

Never fabricate customer results. Demo metrics are labeled synthetic. Baselines and benefit estimates remain illustrative until measured. Instrument events with stable names and organization scope; test calculations against known fixtures.


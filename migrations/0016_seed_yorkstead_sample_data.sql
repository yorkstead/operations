-- Yorkstead Operations: Seed Comprehensive Sample Operational Data for Tenant 0 (org_yorkstead_systems)
-- Provides rich, verified sample records across all operational modules for screenshots, demonstrations, and active workflows.

-- 1. Seed Work Centers
INSERT INTO "work_centers" ("id", "organization_id", "code", "name", "type", "status", "hourly_cost_rate", "created_at", "updated_at")
VALUES
  ('wc_yorkstead_laser_01', 'org_yorkstead_systems', 'WC-LASER-01', 'Mitsubishi 4kW Fiber Laser Cell', 'cutting', 'available', 125.0, now(), now()),
  ('wc_yorkstead_brake_01', 'org_yorkstead_systems', 'WC-BRAKE-01', 'Amada 100-Ton 6-Axis CNC Press Brake', 'forming', 'available', 95.0, now(), now()),
  ('wc_yorkstead_weld_01', 'org_yorkstead_systems', 'WC-WELD-01', 'Fanuc Robotic TIG & PEM Fastener Cell', 'welding', 'available', 110.0, now(), now()),
  ('wc_yorkstead_cmm_01', 'org_yorkstead_systems', 'WC-QC-01', 'Mitutoyo Crysta-Apex CMM Inspection Bay', 'quality', 'available', 85.0, now(), now()),
  ('wc_yorkstead_pack_01', 'org_yorkstead_systems', 'WC-PACK-01', 'Packaging, Crate Staging & Palletization', 'packaging', 'available', 65.0, now(), now())
ON CONFLICT ("organization_id", "code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "status" = EXCLUDED."status",
  "hourly_cost_rate" = EXCLUDED."hourly_cost_rate",
  "updated_at" = now();

-- 2. Seed Jobs Aggregate
INSERT INTO "jobs" ("id", "organization_id", "job_number", "title", "customer_id", "customer_name", "current_status", "priority", "current_revision", "target_due_date", "estimated_labor_hours", "notes", "version", "created_at", "updated_at")
VALUES
  (
    'job_yorkstead_104',
    'org_yorkstead_systems',
    'JOB-2026-104',
    'Aerospace Avionics Enclosure Chassis (50 pcs)',
    'cust_alpine_01',
    'Alpine Aerospace Systems',
    'in_progress',
    'rush',
    'B',
    '2026-09-15',
    24,
    'High-precision avionics enclosure for satellite communications array. Tolerance critical on flange bends (+/-0.005 in).',
    2,
    now() - interval '3 days',
    now()
  ),
  (
    'job_yorkstead_105',
    'org_yorkstead_systems',
    'JOB-2026-105',
    'Architectural Structural Fascia Brackets (120 pcs)',
    'cust_summit_02',
    'Summit Architectural Glass',
    'released_to_shopfloor',
    'standard',
    'A',
    '2026-09-22',
    18,
    'Heavy-duty 6061-T6 aluminum facade brackets. Clear anodize finish per MIL-A-8625 Type II.',
    1,
    now() - interval '2 days',
    now()
  ),
  (
    'job_yorkstead_106',
    'org_yorkstead_systems',
    'JOB-2026-106',
    'Medical Diagnostic Imaging Housing Prototype (15 pcs)',
    'cust_frontier_03',
    'Frontier Precision Works',
    'engineering_ready',
    'critical',
    'A',
    '2026-09-10',
    32,
    'Precision stainless sheet metal enclosure for clinical imaging scanner. Class 1 cosmetic finish required.',
    1,
    now() - interval '1 day',
    now()
  )
ON CONFLICT ("organization_id", "job_number") DO UPDATE SET
  "title" = EXCLUDED."title",
  "current_status" = EXCLUDED."current_status",
  "priority" = EXCLUDED."priority",
  "current_revision" = EXCLUDED."current_revision",
  "target_due_date" = EXCLUDED."target_due_date",
  "notes" = EXCLUDED."notes",
  "version" = EXCLUDED."version",
  "updated_at" = now();

-- 3. Seed Job Revisions & Timeline Events
INSERT INTO "job_revisions" ("id", "job_id", "organization_id", "revision", "change_summary", "changed_by_user_id", "created_at")
VALUES
  ('jrev_yorkstead_104_a', 'job_yorkstead_104', 'org_yorkstead_systems', 'A', 'Initial engineering drawing CAD intake release.', 'usr_brandon_operator', now() - interval '3 days'),
  ('jrev_yorkstead_104_b', 'job_yorkstead_104', 'org_yorkstead_systems', 'B', 'Updated flange return bend datum tolerance to +/-0.005 in per client RFQ revision.', 'usr_brandon_operator', now() - interval '1 day')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "job_timeline_events" ("id", "job_id", "organization_id", "from_status", "to_status", "actor_user_id", "actor_name", "reason", "timestamp")
VALUES
  ('jtime_yorkstead_104_1', 'job_yorkstead_104', 'org_yorkstead_systems', 'draft', 'intake_review', 'usr_brandon_operator', 'Brandon', 'Customer RFQ quote converted into production order.', now() - interval '3 days'),
  ('jtime_yorkstead_104_2', 'job_yorkstead_104', 'org_yorkstead_systems', 'intake_review', 'engineering_ready', 'usr_brandon_operator', 'Brandon', 'Engineering drawing packet extraction verified and approved.', now() - interval '2 days'),
  ('jtime_yorkstead_104_3', 'job_yorkstead_104', 'org_yorkstead_systems', 'engineering_ready', 'in_progress', 'usr_brandon_operator', 'Brandon', 'Raw material verified on hand; traveler dispatched to Laser Station 1.', now() - interval '1 day')
ON CONFLICT ("id") DO NOTHING;

-- 4. Seed Shopfloor Travelers, Operations, and Blockers
INSERT INTO "shopfloor_travelers" ("id", "organization_id", "traveler_number", "qr_code_data", "job_id", "job_number", "part_description", "customer_name", "total_quantity", "current_step_index", "status", "priority", "target_due_date", "version", "created_at", "updated_at")
VALUES
  (
    'trv_yorkstead_104',
    'org_yorkstead_systems',
    'TRV-2026-104',
    'yorkstead://traveler/TRV-2026-104',
    'job_yorkstead_104',
    'JOB-2026-104',
    'Aerospace Avionics Enclosure Chassis Base',
    'Alpine Aerospace Systems',
    50,
    3,
    'active',
    'rush',
    '2026-09-15',
    1,
    now() - interval '2 days',
    now()
  ),
  (
    'trv_yorkstead_105',
    'org_yorkstead_systems',
    'TRV-2026-105',
    'yorkstead://traveler/TRV-2026-105',
    'job_yorkstead_105',
    'JOB-2026-105',
    'Architectural Structural Fascia Brackets',
    'Summit Architectural Glass',
    120,
    1,
    'queued',
    'standard',
    '2026-09-22',
    1,
    now() - interval '1 day',
    now()
  )
ON CONFLICT ("organization_id", "traveler_number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "current_step_index" = EXCLUDED."current_step_index",
  "updated_at" = now();

INSERT INTO "traveler_operations" ("id", "traveler_id", "organization_id", "sequence", "work_center_code", "work_center_name", "operation_name", "required_quantity", "completed_quantity", "scrapped_quantity", "status", "assigned_operator_id", "assigned_operator_name", "blocker_reason", "started_at", "completed_at", "actual_labor_minutes", "created_at", "updated_at")
VALUES
  ('top_yorkstead_104_10', 'trv_yorkstead_104', 'org_yorkstead_systems', 10, 'WC-LASER-01', 'Mitsubishi 4kW Fiber Laser Cell', 'CNC Fiber Laser Cutout & Profile', 50, 50, 0, 'completed', 'usr_brandon_operator', 'Brandon', NULL, now() - interval '2 days', now() - interval '2 days' + interval '3 hours', 180, now() - interval '2 days', now()),
  ('top_yorkstead_104_20', 'trv_yorkstead_104', 'org_yorkstead_systems', 20, 'WC-BRAKE-01', 'Amada 100-Ton 6-Axis CNC Press Brake', '6-Axis CNC Brake Flange Forming', 50, 48, 2, 'completed', 'usr_brandon_operator', 'Brandon', NULL, now() - interval '1 day', now() - interval '1 day' + interval '2 hours', 140, now() - interval '1 day', now()),
  ('top_yorkstead_104_30', 'trv_yorkstead_104', 'org_yorkstead_systems', 30, 'WC-WELD-01', 'Fanuc Robotic TIG & PEM Fastener Cell', 'PEM Clinch Stud Insertion & Corner TIG Weld', 48, 48, 0, 'completed', 'usr_brandon_operator', 'Brandon', NULL, now() - interval '18 hours', now() - interval '16 hours', 95, now() - interval '18 hours', now()),
  ('top_yorkstead_104_40', 'trv_yorkstead_104', 'org_yorkstead_systems', 40, 'WC-QC-01', 'Mitutoyo Crysta-Apex CMM Inspection Bay', 'AS9102 First Article CMM Dimensional Inspection', 48, 48, 0, 'completed', 'usr_brandon_operator', 'Brandon', NULL, now() - interval '12 hours', now() - interval '10 hours', 75, now() - interval '12 hours', now()),
  ('top_yorkstead_104_50', 'trv_yorkstead_104', 'org_yorkstead_systems', 50, 'WC-PACK-01', 'Packaging, Crate Staging & Palletization', 'Final Degrease, Protective Wrap & Crate Pack', 48, 0, 0, 'running', 'usr_brandon_operator', 'Brandon', NULL, now() - interval '2 hours', NULL, 30, now() - interval '2 hours', now())
ON CONFLICT ("id") DO NOTHING;

-- 5. Seed Inventory Locations, Items, Lots, Balances, and Movements
INSERT INTO "inventory_locations" ("id", "organization_id", "location_code", "name", "type", "status", "created_at", "updated_at")
VALUES
  ('loc_yorkstead_raw_01', 'org_yorkstead_systems', 'LOC-RAW-01', 'Sheet Metal Raw Inventory Bay', 'warehouse', 'active', now(), now()),
  ('loc_yorkstead_stage_01', 'org_yorkstead_systems', 'LOC-STAGE-01', 'Laser & Brake Workcenter Staging', 'staging', 'active', now(), now()),
  ('loc_yorkstead_quar_01', 'org_yorkstead_systems', 'LOC-QUAR-01', 'Quality Hold & Quarantine Hold Bay', 'quarantine', 'active', now(), now()),
  ('loc_yorkstead_fin_01', 'org_yorkstead_systems', 'LOC-FIN-01', 'Finished Goods & Outbound Crate Staging', 'warehouse', 'active', now(), now()),
  ('loc_yorkstead_bin_a1', 'org_yorkstead_systems', 'LOC-BIN-A1', 'Fasteners, Hardware & PEM Hardware Bin Rack', 'bin', 'active', now(), now())
ON CONFLICT ("organization_id", "location_code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "type" = EXCLUDED."type",
  "status" = EXCLUDED."status",
  "updated_at" = now();

INSERT INTO "inventory_items" ("id", "organization_id", "item_code", "description", "category", "unit_of_measure", "default_location_id", "reorder_point", "reorder_quantity", "standard_cost_cents", "lot_tracking_required", "status", "version", "created_at", "updated_at")
VALUES
  ('item_yorkstead_al_5052', 'org_yorkstead_systems', 'MAT-AL-5052-090', '5052-H32 Aluminum Sheet 0.090in x 48in x 96in', 'raw_material', 'SHEET', 'loc_yorkstead_raw_01', '10.0000', '25.0000', 4800, true, 'active', 1, now(), now()),
  ('item_yorkstead_al_6061', 'org_yorkstead_systems', 'MAT-AL-6061-125', '6061-T6 Aluminum Sheet 0.125in x 48in x 120in', 'raw_material', 'SHEET', 'loc_yorkstead_raw_01', '8.0000', '20.0000', 7200, true, 'active', 1, now(), now()),
  ('item_yorkstead_pem_m4', 'org_yorkstead_systems', 'HRD-PEM-M4-12', 'M4-0.7 Clinch Studs 12mm Zinc-Plated Steel', 'hardware', 'EA', 'loc_yorkstead_bin_a1', '500.0000', '2000.0000', 18, false, 'active', 1, now(), now()),
  ('item_yorkstead_ss_bolt', 'org_yorkstead_systems', 'HRD-SS-M6-20', 'M6-1.0 x 20mm 316 Stainless Socket Head Cap Screws', 'hardware', 'BOX', 'loc_yorkstead_bin_a1', '5.0000', '15.0000', 2400, false, 'active', 1, now(), now()),
  ('item_yorkstead_finish_clear', 'org_yorkstead_systems', 'CON-ANOD-CLR', 'MIL-A-8625 Clear Anodize Masking Tape & Pre-Dip', 'consumable', 'EA', 'loc_yorkstead_bin_a1', '10.0000', '30.0000', 1250, false, 'active', 1, now(), now()),
  ('item_yorkstead_fg_chassis', 'org_yorkstead_systems', 'FG-AVIONICS-104', 'Aerospace Avionics Enclosure Chassis Base - Rev B', 'finished_goods', 'EA', 'loc_yorkstead_fin_01', '0.0000', '0.0000', 15400, true, 'active', 1, now(), now())
ON CONFLICT ("organization_id", "item_code") DO UPDATE SET
  "description" = EXCLUDED."description",
  "standard_cost_cents" = EXCLUDED."standard_cost_cents",
  "updated_at" = now();

INSERT INTO "inventory_lots" ("id", "organization_id", "item_id", "lot_number", "manufacture_date", "expiration_date", "supplier_reference", "created_at")
VALUES
  ('lot_yorkstead_al_088', 'org_yorkstead_systems', 'item_yorkstead_al_5052', 'LOT-2026-AL-088', now() - interval '14 days', now() + interval '365 days', 'MTR-APEX-89021', now() - interval '14 days'),
  ('lot_yorkstead_al_092', 'org_yorkstead_systems', 'item_yorkstead_al_6061', 'LOT-2026-AL-092', now() - interval '10 days', now() + interval '365 days', 'MTR-MILEHIGH-4421', now() - interval '10 days')
ON CONFLICT ("organization_id", "item_id", "lot_number") DO NOTHING;

INSERT INTO "inventory_item_balances" ("id", "organization_id", "item_id", "location_id", "lot_id", "on_hand_quantity", "allocated_quantity", "updated_at")
VALUES
  ('bal_yorkstead_1', 'org_yorkstead_systems', 'item_yorkstead_al_5052', 'loc_yorkstead_raw_01', 'lot_yorkstead_al_088', '38.0000', '12.0000', now()),
  ('bal_yorkstead_2', 'org_yorkstead_systems', 'item_yorkstead_al_6061', 'loc_yorkstead_raw_01', 'lot_yorkstead_al_092', '24.0000', '8.0000', now()),
  ('bal_yorkstead_3', 'org_yorkstead_systems', 'item_yorkstead_pem_m4', 'loc_yorkstead_bin_a1', NULL, '3400.0000', '400.0000', now()),
  ('bal_yorkstead_4', 'org_yorkstead_systems', 'item_yorkstead_ss_bolt', 'loc_yorkstead_bin_a1', NULL, '18.0000', '2.0000', now()),
  ('bal_yorkstead_5', 'org_yorkstead_systems', 'item_yorkstead_fg_chassis', 'loc_yorkstead_fin_01', 'lot_yorkstead_al_088', '48.0000', '48.0000', now())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "inventory_movements" ("id", "organization_id", "movement_type", "item_id", "lot_id", "from_location_id", "to_location_id", "quantity", "unit_cost_cents", "job_id", "traveler_id", "original_movement_id", "actor_user_id", "reason", "idempotency_key", "occurred_at", "created_at")
VALUES
  ('mov_yorkstead_1', 'org_yorkstead_systems', 'receive', 'item_yorkstead_al_5052', 'lot_yorkstead_al_088', NULL, 'loc_yorkstead_raw_01', '50.0000', 4800, NULL, NULL, NULL, 'usr_brandon_operator', 'PO-2026-042 Vendor delivery receipt with mill cert MTR-APEX-89021', 'idemp_mov_yorkstead_1', now() - interval '7 days', now() - interval '7 days'),
  ('mov_yorkstead_2', 'org_yorkstead_systems', 'issue_to_job', 'item_yorkstead_al_5052', 'lot_yorkstead_al_088', 'loc_yorkstead_raw_01', 'loc_yorkstead_stage_01', '12.0000', 4800, 'job_yorkstead_104', 'trv_yorkstead_104', NULL, 'usr_brandon_operator', 'Dispatched 12 sheets for JOB-2026-104 laser nesting layout', 'idemp_mov_yorkstead_2', now() - interval '2 days', now() - interval '2 days')
ON CONFLICT ("organization_id", "idempotency_key") DO NOTHING;

-- 6. Seed Quality Inspection Records & Non-Conformance Reports (NCR)
INSERT INTO "quality_inspection_records" ("id", "organization_id", "inspection_type", "job_id", "job_number", "part_description", "traveler_operation_id", "inspector_user_id", "inspector_name", "status", "sample_size", "passed_quantity", "failed_quantity", "checklist", "ncr_id", "completed_at", "created_at")
VALUES
  (
    'insp_yorkstead_044',
    'org_yorkstead_systems',
    'first_article',
    'job_yorkstead_104',
    'JOB-2026-104',
    'Aerospace Avionics Enclosure Chassis Base',
    'top_yorkstead_104_20',
    'usr_brandon_operator',
    'Brandon',
    'passed_with_concession',
    5,
    4,
    1,
    '[
      {"id": "chk_1", "characteristic": "Overall Length (X-Axis)", "targetSpec": "14.500 +/-0.010 in", "result": "pass", "measuredValue": "14.502 in"},
      {"id": "chk_2", "characteristic": "Flange Return Bend Angle", "targetSpec": "90.0 +/-0.5 deg", "result": "fail", "measuredValue": "90.8 deg (Part #2)", "notes": "Backgauge datum offset adjusted on CNC brake"},
      {"id": "chk_3", "characteristic": "PEM Clinch Stud Torque Proof", "targetSpec": "25 in-lbs min", "result": "pass", "measuredValue": "28 in-lbs verified"}
    ]'::jsonb,
    'ncr_yorkstead_012',
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    'insp_yorkstead_045',
    'org_yorkstead_systems',
    'final_acceptance',
    'job_yorkstead_104',
    'JOB-2026-104',
    'Aerospace Avionics Enclosure Chassis Base',
    'top_yorkstead_104_40',
    'usr_brandon_operator',
    'Brandon',
    'passed',
    48,
    48,
    0,
    '[
      {"id": "chk_10", "characteristic": "100% Visual & Cosmetic Deburr", "targetSpec": "No scratches, zero sharp edges", "result": "pass", "measuredValue": "Clean"},
      {"id": "chk_11", "characteristic": "CMM 12-Hole Pattern Location", "targetSpec": "True Position 0.005 in RFS", "result": "pass", "measuredValue": "Max deviation 0.0021 in"}
    ]'::jsonb,
    NULL,
    now() - interval '10 hours',
    now() - interval '10 hours'
  )
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "quality_non_conformance_reports" ("id", "organization_id", "ncr_number", "job_id", "job_number", "part_description", "operation_name", "defect_description", "defect_category", "severity", "status", "defect_quantity", "containment_actions", "root_cause_analysis", "disposition", "disposition_notes", "scrap_cost_cents", "rework_labor_minutes", "remake_cost_cents", "created_by_user_id", "created_by_name", "approved_by_user_id", "approved_by_name", "closed_at", "created_at", "updated_at")
VALUES
  (
    'ncr_yorkstead_012',
    'org_yorkstead_systems',
    'NCR-2026-012',
    'job_yorkstead_104',
    'JOB-2026-104',
    'Aerospace Avionics Enclosure Chassis Base',
    '6-Axis CNC Brake Flange Forming',
    'Flange bend angle out of tolerance (+0.8 deg) on 2 pieces during initial tool setup run.',
    'dimensional_out_of_spec',
    'minor',
    'closed',
    2,
    '[
      "Segregated 2 defective pieces into LOC-QUAR-01 quarantine hold",
      "Re-calibrated Amada CNC brake backgauge axis datum",
      "Performed 100% angle check on subsequent 10 formed parts"
    ]'::jsonb,
    'Tooling backgauge datum drift after high-tonnage stainless steel run on prior shift.',
    'rework',
    'Re-struck parts on CNC brake tooling with verified angle 90.1 deg. Verified 100% compliant with CMM verification.',
    0,
    25,
    0,
    'usr_brandon_operator',
    'Brandon',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '18 hours',
    now() - interval '1 day',
    now()
  )
ON CONFLICT ("organization_id", "ncr_number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "disposition" = EXCLUDED."disposition",
  "updated_at" = now();

-- 7. Seed Equipment Assets, Downtime, and Maintenance Work Orders
INSERT INTO "equipment_assets" ("id", "organization_id", "asset_tag", "name", "manufacturer", "model_number", "serial_number", "work_center_code", "location_code", "criticality", "status", "qr_code_data", "last_service_date", "next_scheduled_pm_date", "total_run_hours", "created_at", "updated_at")
VALUES
  ('eq_yorkstead_laser_01', 'org_yorkstead_systems', 'EQ-LASER-01', 'Mitsubishi 4kW Fiber Laser Cutter', 'Mitsubishi Electric', 'ML3015eX-F40', 'MITS-88402', 'WC-LASER-01', 'LOC-STAGE-01', 'critical', 'operational', 'yorkstead://equipment/EQ-LASER-01', '2026-08-15', '2026-09-15', 3840, now(), now()),
  ('eq_yorkstead_brake_01', 'org_yorkstead_systems', 'EQ-BRAKE-01', 'Amada 100-Ton 6-Axis CNC Press Brake', 'Amada America', 'HG-1003', 'AMD-77219', 'WC-BRAKE-01', 'LOC-STAGE-01', 'high', 'operational', 'yorkstead://equipment/EQ-BRAKE-01', '2026-08-10', '2026-09-10', 2910, now(), now()),
  ('eq_yorkstead_weld_01', 'org_yorkstead_systems', 'EQ-WELD-01', 'Fanuc ArcMate 6-Axis Robotic TIG Cell', 'Fanuc Robotics', 'ArcMate 100iD', 'FAN-33902', 'WC-WELD-01', 'LOC-STAGE-01', 'medium', 'operational', 'yorkstead://equipment/EQ-WELD-01', '2026-08-01', '2026-09-01', 1450, now(), now()),
  ('eq_yorkstead_cmm_01', 'org_yorkstead_systems', 'EQ-CMM-01', 'Mitutoyo Crysta-Apex CMM Coordinate Machine', 'Mitutoyo Corp', 'Crysta-Apex S9106', 'MIT-55012', 'WC-QC-01', 'LOC-QUAR-01', 'high', 'operational', 'yorkstead://equipment/EQ-CMM-01', '2026-08-20', '2026-09-20', 880, now(), now())
ON CONFLICT ("organization_id", "asset_tag") DO UPDATE SET
  "status" = EXCLUDED."status",
  "total_run_hours" = EXCLUDED."total_run_hours",
  "updated_at" = now();

INSERT INTO "maintenance_work_orders" ("id", "organization_id", "work_order_number", "equipment_id", "asset_tag", "type", "status", "title", "description", "priority", "assigned_technician_id", "assigned_technician_name", "replacement_parts_used", "actual_labor_minutes", "return_to_service_authorized_by_user_id", "return_to_service_authorized_by_name", "return_to_service_notes", "completed_at", "created_at", "updated_at")
VALUES
  (
    'wo_yorkstead_009',
    'org_yorkstead_systems',
    'WO-2026-009',
    'eq_yorkstead_laser_01',
    'EQ-LASER-01',
    'corrective_emergency',
    'closed_returned_to_service',
    'Laser Nitrogen Assist Gas Manifold Pressure Drop',
    'Replaced worn Viton sealing O-rings on high-pressure N2 regulator manifold. Pressure verified stable at 22 bar.',
    'emergency',
    'usr_brandon_operator',
    'Brandon',
    '[{"itemCode": "ORING-VITON-N2", "description": "Viton High-Pressure Manifold O-Ring 22 Bar", "quantity": 2}]'::jsonb,
    35,
    'usr_brandon_operator',
    'Brandon',
    'Purged nitrogen line; pressure verified 22.0 bar stable under continuous cutting load.',
    now() - interval '2 days',
    now() - interval '2 days',
    now()
  ),
  (
    'wo_yorkstead_010',
    'org_yorkstead_systems',
    'PM-2026-041',
    'eq_yorkstead_brake_01',
    'EQ-BRAKE-01',
    'preventive_scheduled',
    'closed_returned_to_service',
    'Monthly Hydraulic Filter & Axis Calibration Check',
    'Replaced hydraulic return oil filter, greased 6-axis linear guides, and ran datum calibration test.',
    'standard',
    'usr_brandon_operator',
    'Brandon',
    '[{"itemCode": "FLT-HYD-AMD", "description": "Amada Press Brake Hydraulic Filter Element", "quantity": 1}]'::jsonb,
    60,
    'usr_brandon_operator',
    'Brandon',
    'Hydraulic pressure calibrated to manufacturer spec. Ram repeatability test passed within 0.001 mm.',
    now() - interval '10 days',
    now() - interval '10 days',
    now()
  )
ON CONFLICT ("organization_id", "work_order_number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "updated_at" = now();

INSERT INTO "maintenance_downtime_intervals" ("id", "organization_id", "equipment_id", "asset_tag", "category", "reason", "impact_summary", "started_at", "resolved_at", "duration_minutes", "reported_by_user_id", "reported_by_name", "resolved_by_user_id", "resolved_by_name", "work_order_id", "created_at")
VALUES
  (
    'dt_yorkstead_001',
    'org_yorkstead_systems',
    'eq_yorkstead_laser_01',
    'EQ-LASER-01',
    'unplanned_breakdown',
    'Nitrogen assist manifold seal failure causing laser cutoff drop.',
    'Laser cell stopped for 35 minutes; zero production parts damaged.',
    now() - interval '2 days' - interval '35 minutes',
    now() - interval '2 days',
    35,
    'usr_brandon_operator',
    'Brandon',
    'usr_brandon_operator',
    'Brandon',
    'wo_yorkstead_009',
    now() - interval '2 days'
  )
ON CONFLICT ("id") DO NOTHING;

-- 8. Seed Purchasing Vendors, Purchase Orders, Lines, and Shortages
INSERT INTO "purchasing_vendors" ("id", "organization_id", "vendor_code", "name", "email", "payment_terms", "currency", "status", "created_at", "updated_at")
VALUES
  ('vend_yorkstead_apex', 'org_yorkstead_systems', 'VEND-AL-01', 'Apex Raw Materials & Mill Supply', 'orders@apexrawmaterials.com', 'net_30', 'USD', 'active', now(), now()),
  ('vend_yorkstead_rocky', 'org_yorkstead_systems', 'VEND-FAST-02', 'Rocky Mountain Fasteners & Hardware', 'sales@rockymountainfasteners.com', 'net_30', 'USD', 'active', now(), now()),
  ('vend_yorkstead_prec', 'org_yorkstead_systems', 'VEND-TOOL-03', 'Precision Tooling & CNC Carbide Co', 'dispatch@precisiontooling.com', 'net_15', 'USD', 'active', now(), now()),
  ('vend_yorkstead_summit', 'org_yorkstead_systems', 'VEND-CHEM-04', 'Summit Finishing & Anodizing Labs', 'billing@summitfinishing.com', 'net_30', 'USD', 'active', now(), now())
ON CONFLICT ("organization_id", "vendor_code") DO UPDATE SET
  "name" = EXCLUDED."name",
  "email" = EXCLUDED."email",
  "status" = EXCLUDED."status",
  "updated_at" = now();

INSERT INTO "purchasing_purchase_orders" ("id", "organization_id", "po_number", "vendor_id", "vendor_name", "vendor_email", "status", "subtotal_cost_cents", "shipping_cost_cents", "tax_cost_cents", "total_cost_cents", "approval_threshold_cents", "requires_manager_approval", "approved_by_user_id", "approved_by_name", "approved_at", "expected_delivery_date", "issued_at", "completed_at", "created_at", "updated_at")
VALUES
  (
    'po_yorkstead_042',
    'org_yorkstead_systems',
    'PO-2026-042',
    'vend_yorkstead_apex',
    'Apex Raw Materials & Mill Supply',
    'orders@apexrawmaterials.com',
    'received_complete',
    384000,
    15000,
    0,
    399000,
    500000,
    false,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '8 days',
    '2026-08-25',
    now() - interval '8 days',
    now() - interval '7 days',
    now() - interval '8 days',
    now()
  ),
  (
    'po_yorkstead_043',
    'org_yorkstead_systems',
    'PO-2026-043',
    'vend_yorkstead_rocky',
    'Rocky Mountain Fasteners & Hardware',
    'sales@rockymountainfasteners.com',
    'issued',
    72000,
    2500,
    0,
    74500,
    500000,
    false,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '2 days',
    '2026-09-03',
    now() - interval '2 days',
    NULL,
    now() - interval '2 days',
    now()
  )
ON CONFLICT ("organization_id", "po_number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "total_cost_cents" = EXCLUDED."total_cost_cents",
  "updated_at" = now();

INSERT INTO "purchasing_po_line_items" ("id", "organization_id", "po_id", "line_number", "item_code", "description", "quantity_ordered", "quantity_received", "uom", "unit_cost_cents", "total_cost_cents", "linked_job_id", "linked_job_number", "created_at")
VALUES
  ('poli_yorkstead_1', 'org_yorkstead_systems', 'po_yorkstead_042', 1, 'MAT-AL-5052-090', '5052-H32 Aluminum Sheet 0.090in x 48in x 96in with Certified MTR', 8, 8, 'SHEET', 48000, 384000, 'job_yorkstead_104', 'JOB-2026-104', now() - interval '8 days'),
  ('poli_yorkstead_2', 'org_yorkstead_systems', 'po_yorkstead_043', 1, 'HRD-PEM-M4-12', 'M4-0.7 Clinch Studs 12mm Zinc-Plated Steel (Pack of 1000)', 4, 0, 'BOX', 18000, 72000, 'job_yorkstead_105', 'JOB-2026-105', now() - interval '2 days')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "purchasing_receiving_receipts" ("id", "organization_id", "po_id", "po_number", "packing_slip_number", "received_date", "received_by_user_id", "received_by_name", "items_received", "notes", "created_at")
VALUES
  (
    'rec_yorkstead_019',
    'org_yorkstead_systems',
    'po_yorkstead_042',
    'PO-2026-042',
    'PS-APEX-89021',
    '2026-08-25',
    'usr_brandon_operator',
    'Brandon',
    '[{"itemCode": "MAT-AL-5052-090", "quantityReceived": 8, "lotNumber": "LOT-2026-AL-088"}]'::jsonb,
    'Certified Mill Test Report #MTR-APEX-89021 verified and uploaded. Sheet thickness gauge checked 0.090 in.',
    now() - interval '7 days'
  )
ON CONFLICT ("id") DO NOTHING;

-- 9. Seed Shipping Manifests, Stops, and Packages
INSERT INTO "shipping_manifests" ("id", "organization_id", "manifest_number", "carrier_type", "carrier_name", "tracking_or_pro_number", "driver_name", "trailer_or_plate_number", "total_packages", "total_gross_weight_lbs", "status", "bill_of_lading_barcode", "dispatched_at", "dispatched_by_user_id", "dispatched_by_name", "delivered_at", "created_at", "updated_at")
VALUES
  (
    'shp_yorkstead_088',
    'org_yorkstead_systems',
    'SHP-2026-088',
    'ltl_freight',
    'Old Dominion Freight Line',
    'ODFL-982341109',
    'Hank Kowalski',
    'TR-8814',
    1,
    405.00,
    'delivered',
    'BOL-2026-088-YS',
    now() - interval '1 day',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '6 hours',
    now() - interval '1 day',
    now()
  ),
  (
    'shp_yorkstead_089',
    'org_yorkstead_systems',
    'SHP-2026-089',
    'dedicated_courier',
    'Front Range Express Logistics',
    'FREX-44019',
    'Elena Gomez',
    'VAN-2201',
    2,
    260.00,
    'staged_for_loading',
    'BOL-2026-089-YS',
    NULL,
    NULL,
    NULL,
    NULL,
    now() - interval '4 hours',
    now()
  )
ON CONFLICT ("organization_id", "manifest_number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "total_gross_weight_lbs" = EXCLUDED."total_gross_weight_lbs",
  "updated_at" = now();

INSERT INTO "shipping_stops" ("id", "organization_id", "manifest_id", "stop_sequence", "destination_customer_name", "destination_address", "package_numbers", "contact_person", "contact_phone", "delivery_notes", "status", "signed_by", "delivered_at", "created_at")
VALUES
  (
    'stop_yorkstead_088_1',
    'org_yorkstead_systems',
    'shp_yorkstead_088',
    1,
    'Alpine Aerospace Systems',
    '1200 Space Technology Blvd, Longmont, CO 80501',
    '["PKG-2026-042"]'::jsonb,
    'Marcus Vance (Receiving Lead)',
    '(303) 555-0192',
    'Dock #3. First article paperwork and certificate of conformance included in packet envelope.',
    'delivered',
    'M. Vance',
    now() - interval '6 hours',
    now() - interval '1 day'
  )
ON CONFLICT ("id") DO NOTHING;

-- 10. Seed Packaging Specifications, Packaging Units, and Packaged Items
INSERT INTO "packaging_specifications" ("id", "organization_id", "name", "container_type", "max_weight_capacity_lbs", "tare_weight_lbs", "dimensions_inches", "requires_cushioning", "requires_banding", "created_at")
VALUES
  ('pkg_spec_crate_01', 'org_yorkstead_systems', 'Heavy Duty Plywood Crate 48x40x36', 'crate', 1000.00, 45.00, '{"length": 48, "width": 40, "height": 36}'::jsonb, true, true, now()),
  ('pkg_spec_box_02', 'org_yorkstead_systems', 'Double-Wall Corrugated Heavy Carton 24x18x12', 'box', 75.00, 3.50, '{"length": 24, "width": 18, "height": 12}'::jsonb, true, false, now())
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "packaging_units" ("id", "organization_id", "package_number", "container_type", "specification_id", "total_quantity", "net_weight_lbs", "tare_weight_lbs", "gross_weight_lbs", "max_capacity_lbs", "dimensions_inches", "label_barcode", "status", "sealed_at", "sealed_by_user_id", "sealed_by_name", "created_at", "updated_at")
VALUES
  (
    'pkg_unit_yorkstead_042',
    'org_yorkstead_systems',
    'PKG-2026-042',
    'crate',
    'pkg_spec_crate_01',
    48,
    360.00,
    45.00,
    405.00,
    1000.00,
    '{"length": 48, "width": 40, "height": 36}'::jsonb,
    'BC-PKG-2026-042',
    'sealed_ready_for_shipping',
    now() - interval '18 hours',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '20 hours',
    now()
  ),
  (
    'pkg_unit_yorkstead_043',
    'org_yorkstead_systems',
    'PKG-2026-043',
    'box',
    'pkg_spec_box_02',
    60,
    120.00,
    3.50,
    123.50,
    75.00,
    '{"length": 24, "width": 18, "height": 12}'::jsonb,
    'BC-PKG-2026-043',
    'sealed_ready_for_shipping',
    now() - interval '4 hours',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '6 hours',
    now()
  )
ON CONFLICT ("organization_id", "package_number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "gross_weight_lbs" = EXCLUDED."gross_weight_lbs",
  "updated_at" = now();

INSERT INTO "packaged_items" ("id", "organization_id", "package_id", "job_id", "job_number", "part_description", "quantity_packed", "unit_weight_lbs", "lot_number", "created_at")
VALUES
  ('pkgi_yorkstead_1', 'org_yorkstead_systems', 'pkg_unit_yorkstead_042', 'job_yorkstead_104', 'JOB-2026-104', 'Aerospace Avionics Enclosure Chassis Base - Rev B', 48, 7.50, 'LOT-2026-AL-088', now() - interval '18 hours'),
  ('pkgi_yorkstead_2', 'org_yorkstead_systems', 'pkg_unit_yorkstead_043', 'job_yorkstead_105', 'JOB-2026-105', 'Architectural Structural Fascia Brackets', 60, 2.00, 'LOT-2026-AL-092', now() - interval '4 hours')
ON CONFLICT ("id") DO NOTHING;

-- 11. Seed QuoteFlow Quotes, Revisions, and Line Items
INSERT INTO "quoting_quotes" ("id", "organization_id", "quote_number", "customerId", "customerName", "customerContactEmail", "title", "status", "current_revision_number", "min_margin_threshold_percent", "requires_executive_approval", "approved_by_user_id", "approved_by_name", "approved_at", "expires_at", "converted_job_id", "converted_at", "created_at", "updated_at")
VALUES
  (
    'qte_yorkstead_088',
    'org_yorkstead_systems',
    'QTE-2026-088',
    'cust_alpine_01',
    'Alpine Aerospace Systems',
    'm.vance@alpineaero.com',
    'Custom Aerospace Avionics Chassis Prototype (50 pcs)',
    'converted_to_job',
    1,
    25,
    false,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '5 days',
    '2026-10-31',
    'job_yorkstead_104',
    now() - interval '3 days',
    now() - interval '6 days',
    now()
  ),
  (
    'qte_yorkstead_089',
    'org_yorkstead_systems',
    'QTE-2026-089',
    'cust_summit_02',
    'Summit Architectural Glass',
    'elena@summitglass.com',
    'Structural Facade Extrusion Mounting Brackets (250 pcs)',
    'approved',
    1,
    30,
    false,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '2 days',
    '2026-11-15',
    NULL,
    NULL,
    now() - interval '3 days',
    now()
  ),
  (
    'qte_yorkstead_090',
    'org_yorkstead_systems',
    'QTE-2026-090',
    'cust_frontier_03',
    'Frontier Precision Works',
    'engineering@frontierprecision.com',
    'Titanium Cryogenic Valve Manifold Housing Assembly (10 pcs)',
    'draft',
    1,
    35,
    true,
    NULL,
    NULL,
    NULL,
    '2026-11-30',
    NULL,
    NULL,
    now() - interval '1 day',
    now()
  )
ON CONFLICT ("organization_id", "quote_number") DO UPDATE SET
  "status" = EXCLUDED."status",
  "title" = EXCLUDED."title",
  "updated_at" = now();

INSERT INTO "quoting_quote_revisions" ("id", "organization_id", "quote_id", "revision_number", "change_reason", "subtotal_cents", "discount_percent", "discount_amount_cents", "tax_percent", "tax_amount_cents", "total_amount_cents", "overall_margin_percent", "created_by_user_id", "created_by_name", "created_at")
VALUES
  (
    'qrev_yorkstead_088_1',
    'org_yorkstead_systems',
    'qte_yorkstead_088',
    1,
    'Initial customer RFQ CAD quote release with AS9100 first article inspection bundle.',
    770000,
    0,
    0,
    0,
    0,
    770000,
    35.00,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '6 days'
  ),
  (
    'qrev_yorkstead_089_1',
    'org_yorkstead_systems',
    'qte_yorkstead_089',
    1,
    'High-volume production run quote with tiered anodize tooling discount.',
    1250000,
    5,
    62500,
    0,
    0,
    1187500,
    38.50,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '3 days'
  )
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "quoting_quote_line_items" ("id", "organization_id", "revision_id", "line_item_number", "part_description", "drawing_number", "revision", "quantity", "cost_breakdown", "target_margin_percent", "unit_price_cents", "total_price_cents", "created_at")
VALUES
  (
    'qli_yorkstead_088_1',
    'org_yorkstead_systems',
    'qrev_yorkstead_088_1',
    1,
    'Aerospace Avionics Enclosure Chassis Base - Rev B',
    'DWG-2026-AE-104',
    'B',
    50,
    '{"materialCostCents": 4800, "laborCostCents": 2400, "machineCostCents": 1800, "outsourcingCostCents": 0, "freightCostCents": 500, "overheadCostCents": 500, "totalCostCents": 10000}'::jsonb,
    35,
    15400,
    770000,
    now() - interval '6 days'
  ),
  (
    'qli_yorkstead_089_1',
    'org_yorkstead_systems',
    'qrev_yorkstead_089_1',
    1,
    'Structural Facade Extrusion Mounting Brackets - Rev A',
    'DWG-2026-SF-201',
    'A',
    250,
    '{"materialCostCents": 2200, "laborCostCents": 900, "machineCostCents": 800, "outsourcingCostCents": 600, "freightCostCents": 200, "overheadCostCents": 300, "totalCostCents": 5000}'::jsonb,
    38,
    4750,
    1187500,
    now() - interval '3 days'
  )
ON CONFLICT ("id") DO NOTHING;

-- 12. Seed File Storage & Document Vault Records
INSERT INTO "file_vault_records" ("id", "organization_id", "uploaded_by_user_id", "uploaded_by_name", "filename", "mime_type", "size_bytes", "storage_key", "checksum_sha256", "status", "quarantine_reason", "entity_type", "entity_id", "created_at", "updated_at")
VALUES
  ('file_yorkstead_dwg_104', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'Apex-Avionics-Enclosure-RevB.pdf', 'application/pdf', 1845000, 'drawings/yorkstead/Apex-Avionics-Enclosure-RevB.pdf', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', 'clean', NULL, 'job', 'job_yorkstead_104', now() - interval '3 days', now()),
  ('file_yorkstead_mtr_088', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'Mill-Test-Report-5052-H32-Lot088.pdf', 'application/pdf', 840200, 'certs/yorkstead/Mill-Test-Report-5052-H32-Lot088.pdf', '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae', 'clean', NULL, 'purchase_order', 'po_yorkstead_042', now() - interval '7 days', now()),
  ('file_yorkstead_fai_044', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'AS9102-First-Article-Inspection-INS-044.pdf', 'application/pdf', 620400, 'quality/yorkstead/AS9102-First-Article-Inspection-INS-044.pdf', 'fcde2b2edba56bf408601fb721fe9b5c338d10ee429ea04fae5511b68fbf8fb9', 'clean', NULL, 'inspection', 'insp_yorkstead_044', now() - interval '1 day', now()),
  ('file_yorkstead_as9100', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'Yorkstead-Quality-Manual-AS9100D.pdf', 'application/pdf', 3120000, 'compliance/yorkstead/Yorkstead-Quality-Manual-AS9100D.pdf', 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e', 'clean', NULL, 'organization', 'org_yorkstead_systems', now() - interval '30 days', now())
ON CONFLICT ("id") DO NOTHING;

-- 13. Seed Knowledge Base & Standard Operating Procedures (SOP)
INSERT INTO "knowledge_articles" ("id", "organization_id", "article_code", "category", "title", "tags", "linked_equipment_codes", "linked_module_codes", "target_roles", "status", "current_revision_number", "author_user_id", "author_name", "created_at", "updated_at")
VALUES
  (
    'k_art_yorkstead_001',
    'org_yorkstead_systems',
    'SOP-LASER-001',
    'standard_operating_procedure',
    'Mitsubishi 4kW Fiber Laser Daily Calibration & Assist Gas Setup',
    '["laser", "cutting", "setup", "calibration", "safety"]'::jsonb,
    '["EQ-LASER-01"]'::jsonb,
    '["shopfloor", "maintenance"]'::jsonb,
    '["operator", "manager"]'::jsonb,
    'published',
    1,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '20 days',
    now()
  ),
  (
    'k_art_yorkstead_002',
    'org_yorkstead_systems',
    'SOP-BRAKE-002',
    'standard_operating_procedure',
    'Amada CNC Press Brake Precision Flange Bending & Backgauge Datum Setup',
    '["press-brake", "forming", "bending", "tolerances"]'::jsonb,
    '["EQ-BRAKE-01"]'::jsonb,
    '["shopfloor", "quality"]'::jsonb,
    '["operator", "manager"]'::jsonb,
    'published',
    1,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '18 days',
    now()
  ),
  (
    'k_art_yorkstead_003',
    'org_yorkstead_systems',
    'SOP-QC-003',
    'quality_standard',
    'AS9102 Rev B First Article Inspection (FAI) Digital Verification Protocol',
    '["as9102", "quality", "cmm", "first-article", "compliance"]'::jsonb,
    '["EQ-CMM-01"]'::jsonb,
    '["quality", "shopfloor"]'::jsonb,
    '["inspector", "manager", "admin"]'::jsonb,
    'published',
    1,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '15 days',
    now()
  ),
  (
    'k_art_yorkstead_004',
    'org_yorkstead_systems',
    'SOP-PACK-004',
    'standard_operating_procedure',
    'Aerospace Finished Goods Heavy Wooden Crate Packaging & Banding Standard',
    '["packaging", "shipping", "crates", "logistics"]'::jsonb,
    '["WC-PACK-01"]'::jsonb,
    '["packaging", "shipping"]'::jsonb,
    '["operator", "shipping_clerk"]'::jsonb,
    'published',
    1,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '12 days',
    now()
  )
ON CONFLICT ("organization_id", "article_code") DO UPDATE SET
  "title" = EXCLUDED."title",
  "status" = EXCLUDED."status",
  "updated_at" = now();

INSERT INTO "knowledge_revisions" ("id", "organization_id", "article_id", "revision_number", "title", "content", "change_log", "reviewed_by_user_id", "reviewed_by_name", "approved_at", "published_at", "created_at")
VALUES
  (
    'k_rev_yorkstead_001_1',
    'org_yorkstead_systems',
    'k_art_yorkstead_001',
    1,
    'Mitsubishi 4kW Fiber Laser Daily Calibration & Assist Gas Setup',
    '# Standard Operating Procedure: Fiber Laser Setup\n\n## 1. Safety PPE Requirements\n- ANSI Z136.1 certified laser safety eyewear (1070 nm protection).\n- Steel-toe boots and cut-resistant Kevlar handling gloves.\n\n## 2. Startup & Beam Focus Centering\n1. Power on chiller unit; verify water temperature is 22.0 +/- 0.5 °C.\n2. Execute tape shot nozzle alignment on 0.8 mm nozzle orifice.\n3. Verify nitrogen assist gas pressure is calibrated at 20-22 bar for aluminum.',
    'Initial release of standard fiber laser operating procedure.',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '20 days',
    now() - interval '20 days',
    now() - interval '20 days'
  ),
  (
    'k_rev_yorkstead_002_1',
    'org_yorkstead_systems',
    'k_art_yorkstead_002',
    1,
    'Amada CNC Press Brake Precision Flange Bending & Backgauge Datum Setup',
    '# Standard Operating Procedure: CNC Press Brake Operation\n\n## 1. Tooling Inspection\n- Inspect punch tip radius for micro-galling before clamping.\n- Verify V-die width matches sheet thickness formula: V = 8 x Material Thickness.\n\n## 2. Angle Compensation Calibration\n1. Form single test piece; measure return bend angle with calibrated digital protractor.\n2. Input angle offset delta into Amada AMNC 3i controller before releasing traveler run.',
    'Initial release of standard press brake forming procedure.',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '18 days',
    now() - interval '18 days',
    now() - interval '18 days'
  )
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "knowledge_steps" ("id", "organization_id", "revision_id", "step_number", "title", "instruction", "safety_warning", "media_url", "created_at")
VALUES
  ('k_step_yorkstead_1', 'org_yorkstead_systems', 'k_rev_yorkstead_001_1', 1, 'Pre-Start Chiller & Exhaust Inspection', 'Verify chiller water level and switch on downdraft dust extraction collector.', 'Do not operate without high-volume dust extraction active.', NULL, now() - interval '20 days'),
  ('k_step_yorkstead_2', 'org_yorkstead_systems', 'k_rev_yorkstead_001_1', 2, 'Nozzle Tape Shot Centering Test', 'Place adhesive tape over nozzle orifice; perform pulse shot and verify round hole centered within 0.05 mm.', 'Ensure protective laser enclosure interlocks are closed.', NULL, now() - interval '20 days')
ON CONFLICT ("id") DO NOTHING;

-- 14. Seed Job Packet Intelligence Documents
INSERT INTO "job_packet_documents" ("id", "organization_id", "job_id", "job_number", "file_name", "file_storage_key", "file_size_bytes", "mime_type", "document_type", "extraction_status", "ai_model_used", "extracted_entities", "inconsistencies", "human_reviewer_id", "human_reviewer_name", "human_approved_at", "uploaded_at", "created_at", "updated_at")
VALUES
  (
    'pkt_doc_yorkstead_104',
    'org_yorkstead_systems',
    'job_yorkstead_104',
    'JOB-2026-104',
    'Apex-Avionics-Enclosure-RevB.pdf',
    'drawings/yorkstead/Apex-Avionics-Enclosure-RevB.pdf',
    1845000,
    'application/pdf',
    'engineering_drawing',
    'approved',
    'synthetic-drawing-parser-v3.0',
    '[
      {"key": "material", "label": "Material Callout", "rawValue": "5052-H32 Aluminum Sheet (0.090 in)", "normalizedValue": "5052-H32", "confidenceScore": 0.99, "approved": true},
      {"key": "hardware", "label": "Hardware Callout", "rawValue": "8x M4-0.7 PEM Clinch Studs 12mm", "normalizedValue": "HRD-PEM-M4", "confidenceScore": 0.98, "approved": true},
      {"key": "tolerance", "label": "Flange Bend Tolerance", "rawValue": "+/- 0.005 in (90.0 deg)", "normalizedValue": "+/-0.005in", "confidenceScore": 0.97, "approved": true},
      {"key": "finish", "label": "Surface Finish", "rawValue": "MIL-A-8625 Type II Clear Anodize", "normalizedValue": "CLEAR_ANODIZE", "confidenceScore": 0.99, "approved": true}
    ]'::jsonb,
    '[]'::jsonb,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '2 days',
    now() - interval '3 days',
    now() - interval '3 days',
    now()
  ),
  (
    'pkt_doc_yorkstead_105',
    'org_yorkstead_systems',
    'job_yorkstead_105',
    'JOB-2026-105',
    'Summit-Fascia-Bracket-RevA.pdf',
    'drawings/yorkstead/Summit-Fascia-Bracket-RevA.pdf',
    1240000,
    'application/pdf',
    'engineering_drawing',
    'approved',
    'synthetic-drawing-parser-v3.0',
    '[
      {"key": "material", "label": "Material Callout", "rawValue": "6061-T6 Aluminum Sheet 0.125 in", "normalizedValue": "6061-T6", "confidenceScore": 0.99, "approved": true},
      {"key": "finish", "label": "Surface Finish", "rawValue": "MIL-A-8625 Type II Clear Anodize", "normalizedValue": "CLEAR_ANODIZE", "confidenceScore": 0.98, "approved": true}
    ]'::jsonb,
    '[]'::jsonb,
    'usr_brandon_operator',
    'Brandon',
    now() - interval '1 day',
    now() - interval '2 days',
    now() - interval '2 days',
    now()
  )
ON CONFLICT ("id") DO NOTHING;

-- 15. Seed Planning Suggestions (Analytics)
INSERT INTO "planning_suggestions" ("id", "organization_id", "title", "category", "rationale", "constraints", "trade_offs", "confidence_score", "status", "approved_by_user_id", "approved_by_name", "approved_at", "created_at", "updated_at")
VALUES
  (
    'plan_sug_yorkstead_001',
    'org_yorkstead_systems',
    'Workcenter Rebalance: Route Secondary Forming to Brake Cell #2 during Laser Shift 2 Peak',
    'workcenter_rebalance',
    'Forming queue projected to exceed buffer threshold by 18% during peak laser cutting throughput.',
    '["Maintain AS9102 First Article certified operator on duty", "Preserve tooling clearance"]'::jsonb,
    '["+15 min setup time on Brake #2 vs -3.5 hours backlog wait time"]'::jsonb,
    0.9400,
    'approved',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '1 day',
    now() - interval '2 days',
    now()
  ),
  (
    'plan_sug_yorkstead_002',
    'org_yorkstead_systems',
    'Material Consolidation: Combine 5052-H32 Nesting Sheets between JOB-104 and JOB-107',
    'material_consolidation',
    'Consolidating nest patterns reduces sheet scrap drop from 14.2% to 6.8%, saving $340 in raw material.',
    '["Grain direction alignment required for aerospace 90 deg bends"]'::jsonb,
    '["Requires nested laser program re-post (+10 min CAM time)"]'::jsonb,
    0.9600,
    'approved',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '12 hours',
    now() - interval '1 day',
    now()
  )
ON CONFLICT ("id") DO NOTHING;

-- 16. Seed Background Jobs
INSERT INTO "background_jobs" ("id", "organization_id", "type", "status", "progress", "payload", "result", "error", "resource_type", "resource_id", "idempotency_key", "attempts", "max_attempts", "available_at", "created_by_user_id", "created_by_name", "created_at", "started_at", "completed_at", "updated_at")
VALUES
  (
    'bg_job_yorkstead_001',
    'org_yorkstead_systems',
    'drawing_packet_extract',
    'completed',
    100,
    '{"documentId": "pkt_doc_yorkstead_104", "jobNumber": "JOB-2026-104"}'::jsonb,
    '{"entitiesExtracted": 4, "confidence": 0.982}'::jsonb,
    NULL,
    'drawing_packet',
    'pkt_doc_yorkstead_104',
    'idemp_bg_001',
    1,
    3,
    now() - interval '3 days',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '3 days',
    now() - interval '3 days',
    now() - interval '3 days' + interval '4 seconds',
    now() - interval '3 days'
  ),
  (
    'bg_job_yorkstead_002',
    'org_yorkstead_systems',
    'analytics_kpi_aggregate',
    'completed',
    100,
    '{"period": "2026-W35", "organizationId": "org_yorkstead_systems"}'::jsonb,
    '{"onTimeDeliveryRate": 0.98, "scrapRate": 0.012, "activeJobs": 3}'::jsonb,
    NULL,
    'analytics',
    'org_yorkstead_systems',
    'idemp_bg_002',
    1,
    3,
    now() - interval '1 hour',
    'usr_brandon_operator',
    'Brandon',
    now() - interval '1 hour',
    now() - interval '1 hour',
    now() - interval '1 hour' + interval '2 seconds',
    now() - interval '1 hour'
  )
ON CONFLICT ("organization_id", "type", "idempotency_key") DO NOTHING;

-- 17. Seed Rich Audit Events Trail
INSERT INTO "audit_events" ("id", "organization_id", "actor_id", "actor_name", "entity_type", "entity_id", "action", "summary", "created_at")
VALUES
  ('aud_seed_01', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'quote', 'qte_yorkstead_088', 'quotes.created', 'Customer RFQ received from Alpine Aerospace Systems. Quote QTE-2026-088 drafted.', now() - interval '6 days'),
  ('aud_seed_02', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'quote', 'qte_yorkstead_088', 'quotes.approved', 'Quote QTE-2026-088 approved with 35.0% gross margin policy compliance.', now() - interval '5 days'),
  ('aud_seed_03', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'quote', 'qte_yorkstead_088', 'quotes.converted_to_job', 'Quote QTE-2026-088 converted to production order JOB-2026-104.', now() - interval '3 days'),
  ('aud_seed_04', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'packet', 'pkt_doc_yorkstead_104', 'packets.document_extracted', 'Engineering drawing Apex-Avionics-Enclosure-RevB.pdf extracted with 4 certified callouts.', now() - interval '3 days'),
  ('aud_seed_05', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'purchase_order', 'po_yorkstead_042', 'purchasing.material_received', '5052-H32 Aluminum sheets received under Lot LOT-2026-AL-088 with Mill Cert MTR-APEX-89021 verified.', now() - interval '7 days'),
  ('aud_seed_06', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'traveler', 'trv_yorkstead_104', 'shopfloor.traveler_released', 'Digital Traveler TRV-2026-104 released across 5 work centers.', now() - interval '2 days'),
  ('aud_seed_07', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'inspection', 'insp_yorkstead_044', 'quality.fai_recorded', 'First Article Inspection recorded: 4 passed, 1 flagged for concession on CNC brake flange bend.', now() - interval '1 day'),
  ('aud_seed_08', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'ncr', 'ncr_yorkstead_012', 'quality.ncr_closed', 'NCR-2026-012 closed: re-struck on calibrated press brake with 100% CMM conformance.', now() - interval '18 hours'),
  ('aud_seed_09', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'package', 'pkg_unit_yorkstead_042', 'packaging.container_sealed', 'Heavy Duty Plywood Crate PKG-2026-042 sealed: 48 finished chassis units (Gross 405 lbs).', now() - interval '18 hours'),
  ('aud_seed_10', 'org_yorkstead_systems', 'usr_brandon_operator', 'Brandon', 'manifest', 'shp_yorkstead_088', 'shipping.manifest_delivered', 'Carrier Old Dominion Freight Line delivered shipment to Alpine Aerospace Systems with signed POD.', now() - interval '6 hours')
ON CONFLICT ("id") DO NOTHING;

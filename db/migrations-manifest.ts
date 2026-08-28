// Authoritative Manifest of Application Database Migrations
export interface MigrationMetadata {
  id: string;
  name: string;
  filename: string;
  checksum: string;
  appliedAtOrder: number;
}

export const MIGRATIONS_MANIFEST: MigrationMetadata[] = [
  {
    id: "0001_initial_schema",
    name: "0001_initial_schema.sql",
    filename: "0001_initial_schema.sql",
    checksum: "c378e732ea6acf5dd3c241ad1691640d0651af3663f65cfb114e78c4a7461333",
    appliedAtOrder: 1,
  },
  {
    id: "0002_shopfloor_persistence",
    name: "0002_shopfloor_persistence.sql",
    filename: "0002_shopfloor_persistence.sql",
    checksum: "001e634c8c4997012dc515ed7c85582b10f00ad78044ca46b0e2e578060e1f47",
    appliedAtOrder: 2,
  },
  {
    id: "0003_inventory_movement_ledger",
    name: "0003_inventory_movement_ledger.sql",
    filename: "0003_inventory_movement_ledger.sql",
    checksum: "bc3e57eef8fffeef8e2c0329598a2c8152ee6d64d305b321420b586e85db3af9",
    appliedAtOrder: 3,
  },
  {
    id: "0004_quality_ncr_persistence",
    name: "0004_quality_ncr_persistence.sql",
    filename: "0004_quality_ncr_persistence.sql",
    checksum: "5745f1f25af2003585d3a1fddc63bf8a2f82a618f6d3c04e6c3d6a26a34240b2",
    appliedAtOrder: 4,
  },
  {
    id: "0005_maintenance_equipment_persistence",
    name: "0005_maintenance_equipment_persistence.sql",
    filename: "0005_maintenance_equipment_persistence.sql",
    checksum: "80ddbcaac7395d7a54db27d4ae18ed1c0a2ad254bc1849e4a0df5187f7373c41",
    appliedAtOrder: 5,
  },
  {
    id: "0006_purchasing_po_persistence",
    name: "0006_purchasing_po_persistence.sql",
    filename: "0006_purchasing_po_persistence.sql",
    checksum: "9c8e73d3f16a13872b9c3e13f60ee76437265029b9c7c781e9d9e53c91b66b63",
    appliedAtOrder: 6,
  },
  {
    id: "0007_shipping_manifests",
    name: "0007_shipping_manifests.sql",
    filename: "0007_shipping_manifests.sql",
    checksum: "d2ebb426df11b8c57ac197412b29bc5e2f1512f576912b2e545c0a8ae5a9a26e",
    appliedAtOrder: 7,
  },
  {
    id: "0008_packaging_containers",
    name: "0008_packaging_containers.sql",
    filename: "0008_packaging_containers.sql",
    checksum: "54eae258eb927c6068d3c203c38b846a2d5fcd49696a02cbd85e7ceb0cf58837",
    appliedAtOrder: 8,
  },
  {
    id: "0009_quoting_estimates",
    name: "0009_quoting_estimates.sql",
    filename: "0009_quoting_estimates.sql",
    checksum: "69722c69c3668068247ff7ed0cded078da19eca6c687a6ecdd618e75b7cce7aa",
    appliedAtOrder: 9,
  },
  {
    id: "0010_file_metadata",
    name: "0010_file_metadata.sql",
    filename: "0010_file_metadata.sql",
    checksum: "67e156a07f090fee47d29b1cbc6c8c90efd49e9b5c0ab00608a4c6b2693f6965",
    appliedAtOrder: 10,
  },
  {
    id: "0011_knowledge_articles",
    name: "0011_knowledge_articles.sql",
    filename: "0011_knowledge_articles.sql",
    checksum: "3413a6ab72b46d30cc326bf41770493425d7e37dbf30926212bdde1e09a8f369",
    appliedAtOrder: 11,
  },
  {
    id: "0012_drawing_packets",
    name: "0012_drawing_packets.sql",
    filename: "0012_drawing_packets.sql",
    checksum: "4a9bedf9750ce6591f69ca206b7e941b87fe2b1d0e012e9f3840664ede2b8f32",
    appliedAtOrder: 12,
  },
  {
    id: "0013_analytics_planning",
    name: "0013_analytics_planning.sql",
    filename: "0013_analytics_planning.sql",
    checksum: "e91c267129e2a5dab9a1b5fed19f2dd2d9e3ad81149b1f980f9f0effdc3b5e59",
    appliedAtOrder: 13,
  },
  {
    id: "0014_durable_background_jobs",
    name: "0014_durable_background_jobs.sql",
    filename: "0014_durable_background_jobs.sql",
    checksum: "f2f7bb8795730a4b123c68e387273cf40f00e281d8eaf021c513cb95150ba4a1",
    appliedAtOrder: 14,
  },
  {
    id: "0015_seed_yorkstead_root_tenant",
    name: "0015_seed_yorkstead_root_tenant.sql",
    filename: "0015_seed_yorkstead_root_tenant.sql",
    checksum: "c194915a0d83d5f784a3cae16426cec83db4cef2cc9ea464f9a19cecd5cb2844",
    appliedAtOrder: 15,
  },
];

export const TOTAL_MIGRATIONS_COUNT = 15;
export const EXPECTED_MIGRATIONS = MIGRATIONS_MANIFEST;

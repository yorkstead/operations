'use client';

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Truck, MapPin, Building, Plus, Search, CheckCircle2 } from "lucide-react";

export function MasterDataWorkspace() {
  const [activeTab, setActiveTab] = React.useState<"customers" | "vendors" | "locations">("customers");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [feedback, setFeedback] = React.useState<string | null>(null);

  const [customers] = React.useState([
    { id: "cust_1", name: "Alpine Aerospace Systems", code: "AERO-01", status: "active", terms: "Net 30", city: "Denver, CO", contact: "Marcus Vance (m.vance@alpineaero.com)" },
    { id: "cust_2", name: "Summit Architectural Glass", code: "SAG-02", status: "active", terms: "Net 45", city: "Boulder, CO", contact: "Elena Gomez (elena@summitglass.com)" },
    { id: "cust_3", name: "Frontier Precision Works", code: "FPW-03", status: "active", terms: "Net 30", city: "Colorado Springs, CO", contact: "David Ortiz (d.ortiz@frontierprec.com)" },
    { id: "cust_4", name: "Boulder Cryogenics Laboratory", code: "BCL-04", status: "active", terms: "Due on Receipt", city: "Boulder, CO", contact: "Dr. Sarah Chen (schen@bouldercryo.org)" },
    { id: "cust_5", name: "Mile High Defense Systems", code: "MHDS-05", status: "active", terms: "Net 60", city: "Aurora, CO", contact: "Col. Thomas Briggs (tbriggs@mhds-gov.com)" },
  ]);

  const [vendors] = React.useState([
    { id: "vend_1", name: "Apex Raw Materials & Mill Supply", code: "VEND-AL-01", category: "Raw Materials", leadTime: "3-5 days", city: "Pueblo, CO", contact: "orders@apexrawmaterials.com" },
    { id: "vend_2", name: "Rocky Mountain Fasteners & Hardware", code: "VEND-FAST-02", category: "Hardware & PEM", leadTime: "1-2 days", city: "Aurora, CO", contact: "sales@rockymountainfasteners.com" },
    { id: "vend_3", name: "Precision Tooling & CNC Carbide Co", code: "VEND-TOOL-03", category: "Tooling & Inserts", leadTime: "5-7 days", city: "Longmont, CO", contact: "dispatch@precisiontooling.com" },
    { id: "vend_4", name: "Summit Finishing & Anodizing Labs", code: "VEND-CHEM-04", category: "Chemical / Anodize", leadTime: "3-4 days", city: "Denver, CO", contact: "billing@summitfinishing.com" },
    { id: "vend_5", name: "Front Range Nitrogen & Industrial Gases", code: "VEND-GAS-05", category: "Gases & Consumables", leadTime: "Next day", city: "Commerce City, CO", contact: "deliveries@frontrangegas.com" },
  ]);

  const [locations] = React.useState([
    { id: "loc_1", name: "Main Precision Fabrication Plant", code: "PLANT-01", type: "CNC Laser & Forming Floor", address: "1420 40th St, Denver, CO 80205", isDefault: true },
    { id: "loc_2", name: "Robotic Welding & Assembly Annex", code: "ANNEX-02", type: "Welding & Fastening Cell", address: "1430 40th St, Denver, CO 80205", isDefault: false },
    { id: "loc_3", name: "CMM Metrology & Quality Inspection Lab", code: "QC-LAB-01", type: "Cleanroom / Inspection", address: "1420 40th St, Bay 4, Denver, CO 80205", isDefault: false },
    { id: "loc_4", name: "Logistics, Crate Staging & Outbound Dock", code: "DOCK-02", type: "Shipping & Receiving Dock", address: "1450 40th St, Denver, CO 80205", isDefault: false },
  ]);

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVendors = vendors.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLocations = locations.filter(
    (l) => l.name.toLowerCase().includes(searchQuery.toLowerCase()) || l.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="default">CORE//MASTER_DATA</Badge>
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Directory & Shared Entities
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Customers, Vendors & Facilities
          </h1>
          <p className="text-sm text-muted-foreground">
            Authoritative shared operational master data. Structured for shopfloor routing, purchasing, and invoicing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setFeedback(`New master entity dialog opened.`);
              setTimeout(() => setFeedback(null), 2500);
            }}
          >
            <Plus className="mr-1.5 size-4" />
            Add Entity
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs font-mono text-primary">
          <CheckCircle2 className="size-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Directory Tabs and Search Filter */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4">
        <div className="flex gap-2">
          <Button
            variant={activeTab === "customers" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("customers")}
            className="font-mono text-xs uppercase"
          >
            <Users className="mr-1.5 size-3.5" />
            Customers ({customers.length})
          </Button>
          <Button
            variant={activeTab === "vendors" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("vendors")}
            className="font-mono text-xs uppercase"
          >
            <Truck className="mr-1.5 size-3.5" />
            Vendors ({vendors.length})
          </Button>
          <Button
            variant={activeTab === "locations" ? "default" : "secondary"}
            size="sm"
            onClick={() => setActiveTab("locations")}
            className="font-mono text-xs uppercase"
          >
            <MapPin className="mr-1.5 size-3.5" />
            Locations ({locations.length})
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search code or name..."
            className="w-full rounded-md border border-border bg-background py-1.5 pl-8 pr-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* Directory Data List */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Building className="size-5" />
            <CardTitle className="text-base capitalize">
              {activeTab === "customers" && "Customer Accounts"}
              {activeTab === "vendors" && "Approved Vendors & Suppliers"}
              {activeTab === "locations" && "Organization Facilities & Docks"}
            </CardTitle>
          </div>
          <CardDescription>Verified shared records strictly scoped to this organization tenant.</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border">
            {activeTab === "customers" &&
              filteredCustomers.map((c) => (
                <div key={c.id} className="flex items-center justify-between py-3.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{c.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{c.code}</Badge>
                      <Badge variant="secondary" className="text-[9px] uppercase">{c.status}</Badge>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Terms: {c.terms} &bull; Location: {c.city}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="font-mono text-xs text-primary hover:underline">
                    View Ledger
                  </Button>
                </div>
              ))}

            {activeTab === "vendors" &&
              filteredVendors.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{v.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{v.code}</Badge>
                      <Badge variant="secondary" className="text-[9px] uppercase">{v.category}</Badge>
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Standard Lead Time: {v.leadTime} &bull; Remit: {v.city}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="font-mono text-xs text-primary hover:underline">
                    Purchase Order History
                  </Button>
                </div>
              ))}

            {activeTab === "locations" &&
              filteredLocations.map((l) => (
                <div key={l.id} className="flex items-center justify-between py-3.5">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">{l.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{l.code}</Badge>
                      {l.isDefault && <Badge variant="default" className="text-[9px]">DEFAULT</Badge>}
                    </div>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      Type: {l.type} &bull; Address: {l.address}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="font-mono text-xs text-primary hover:underline">
                    Work Centers
                  </Button>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

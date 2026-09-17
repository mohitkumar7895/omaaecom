import { NextResponse } from 'next/server';
import type { Zone } from "../../../types/zone";

// In‑memory store for demo purposes – replace with DB in production
let zones: Zone[] = [];

export async function GET() {
  return NextResponse.json(zones);
}

export async function POST(req: Request) {
  const zone: Omit<Zone, 'id'> = await req.json();
  const newZone: Zone = { ...zone, id: crypto.randomUUID() };
  zones.push(newZone);
  return NextResponse.json({ success: true, zone: newZone });
}

export async function PUT(req: Request) {
  const updated: Zone = await req.json();
  const idx = zones.findIndex(z => z.id === updated.id);
  if (idx >= 0) zones[idx] = updated;
  return NextResponse.json({ success: true, zone: updated });
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  zones = zones.filter(z => z.id !== id);
  return NextResponse.json({ success: true });
}

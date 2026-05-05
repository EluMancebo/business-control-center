import { dbConnect } from "@/lib/db";
import { AppointmentService } from "@/models/AppointmentService";
import mongoose from "mongoose";

const BUSINESS_ID = new mongoose.Types.ObjectId(
  process.env.BUSINESS_ID_DEV || "69751a1af0e184a8a5477cfd"
);

const services = [
  {
    businessId: BUSINESS_ID,
    name: "Corte de pelo clásico",
    description: "Corte tradicional con navaja y acabado profesional",
    durationMinutes: 30,
    priceText: "15€",
    visibleOnWeb: true,
    requiresConfirmation: false,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 5,
    sectorTags: ["haircut", "classic"],
  },
  {
    businessId: BUSINESS_ID,
    name: "Corte + Barba",
    description: "Servicio completo: corte de pelo y arreglo de barba",
    durationMinutes: 45,
    priceText: "22€",
    visibleOnWeb: true,
    requiresConfirmation: false,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 5,
    sectorTags: ["haircut", "beard", "combo"],
  },
  {
    businessId: BUSINESS_ID,
    name: "Afeitado tradicional",
    description: "Afeitado con navaja, toalla caliente y aceites",
    durationMinutes: 25,
    priceText: "12€",
    visibleOnWeb: true,
    requiresConfirmation: false,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 5,
    sectorTags: ["shave", "traditional"],
  },
  {
    businessId: BUSINESS_ID,
    name: "Arreglo de barba",
    description: "Perfilado y mantenimiento de barba",
    durationMinutes: 20,
    priceText: "10€",
    visibleOnWeb: true,
    requiresConfirmation: false,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 5,
    sectorTags: ["beard"],
  },
];

async function seed() {
  console.log("🌱 Seeding appointment services...");

  await dbConnect();

  // Limpiar servicios existentes de este business
  const deleted = await AppointmentService.deleteMany({ businessId: BUSINESS_ID });
  console.log(`🗑️  Deleted ${deleted.deletedCount} existing services`);

  // Insertar nuevos servicios
  const inserted = await AppointmentService.insertMany(services);
  console.log(`✅ Inserted ${inserted.length} services:`);

  inserted.forEach((s) => {
    console.log(`   - ${s.name} (${s.durationMinutes}min, ${s.priceText})`);
  });

  console.log("\n✨ Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});

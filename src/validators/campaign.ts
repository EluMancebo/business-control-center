 import { z } from "zod";

export const CampaignCreateSchema = z.object({
  name: z.string().min(2),
  objective: z.enum(["captacion", "oferta", "evento", "fidelizacion"]),
  channels: z.array(z.enum(["web", "landing", "whatsapp", "rrss","email"])).min(1).optional(),
  status: z.enum(["draft", "active", "paused", "ended"]).optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});

export const CampaignUpdateSchema = CampaignCreateSchema.partial();
   

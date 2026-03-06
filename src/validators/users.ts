// src/validators/users.ts
import { z } from "zod";

export const CreateUserSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(80, "Nombre demasiado largo"),
  email: z.string().email("Email inválido").max(120, "Email demasiado largo"),
  role: z.enum(["marketing", "staff"]),
  password: z.string().min(8, "Mínimo 8 caracteres").max(200, "Máximo 200 caracteres"),
});

export const ResetPasswordSchema = z.object({
  password: z.string().min(8, "Mínimo 8 caracteres").max(200, "Máximo 200 caracteres"),
}); 

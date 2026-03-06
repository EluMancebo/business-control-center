// src/validators/account.ts
import { z } from "zod";

export const UpdateAccountSchema = z.object({
  name: z.string().min(2, "Nombre demasiado corto").max(80, "Nombre demasiado largo").optional(),
  email: z.string().email("Email inválido").max(120, "Email demasiado largo").optional(),
});

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Falta la contraseña actual"),
  newPassword: z.string().min(8, "Mínimo 8 caracteres").max(200, "Máximo 200 caracteres"),
});    

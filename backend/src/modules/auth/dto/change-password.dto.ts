import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  @Matches(/[A-Z]/, { message: 'La contraseña debe contener al menos una mayúscula' })
  @Matches(/[a-z]/, { message: 'La contraseña debe contener al menos una minúscula' })
  @Matches(/\d/, { message: 'La contraseña debe contener al menos un número' })
  @Matches(/[^A-Za-z0-9]/, { message: 'La contraseña debe contener al menos un símbolo' })
  newPassword: string;
}

import { Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  protected override errorMessage = 'Demasiadas solicitudes. Por favor intente más tarde.';
}

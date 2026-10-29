import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { RegisterDto, StylistRegisterDto } from '../src/modules/identity/application/auth.dto';

describe('stylist registration validation', () => {
  it('accepts the frontend payload with strict property whitelisting', async () => {
    const dto = plainToInstance(StylistRegisterDto, {
      firstName: 'Awa',
      lastName: 'Diop',
      businessName: 'Atelier Awa',
      phone: '+221 77 000 00 00',
      email: 'awa@example.com',
      password: 'MotDePasse!2026',
    });

    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toEqual([]);
    expect(dto.role).toBe('STYLIST');
  });

  it('accepts the client form values shown in the report', async () => {
    const dto = plainToInstance(RegisterDto, {
      firstName: 'Client1',
      lastName: 'VIP',
      phone: '+221771239876',
      email: 'client@gmail.com',
      password: 'client@2026',
    });

    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors).toEqual([]);
    expect(dto.role).toBe('CLIENT');
  });
});

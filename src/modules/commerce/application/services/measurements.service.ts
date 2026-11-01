import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MeasurementSource, UserRole } from '@prisma/client';
import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { canonicalPhone } from '../../../../shared/domain/contact';
import type {
  CreateClientModelMeasurementDto,
  CreateEmployeeMeasurementDto,
  CreateMeasurementDto,
  SaveClientMeasurementDto,
  UpdateMeasurementDto,
  ValidateMeasurementDto,
} from '../commerce.dto';

import { paginate } from '../../../../shared/application/pagination';
import { validateMeasurements } from '../measurement-validation';
import { CommerceAccessService } from './commerce-access.service';

@Injectable()
export class MeasurementsService {
  constructor(
    private readonly db: PrismaService,
    private readonly access: CommerceAccessService,
  ) {}
  async listMeasurements(
    routeId: string,
    actorId: string,
    limit: number,
    cursor?: string,
    query?: string,
  ) {
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const rows = await this.db.measurement.findMany({
      where: {
        stylistId: stylist.id,
        ...(query && {
          OR: [
            { clientName: { contains: query, mode: 'insensitive' } },
            { clientPhone: { contains: query } },
          ],
        }),
      },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return paginate(
      rows.map(({ values, ...m }) => ({ ...m, measurements: values })),
      limit,
    );
  }

  async createMeasurement(routeId: string, actorId: string, dto: CreateMeasurementDto) {
    validateMeasurements(dto.measurements);
    const stylist = await this.access.stylistProfile(routeId, actorId);
    const { measurements, ...rest } = dto;
    if (rest.clientId) {
      await this.access.assertClientPhone(rest.clientId, rest.clientPhone);
    }
    rest.clientPhone = canonicalPhone(rest.clientPhone);
    const row = await this.db.measurement.create({
      data: {
        ...rest,
        clientConfirmedAt: rest.clientId ? new Date() : null,
        values: measurements,
        stylistId: stylist.id,
        source: MeasurementSource.stylist,
        validatedAt: new Date(),
        validatedById: actorId,
      },
    });
    return { ...row, measurements: row.values };
  }

  async updateMeasurement(id: string, actorId: string, dto: UpdateMeasurementDto) {
    const measurement = await this.db.measurement.findUnique({
      where: { id },
      include: { stylist: true },
    });
    if (!measurement) {
      throw new NotFoundException();
    }
    if (measurement.stylist.userId !== actorId) {
      throw new ForbiddenException();
    }
    if (dto.measurements) {
      validateMeasurements(dto.measurements);
    }
    const { measurements, ...rest } = dto;
    const updated = await this.db.measurement.update({
      where: { id },
      data: {
        ...rest,
        values: measurements ?? undefined,
        ...(measurements &&
          (measurement.source === MeasurementSource.client
            ? { validatedAt: null, validatedById: null }
            : {
                source: MeasurementSource.stylist,
                validatedAt: new Date(),
                validatedById: actorId,
              })),
      },
    });
    const { values, ...result } = updated;
    return { ...result, measurements: values };
  }

  async validateMeasurement(id: string, actorId: string, dto: ValidateMeasurementDto) {
    const record = await this.db.measurement.findUnique({
      where: { id },
      include: { stylist: true },
    });
    if (!record) {
      throw new NotFoundException('Fiche de mesures introuvable');
    }
    if (record.stylist.userId !== actorId) {
      throw new ForbiddenException('Accès interdit à cette fiche');
    }
    const modelName = dto.modelName.trim();
    if (modelName.length < 2) {
      throw new BadRequestException('Précisez le modèle concerné par la validation.');
    }
    validateMeasurements(record.values as Record<string, number>);
    const result = await this.db.measurement.updateMany({
      where: { id, stylistId: record.stylistId, updatedAt: new Date(dto.expectedUpdatedAt) },
      data: { modelName, validatedAt: new Date(), validatedById: actorId },
    });
    if (!result.count) {
      throw new ConflictException(
        'Ces mesures ont été modifiées. Actualisez la fiche avant de la valider.',
      );
    }
    const { values, ...updated } = await this.db.measurement.findUniqueOrThrow({ where: { id } });
    return { ...updated, measurements: values };
  }

  async deleteMeasurement(id: string, actorId: string) {
    const record = await this.db.measurement.findUnique({
      where: { id },
      include: { stylist: true },
    });
    if (!record) {
      throw new NotFoundException('Fiche introuvable');
    }
    if (record.stylist.userId !== actorId) {
      throw new ForbiddenException();
    }
    await this.db.measurement.delete({ where: { id } });
    return { success: true };
  }

  async listEmployeeMeasurements(actorId: string, limit: number, cursor?: string) {
    const employee = await this.access.employeeProfile(actorId);
    const rows = await this.db.measurement.findMany({
      where: { stylistId: employee.stylistId },
      take: limit + 1,
      ...(cursor && { cursor: { id: cursor }, skip: 1 }),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
    });
    return paginate(
      rows.map(({ values, ...measurement }) => ({ ...measurement, measurements: values })),
      limit,
    );
  }

  async createEmployeeMeasurement(actorId: string, dto: CreateEmployeeMeasurementDto) {
    const employee = await this.access.employeeProfile(actorId);
    validateMeasurements(dto.measurements);

    const row = await this.db.measurement.create({
      data: {
        stylistId: employee.stylistId,
        clientId: null,
        clientName: dto.clientName.trim(),
        clientPhone: canonicalPhone(dto.clientPhone),
        source: MeasurementSource.employee,
        values: dto.measurements,
        notes: dto.notes ?? '',
      },
    });
    return { ...row, measurements: row.values };
  }

  async updateEmployeeMeasurement(actorId: string, id: string, dto: UpdateMeasurementDto) {
    const employee = await this.access.employeeProfile(actorId);
    const measurement = await this.db.measurement.findFirst({
      where: { id, stylistId: employee.stylistId },
    });
    if (!measurement) {
      throw new NotFoundException('Fiche de mesures introuvable');
    }
    if (dto.measurements) {
      validateMeasurements(dto.measurements);
    }
    const updated = await this.db.measurement.update({
      where: { id },
      data: {
        values: dto.measurements ?? undefined,
        notes: dto.notes,
        ...(dto.measurements && {
          source: MeasurementSource.employee,
          validatedAt: null,
          validatedById: null,
        }),
      },
    });
    return { ...updated, measurements: updated.values };
  }

  async clientMeasurements(clientId: string) {
    const rows = await this.db.measurement.findMany({
      where: { clientId, clientConfirmedAt: { not: null } },
      orderBy: [{ updatedAt: 'desc' }, { id: 'desc' }],
    });
    return rows.map(({ values, ...row }) => ({ ...row, measurements: values }));
  }

  async saveClientMeasurements(clientId: string, dto: SaveClientMeasurementDto) {
    validateMeasurements(dto.measurements);
    const [client, stylist, current] = await Promise.all([
      this.db.user.findUnique({ where: { id: clientId } }),
      this.db.stylistProfile.findUnique({ where: { id: dto.stylistId } }),
      this.db.measurement.findFirst({
        where: {
          clientId,
          clientConfirmedAt: { not: null },
          stylistId: dto.stylistId,
          ...(dto.measurementId ? { id: dto.measurementId } : { modelName: null }),
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);
    if (!client) {
      throw new NotFoundException('Client introuvable');
    }
    if (!stylist) {
      throw new NotFoundException('Styliste introuvable');
    }
    if (dto.measurementId && !current) {
      throw new NotFoundException('Fiche de mesures introuvable');
    }
    const data = {
      source: MeasurementSource.client,
      clientConfirmedAt: new Date(),
      validatedAt: null,
      validatedById: null,
      values: dto.measurements,
      notes: dto.notes ?? current?.notes ?? '',
      clientName: `${client.firstName} ${client.lastName}`,
      clientPhone: client.phone,
    };
    const row = current
      ? await this.db.measurement.update({ where: { id: current.id }, data })
      : await this.db.measurement.create({ data: { ...data, clientId, stylistId: dto.stylistId } });
    return { ...row, measurements: row.values };
  }

  async createClientModelMeasurements(clientId: string, dto: CreateClientModelMeasurementDto) {
    validateMeasurements(dto.measurements);
    const modelName = dto.modelName.trim();
    if (modelName.length < 2) {
      throw new BadRequestException('Précisez le nom du modèle.');
    }
    const [client, stylist] = await Promise.all([
      this.db.user.findFirst({ where: { id: clientId, role: UserRole.CLIENT, active: true } }),
      this.db.stylistProfile.findUnique({ where: { id: dto.stylistId } }),
    ]);
    if (!client) {
      throw new NotFoundException('Client introuvable');
    }
    if (!stylist) {
      throw new NotFoundException('Styliste introuvable');
    }
    const { values, ...row } = await this.db.measurement.create({
      data: {
        stylistId: stylist.id,
        clientId: client.id,
        clientName: `${client.firstName} ${client.lastName}`,
        source: MeasurementSource.client,
        clientConfirmedAt: new Date(),
        clientPhone: client.phone,
        modelName,
        modelType: dto.modelType?.trim(),
        values: dto.measurements,
        notes: dto.notes?.trim() ?? '',
      },
    });
    return { ...row, measurements: values };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

const VALID_CATALOGS = [
  'data-subject-types',
  'data-categories',
  'data-items',
  'legal-bases',
  'third-party-types',
  'third-parties',
  'countries',
  'security-measures',
  'retention-rules',
  'lifecycle-phases',
  'risks',
];

/** Prisma delegate type for catalog models */
type PrismaModel = {
  findMany: (args: unknown) => Promise<unknown[]>;
  findUnique: (args: unknown) => Promise<unknown | null>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
};

@Injectable()
export class CatalogsService {
  constructor(private prisma: PrismaService) {}

  private getModel(type: string): PrismaModel {
    if (!VALID_CATALOGS.includes(type)) {
      throw new BadRequestException('Tipo de catálogo no válido');
    }
    const modelMap: Record<string, PrismaModel> = {
      'data-subject-types': this.prisma.dataSubjectType as unknown as PrismaModel,
      'data-categories': this.prisma.dataCategory as unknown as PrismaModel,
      'data-items': this.prisma.dataItem as unknown as PrismaModel,
      'legal-bases': this.prisma.legalBasis as unknown as PrismaModel,
      'third-party-types': this.prisma.thirdPartyType as unknown as PrismaModel,
      'third-parties': this.prisma.thirdParty as unknown as PrismaModel,
      'countries': this.prisma.country as unknown as PrismaModel,
      'security-measures': this.prisma.securityMeasure as unknown as PrismaModel,
      'retention-rules': this.prisma.retentionRule as unknown as PrismaModel,
      'lifecycle-phases': this.prisma.lifecyclePhase as unknown as PrismaModel,
      'risks': this.prisma.risk as unknown as PrismaModel,
    };
    return modelMap[type];
  }

  async findAll(type: string, companyId?: string) {
    const model = this.getModel(type);
    const where: Record<string, unknown> = {};

    const modelsWithCompanyId = [
      'data-subject-types', 'data-categories', 'data-items', 'legal-bases',
      'third-parties', 'security-measures', 'retention-rules', 'lifecycle-phases', 'risks',
    ];

    if (companyId && modelsWithCompanyId.includes(type)) {
      where.companyId = companyId;
    }

    const include: Record<string, boolean> = {};
    if (type === 'data-items') include.dataCategory = true;
    if (type === 'third-parties') {
      include.country = true;
      include.thirdPartyType = true;
    }

    return model.findMany({ where, include, orderBy: { name: 'asc' } });
  }

  async findOne(type: string, id: string) {
    const model = this.getModel(type);
    const include: Record<string, boolean> = {};
    if (type === 'data-items') include.dataCategory = true;
    if (type === 'third-parties') {
      include.country = true;
      include.thirdPartyType = true;
    }

    const item = await model.findUnique({ where: { id }, include });
    if (!item) throw new NotFoundException('Ítem no encontrado');
    return item;
  }

  async create(type: string, dto: CreateCatalogItemDto) {
    const model = this.getModel(type);
    const data = this.buildData(type, dto);
    return model.create({ data });
  }

  async update(type: string, id: string, dto: UpdateCatalogItemDto) {
    const model = this.getModel(type);
    await this.findOne(type, id);
    const data = this.buildData(type, dto);
    return model.update({ where: { id }, data });
  }

  async toggleStatus(type: string, id: string) {
    const model = this.getModel(type);
    const item = await this.findOne(type, id) as Record<string, unknown>;
    return model.update({ where: { id }, data: { isActive: !item.isActive } });
  }

  private buildData(type: string, dto: CreateCatalogItemDto | UpdateCatalogItemDto): Record<string, unknown> {
    const data: Record<string, unknown> = {};
    const input = dto as Record<string, unknown>;

    if (type !== 'third-parties' && input.code !== undefined) data.code = input.code;
    if (input.name !== undefined) data.name = input.name;
    if (type !== 'third-parties' && input.description !== undefined) data.description = input.description;
    if (input.isActive !== undefined) data.isActive = input.isActive;
    if (input.companyId !== undefined) data.companyId = input.companyId;

    switch (type) {
      case 'data-categories':
        if (input.isSpecialCategory !== undefined) data.isSpecialCategory = input.isSpecialCategory;
        break;
      case 'data-items':
        if (input.dataCategoryId !== undefined) data.dataCategoryId = input.dataCategoryId;
        if (input.isSensitive !== undefined) data.isSensitive = input.isSensitive;
        break;
      case 'legal-bases':
        if (input.legalReference !== undefined) data.legalReference = input.legalReference;
        break;
      case 'security-measures':
      case 'risks':
        if (input.category !== undefined) data.category = input.category;
        break;
      case 'retention-rules':
        if (input.defaultTerm !== undefined) data.defaultTerm = input.defaultTerm;
        if (input.legalReference !== undefined) data.legalReference = input.legalReference;
        break;
      case 'lifecycle-phases':
        if (input.orderIndex !== undefined) data.orderIndex = input.orderIndex;
        break;
      case 'countries':
        if (input.isoCode !== undefined) data.isoCode = input.isoCode;
        if (input.region !== undefined) data.region = input.region;
        break;
      case 'risks':
        if (input.severity !== undefined) data.severity = input.severity;
        break;
      case 'third-parties':
        if (input.identificationNumber !== undefined) data.identificationNumber = input.identificationNumber;
        if (input.countryId !== undefined) data.countryId = input.countryId;
        if (input.thirdPartyTypeId !== undefined) data.thirdPartyTypeId = input.thirdPartyTypeId;
        if (input.legalAddress !== undefined) data.legalAddress = input.legalAddress;
        if (input.contactName !== undefined) data.contactName = input.contactName;
        if (input.contactEmail !== undefined) data.contactEmail = input.contactEmail;
        if (input.contactPhone !== undefined) data.contactPhone = input.contactPhone;
        if (input.actsAsProcessor !== undefined) data.actsAsProcessor = input.actsAsProcessor;
        if (input.actsAsRecipient !== undefined) data.actsAsRecipient = input.actsAsRecipient;
        if (input.actsAsJointController !== undefined) data.actsAsJointController = input.actsAsJointController;
        if (input.contractExists !== undefined) data.contractExists = input.contractExists;
        if (input.confidentialityAgreementExists !== undefined) data.confidentialityAgreementExists = input.confidentialityAgreementExists;
        if (input.usesSubprocessors !== undefined) data.usesSubprocessors = input.usesSubprocessors;
        if (input.notes !== undefined) data.notes = input.notes;
        break;
    }

    return data;
  }
}

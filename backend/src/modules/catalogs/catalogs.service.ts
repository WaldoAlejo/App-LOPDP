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

@Injectable()
export class CatalogsService {
  constructor(private prisma: PrismaService) {}

  private getModel(type: string) {
    if (!VALID_CATALOGS.includes(type)) {
      throw new BadRequestException('Tipo de catálogo no válido');
    }
    const modelMap: Record<string, any> = {
      'data-subject-types': this.prisma.dataSubjectType,
      'data-categories': this.prisma.dataCategory,
      'data-items': this.prisma.dataItem,
      'legal-bases': this.prisma.legalBasis,
      'third-party-types': this.prisma.thirdPartyType,
      'third-parties': this.prisma.thirdParty,
      'countries': this.prisma.country,
      'security-measures': this.prisma.securityMeasure,
      'retention-rules': this.prisma.retentionRule,
      'lifecycle-phases': this.prisma.lifecyclePhase,
      'risks': this.prisma.risk,
    };
    return modelMap[type];
  }

  async findAll(type: string, companyId?: string) {
    const model = this.getModel(type);
    const where: any = {};

    // Modelos que tienen campo companyId en el schema
    const modelsWithCompanyId = [
      'data-subject-types',
      'data-categories',
      'data-items',
      'legal-bases',
      'third-parties',
      'security-measures',
      'retention-rules',
      'lifecycle-phases',
      'risks',
    ];

    if (companyId && modelsWithCompanyId.includes(type)) {
      where.companyId = companyId;
    }

    const include: any = {};
    if (type === 'data-items') include.dataCategory = true;
    if (type === 'third-parties') {
      include.country = true;
      include.thirdPartyType = true;
    }

    return model.findMany({ where, include, orderBy: { name: 'asc' } });
  }

  async findOne(type: string, id: string) {
    const model = this.getModel(type);
    const include: any = {};
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
    const item = await this.findOne(type, id);
    return model.update({ where: { id }, data: { isActive: !item.isActive } });
  }

  private buildData(type: string, dto: any) {
    const data: any = {};

    if (dto.code !== undefined) data.code = dto.code;
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.companyId !== undefined) data.companyId = dto.companyId;

    switch (type) {
      case 'data-categories':
        if (dto.isSpecialCategory !== undefined) data.isSpecialCategory = dto.isSpecialCategory;
        break;
      case 'data-items':
        if (dto.dataCategoryId !== undefined) data.dataCategoryId = dto.dataCategoryId;
        if (dto.isSensitive !== undefined) data.isSensitive = dto.isSensitive;
        break;
      case 'legal-bases':
        if (dto.legalReference !== undefined) data.legalReference = dto.legalReference;
        break;
      case 'security-measures':
      case 'risks':
        if (dto.category !== undefined) data.category = dto.category;
        break;
      case 'retention-rules':
        if (dto.defaultTerm !== undefined) data.defaultTerm = dto.defaultTerm;
        if (dto.legalReference !== undefined) data.legalReference = dto.legalReference;
        break;
      case 'lifecycle-phases':
        if (dto.orderIndex !== undefined) data.orderIndex = dto.orderIndex;
        break;
      case 'countries':
        if (dto.isoCode !== undefined) data.isoCode = dto.isoCode;
        if (dto.region !== undefined) data.region = dto.region;
        break;
      case 'risks':
        if (dto.severity !== undefined) data.severity = dto.severity;
        break;
      case 'third-parties':
        if (dto.identificationNumber !== undefined) data.identificationNumber = dto.identificationNumber;
        if (dto.countryId !== undefined) data.countryId = dto.countryId;
        if (dto.thirdPartyTypeId !== undefined) data.thirdPartyTypeId = dto.thirdPartyTypeId;
        if (dto.legalAddress !== undefined) data.legalAddress = dto.legalAddress;
        if (dto.contactName !== undefined) data.contactName = dto.contactName;
        if (dto.contactEmail !== undefined) data.contactEmail = dto.contactEmail;
        if (dto.contactPhone !== undefined) data.contactPhone = dto.contactPhone;
        if (dto.actsAsProcessor !== undefined) data.actsAsProcessor = dto.actsAsProcessor;
        if (dto.actsAsRecipient !== undefined) data.actsAsRecipient = dto.actsAsRecipient;
        if (dto.actsAsJointController !== undefined) data.actsAsJointController = dto.actsAsJointController;
        if (dto.contractExists !== undefined) data.contractExists = dto.contractExists;
        if (dto.confidentialityAgreementExists !== undefined) data.confidentialityAgreementExists = dto.confidentialityAgreementExists;
        if (dto.usesSubprocessors !== undefined) data.usesSubprocessors = dto.usesSubprocessors;
        if (dto.notes !== undefined) data.notes = dto.notes;
        break;
    }

    return data;
  }
}

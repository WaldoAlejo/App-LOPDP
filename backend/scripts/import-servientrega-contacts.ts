import * as fs from 'fs';
import * as path from 'path';

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

type ParsedRow = {
  line: number;
  macro: string;
  process: string;
  email: string;
  user: string;
  position: string;
};

type InvalidRow = {
  line: number;
  reason: string;
  raw: string;
};

type CliOptions = {
  filePath: string;
  companyId?: string;
  roleCode: string;
  apply: boolean;
  createUsers: boolean;
  defaultPassword?: string;
};

const prisma = new PrismaClient();

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    filePath: path.resolve(process.cwd(), '..', 'Lista de correos - Procesos.csv'),
    roleCode: 'PROCESS_LEADER',
    apply: false,
    createUsers: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--file' && next) {
      options.filePath = path.resolve(process.cwd(), next);
      index += 1;
      continue;
    }

    if (arg === '--company-id' && next) {
      options.companyId = next;
      index += 1;
      continue;
    }

    if (arg === '--role-code' && next) {
      options.roleCode = next;
      index += 1;
      continue;
    }

    if (arg === '--default-password' && next) {
      options.defaultPassword = next;
      index += 1;
      continue;
    }

    if (arg === '--apply') {
      options.apply = true;
      continue;
    }

    if (arg === '--create-users') {
      options.createUsers = true;
    }
  }

  return options;
}

function normalize(value: string | undefined): string {
  return (value ?? '').replace(/^\uFEFF/, '').trim();
}

function normalizeText(value: string | undefined): string {
  return normalize(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

function splitFirstColumns(line: string, columns: number): string[] {
  const parts = line.split(';');
  const result = parts.slice(0, columns);
  while (result.length < columns) {
    result.push('');
  }
  return result;
}

function isEmail(value: string): boolean {
  return /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}

function splitPersonName(fullName: string): { firstName: string; lastName: string } {
  const tokens = fullName
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length === 0) {
    return { firstName: 'Sin', lastName: 'Nombre' };
  }

  if (tokens.length === 1) {
    return { firstName: tokens[0], lastName: 'N/A' };
  }

  if (tokens.length === 2) {
    return { firstName: tokens[0], lastName: tokens[1] };
  }

  const lastName = tokens.slice(-2).join(' ');
  const firstName = tokens.slice(0, -2).join(' ');
  return { firstName, lastName };
}

function getAreaResponsiblePriority(position: string): number {
  const normalized = normalizeText(position);

  if (normalized.includes('FACILITADOR')) {
    return 100;
  }

  if (normalized.includes('DINAMIZADOR')) {
    return 80;
  }

  if (normalized.includes('GERENCIA REGIONAL') || normalized.includes('GERENTE REGIONAL')) {
    return 100;
  }

  if (normalized.includes('ADMINISTRADOR')) {
    return 60;
  }

  if (normalized.includes('JEFE')) {
    return 50;
  }

  if (normalized.includes('ANALISTA')) {
    return 40;
  }

  return 10;
}

function getProcessResponsiblePriority(position: string): number {
  const normalized = normalizeText(position);

  if (normalized.includes('DINAMIZADOR')) {
    return 100;
  }

  if (normalized.includes('GERENCIA DE PROCESO') || normalized.includes('GERENTE DE PROCESO')) {
    return 100;
  }

  if (normalized.includes('FACILITADOR')) {
    return 80;
  }

  if (normalized.includes('ADMINISTRADOR')) {
    return 60;
  }

  if (normalized.includes('JEFE')) {
    return 50;
  }

  if (normalized.includes('ANALISTA')) {
    return 40;
  }

  return 10;
}

function selectPreferredRow(rows: ParsedRow[], getPriority: (position: string) => number): ParsedRow | undefined {
  let best:
    | {
        row: ParsedRow;
        priority: number;
      }
    | undefined;

  for (const row of rows) {
    const priority = getPriority(row.position);

    if (!best || priority > best.priority || (priority === best.priority && row.line < best.row.line)) {
      best = { row, priority };
    }
  }

  return best?.row;
}

function selectPreferredResponsible(
  rows: ParsedRow[],
  resolvedUsers: Map<string, string>,
  getPriority: (position: string) => number,
): { userId?: string; line?: number; email?: string; position?: string } {
  const sortedCandidates = [...rows].sort((left, right) => {
    const priorityDiff = getPriority(right.position) - getPriority(left.position);
    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return left.line - right.line;
  });

  for (const row of sortedCandidates) {
    const userId = resolvedUsers.get(row.email);
    if (!userId) {
      continue;
    }

    return {
      userId,
      line: row.line,
      email: row.email,
      position: row.position,
    };
  }

  return {};
}

function buildResponsiblePreview(rows: ParsedRow[]) {
  const areaRows = new Map<string, ParsedRow[]>();
  const processRows = new Map<string, ParsedRow[]>();

  for (const row of rows) {
    areaRows.set(row.macro, [...(areaRows.get(row.macro) ?? []), row]);

    const processKey = `${row.macro}|||${row.process}`;
    processRows.set(processKey, [...(processRows.get(processKey) ?? []), row]);
  }

  const areaResponsibles = [...areaRows.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([macro, groupedRows]) => {
      const selected = selectPreferredRow(groupedRows, getAreaResponsiblePriority);
      return {
        macro,
        responsibleEmail: selected?.email,
        responsibleName: selected?.user,
        responsiblePosition: selected?.position,
        sourceLine: selected?.line,
      };
    });

  const processResponsibles = [...processRows.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([processKey, groupedRows]) => {
      const [macro, process] = processKey.split('|||');
      const selected = selectPreferredRow(groupedRows, getProcessResponsiblePriority);

      return {
        macro,
        process,
        responsibleEmail: selected?.email,
        responsibleName: selected?.user,
        responsiblePosition: selected?.position,
        sourceLine: selected?.line,
      };
    });

  return {
    areaResponsibles,
    processResponsibles,
  };
}

function parseCsv(filePath: string): { validRows: ParsedRow[]; invalidRows: InvalidRow[]; blankRows: number } {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);

  const validRows: ParsedRow[] = [];
  const invalidRows: InvalidRow[] = [];
  let blankRows = 0;

  for (let index = 1; index < lines.length; index += 1) {
    const rawLine = lines[index];
    if (!rawLine) {
      continue;
    }

    const [macro, process, email, user, position] = splitFirstColumns(rawLine, 5).map(normalize);
    const lineNumber = index + 1;

    if (!macro && !process && !email && !user && !position) {
      blankRows += 1;
      continue;
    }

    if (!macro || !process || !email || !user) {
      invalidRows.push({ line: lineNumber, reason: 'required_fields_missing', raw: rawLine });
      continue;
    }

    if (!isEmail(email)) {
      invalidRows.push({ line: lineNumber, reason: 'invalid_email', raw: rawLine });
      continue;
    }

    validRows.push({
      line: lineNumber,
      macro,
      process,
      email: email.toLowerCase(),
      user,
      position,
    });
  }

  return { validRows, invalidRows, blankRows };
}

function summarize(validRows: ParsedRow[], invalidRows: InvalidRow[], blankRows: number) {
  const macroCounts = new Map<string, number>();
  const processCounts = new Map<string, number>();
  const emailCounts = new Map<string, number>();

  for (const row of validRows) {
    macroCounts.set(row.macro, (macroCounts.get(row.macro) ?? 0) + 1);
    processCounts.set(row.process, (processCounts.get(row.process) ?? 0) + 1);
    emailCounts.set(row.email, (emailCounts.get(row.email) ?? 0) + 1);
  }

  return {
    totalRows: validRows.length + invalidRows.length + blankRows,
    validRows: validRows.length,
    invalidRows: invalidRows.length,
    blankRows,
    uniqueMacros: macroCounts.size,
    uniqueProcesses: processCounts.size,
    uniqueEmails: emailCounts.size,
    macros: [...macroCounts.entries()]
      .sort((left, right) => left[0].localeCompare(right[0]))
      .map(([name, count]) => ({ name, count })),
    topDuplicateEmails: [...emailCounts.entries()]
      .filter(([, count]) => count > 1)
      .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
      .slice(0, 20)
      .map(([email, count]) => ({ email, count })),
    invalidDetails: invalidRows.slice(0, 20),
  };
}

function summarizeInvalidRows(invalidRows: InvalidRow[]) {
  return invalidRows.slice(0, 20).map((row) => ({
    ...row,
    raw: row.raw.length > 160 ? `${row.raw.slice(0, 160)}...` : row.raw,
  }));
}

async function ensureCompany(companyId: string) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) {
    throw new Error(`Company not found: ${companyId}`);
  }
  return company;
}

async function ensureRole(roleCode: string) {
  const role = await prisma.role.findUnique({ where: { code: roleCode } });
  if (!role) {
    throw new Error(`Role not found: ${roleCode}`);
  }
  return role;
}

async function findOrCreateArea(companyId: string, name: string, responsibleUserId?: string) {
  const existing = await prisma.area.findFirst({
    where: { companyId, name },
  });

  if (existing) {
    if (!existing.responsibleUserId && responsibleUserId) {
      const updated = await prisma.area.update({
        where: { id: existing.id },
        data: { responsibleUserId },
      });
      return { area: updated, created: false };
    }

    return { area: existing, created: false };
  }

  const created = await prisma.area.create({
    data: {
      companyId,
      name,
      responsibleUserId,
      isActive: true,
    },
  });
  return { area: created, created: true };
}

async function findOrCreateProcess(companyId: string, areaId: string, name: string, responsibleUserId?: string) {
  const existing = await prisma.process.findFirst({
    where: { companyId, areaId, name },
  });

  if (existing) {
    if (!existing.responsibleUserId && responsibleUserId) {
      const updated = await prisma.process.update({
        where: { id: existing.id },
        data: { responsibleUserId },
      });
      return { process: updated, created: false };
    }

    return { process: existing, created: false };
  }

  const created = await prisma.process.create({
    data: {
      companyId,
      areaId,
      name,
      responsibleUserId,
      isActive: true,
    },
  });
  return { process: created, created: true };
}

async function findOrCreateUser(
  row: ParsedRow,
  companyId: string,
  roleId: string,
  areaId: string,
  createUsers: boolean,
  defaultPassword?: string,
) {
  const existing = await prisma.user.findUnique({ where: { email: row.email } });
  if (existing) {
    const data: { areaId?: string; companyId?: string; position?: string } = {};

    if (!existing.areaId) {
      data.areaId = areaId;
    }

    if (!existing.companyId) {
      data.companyId = companyId;
    }

    if (!existing.position && row.position) {
      data.position = row.position;
    }

    if (Object.keys(data).length > 0) {
      const updated = await prisma.user.update({ where: { id: existing.id }, data });
      return { user: updated, created: false };
    }

    return { user: existing, created: false };
  }

  if (!createUsers) {
    return null;
  }

  if (!defaultPassword) {
    throw new Error('Missing default password. Use --default-password when --create-users is enabled.');
  }

  const passwordHash = await bcrypt.hash(defaultPassword, 10);
  const { firstName, lastName } = splitPersonName(row.user);

  const created = await prisma.user.create({
    data: {
      companyId,
      areaId,
      roleId,
      firstName,
      lastName,
      email: row.email,
      position: row.position || null,
      passwordHash,
      isActive: true,
    },
  });
  return { user: created, created: true };
}

async function applyImport(rows: ParsedRow[], options: CliOptions) {
  if (!options.companyId) {
    throw new Error('The --company-id parameter is required when using --apply.');
  }

  const company = await ensureCompany(options.companyId);
  const role = await ensureRole(options.roleCode);

  let createdAreas = 0;
  let createdProcesses = 0;
  let createdUsers = 0;
  let linkedExistingUsers = 0;
  let unresolvedUsers = 0;
  let assignedAreaResponsibles = 0;
  let assignedProcessResponsibles = 0;

  const areaRows = new Map<string, ParsedRow[]>();
  const processRows = new Map<string, ParsedRow[]>();
  const userRows = new Map<string, ParsedRow[]>();
  const resolvedUsers = new Map<string, string>();
  const areasByMacro = new Map<string, string>();
  const processesByKey = new Map<string, string>();

  for (const row of rows) {
    const areaKey = row.macro;
    const processKey = `${row.macro}|||${row.process}`;

    areaRows.set(areaKey, [...(areaRows.get(areaKey) ?? []), row]);
    processRows.set(processKey, [...(processRows.get(processKey) ?? []), row]);
    userRows.set(row.email, [...(userRows.get(row.email) ?? []), row]);
  }

  for (const [macro] of areaRows.entries()) {
    const areaResult = await findOrCreateArea(company.id, macro);
    const area = areaResult.area;
    areasByMacro.set(macro, area.id);
    if (areaResult.created) {
      createdAreas += 1;
    }
  }

  for (const [processKey, groupedRows] of processRows.entries()) {
    const [macro, processName] = processKey.split('|||');
    const areaId = areasByMacro.get(macro);
    if (!areaId) {
      continue;
    }

    const processResult = await findOrCreateProcess(company.id, areaId, processName);
    processesByKey.set(processKey, processResult.process.id);
    if (processResult.created) {
      createdProcesses += 1;
    }
  }

  for (const [email, groupedRows] of userRows.entries()) {
    const selectedRow = groupedRows[0];
    const areaId = areasByMacro.get(selectedRow.macro);
    if (!areaId) {
      unresolvedUsers += 1;
      continue;
    }

    const userResult = await findOrCreateUser(
      selectedRow,
      company.id,
      role.id,
      areaId,
      options.createUsers,
      options.defaultPassword,
    );

    if (userResult) {
      resolvedUsers.set(email, userResult.user.id);
      if (userResult.created) {
        createdUsers += 1;
      } else {
        linkedExistingUsers += 1;
      }
    } else {
      unresolvedUsers += 1;
    }
  }

  for (const [macro, macroRows] of areaRows.entries()) {
    const areaId = areasByMacro.get(macro);
    if (!areaId) {
      continue;
    }

    const preferredAreaResponsible = selectPreferredResponsible(
      macroRows,
      resolvedUsers,
      getAreaResponsiblePriority,
    );

    if (preferredAreaResponsible.userId) {
      await prisma.area.update({
        where: { id: areaId },
        data: { responsibleUserId: preferredAreaResponsible.userId },
      });
      assignedAreaResponsibles += 1;
    }
  }

  for (const [processKey, groupedRows] of processRows.entries()) {
    const processId = processesByKey.get(processKey);
    if (!processId) {
      continue;
    }

    const preferredProcessResponsible = selectPreferredResponsible(
      groupedRows,
      resolvedUsers,
      getProcessResponsiblePriority,
    );

    if (preferredProcessResponsible.userId) {
      await prisma.process.update({
        where: { id: processId },
        data: { responsibleUserId: preferredProcessResponsible.userId },
      });
      assignedProcessResponsibles += 1;
    }
  }

  return {
    company: { id: company.id, legalName: company.legalName },
    roleCode: role.code,
    createdAreas,
    createdProcesses,
    createdUsers,
    linkedExistingUsers,
    unresolvedUsers,
    assignedAreaResponsibles,
    assignedProcessResponsibles,
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const { validRows, invalidRows, blankRows } = parseCsv(options.filePath);
  const summary = summarize(validRows, invalidRows, blankRows);
  const responsiblePreview = buildResponsiblePreview(validRows);

  console.log(
    JSON.stringify(
      {
        mode: options.apply ? 'apply' : 'dry-run',
        filePath: options.filePath,
        summary: {
          ...summary,
          invalidDetails: summarizeInvalidRows(invalidRows),
          responsiblePreview,
        },
      },
      null,
      2,
    ),
  );

  if (!options.apply) {
    return;
  }

  const result = await applyImport(validRows, options);
  console.log(JSON.stringify({ importResult: result }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
import type { Alignment, Cell, Row, Workbook, Worksheet } from "exceljs";
import type { Category, Goal, Summary, Transaction } from "@/types";

type SheetColumn<T> = {
  header: string;
  value: (item: T, index: number) => string | number;
  alignment?: Partial<Alignment>;
};

type SummaryItem = {
  label: string;
  value: string | number;
};

type ReportSheet<T> = {
  name: string;
  title: string;
  summary: SummaryItem[];
  columns: SheetColumn<T>[];
  rows: T[];
  decorateRow?: (row: Row, item: T, index: number) => void;
};

const HEADER_BACKGROUND = "244235";
const HEADER_TEXT = "FFFFFF";
const TITLE_BACKGROUND = "EAF4EE";
const TITLE_TEXT = "193126";
const META_TEXT = "5E6E66";
const LABEL_TEXT = "708178";
const BODY_TEXT = "21332B";
const BORDER = "D9E5DC";
const SURFACE = "FFFFFF";
const SURFACE_ALT = "F8FBF9";
const ACCENT_SURFACE = "F2F8F4";

function getExportDateLabel() {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date());
}

function getFileDateStamp() {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date());
}

function toCurrencyValue(value: number) {
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}

function toPercentValue(value: number) {
  return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value)}%`;
}

function formatExportDateTimeMsk(value: string) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Moscow",
  }).format(new Date(value));
}

function findCategoryName(categories: Category[], categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.name ?? "Без категории";
}

async function getExportRuntime() {
  const [{ default: ExcelJS }, { saveAs }] = await Promise.all([import("exceljs"), import("file-saver")]);
  return { ExcelJS, saveAs };
}

function createWorkbook(ExcelJS: typeof import("exceljs")) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Aura Finance";
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = false;
  return workbook;
}

function styleBaseSheet(sheet: Worksheet, frozenRows: number) {
  sheet.views = [{ state: "frozen", ySplit: frozenRows }];
  sheet.properties.defaultRowHeight = 22;
}

function applyTableCellStyle(cell: Cell, fill: string) {
  cell.font = { name: "Segoe UI", size: 10, color: { argb: BODY_TEXT } };
  cell.border = {
    top: { style: "thin", color: { argb: BORDER } },
    left: { style: "thin", color: { argb: BORDER } },
    bottom: { style: "thin", color: { argb: BORDER } },
    right: { style: "thin", color: { argb: BORDER } },
  };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: fill },
  };
}

function writeReportSheet<T>(workbook: Workbook, config: ReportSheet<T>) {
  const sheet = workbook.addWorksheet(config.name);
  const tableStartRow = Math.max(7, 5 + config.summary.length);
  styleBaseSheet(sheet, tableStartRow);

  const columnCount = Math.max(config.columns.length, 2);
  const lastColumnLetter = sheet.getColumn(columnCount).letter;

  sheet.mergeCells(`A1:${lastColumnLetter}1`);
  const titleCell = sheet.getCell("A1");
  titleCell.value = config.title;
  titleCell.font = {
    name: "Georgia",
    size: 19,
    bold: true,
    color: { argb: TITLE_TEXT },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TITLE_BACKGROUND },
  };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  sheet.getRow(1).height = 28;

  sheet.mergeCells(`A2:${lastColumnLetter}2`);
  const metaCell = sheet.getCell("A2");
  metaCell.value = `Экспортировано: ${getExportDateLabel()} (МСК)`;
  metaCell.font = {
    name: "Segoe UI",
    size: 10,
    color: { argb: META_TEXT },
  };
  metaCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: ACCENT_SURFACE },
  };

  config.summary.forEach((item, index) => {
    const rowNumber = 4 + index;
    const labelCell = sheet.getCell(`A${rowNumber}`);
    const valueCell = sheet.getCell(`B${rowNumber}`);

    labelCell.value = item.label;
    labelCell.font = { name: "Segoe UI", size: 10, color: { argb: LABEL_TEXT } };
    labelCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SURFACE_ALT },
    };

    valueCell.value = item.value;
    valueCell.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: BODY_TEXT } };
    valueCell.alignment = { horizontal: "left" };
    valueCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SURFACE_ALT },
    };
  });

  const headerRow = sheet.getRow(tableStartRow);

  config.columns.forEach((column, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = column.header;
    cell.font = {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: HEADER_TEXT },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_BACKGROUND },
    };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER } },
      left: { style: "thin", color: { argb: BORDER } },
      bottom: { style: "thin", color: { argb: BORDER } },
      right: { style: "thin", color: { argb: BORDER } },
    };
    cell.alignment = { vertical: "middle", horizontal: "left" };
  });
  headerRow.height = 22;

  config.rows.forEach((item, rowIndex) => {
    const row = sheet.getRow(tableStartRow + rowIndex + 1);

    config.columns.forEach((column, columnIndex) => {
      const cell = row.getCell(columnIndex + 1);
      cell.value = column.value(item, rowIndex);
      cell.alignment = column.alignment ?? { vertical: "top", horizontal: "left", wrapText: true };
      applyTableCellStyle(cell, rowIndex % 2 === 0 ? SURFACE : SURFACE_ALT);
    });

    config.decorateRow?.(row, item, rowIndex);
  });

  if (config.rows.length === 0) {
    const emptyRow = sheet.getRow(tableStartRow + 1);
    const emptyCell = emptyRow.getCell(1);
    emptyCell.value = "Данных пока нет";
    emptyCell.font = { name: "Segoe UI", italic: true, color: { argb: META_TEXT } };
    emptyCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SURFACE_ALT },
    };
    sheet.mergeCells(`A${tableStartRow + 1}:${lastColumnLetter}${tableStartRow + 1}`);
  }

  sheet.autoFilter = {
    from: { row: tableStartRow, column: 1 },
    to: { row: tableStartRow, column: config.columns.length },
  };

  config.columns.forEach((column, index) => {
    const values = [
      column.header,
      ...config.rows.map((item, rowIndex) => String(column.value(item, rowIndex) ?? "")),
    ];
    const width = Math.min(36, Math.max(12, ...values.map((value) => value.length + 2)));
    sheet.getColumn(index + 1).width = width;
  });
}

function writeCategorySection(
  sheet: Worksheet,
  startRow: number,
  title: string,
  typeLabel: string,
  categories: Category[]
) {
  sheet.mergeCells(`A${startRow}:C${startRow}`);
  const sectionTitle = sheet.getCell(`A${startRow}`);
  sectionTitle.value = title;
  sectionTitle.font = {
    name: "Segoe UI",
    size: 14,
    bold: true,
    color: { argb: TITLE_TEXT },
  };
  sectionTitle.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: ACCENT_SURFACE },
  };

  const summaryLabel = sheet.getCell(`A${startRow + 1}`);
  const summaryValue = sheet.getCell(`B${startRow + 1}`);
  summaryLabel.value = "Количество категорий";
  summaryValue.value = categories.length;
  summaryLabel.font = { name: "Segoe UI", size: 10, color: { argb: LABEL_TEXT } };
  summaryValue.font = { name: "Segoe UI", size: 11, bold: true, color: { argb: BODY_TEXT } };
  summaryLabel.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: SURFACE_ALT },
  };
  summaryValue.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: SURFACE_ALT },
  };

  const headerRowNumber = startRow + 3;
  const headers = ["Категория", "Тип", "Цвет"];
  headers.forEach((header, index) => {
    const cell = sheet.getRow(headerRowNumber).getCell(index + 1);
    cell.value = header;
    cell.font = {
      name: "Segoe UI",
      size: 10,
      bold: true,
      color: { argb: HEADER_TEXT },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_BACKGROUND },
    };
    cell.border = {
      top: { style: "thin", color: { argb: BORDER } },
      left: { style: "thin", color: { argb: BORDER } },
      bottom: { style: "thin", color: { argb: BORDER } },
      right: { style: "thin", color: { argb: BORDER } },
    };
  });

  if (categories.length === 0) {
    const emptyRow = headerRowNumber + 1;
    const emptyCell = sheet.getCell(`A${emptyRow}`);
    emptyCell.value = `Пока нет категорий типа "${typeLabel.toLowerCase()}"`;
    emptyCell.font = { name: "Segoe UI", italic: true, color: { argb: META_TEXT } };
    emptyCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: SURFACE_ALT },
    };
    sheet.mergeCells(`A${emptyRow}:C${emptyRow}`);
    return emptyRow + 2;
  }

  categories.forEach((category, index) => {
    const rowNumber = headerRowNumber + 1 + index;
    const row = sheet.getRow(rowNumber);
    const fill = index % 2 === 0 ? SURFACE : SURFACE_ALT;

    row.getCell(1).value = category.name;
    row.getCell(2).value = typeLabel;
    row.getCell(3).value = category.color;

    [1, 2, 3].forEach((columnIndex) => {
      const cell = row.getCell(columnIndex);
      applyTableCellStyle(cell, fill);
    });

    const colorCell = row.getCell(3);
    colorCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: category.color.replace("#", "").toUpperCase() },
    };
    colorCell.font = { name: "Segoe UI", size: 10, color: { argb: "0B0B0B" }, bold: true };
  });

  return headerRowNumber + categories.length + 2;
}

async function saveWorkbook(workbook: Workbook, fileName: string) {
  const { saveAs } = await getExportRuntime();
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileName
  );
}

export async function exportExpensesReport(data: {
  transactions: Transaction[];
  categories: Category[];
  summary: Summary;
}) {
  const { ExcelJS } = await getExportRuntime();
  const workbook = createWorkbook(ExcelJS);
  const rows = data.transactions.filter((transaction) => transaction.type === "expense");
  const totalExpenses = rows.reduce((acc, transaction) => acc + transaction.amount, 0);

  writeReportSheet(workbook, {
    name: "Расходы",
    title: "Aura Finance — Расходы",
    summary: [
      { label: "Всего расходов", value: toCurrencyValue(totalExpenses) },
      { label: "Операций", value: rows.length },
      { label: "Текущий баланс", value: toCurrencyValue(data.summary.balance) },
    ],
    columns: [
      { header: "Дата", value: (item) => formatExportDateTimeMsk(item.createdAt) },
      { header: "Операция", value: (item) => item.title },
      { header: "Категория", value: (item) => findCategoryName(data.categories, item.categoryId) },
      { header: "Сумма", value: (item) => toCurrencyValue(item.amount) },
    ],
    rows,
  });

  await saveWorkbook(workbook, `aura-expenses-${getFileDateStamp()}.xlsx`);
}

export async function exportIncomeReport(data: {
  transactions: Transaction[];
  categories: Category[];
  summary: Summary;
}) {
  const { ExcelJS } = await getExportRuntime();
  const workbook = createWorkbook(ExcelJS);
  const rows = data.transactions.filter((transaction) => transaction.type === "income");
  const totalIncome = rows.reduce((acc, transaction) => acc + transaction.amount, 0);

  writeReportSheet(workbook, {
    name: "Доходы",
    title: "Aura Finance — Доходы",
    summary: [
      { label: "Всего доходов", value: toCurrencyValue(totalIncome) },
      { label: "Операций", value: rows.length },
      { label: "Текущий баланс", value: toCurrencyValue(data.summary.balance) },
    ],
    columns: [
      { header: "Дата", value: (item) => formatExportDateTimeMsk(item.createdAt) },
      { header: "Операция", value: (item) => item.title },
      { header: "Категория", value: (item) => findCategoryName(data.categories, item.categoryId) },
      { header: "Сумма", value: (item) => toCurrencyValue(item.amount) },
    ],
    rows,
  });

  await saveWorkbook(workbook, `aura-income-${getFileDateStamp()}.xlsx`);
}

export async function exportTransactionsReport(data: {
  transactions: Transaction[];
  categories: Category[];
  summary: Summary;
}) {
  const { ExcelJS } = await getExportRuntime();
  const workbook = createWorkbook(ExcelJS);

  writeReportSheet(workbook, {
    name: "Транзакции",
    title: "Aura Finance — Все транзакции",
    summary: [
      { label: "Доходы", value: toCurrencyValue(data.summary.income) },
      { label: "Расходы", value: toCurrencyValue(data.summary.expenses) },
      { label: "Баланс", value: toCurrencyValue(data.summary.balance) },
      { label: "Всего строк", value: data.transactions.length },
    ],
    columns: [
      { header: "Дата", value: (item) => formatExportDateTimeMsk(item.createdAt) },
      { header: "Тип", value: (item) => (item.type === "expense" ? "Расход" : "Доход") },
      { header: "Операция", value: (item) => item.title },
      { header: "Категория", value: (item) => findCategoryName(data.categories, item.categoryId) },
      { header: "Сумма", value: (item) => toCurrencyValue(item.amount) },
    ],
    rows: data.transactions,
  });

  await saveWorkbook(workbook, `aura-transactions-${getFileDateStamp()}.xlsx`);
}

export async function exportGoalsReport(data: { goals: Goal[] }) {
  const { ExcelJS } = await getExportRuntime();
  const workbook = createWorkbook(ExcelJS);
  const totalCurrent = data.goals.reduce((acc, goal) => acc + goal.currentAmount, 0);
  const totalTarget = data.goals.reduce((acc, goal) => acc + goal.targetAmount, 0);
  const totalRemaining = data.goals.reduce(
    (acc, goal) => acc + Math.max(goal.targetAmount - goal.currentAmount, 0),
    0
  );

  writeReportSheet(workbook, {
    name: "Цели",
    title: "Aura Finance — Цели",
    summary: [
      { label: "Всего целей", value: data.goals.length },
      { label: "Накоплено", value: toCurrencyValue(totalCurrent) },
      { label: "Целевой объём", value: toCurrencyValue(totalTarget) },
      { label: "Осталось накопить", value: toCurrencyValue(totalRemaining) },
    ],
    columns: [
      { header: "Цель", value: (item) => item.title },
      { header: "Описание", value: (item) => item.description },
      { header: "Накоплено", value: (item) => toCurrencyValue(item.currentAmount) },
      { header: "Целевая сумма", value: (item) => toCurrencyValue(item.targetAmount) },
      { header: "Осталось", value: (item) => toCurrencyValue(Math.max(item.targetAmount - item.currentAmount, 0)) },
      { header: "Прогресс", value: (item) => toPercentValue((item.currentAmount / item.targetAmount) * 100) },
    ],
    rows: data.goals,
  });

  await saveWorkbook(workbook, `aura-goals-${getFileDateStamp()}.xlsx`);
}

export async function exportCategoriesReport(data: { categories: Category[] }) {
  const { ExcelJS } = await getExportRuntime();
  const workbook = createWorkbook(ExcelJS);
  const sheet = workbook.addWorksheet("Категории");
  const expenseCategories = data.categories.filter((category) => category.type === "expense");
  const incomeCategories = data.categories.filter((category) => category.type === "income");

  styleBaseSheet(sheet, 7);
  sheet.columns = [{ width: 24 }, { width: 16 }, { width: 16 }];

  sheet.mergeCells("A1:C1");
  const titleCell = sheet.getCell("A1");
  titleCell.value = "Aura Finance — Категории";
  titleCell.font = {
    name: "Georgia",
    size: 19,
    bold: true,
    color: { argb: TITLE_TEXT },
  };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: TITLE_BACKGROUND },
  };

  sheet.mergeCells("A2:C2");
  const metaCell = sheet.getCell("A2");
  metaCell.value = `Экспортировано: ${getExportDateLabel()} (МСК)`;
  metaCell.font = {
    name: "Segoe UI",
    size: 10,
    color: { argb: META_TEXT },
  };
  metaCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: ACCENT_SURFACE },
  };

  const nextRowAfterExpenses = writeCategorySection(
    sheet,
    4,
    "Категории расходов",
    "Расходы",
    expenseCategories
  );
  writeCategorySection(
    sheet,
    nextRowAfterExpenses + 1,
    "Категории доходов",
    "Доходы",
    incomeCategories
  );

  await saveWorkbook(workbook, `aura-categories-${getFileDateStamp()}.xlsx`);
}

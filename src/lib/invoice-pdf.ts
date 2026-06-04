import type { ApiOrder, ApiOrderItem } from "@/services/order.service";

const PAGE_WIDTH = 595;
const PAGE_HEIGHT = 842;
const MARGIN = 40;
const TABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;

type FontName = "F1" | "F2";
type PdfColor = [number, number, number];

const COLORS = {
  amber: [0.96, 0.62, 0.04] as PdfColor,
  dark: [0.08, 0.11, 0.18] as PdfColor,
  muted: [0.39, 0.45, 0.55] as PdfColor,
  border: [0.88, 0.91, 0.95] as PdfColor,
  white: [1, 1, 1] as PdfColor,
};

function normalizeText(value: unknown, fallback = "Not available"): string {
  const text = String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text || fallback;
}

function escapePdfText(value: unknown): string {
  return normalizeText(value, "").replace(/([\\()])/g, "\\$1");
}

function formatNumber(amount: number | undefined): string {
  const safeAmount = Number.isFinite(amount) ? amount ?? 0 : 0;
  return safeAmount.toLocaleString("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatMoney(amount: number | undefined): string {
  return `BDT ${formatNumber(amount)}`;
}

function formatDateTime(value: string | undefined): string {
  if (!value) return "Not available";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function orderNumber(order: ApiOrder): string {
  return normalizeText(order._id, "order").slice(-12);
}

function customerName(order: ApiOrder): string {
  return typeof order.user === "object" ? normalizeText(order.user.name, "Customer") : "Customer";
}

function customerEmail(order: ApiOrder): string {
  return typeof order.user === "object" ? normalizeText(order.user.email, "Not available") : "Not available";
}

function customerPhone(order: ApiOrder): string {
  return typeof order.user === "object" ? normalizeText(order.user.phone, "Not available") : "Not available";
}

function productName(item: ApiOrderItem): string {
  if (typeof item.product === "object") return normalizeText(item.product.name, "Product");
  return normalizeText(item.product, "Product");
}

function itemMeta(item: ApiOrderItem): string {
  const parts = [
    item.size ? `Size: ${normalizeText(item.size)}` : "",
    item.color ? `Color: ${normalizeText(item.color)}` : "",
  ].filter(Boolean);

  return parts.join(" | ");
}

function wrapText(value: string, maxChars: number): string[] {
  const words = normalizeText(value).split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    if (`${current} ${word}`.length <= maxChars) {
      current = `${current} ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) lines.push(current);
  return lines.length ? lines : ["Not available"];
}

function color([r, g, b]: PdfColor): string {
  return `${r} ${g} ${b}`;
}

function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildPdf(commandsByPage: string[][]): Blob {
  const pageObjectsStart = 5;
  const pageRefs = commandsByPage
    .map((_, index) => `${pageObjectsStart + index * 2} 0 R`)
    .join(" ");

  const objects: { id: number; body: string }[] = [
    { id: 1, body: "<< /Type /Catalog /Pages 2 0 R >>" },
    { id: 2, body: `<< /Type /Pages /Kids [${pageRefs}] /Count ${commandsByPage.length} >>` },
    { id: 3, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>" },
    { id: 4, body: "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>" },
  ];

  commandsByPage.forEach((commands, index) => {
    const pageId = pageObjectsStart + index * 2;
    const contentId = pageId + 1;
    const content = commands.join("\n");

    objects.push({
      id: pageId,
      body: [
        "<< /Type /Page",
        "/Parent 2 0 R",
        `/MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}]`,
        "/Resources << /Font << /F1 3 0 R /F2 4 0 R >> >>",
        `/Contents ${contentId} 0 R`,
        ">>",
      ].join(" "),
    });
    objects.push({
      id: contentId,
      body: `<< /Length ${content.length + 1} >>\nstream\n${content}\nendstream`,
    });
  });

  objects.sort((a, b) => a.id - b.id);

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (const object of objects) {
    offsets[object.id] = pdf.length;
    pdf += `${object.id} 0 obj\n${object.body}\nendobj\n`;
  }

  const startXref = pdf.length;
  const maxObjectId = objects[objects.length - 1]?.id ?? 0;

  pdf += `xref\n0 ${maxObjectId + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let id = 1; id <= maxObjectId; id += 1) {
    pdf += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObjectId + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${startXref}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadInvoicePdf(order: ApiOrder): void {
  const pages: string[][] = [[]];
  let pageIndex = 0;
  let y = PAGE_HEIGHT - MARGIN;

  const currentPage = () => pages[pageIndex];

  const addText = (
    text: unknown,
    x: number,
    textY: number,
    options: { size?: number; font?: FontName; fill?: PdfColor } = {}
  ) => {
    const size = options.size ?? 10;
    const font = options.font ?? "F1";
    const fill = options.fill ?? COLORS.dark;
    currentPage().push(
      `q ${color(fill)} rg BT /${font} ${size} Tf ${x} ${textY} Td (${escapePdfText(text)}) Tj ET Q`
    );
  };

  const addLine = (x1: number, y1: number, x2: number, y2: number, stroke = COLORS.border) => {
    currentPage().push(`q ${color(stroke)} RG ${x1} ${y1} m ${x2} ${y2} l S Q`);
  };

  const addRect = (x: number, rectY: number, width: number, height: number, fill = COLORS.amber) => {
    currentPage().push(`q ${color(fill)} rg ${x} ${rectY} ${width} ${height} re f Q`);
  };

  const addPage = () => {
    pageIndex += 1;
    pages[pageIndex] = [];
    y = PAGE_HEIGHT - MARGIN;
    addText("LooksBee", MARGIN, y, { size: 16, font: "F2", fill: COLORS.amber });
    addText(`Invoice #${orderNumber(order)} continued`, MARGIN, y - 18, {
      size: 9,
      fill: COLORS.muted,
    });
    addLine(MARGIN, y - 30, PAGE_WIDTH - MARGIN, y - 30);
    y -= 54;
  };

  const ensureSpace = (height: number) => {
    if (y - height < 92) addPage();
  };

  const addField = (label: string, value: unknown, x: number, fieldY: number) => {
    addText(label, x, fieldY, { size: 8, font: "F2", fill: COLORS.muted });
    addText(value, x, fieldY - 14, { size: 10, font: "F2", fill: COLORS.dark });
  };

  const addTableHeader = () => {
    addRect(MARGIN, y - 7, TABLE_WIDTH, 24, COLORS.amber);
    addText("Item", MARGIN + 10, y, { size: 9, font: "F2", fill: COLORS.white });
    addText("Qty", 310, y, { size: 9, font: "F2", fill: COLORS.white });
    addText("Unit Price", 355, y, { size: 9, font: "F2", fill: COLORS.white });
    addText("Line Total", 460, y, { size: 9, font: "F2", fill: COLORS.white });
    y -= 28;
  };

  addText("LooksBee", MARGIN, y, { size: 20, font: "F2", fill: COLORS.amber });
  addText("Customer invoice", MARGIN, y - 18, { size: 9, fill: COLORS.muted });
  addText("INVOICE", 435, y, { size: 24, font: "F2", fill: COLORS.dark });
  addLine(MARGIN, y - 34, PAGE_WIDTH - MARGIN, y - 34);
  y -= 64;

  addField("ORDER ID", `#${orderNumber(order)}`, MARGIN, y);
  addField("ORDER DATE", formatDateTime(order.order_date ?? order.createdAt), 210, y);
  addField("INVOICE DATE", formatDateTime(new Date().toISOString()), 390, y);
  y -= 48;

  addField("CUSTOMER", customerName(order), MARGIN, y);
  addField("EMAIL", customerEmail(order), 210, y);
  addField("PHONE", customerPhone(order), 390, y);
  y -= 48;

  addText("DELIVERY ADDRESS", MARGIN, y, { size: 8, font: "F2", fill: COLORS.muted });
  const addressLines = wrapText(order.delivery_address, 92);
  addressLines.forEach((line, index) => {
    addText(line, MARGIN, y - 14 - index * 12, { size: 10, fill: COLORS.dark });
  });
  y -= 28 + addressLines.length * 12;

  addField("PAYMENT STATUS", normalizeText(order.payment_status ?? "pending"), MARGIN, y);
  addField("PAYMENT METHOD", normalizeText(order.payment_method ?? "Not available").replace(/_/g, " "), 210, y);
  addField("DELIVERY STATUS", normalizeText(order.delivery_status ?? "pending").replace(/_/g, " "), 390, y);
  y -= 52;

  addTableHeader();

  for (const item of order.items) {
    const nameLines = wrapText(productName(item), 42);
    const meta = itemMeta(item);
    const rowHeight = Math.max(28, nameLines.length * 12 + (meta ? 12 : 0) + 10);
    ensureSpace(rowHeight + 12);

    if (y > PAGE_HEIGHT - MARGIN - 70) addTableHeader();

    nameLines.forEach((line, index) => {
      addText(line, MARGIN + 10, y - index * 12, {
        size: 9,
        font: index === 0 ? "F2" : "F1",
        fill: COLORS.dark,
      });
    });

    if (meta) {
      addText(meta, MARGIN + 10, y - nameLines.length * 12, { size: 8, fill: COLORS.muted });
    }

    addText(item.quantity, 310, y, { size: 9, fill: COLORS.dark });
    addText(formatMoney(item.price), 355, y, { size: 9, fill: COLORS.dark });
    addText(formatMoney(item.total_price), 460, y, { size: 9, font: "F2", fill: COLORS.dark });
    addLine(MARGIN, y - rowHeight + 6, PAGE_WIDTH - MARGIN, y - rowHeight + 6);
    y -= rowHeight;
  }

  ensureSpace(130);
  y -= 10;
  addLine(350, y, PAGE_WIDTH - MARGIN, y);
  y -= 22;

  addText("Subtotal", 360, y, { size: 10, fill: COLORS.muted });
  addText(formatMoney(order.total_amount), 460, y, { size: 10, fill: COLORS.dark });
  y -= 18;

  if (order.coupon_applied || order.discount > 0) {
    addText("Discount", 360, y, { size: 10, fill: COLORS.muted });
    addText(`-${formatMoney(order.discount)}`, 460, y, { size: 10, fill: COLORS.dark });
    y -= 18;
  }

  addLine(350, y + 8, PAGE_WIDTH - MARGIN, y + 8);
  addText("Total", 360, y - 8, { size: 12, font: "F2", fill: COLORS.dark });
  addText(formatMoney(order.final_amount), 460, y - 8, { size: 12, font: "F2", fill: COLORS.dark });
  y -= 42;

  if (order.notes) {
    ensureSpace(48);
    addText("NOTES", MARGIN, y, { size: 8, font: "F2", fill: COLORS.muted });
    wrapText(order.notes, 92).forEach((line, index) => {
      addText(line, MARGIN, y - 14 - index * 12, { size: 9, fill: COLORS.dark });
    });
  }

  pages.forEach((page, index) => {
    page.push(
      `q ${color(COLORS.muted)} rg BT /F1 8 Tf ${MARGIN} 38 Td (Generated by LooksBee Dashboard) Tj ET Q`
    );
    page.push(
      `q ${color(COLORS.muted)} rg BT /F1 8 Tf ${PAGE_WIDTH - 86} 38 Td (Page ${index + 1} of ${pages.length}) Tj ET Q`
    );
  });

  const blob = buildPdf(pages);
  const filename = `invoice-${orderNumber(order).replace(/[^a-z0-9-]/gi, "")}.pdf`;
  downloadBlob(filename, blob);
}

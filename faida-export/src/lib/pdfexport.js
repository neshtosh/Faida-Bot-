/**
 * Faida PDF Export
 * ──────────────────────────────────────────────────────────
 * Generates printable PDF files from filled web or benefit forms.
 */

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { logger } = require("./logger");

const EXPORT_DIR = path.join(__dirname, "../../data/pdf-exports");

/**
 * Ensures the PDF export directory exists.
 */
function ensureExportDir() {
  if (!fs.existsSync(EXPORT_DIR)) {
    fs.mkdirSync(EXPORT_DIR, { recursive: true });
  }
}

/**
 * Builds a PDF file from form data and returns the file path.
 */
function generateFormPdf({ title, sourceUrl, refCode, fields, answers, lang = "en" }) {
  ensureExportDir();

  const safeRef = (refCode || "FAIDA").replace(/[^\w-]/g, "");
  const filePath = path.join(EXPORT_DIR, `${safeRef}-${Date.now()}.pdf`);
  const isSw = lang === "sw";

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(18).text(isSw ? "Faida — Fomu Iliyojazwa" : "Faida — Pre-filled Form", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#444444");
    doc.text(`${isSw ? "Kichwa" : "Title"}: ${title || "Application"}`);
    doc.text(`${isSw ? "Chanzo" : "Source"}: ${sourceUrl || "—"}`);
    doc.text(`${isSw ? "Msimbo wa kumbukumbu" : "Reference"}: ${refCode || "—"}`);
    doc.text(
      `${isSw ? "Tarehe" : "Date"}: ${new Date().toLocaleString("en-KE", { timeZone: "Africa/Nairobi" })}`
    );
    doc.moveDown();

    doc.fillColor("#000000").fontSize(13).text(isSw ? "Maelezo" : "Details", { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);

    for (const field of fields || []) {
      const val = answers?.[field.key];
      if (!val) continue;
      doc.font("Helvetica-Bold").text(`${field.label}:`, { continued: false });
      doc.font("Helvetica").text(String(val));
      doc.moveDown(0.3);
    }

    doc.moveDown();
    doc.fontSize(10).fillColor("#555555");
    doc.text(
      isSw
        ? "Uthibitisho: Nafanya uthibitisho kwamba taarifa hapo juu ni za kweli."
        : "Declaration: I declare that the information above is true and accurate."
    );
    doc.moveDown(2);
    doc.text(isSw ? "Sahihi: _________________________" : "Signature: _________________________");

    doc.end();

    stream.on("finish", () => {
      logger.info({ event: "pdf_generated", filePath, refCode }, "PDF generated");
      resolve(filePath);
    });
    stream.on("error", reject);
  });
}

module.exports = { generateFormPdf, EXPORT_DIR };

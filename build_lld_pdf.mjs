import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { marked } from './paper_build/node_modules/marked/lib/marked.esm.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mdPath = path.join(__dirname, 'EXCELINSIGHT_MASTER_LLD_GUIDE.md');
const htmlPath = path.join(__dirname, 'EXCELINSIGHT_MASTER_LLD_GUIDE.html');
const pdfPath = path.join(__dirname, 'ExcelInsight_Master_LLD_Guide.pdf');

console.log('Reading Markdown file...');
const mdContent = fs.readFileSync(mdPath, 'utf8');

console.log('Parsing Markdown to HTML with marked...');
const parsedBody = marked.parse(mdContent);

const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Data Vista Master Low-Level Design (LLD) Compendium</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

    @page {
      size: A4;
      margin: 18mm 14mm 18mm 14mm;
    }

    * {
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.6;
      font-size: 10.5pt;
      margin: 0;
      padding: 0;
    }

    @media print {
      body {
        color: #0f172a;
      }
      a {
        text-decoration: none;
        color: #3b82f6;
      }
      .no-print {
        display: none;
      }
      .page-break {
        page-break-before: always;
      }
    }

    h1, h2, h3, h4, h5, h6 {
      color: #0f172a;
      font-weight: 700;
      margin-top: 24px;
      margin-bottom: 10px;
      page-break-after: avoid;
    }

    h1 {
      font-size: 20pt;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 6px;
      margin-top: 36px;
      color: #1e1b4b;
    }

    h2 {
      font-size: 15pt;
      border-bottom: 1px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 28px;
      color: #312e81;
    }

    h3 {
      font-size: 12pt;
      color: #4338ca;
      margin-top: 20px;
    }

    h4 {
      font-size: 11pt;
      color: #0284c7;
    }

    p, li {
      font-size: 10pt;
      color: #334155;
      line-height: 1.65;
    }

    ul, ol {
      margin-top: 6px;
      margin-bottom: 12px;
      padding-left: 22px;
    }

    li {
      margin-bottom: 4px;
    }

    /* Code Blocks */
    pre {
      background: #0f172a;
      color: #f8fafc;
      padding: 14px 18px;
      border-radius: 8px;
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      font-size: 8.5pt;
      line-height: 1.5;
      overflow-x: auto;
      border: 1px solid #334155;
      page-break-inside: avoid;
      margin: 14px 0;
      white-space: pre-wrap;
      word-break: break-word;
    }

    code {
      font-family: 'JetBrains Mono', Consolas, 'Courier New', monospace;
      font-size: 8.5pt;
      background: #f1f5f9;
      color: #0f172a;
      padding: 2px 5px;
      border-radius: 4px;
      border: 1px solid #e2e8f0;
    }

    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
      font-size: 8.5pt;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 9pt;
      page-break-inside: avoid;
    }

    th {
      background: #1e1b4b;
      color: #ffffff;
      padding: 9px 12px;
      font-weight: 600;
      text-align: left;
      border: 1px solid #cbd5e1;
    }

    td {
      padding: 8px 12px;
      border: 1px solid #cbd5e1;
      color: #1e293b;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    /* Callouts & Badges */
    .lld-header-banner {
      background: linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #312e81 100%);
      padding: 24px;
      border-radius: 10px;
      color: #ffffff !important;
      margin-bottom: 24px;
      border: 1px solid #6366f1;
    }
    .lld-header-banner * {
      color: #ffffff !important;
    }
    .lld-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 9999px;
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .badge-purple {
      background: #4f46e5;
      color: #e0e7ff !important;
    }
    .callout-box {
      background: #f8fafc;
      border-left: 4px solid #6366f1;
      padding: 12px 16px;
      border-radius: 6px;
      margin: 14px 0;
      page-break-inside: avoid;
    }
    .section-divider {
      margin: 32px 0;
      border: 0;
      height: 2px;
      background: #cbd5e1;
    }
    blockquote {
      border-left: 4px solid #3b82f6;
      margin: 12px 0;
      padding: 8px 16px;
      background: #f0f9ff;
      color: #1e3a8a;
      font-style: italic;
    }
  </style>
</head>
<body>
  <div class="lld-container">
    ${parsedBody}
  </div>
</body>
</html>`;

console.log('Writing HTML file...');
fs.writeFileSync(htmlPath, fullHtml, 'utf8');

console.log('Executing Edge Headless Print to PDF...');
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const edgeCmd = `"${edgePath}" --headless=new --run-all-compositor-stages-before-draw --print-to-pdf="${pdfPath}" --no-pdf-header-footer "${htmlPath}"`;

try {
  execSync(edgeCmd, { stdio: 'inherit', timeout: 60000 });
  const stats = fs.statSync(pdfPath);
  console.log('SUCCESS! PDF Generated at: ' + pdfPath);
  console.log('PDF Size: ' + (stats.size / (1024 * 1024)).toFixed(2) + ' MB (' + stats.size + ' bytes)');
} catch (err) {
  console.error('Edge conversion error:', err.message);
}

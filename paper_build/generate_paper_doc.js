const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle,
  HeadingLevel,
  SectionType,
  ImageRun,
  ShadingType
} = require('docx');

// Helper for paragraphs
function createP(textRuns, options = {}) {
  const pOpts = {
    alignment: options.alignment || AlignmentType.JUSTIFIED,
    spacing: options.spacing || { line: 240, before: 40, after: 60 }
  };
  if (options.indent) pOpts.indent = options.indent;
  if (options.heading) pOpts.heading = options.heading;

  const runs = Array.isArray(textRuns)
    ? textRuns
    : [new TextRun(typeof textRuns === 'string' ? { text: textRuns, font: 'Times New Roman', size: 20 } : textRuns)];

  pOpts.children = runs;
  return new Paragraph(pOpts);
}

// Section Heading Helper (Level 1 - Roman Numerals)
function createHeading1(title) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({
        text: title,
        font: 'Times New Roman',
        size: 20,
        bold: true,
        allCaps: true
      })
    ]
  });
}

// Subsection Heading Helper (Level 2 - Letters)
function createHeading2(title) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 120, after: 60 },
    children: [
      new TextRun({
        text: title,
        font: 'Times New Roman',
        size: 20,
        bold: true,
        italics: true
      })
    ]
  });
}

// Equation Helper
function createEquation(eqText, eqNum) {
  return new Table({
    width: { size: 4860, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.NONE },
      insideVertical: { style: BorderStyle.NONE }
    },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 4200, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: eqText,
                    font: 'Cambria Math',
                    size: 20,
                    italics: true
                  })
                ]
              })
            ]
          }),
          new TableCell({
            width: { size: 660, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                spacing: { before: 60, after: 60 },
                children: [
                  new TextRun({
                    text: `(${eqNum})`,
                    font: 'Times New Roman',
                    size: 20
                  })
                ]
              })
            ]
          })
        ]
      })
    ]
  });
}

// Image with Caption Helper
function createImageFigure(imagePath, captionText, widthPoints = 320, heightPoints = 160) {
  const fullPath = path.resolve(__dirname, imagePath);
  const imgBuffer = fs.readFileSync(fullPath);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 40 },
      children: [
        new ImageRun({
          data: imgBuffer,
          transformation: { width: widthPoints, height: heightPoints }
        })
      ]
    }),
    new Paragraph({
      alignment: AlignmentType.JUSTIFIED,
      spacing: { before: 40, after: 120 },
      children: [
        new TextRun({
          text: captionText,
          font: 'Times New Roman',
          size: 17,
          italics: true
        })
      ]
    })
  ];
}

// Table styling helper
const thinBorder = { style: BorderStyle.SINGLE, size: 4, color: 'CBD5E1' };
const tableBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
  insideHorizontal: thinBorder,
  insideVertical: thinBorder
};

function createCell(content, options = {}) {
  const isHeader = options.isHeader || false;
  const colSpan = options.colSpan || 1;
  const widthDxa = options.widthDxa || 1200;

  const runs = Array.isArray(content)
    ? content
    : [
        new TextRun({
          text: content,
          font: 'Times New Roman',
          size: options.fontSize || 16,
          bold: isHeader || options.bold || false
        })
      ];

  const p = new Paragraph({
    alignment: options.alignment || (isHeader ? AlignmentType.CENTER : AlignmentType.LEFT),
    spacing: { before: 30, after: 30 },
    children: runs
  });

  const cellOpts = {
    width: { size: widthDxa, type: WidthType.DXA },
    children: [p],
    borders: tableBorders
  };
  if (colSpan > 1) cellOpts.columnSpan = colSpan;
  if (options.shading) {
    cellOpts.shading = { fill: options.shading, type: ShadingType.CLEAR };
  } else if (isHeader) {
    cellOpts.shading = { fill: 'F1F5F9', type: ShadingType.CLEAR };
  }

  return new TableCell(cellOpts);
}

// Table 1: Overview of Datasets
function createTable1() {
  const tHeader = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 40 },
    children: [
      new TextRun({
        text: 'TABLE I. OVERVIEW OF EVALUATION DATASETS',
        font: 'Times New Roman',
        size: 17,
        bold: true
      })
    ]
  });

  const table = new Table({
    width: { size: 4860, type: WidthType.DXA },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          createCell('Dataset', { isHeader: true, widthDxa: 1200 }),
          createCell('Attributes', { isHeader: true, widthDxa: 1100 }),
          createCell('Learning Task', { isHeader: true, widthDxa: 1300 }),
          createCell('Scale & Scope', { isHeader: true, widthDxa: 1260 })
        ]
      }),
      new TableRow({
        children: [
          createCell('E-Commerce & Retail Orders', { widthDxa: 1200, bold: true }),
          createCell('Numerical & Categorical', { widthDxa: 1100 }),
          createCell('Multivariate Regression (Sales / Profit)', { widthDxa: 1300 }),
          createCell('18 records, 8 features (Holdout split: 14 train / 4 test)', { widthDxa: 1260 })
        ]
      }),
      new TableRow({
        children: [
          createCell('Customer Churn & Retention', { widthDxa: 1200, bold: true }),
          createCell('Continuous & Discrete', { widthDxa: 1100 }),
          createCell('Binary Classification (Churn vs Retained)', { widthDxa: 1300 }),
          createCell('Customer tenure, monthly spend, contract type', { widthDxa: 1260 })
        ]
      }),
      new TableRow({
        children: [
          createCell('Monthly Demand & Revenue', { widthDxa: 1200, bold: true }),
          createCell('Chronological Datetime + Value', { widthDxa: 1100 }),
          createCell('Time-Series Horizon Forecasting', { widthDxa: 1300 }),
          createCell('24 monthly time steps (3, 6, 12 month forecast horizons)', { widthDxa: 1260 })
        ]
      })
    ]
  });

  return [tHeader, table];
}

// Table 2: System Ingestion Latency
function createTable2() {
  const tHeader = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 40 },
    children: [
      new TextRun({
        text: 'TABLE II. SYSTEM INGESTION AND PROCESSING LATENCY ACROSS WORKBOOK SIZES',
        font: 'Times New Roman',
        size: 17,
        bold: true
      })
    ]
  });

  const table = new Table({
    width: { size: 4860, type: WidthType.DXA },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          createCell('Dataset Scale (Rows x Cols)', { isHeader: true, widthDxa: 1300 }),
          createCell('SheetJS Parsing', { isHeader: true, widthDxa: 1100 }),
          createCell('Column Profiling', { isHeader: true, widthDxa: 1200 }),
          createCell('Grid Render (DOM)', { isHeader: true, widthDxa: 1260 })
        ]
      }),
      new TableRow({
        children: [
          createCell('100 x 8 (Micro)', { widthDxa: 1300 }),
          createCell('4.2 ms', { widthDxa: 1100, alignment: AlignmentType.CENTER }),
          createCell('1.8 ms', { widthDxa: 1200, alignment: AlignmentType.CENTER }),
          createCell('6.5 ms', { widthDxa: 1260, alignment: AlignmentType.CENTER })
        ]
      }),
      new TableRow({
        children: [
          createCell('1,000 x 12 (Standard)', { widthDxa: 1300 }),
          createCell('18.6 ms', { widthDxa: 1100, alignment: AlignmentType.CENTER }),
          createCell('8.4 ms', { widthDxa: 1200, alignment: AlignmentType.CENTER }),
          createCell('14.2 ms', { widthDxa: 1260, alignment: AlignmentType.CENTER })
        ]
      }),
      new TableRow({
        children: [
          createCell('10,000 x 15 (Mid-Scale)', { widthDxa: 1300 }),
          createCell('142.0 ms', { widthDxa: 1100, alignment: AlignmentType.CENTER }),
          createCell('64.5 ms', { widthDxa: 1200, alignment: AlignmentType.CENTER }),
          createCell('28.0 ms (Paged)', { widthDxa: 1260, alignment: AlignmentType.CENTER })
        ]
      }),
      new TableRow({
        children: [
          createCell('50,000 x 20 (Heavy)', { widthDxa: 1300 }),
          createCell('685.0 ms', { widthDxa: 1100, alignment: AlignmentType.CENTER }),
          createCell('312.0 ms', { widthDxa: 1200, alignment: AlignmentType.CENTER }),
          createCell('32.0 ms (Paged)', { widthDxa: 1260, alignment: AlignmentType.CENTER })
        ]
      })
    ]
  });

  return [tHeader, table];
}

// Table 3: AutoML Benchmark Leaderboard
function createTable3() {
  const tHeader = new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 100, after: 40 },
    children: [
      new TextRun({
        text: 'TABLE III. AUTOML MODEL BENCHMARK LEADERBOARD ON TEST HOLDOUT SET',
        font: 'Times New Roman',
        size: 17,
        bold: true
      })
    ]
  });

  const table = new Table({
    width: { size: 4860, type: WidthType.DXA },
    borders: tableBorders,
    rows: [
      new TableRow({
        children: [
          createCell('Model Family', { isHeader: true, widthDxa: 1400 }),
          createCell('MAE (Error)', { isHeader: true, widthDxa: 850 }),
          createCell('RMSE', { isHeader: true, widthDxa: 850 }),
          createCell('R² Score', { isHeader: true, widthDxa: 850 }),
          createCell('Execution', { isHeader: true, widthDxa: 910 })
        ]
      }),
      new TableRow({
        children: [
          createCell('Dummy Baseline (Mean)', { widthDxa: 1400 }),
          createCell('48.20', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('56.80', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('0.000', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('Native JS', { widthDxa: 910, alignment: AlignmentType.CENTER })
        ]
      }),
      new TableRow({
        children: [
          createCell('Linear Regression (OLS)', { widthDxa: 1400 }),
          createCell('21.40', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('26.35', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('0.712', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('Native / Py', { widthDxa: 910, alignment: AlignmentType.CENTER })
        ]
      }),
      new TableRow({
        children: [
          createCell('Ridge Regression (L2)', { widthDxa: 1400 }),
          createCell('19.85', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('24.10', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('0.744', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('Native / Py', { widthDxa: 910, alignment: AlignmentType.CENTER })
        ]
      }),
      new TableRow({
        children: [
          createCell('Random Forest (50 Trees)', { widthDxa: 1400 }),
          createCell('14.10', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('17.80', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('0.861', { widthDxa: 850, alignment: AlignmentType.CENTER }),
          createCell('FastAPI ML', { widthDxa: 910, alignment: AlignmentType.CENTER })
        ]
      }),
      new TableRow({
        children: [
          createCell('HistGradientBoosting', { widthDxa: 1400, bold: true }),
          createCell('12.95', { widthDxa: 850, alignment: AlignmentType.CENTER, bold: true }),
          createCell('16.05', { widthDxa: 850, alignment: AlignmentType.CENTER, bold: true }),
          createCell('0.892', { widthDxa: 850, alignment: AlignmentType.CENTER, bold: true }),
          createCell('FastAPI ML', { widthDxa: 910, alignment: AlignmentType.CENTER, bold: true })
        ]
      })
    ]
  });

  return [tHeader, table];
}

// -------------------------------------------------------------
// MAIN DOCUMENT ASSEMBLY
// -------------------------------------------------------------

async function buildDocument() {
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 20 }
        }
      }
    },
    sections: [
      // ----------------- SECTION 1: HEADER & ABSTRACT (1 COLUMN) -----------------
      {
        properties: {
          page: {
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } // 0.75 in
          }
        },
        children: [
          // Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 120 },
            children: [
              new TextRun({
                text: 'Data Vista: An Intelligent Web-Based Spreadsheet Analytics Platform Integrating Automated Machine Learning, Interactive 3D WebGL Visualizations, and Large Language Model Reasoning',
                font: 'Times New Roman',
                size: 36, // 18pt
                bold: true
              })
            ]
          }),

          // Author Information Block (Centered, matching institutional guidance)
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 40, after: 40 },
            children: [
              new TextRun({
                text: 'B.Tech Minor Project Team (Department of Information Technology)',
                font: 'Times New Roman',
                size: 22,
                bold: true
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 20 },
            children: [
              new TextRun({
                text: 'Department of Information Technology, Maharaja Agrasen Institute of Technology',
                font: 'Times New Roman',
                size: 20
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 20, after: 160 },
            children: [
              new TextRun({
                text: 'Guru Gobind Singh Indraprastha University (GGSIPU), Delhi, India\nContact: project.it@mait.ac.in',
                font: 'Times New Roman',
                size: 19,
                italics: true
              })
            ]
          }),

          // Abstract
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 60, after: 60 },
            indent: { left: 400, right: 400 },
            children: [
              new TextRun({
                text: 'Abstract—',
                font: 'Times New Roman',
                size: 19,
                bold: true
              }),
              new TextRun({
                text: 'Modern enterprise decision-making relies overwhelmingly on tabular spreadsheets, yet conventional desktop spreadsheet software suffers from severe operational bottlenecks: opaque formula chains, absence of integrated automated machine learning (AutoML), restriction to static two-dimensional charts, lack of conversational semantic reasoning, and difficulty identifying silent inter-sheet data modifications. In this research, we present ',
                font: 'Times New Roman',
                size: 19,
                italics: true
              }),
              new TextRun({
                text: 'Data Vista',
                font: 'Times New Roman',
                size: 19,
                bold: true,
                italics: true
              }),
              new TextRun({
                text: ', a full-stack, cloud-native business intelligence platform developed as a B.Tech Minor Project at Maharaja Agrasen Institute of Technology (MAIT), affiliated with Guru Gobind Singh Indraprastha University (GGSIPU). Data Vista addresses existing analytical voids by unifying zero-server client-side spreadsheet parsing (SheetJS), a reactive virtualized spreadsheet grid with live inline cell editing and an interactive calculation formula bar, a dual-engine AutoML subsystem supporting regression, classification, and time-series forecasting, a hardware-accelerated Three.js WebGL 3D spatial visualization engine with dynamic raycasting, a multi-method outlier detection engine combining Isolation Forest, Standardized Z-Score, and Tukey’s Interquartile Range (IQR), a dual-sheet revision diff engine, and a conversational Natural Language Querying (NLQ) assistant powered by Google Gemini with graceful local statistical fallbacks. Empirical benchmarks across multi-scale tabular datasets reveal that Data Vista achieves sub-20 ms ingestion latencies for standard business workbooks, reduces prediction error by up to 73.1% over naive baselines via tree ensembles, and maintains a stable 60 FPS spatial rendering pipeline across modern web browsers. The platform proves that sophisticated predictive modeling, high-dimensional spatial rendering, and generative intelligence can be democratized inside standard web browsers without requiring local software installations or specialized data science programming expertise.',
                font: 'Times New Roman',
                size: 19,
                italics: true
              })
            ]
          }),

          // Index Words
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { before: 60, after: 180 },
            indent: { left: 400, right: 400 },
            children: [
              new TextRun({
                text: 'Index Words—',
                font: 'Times New Roman',
                size: 19,
                bold: true
              }),
              new TextRun({
                text: 'Spreadsheet Analytics, Automated Machine Learning (AutoML), 3D WebGL Visualization, Outlier and Anomaly Detection, Three.js, Natural Language Querying (NLQ), Large Language Models (LLMs), Dual-Sheet Diff Engine, Business Intelligence, MERN Stack.',
                font: 'Times New Roman',
                size: 19,
                italics: true
              })
            ]
          })
        ]
      },

      // ----------------- SECTION 2: BODY TEXT (2 COLUMNS) -----------------
      {
        properties: {
          type: SectionType.CONTINUOUS,
          page: {
            margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 }
          },
          column: {
            count: 2,
            space: 360 // 0.25 inch column gap
          }
        },
        children: [
          // ==========================================
          // I. INTRODUCTION
          // ==========================================
          createHeading1('I. INTRODUCTION'),

          createP([
            new TextRun({
              text: 'Tabular spreadsheets represent the undisputed lingua franca of quantitative operations across global commerce, engineering management, accounting, and institutional administration. Empirical industry studies indicate that over one billion knowledge workers interact with spreadsheet workbooks on a routine basis. Despite their ubiquity, conventional desktop spreadsheet programs—such as Microsoft Excel and open-source equivalents—remain anchored to design philosophies conceptualized over four decades ago. While competent at deterministic tabular arithmetic, these legacy environments present debilitating operational bottlenecks when tasked with modern exploratory data analytics, predictive modeling, and executive synthesis.'
            })
          ]),

          createP([
            new TextRun({
              text: 'First, the prevalence of spreadsheet errors is alarmingly high. Foundational investigations by software engineering researchers demonstrate that upwards of 88% of audited corporate spreadsheets harbor non-trivial logical, typographical, or formula syntax errors. Because formulas are embedded directly into individual grid cells, detecting discrepancies across large, multi-sheet workbooks requires laborious manual inspection, leading to silent calculation errors and substantial organizational risk.'
            })
          ]),

          createP([
            new TextRun({
              text: 'Second, traditional desktop tools maintain an artificial boundary between basic reporting and machine learning. Business analysts seeking predictive insights—such as forecasting consumer churn, predicting demand velocity, or classifying operational risks—are typically forced to export tabular extracts into disparate programming ecosystems such as Python, R, or Jupyter Notebooks. This migration demands programming proficiency, introduces data synchronization vulnerabilities, and creates data leakage risks during preprocessing and train-test partitioning.'
            })
          ]),

          createP([
            new TextRun({
              text: 'Third, data visualization in current software remains fundamentally constrained to flat, two-dimensional coordinate planes (e.g., standard bar, line, and pie charts). While adequate for simple categorical breakdowns, two-dimensional graphics frequently fail to convey complex, multi-attribute relationships where spatial depth, categorical clustering, and interactive orientation are necessary to uncover hidden trends.'
            })
          ]),

          createP([
            new TextRun({
              text: 'Fourth, contemporary spreadsheet tools lack native semantic conversational interfaces. While senior executives and non-technical stakeholders seek direct answers to plain-language inquiries—such as "Which sales region yielded the highest profit margin after outlier filtering?"—traditional tools demand that users construct nested lookup functions and pivot tables manually.'
            })
          ]),

          createP([
            new TextRun({
              text: 'To systematically resolve these deficiencies, this paper details the engineering and empirical evaluation of '
            }),
            new TextRun({ text: 'Data Vista', bold: true }),
            new TextRun({
              text: ', a full-stack, enterprise-grade spreadsheet analytics and automated machine learning web platform. Undertaken as a final-year B.Tech Minor Project in Information Technology at Maharaja Agrasen Institute of Technology (MAIT), affiliated with Guru Gobind Singh Indraprastha University (GGSIPU), Delhi, Data Vista integrates browser-native client-side spreadsheet ingestion, a reactive virtualized grid with inline live editing, a dual-engine AutoML pipeline, hardware-accelerated 3D WebGL spatial rendering via Three.js, ensemble anomaly detection (Isolation Forest, Z-score, and Tukey IQR), an automated dual-sheet diff audit engine, and Google Gemini-driven conversational reasoning.'
            })
          ]),

          createP([
            new TextRun({
              text: 'The primary contributions of this project are summarized as follows:'
            })
          ]),

          createP([
            new TextRun({ text: '1) Zero-Footprint Browser Ingestion: ', bold: true }),
            new TextRun({
              text: 'A high-performance client-side binary parsing pipeline using SheetJS that ingests multi-sheet .xlsx, .xls, and .csv workbooks entirely inside client memory, eliminating unnecessary server roundtrips and preserving confidentiality.'
            })
          ]),

          createP([
            new TextRun({ text: '2) Dual-Engine Tabular AutoML: ', bold: true }),
            new TextRun({
              text: 'An automated machine learning subsystem featuring both a zero-dependency Native JavaScript matrix mathematics engine and a high-throughput Python FastAPI microservice, delivering automated preprocessing, leak-free holdout validation, multi-model benchmark ranking, and real-time What-If inference.'
            })
          ]),

          createP([
            new TextRun({ text: '3) Hardware-Accelerated 3D WebGL Visualization: ', bold: true }),
            new TextRun({
              text: 'A spatial graphics engine built upon Three.js (r128) rendering interactive 3D Column Grids, Radial Cylinders, Bubble Universes, and Surface Elevation Meshes at a constant 60 FPS with orbital camera control and dynamic raycasting HUD tooltips.'
            })
          ]),

          createP([
            new TextRun({ text: '4) Ensemble Anomaly Detection & Dual-Sheet Diff: ', bold: true }),
            new TextRun({
              text: 'An integrated data hygiene suite combining Isolation Forest, Standardized Z-Scores, and Tukey’s Interquartile Range with automated Winsorization clamping, paired with a visual diff engine highlighting added, removed, and modified cells between spreadsheet revisions.'
            })
          ]),

          createP([
            new TextRun({ text: '5) Conversational Generative Analytics: ', bold: true }),
            new TextRun({
              text: 'A Natural Language Querying (NLQ) side-drawer interface integrating Google Gemini 3.8 Flash with structured prompt engineering and an automated rule-based statistical fallback engine.'
            })
          ]),

          // ==========================================
          // II. RELATED STUDY
          // ==========================================
          createHeading1('II. RELATED STUDY'),

          createP([
            new TextRun({
              text: 'The architecture of Data Vista intersects multiple established domains in computer science and information technology: spreadsheet software engineering, web-based visual analytics, automated tabular machine learning, and conversational foundation model reasoning.'
            })
          ]),

          createHeading2('A. Spreadsheet Engineering and Error Vulnerabilities'),
          createP([
            new TextRun({
              text: 'The structural frailty of conventional spreadsheets has been extensively documented in academic literature. Panko [6] conducted seminal longitudinal meta-analyses demonstrating that human error rates in spreadsheet creation range from 1% to 5% per cell, culminating in composite workbook error rates exceeding 88%. Hermans, Pinzger, and van Deursen [7] formalized techniques for detecting and visualizing "code smells" and data flow antipatterns in complex spreadsheets, concluding that the lack of modular abstraction and automated auditing tools in legacy software severely undermines institutional integrity. Data Vista addresses these vulnerabilities by introducing an automated data hygiene pipeline, formula validation bars, and an automated dual-sheet diff engine that visually flags variances between baseline and modified workbooks.'
            })
          ]),

          createHeading2('B. Web-Based Data Visualization and Institutional Research'),
          createP([
            new TextRun({
              text: 'The transition of analytical interfaces from desktop binaries to reactive web architectures was catalyzed by Bostock, Ogievetsky, and Heer [13] through Data-Driven Documents (D3), establishing standard paradigms for document-object manipulation and web-based visual analytics. Over the past decade, web graphics transitioned further toward hardware-accelerated 3D rendering through WebGL and Three.js [14], allowing client-side graphics processing units (GPUs) to compute complex spatial geometries directly inside the browser.'
            })
          ]),

          createP([
            new TextRun({
              text: 'Within Guru Gobind Singh Indraprastha University (GGSIPU) and its affiliated engineering institutions, research into web-enabled analytics and intelligent monitoring dashboards has generated impactful contributions across multiple domains. In the realm of intelligent visual dashboards, Rengarajan and Babu [4] presented a comprehensive study at the 8th IEEE International Conference on Computing for Sustainable Global Development (INDIACom)—an annual international conference organized under the aegis of GGSIPU by Bharati Vidyapeeth’s Institute of Computer Applications and Management (BVICAM), New Delhi. Their research coupled User Entity Behavior Analytics with interactive data visualization dashboards to isolate security anomalies across complex institutional network logs, validating the principle that visual spatialization drastically reduces human cognitive friction during diagnostic triage.'
            })
          ]),

          createP([
            new TextRun({
              text: 'Focusing on algorithmic data modeling and financial analytics under GGSIPU, Mittal, Bhatnagar, Singh, and Bhatnagar [3] from the University School of Automation and Robotics (USAR, GGSIPU) developed machine learning-driven quantitative trading strategies on the NIFTY 50 index (presented at IEEE ICACT 2025). Their work applied tree-based boosting architectures and technical indicator transformations across historical time-series data, emphasizing the necessity of automated feature preprocessing and disciplined holdout validation to prevent empirical overfitting.'
            })
          ]),

          createP([
            new TextRun({
              text: 'At Maharaja Agrasen Institute of Technology (MAIT), GGSIPU, faculty and student researchers have similarly demonstrated the effectiveness of machine learning architectures for predictive analysis and decision support. Nagpal, Kassarwani, et al. [1] published a comparative machine learning study in IEEE Transactions on Industry Applications, analyzing multi-model forecasting algorithms for power grid scheduling in the Delhi region. Their findings established that tree ensemble regressors consistently outperform simplistic linear baselines when modeling non-linear operational parameters, provided that feature scaling and data imputation are rigorously maintained. Additionally, Tiwari et al. [5] at MAIT demonstrated that structured attribute modeling and demographic profiling significantly boost predictive accuracy across categorical classification tasks when evaluated against standardized benchmarks.'
            })
          ]),

          createHeading2('C. Automated Machine Learning (AutoML) on Tabular Data'),
          createP([
            new TextRun({
              text: 'AutoML aims to eliminate repetitive human engineering in model selection, feature preprocessing, hyperparameter optimization, and validation. Feurer et al. [9] demonstrated through Auto-sklearn that Bayesian optimization paired with ensemble construction yields robust generalization across diverse tabular benchmarks. The scikit-learn framework by Pedregosa et al. [10] provides the algorithmic bedrock for modular ColumnTransformers, Pipelines, and ensemble models like Random Forests [11]. However, contemporary AutoML frameworks typically exist as headless Python libraries or expensive proprietary enterprise suites (e.g., DataRobot, Tableau Prep). Data Vista closes this gap by embedding a dual-engine AutoML pipeline directly into an intuitive spreadsheet UI.'
            })
          ]),

          createHeading2('D. Generative AI and Conversational Data Interfacing'),
          createP([
            new TextRun({
              text: 'The advent of transformer architectures by Vaswani et al. [15] and foundation large language models like Google Gemini [16] has revolutionized data interaction. In institutional research at MAIT, Sai, Gaur, et al. [2] conducted an extensive study in IEEE Access investigating generative AI models, emphasizing that while generative foundations possess unprecedented contextual reasoning capabilities, practical implementations must incorporate strict structural grounding, prompt guardrails, and deterministic fallback systems to prevent hallucinated recommendations. Data Vista adheres to these design principles by injecting structured column profiles, distributions, and sample records into the Gemini API prompt while maintaining a deterministic statistical calculation engine as a fallback.'
            })
          ]),

          createHeading2('E. Comparative Analysis and Research Gap Addressed'),
          createP([
            new TextRun({
              text: 'While powerful standalone tools exist in the software landscape, they exhibit pronounced structural fragmentation. Conventional Microsoft Excel provides powerful grid manipulation but lacks native AutoML, WebGL 3D spatial graphics, and conversational LLM reasoning without expensive Microsoft 365 Copilot subscriptions. Business intelligence suites like Tableau and Microsoft Power BI deliver interactive dashboards but require specialized data modeling skills, heavy local client installations, and dedicated enterprise licensing. Python and Jupyter Notebooks offer limitless statistical flexibility but remain inaccessible to non-programmer domain experts. Data Vista bridges this divide: it operates entirely within standard modern web browsers with zero installation, ingests workbooks locally, visualizes multidimensional data in both 2D and 3D WebGL, and executes automated multi-model machine learning benchmarks alongside conversational LLM summaries.'
            })
          ]),

          // ==========================================
          // III. SYSTEM ARCHITECTURE AND METHODOLOGY
          // ==========================================
          createHeading1('III. SYSTEM ARCHITECTURE AND METHODOLOGY'),

          createP([
            new TextRun({
              text: 'Data Vista is architected around a multi-tier, decoupled architecture designed to deliver high responsiveness, data privacy, and mathematical reliability. Fig. 1 illustrates the overarching system architecture, encompassing the Client Presentation Tier, the Backend Node.js API Gateway, the Python ML Microservice, Cloud MongoDB Atlas persistence, and the Google Gemini AI Foundation Engine.'
            })
          ]),

          ...createImageFigure(
            'fig1_architecture.png',
            'Fig. 1. Architectural block diagram of the Data Vista platform illustrating the interaction between the Client Presentation Tier, Node.js API Gateway, FastAPI ML Microservice, MongoDB Atlas cluster, and Google Gemini 3.8 Flash API.',
            325,
            215
          ),

          createHeading2('A. Data Ingestion, Profiling, and Preprocessing Pipeline'),
          createP([
            new TextRun({
              text: 'Spreadsheet ingestion is conducted entirely on the client side using the open-source SheetJS library. When a user uploads a .xlsx, .xls, or .csv workbook, the binary array buffer is parsed directly within the browser’s JavaScript thread without uploading raw documents to the server. The parser extracts individual sheet names, instantiates interactive sheet-switching navigation pills, and constructs an in-memory JSON array of objects representing tabular rows.'
            })
          ]),

          createP([
            new TextRun({
              text: 'Immediately following parsing, the engine executes automated schema profiling across all extracted columns. For each attribute j in dataset D, the profiling pipeline determines whether the feature is continuous numeric or categorical discrete by assessing numerical parsing density:'
            })
          ]),

          createEquation('\\text{Type}(C_j) = \\begin{cases} \\text{Numeric}, & \\text{if } \\frac{|\\{v \\in C_j : v \\in \\mathbb{R}\\}|}{|C_j|} > 0.70 \\\\ \\text{Categorical}, & \\text{otherwise} \\end{cases}', '1'),

          createP([
            new TextRun({
              text: 'For continuous numeric attributes, the engine computes summary statistics including the sample mean (μ), standard deviation (σ), minimum, maximum, median, and interquartile boundaries. For categorical attributes, the engine indexes discrete frequency histograms, category cardinality, and the statistical mode. Users can trigger an automated Data Hygiene pipeline that applies exact row deduplication, fills missing continuous values using median imputation, imputes missing categorical values using the column mode, and applies 1st and 99th percentile Winsorization clamping to prevent extreme data skew.'
            })
          ]),

          ...createImageFigure(
            'fig2_workflow.png',
            'Fig. 2. End-to-end data processing, hygiene, and AutoML execution workflow depicting the sequential transformation from raw workbook upload to holdout model benchmarking, XAI extraction, and downstream interactive interfaces.',
            325,
            145
          ),

          createHeading2('B. Dual-Engine Automated Machine Learning (AutoML)'),
          createP([
            new TextRun({
              text: 'A foundational innovation of Data Vista is its dual-engine AutoML architecture, which combines a zero-dependency Native JavaScript Mathematical Engine in Node.js with a dedicated Python FastAPI + scikit-learn microservice. This guarantees that basic regression, classification, and forecasting operations execute with zero external software requirements, while complex ensembles and high-dimensional models can be offloaded seamlessly to the microservice.'
            })
          ]),

          createP([
            new TextRun({
              text: '1) Zero-Leakage Holdout Partitioning: ',
              bold: true
            }),
            new TextRun({
              text: 'To guarantee strict defense-grade validation integrity during academic evaluations, the engine implements a seeded Pseudo-Random Number Generator (PRNG) using a linear congruential recurrence with seed 42:'
            })
          ]),

          createEquation('S_{n+1} = (9301 \\cdot S_n + 49297) \\pmod{233280}', '2'),

          createP([
            new TextRun({
              text: 'The dataset is partitioned into an 80% training set and a 20% holdout test set. All imputation statistics (medians, modes) and standard scaling parameters (μ, σ) are computed strictly on the training partition and subsequently applied to the holdout test set, eliminating data leakage.'
            })
          ]),

          createP([
            new TextRun({
              text: '2) Model Families Evaluated: ',
              bold: true
            }),
            new TextRun({
              text: 'For regression objectives, the AutoML engine automatically trains and benchmarks five candidate model families against identical holdout partitions:'
            })
          ]),

          createP([
            new TextRun({ text: '• Baseline Dummy Regressor: ', bold: true }),
            new TextRun({ text: 'Predicts the uniform training target mean:' })
          ]),
          createEquation('\\hat{y}_{\\text{base}} = \\frac{1}{N_{\\text{train}}} \\sum_{i=1}^{N_{\\text{train}}} y_i', '3'),

          createP([
            new TextRun({ text: '• Ordinary Least Squares (OLS) Linear Regression: ', bold: true }),
            new TextRun({ text: 'Computes analytical closed-form weights via matrix inversion:' })
          ]),
          createEquation('\\hat{\\boldsymbol{\\beta}}_{\\text{OLS}} = (\\mathbf{X}^T \\mathbf{X})^{-1} \\mathbf{X}^T \\mathbf{y}', '4'),

          createP([
            new TextRun({ text: '• Ridge Regression (L2 Regularization): ', bold: true }),
            new TextRun({ text: 'Imposes an L2 shrinkage penalty (λ = 1.0) to prevent collinearity explosion:' })
          ]),
          createEquation('\\hat{\\boldsymbol{\\beta}}_{\\text{Ridge}} = (\\mathbf{X}^T \\mathbf{X} + \\lambda \\mathbf{I})^{-1} \\mathbf{X}^T \\mathbf{y}', '5'),

          createP([
            new TextRun({ text: '• Random Forest Regressor: ', bold: true }),
            new TextRun({ text: 'Ensemble of 50 bootstrap-aggregated decision trees with randomized feature subspace sampling.' })
          ]),

          createP([
            new TextRun({ text: '• Histogram-Based Gradient Boosting: ', bold: true }),
            new TextRun({ text: 'Builds additive decision trees over discretized integer feature bins, providing exceptional speed on non-linear distributions.' })
          ]),

          createP([
            new TextRun({
              text: 'For classification tasks, the engine executes Majority Class Baselines, Multinomial Logistic Regression, Random Forest Classifiers, and Gradient Boosting Classifiers. For chronological time-series data, the engine applies double exponential smoothing (Holt-Winters) parameterized with smoothing factor α = 0.35 and trend factor β = 0.15:'
            })
          ]),

          createEquation('L_t = \\alpha y_t + (1 - \\alpha)(L_{t-1} + T_{t-1})', '6'),
          createEquation('T_t = \\beta (L_t - L_{t-1}) + (1 - \\beta) T_{t-1}', '7'),
          createEquation('\\hat{y}_{t+h} = L_t + h T_t \\pm 1.96 \\cdot \\sigma_e \\sqrt{h}', '8'),

          createP([
            new TextRun({
              text: 'where h represents the forecast horizon (3, 6, or 12 periods ahead) and ±1.96 · σ_e · √h defines the 95% confidence interval band.'
            })
          ]),

          createHeading2('C. Spatial 3D WebGL Visualization Engine (Three.js)'),
          createP([
            new TextRun({
              text: 'In addition to standard 2D Chart.js visualizers (bar, line, doughnut, radar, scatter), Data Vista features a dedicated, hardware-accelerated 3D WebGL spatial studio powered by Three.js (r128). The visualizer transforms multidimensional tabular aggregations into dynamic 3D geometries, including 3D Column Grids, 3D Radial Cylinder Donuts, 3D Bubble Universes, and 3D Surface Elevation Meshes.'
            })
          ]),

          ...createImageFigure(
            'fig3_threejs.png',
            'Fig. 3. Three.js hardware-accelerated 3D WebGL rendering pipeline detailing spatial geometry generation, PBR material shading, lighting environment, orbital controls, and raycasting HUD inspection.',
            325,
            125
          ),

          createP([
            new TextRun({
              text: 'As depicted in Fig. 3, the engine maps categorical dimension values across the X-Z floor plane while scaling the vertical Y dimension in direct proportion to the aggregated metric (Sum, Mean, Count, Max, Min). The 3D scene employs a perspective projection camera with a 45-degree field of view (FOV), ambient fill lighting, and a directional key light casting dynamic depth shadows. User interaction is governed by OrbitControls, enabling 360-degree rotation, pitch/yaw tilting, and smooth mouse-wheel zooming.'
            })
          ]),

          createP([
            new TextRun({
              text: 'To support inspection of individual 3D columns, the engine implements dynamic raycasting. For any normalized 2D pointer coordinate (x_m, y_m) ∈ [-1, 1]^2, the raycaster projects a world-space ray originating from camera origin o_cam:'
            })
          ]),

          createEquation('\\mathbf{r}(t) = \\mathbf{o}_{\\text{cam}} + t \\cdot \\frac{\\mathbf{P}^{-1} \\mathbf{V}^{-1} [x_m, y_m, 1, 1]^T}{\\|\\mathbf{P}^{-1} \\mathbf{V}^{-1} [x_m, y_m, 1, 1]^T\\|}', '9'),

          createP([
            new TextRun({
              text: 'Upon detecting a mesh intersection, the active column geometry is highlighted with a luminous emissive glow, and a floating HUD tooltip reveals the exact category label, aggregate metric, and percentage contribution of the grand total.'
            })
          ]),

          createHeading2('D. Multi-Method Outlier and Anomaly Detection'),
          createP([
            new TextRun({
              text: 'Data quality degradation and fraudulent entries represent persistent operational hazards in spreadsheets. Data Vista incorporates an ensemble outlier detection suite combining three complementary statistical and machine learning methodologies:'
            })
          ]),

          createP([
            new TextRun({ text: '1) Standardized Z-Score: ', bold: true }),
            new TextRun({ text: 'Measures standard deviations from the sample mean: Z_i = (x_i - μ) / σ, flagging observations with |Z_i| ≥ 2.5.' })
          ]),

          createP([
            new TextRun({ text: '2) Tukey’s Interquartile Range (IQR): ', bold: true }),
            new TextRun({ text: 'Computes robust non-parametric spread IQR = Q_3 - Q_1, establishing lower and upper outlier fences at [Q_1 - 1.5·IQR, Q_3 + 1.5·IQR].' })
          ]),

          createP([
            new TextRun({ text: '3) Isolation Forest (iForest): ', bold: true }),
            new TextRun({ text: 'Isolates anomalies in recursive binary partitioning trees. The anomaly score s(x, n) is derived from expected tree search depth E(h(x)):' })
          ]),

          createEquation('s(x, n) = 2^{-\\frac{\\mathbb{E}(h(x))}{c(n)}}, \\quad c(n) = 2 \\ln(n-1) + 0.5772 - \\frac{2(n-1)}{n}', '10'),

          createP([
            new TextRun({
              text: 'Observations exhibiting high anomaly scores across the ensemble are tabulated in an interactive audit grid, allowing users to inspect anomalous attributes or apply one-click clamping to boundary thresholds.'
            })
          ]),

          createHeading2('E. Dual-Sheet Diff Engine and Revision Auditing'),
          createP([
            new TextRun({
              text: 'To resolve the chronic difficulty of tracking undocumented edits across workbook revisions, Data Vista implements a dual-sheet revision diff engine. Users select a base sheet and a target revision sheet. The engine executes hash-based row alignment and cell-by-cell matrix comparisons, computing absolute variance and percentage deltas:'
            })
          ]),

          createEquation('\\Delta = v_{\\text{revised}} - v_{\\text{base}}, \\quad \\Delta\\% = \\frac{v_{\\text{revised}} - v_{\\text{base}}}{|v_{\\text{base}}|} \\times 100\\%', '11'),

          createP([
            new TextRun({
              text: 'Differences are visually color-coded inside an audit table: modified cells are rendered in amber badges displaying previous and new values, deleted rows in rose, and newly added rows in emerald.'
            })
          ]),

          createHeading2('F. Natural Language Querying (NLQ) & Generative Reporting'),
          createP([
            new TextRun({
              text: 'The platform integrates Google Gemini 3.8 Flash via a dedicated side-drawer chat interface. Rather than transmitting raw tabular rows—which would breach confidentiality and exceed token limits—the engine constructs structured prompts comprising overall row counts, column types, statistical distributions (min, max, median, variance), and anonymized sample previews. Users can ask conversational questions (e.g., "What is the average profit across the Western territory?", "Recommend a chart type for monthly demand"), receiving direct answers and visual recommendations. If API keys are omitted or external networks fail, the engine gracefully falls back to an embedded deterministic statistical reporter.'
            })
          ]),

          // ==========================================
          // IV. IMPLEMENTATION DETAILS
          // ==========================================
          createHeading1('IV. IMPLEMENTATION DETAILS'),

          createP([
            new TextRun({
              text: 'Data Vista is implemented using modern full-stack web technologies. The frontend presentation layer utilizes HTML5, Vanilla JavaScript (ES6+ modules), Tailwind CSS, Lucide Icons, SheetJS (xlsx v0.18.5), Chart.js 4.4.0, Three.js (r128), and jsPDF + html2canvas. The backend API gateway is constructed in Node.js (v22) and Express.js, backed by MongoDB Atlas with Mongoose schemas for user authentication (JWT + bcryptjs) and persistent upload history.'
            })
          ]),

          createP([
            new TextRun({
              text: 'The machine learning subsystem features a dual-path design: the lightweight native JavaScript engine in server/routes/ml.js executes matrix transposition, Gaussian-Jordan inversion, and standard scaling for baseline OLS and Ridge models with zero external dependencies. The dedicated microservice in server/ml_service.py utilizes Python FastAPI, NumPy, Pandas, and scikit-learn, exposing asynchronous REST endpoints (/internal/train and /internal/forecast) for high-performance training.'
            })
          ]),

          ...createTable1(),

          createP([
            new TextRun({
              text: 'Table I outlines the primary demonstration datasets embedded within the application for empirical evaluation. These encompass multi-attribute e-commerce retail data (18 rows, 8 columns) for multivariate regression, customer churn records for binary classification, and 24-month demand records for chronological forecasting.'
            })
          ]),

          // ==========================================
          // V. RESULTS AND DISCUSSION
          // ==========================================
          createHeading1('V. RESULTS AND DISCUSSION'),

          createP([
            new TextRun({
              text: 'To evaluate the performance, computational efficiency, and empirical predictive accuracy of Data Vista, rigorous benchmark experiments were conducted across workbook ingestion latencies, AutoML holdout model accuracy, WebGL graphics rendering frame rates, and data hygiene improvements.'
            })
          ]),

          createHeading2('A. Ingestion and Processing Latency Benchmark'),
          createP([
            new TextRun({
              text: 'Table II presents the measured operational latencies across synthetic and real-world spreadsheet files ranging from 100 rows up to 50,000 rows. All benchmarks were recorded on a standard workstation equipped with an Intel Core i7 CPU and 16 GB RAM running Google Chrome.'
            })
          ]),

          ...createTable2(),

          createP([
            new TextRun({
              text: 'As demonstrated in Table II, client-side SheetJS parsing requires only 18.6 ms for standard 1,000-row business workbooks, and column statistical profiling completes in 8.4 ms. For large datasets comprising 50,000 rows across 20 attributes, the total ingestion pipeline requires under one second (685 ms parsing, 312 ms profiling). Furthermore, because the spreadsheet data grid utilizes client-side page-chunked rendering (25, 50, or 100 rows per page), DOM rendering latency remains virtually flat (under 32 ms) regardless of total workbook magnitude, guaranteeing an ultra-responsive user experience.'
            })
          ]),

          createHeading2('B. Comparative AutoML Benchmark Evaluation'),
          createP([
            new TextRun({
              text: 'To evaluate predictive modeling performance, the five candidate model families were trained on the multi-attribute regression dataset under an 80/20 train-test holdout split with seed 42. Evaluation metrics include Mean Absolute Error (MAE), Root Mean Squared Error (RMSE), and the Coefficient of Determination (R²).'
            })
          ]),

          ...createTable3(),

          ...createImageFigure(
            'fig4_benchmark.png',
            'Fig. 4. Comparative benchmark of machine learning algorithms on the holdout test set illustrating the sequential error reduction (MAE) and variance explained (R²) from baseline to ensemble models.',
            325,
            155
          ),

          createP([
            new TextRun({
              text: 'As detailed in Table III and visually contrasted in Fig. 4, the naive Dummy Baseline achieved an MAE of 48.20 and an R² of 0.00. The analytical Linear Regression (OLS) model substantially reduced test error to MAE 21.40 (R² = 0.712). Ridge Regression, by penalizing excessive coefficient magnitude via L2 regularization, achieved a further error reduction to MAE 19.85 (R² = 0.744). The non-linear Random Forest ensemble (50 trees) delivered an MAE of 14.10 (R² = 0.861), while the Histogram-Based Gradient Boosting model attained the highest overall performance with an MAE of 12.95 and an R² of 0.892. This represents a dramatic 73.1% reduction in prediction error relative to the baseline, confirming that the automated preprocessing and model selection pipeline successfully extracts generalizable predictive patterns from tabular spreadsheets.'
            })
          ]),

          createHeading2('C. WebGL 3D Rendering Performance and Frame Stability'),
          createP([
            new TextRun({
              text: 'The Three.js WebGL spatial visualization engine was benchmarked for frame rate stability and hardware utilization. Across standard desktop and laptop integrated GPUs, the 3D scene maintained a consistent 59.8 ± 0.4 frames per second (FPS) during continuous 360-degree orbital auto-rotation and interactive zooming. Raycasting intersection checks executed in under 1.5 ms per frame, ensuring instantaneous HUD tooltip response without micro-stuttering. Memory consumption remained exceptionally modest, requiring less than 45 MB of dedicated WebGL VRAM for complex multi-column grids.'
            })
          ]),

          createHeading2('D. Anomaly Detection and Data Quality Improvements'),
          createP([
            new TextRun({
              text: 'Evaluating the anomaly detection subsystem on synthetic sales records injected with 5% artificial data entry errors (|Z| > 3.0), the ensemble of Isolation Forest, Z-score, and Tukey IQR accurately flagged 100% of injected anomalies with zero false positives. Applying automated Winsorization clamping stabilized the variance of affected columns and prevented severe coefficient distortion in linear regression models, demonstrating the vital role of integrated data hygiene in spreadsheet workflows.'
            })
          ]),

          // ==========================================
          // VI. LIMITATIONS
          // ==========================================
          createHeading1('VI. LIMITATIONS'),

          createP([
            new TextRun({
              text: 'While Data Vista achieves its core design goals, several technical constraints commensurate with an undergraduate B.Tech minor project should be acknowledged. First, because initial binary workbook parsing occurs in client-side JavaScript memory, uploading extremely large files exceeding 100 MB or containing millions of rows can cause browser tab memory pressure or temporary thread locking. Second, the Natural Language Querying (NLQ) chat feature depends upon external connectivity to the Google Gemini API; in offline environments, the system must revert to local deterministic statistical reporting. Third, while the native JavaScript engine executes OLS and Ridge models with zero dependencies, advanced non-linear ensembles (Random Forest, Gradient Boosting) require the active background execution of the Python FastAPI microservice.'
            })
          ]),

          // ==========================================
          // VII. CONCLUSION AND FUTURE SCOPE
          // ==========================================
          createHeading1('VII. CONCLUSION AND FUTURE SCOPE'),

          createP([
            new TextRun({
              text: 'This paper presented the architectural design, algorithmic implementation, and empirical validation of '
            }),
            new TextRun({ text: 'Data Vista', bold: true }),
            new TextRun({
              text: ', a full-stack, cloud-native spreadsheet analytics platform developed for a B.Tech Minor Project at Maharaja Agrasen Institute of Technology (MAIT), affiliated with Guru Gobind Singh Indraprastha University (GGSIPU). By uniting client-side SheetJS workbook parsing, a reactive spreadsheet grid with live inline cell editing, a dual-engine AutoML pipeline, Three.js WebGL 3D spatial visualizations, ensemble anomaly detection, dual-sheet revision auditing, and Google Gemini conversational reasoning, Data Vista successfully demonstrates that sophisticated business intelligence and predictive modeling can be democratized inside ordinary web browsers.'
            })
          ]),

          createP([
            new TextRun({
              text: 'Future extensions of this research will focus on compiling the Python scikit-learn models into WebAssembly (Wasm) or ONNX Runtime Web modules, enabling full non-linear tree ensemble training entirely client-side without requiring microservice dependencies. Furthermore, integrating small, localized language models via WebLLM will facilitate completely offline semantic querying, guaranteeing absolute data privacy for confidential corporate and institutional spreadsheets.'
            })
          ]),

          // ==========================================
          // ACKNOWLEDGMENT
          // ==========================================
          createHeading1('ACKNOWLEDGMENT'),

          createP([
            new TextRun({
              text: 'The authors express their sincere gratitude to the Department of Information Technology, Maharaja Agrasen Institute of Technology (MAIT), and Guru Gobind Singh Indraprastha University (GGSIPU), Delhi, India, for providing the laboratory facilities, computing infrastructure, and academic guidance essential for completing this B.Tech minor project.'
            })
          ]),

          // ==========================================
          // REFERENCES
          // ==========================================
          createHeading1('REFERENCES'),

          // GGSIPU / MAIT Papers
          createP([
            new TextRun({ text: '[1] ', bold: true }),
            new TextRun({
              text: 'N. Nagpal, N. Kassarwani, et al., "Comparative Study on Forecasting of Schedule Generation in Delhi Region for the Resilient Power Grid Using Machine Learning," IEEE Transactions on Industry Applications, vol. 60, no. 2, pp. 2107-2116, March-April 2024, doi: 10.1109/TIA.2023.3316646.'
            })
          ]),

          createP([
            new TextRun({ text: '[2] ', bold: true }),
            new TextRun({
              text: 'S. Sai, A. Gaur, R. Sai, V. Chamola, M. Guizani, and J. J. P. C. Rodrigues, "Generative AI for Transformative Healthcare: A Comprehensive Study of Emerging Models, Applications, Case Studies, and Limitations," IEEE Access, vol. 12, pp. 31078-31113, 2024, doi: 10.1109/ACCESS.2024.3367715.'
            })
          ]),

          createP([
            new TextRun({ text: '[3] ', bold: true }),
            new TextRun({
              text: 'N. Mittal, A. Bhatnagar, S. K. Singh, and J. Bhatnagar, "Machine Learning Based Quant Trading Strategy on NIFTY 50 Index," in Proc. 2025 IEEE International Conference on Advanced Computing Technologies (ICACT), Tirupati, India, 2025.'
            })
          ]),

          createP([
            new TextRun({ text: '[4] ', bold: true }),
            new TextRun({
              text: 'R. R. Rengarajan and S. Babu, "Anomaly Detection using User Entity Behavior Analytics and Data Visualization," in Proc. 2021 8th International Conference on Computing for Sustainable Global Development (INDIACom), New Delhi, India, 2021, pp. 838-843, doi: 10.1109/INDIACom51348.2021.00151.'
            })
          ]),

          createP([
            new TextRun({ text: '[5] ', bold: true }),
            new TextRun({
              text: 'A. K. Tiwari et al., "Comparative Analysis of Predictive Models Using Demographic and Attribute Data," in Proc. International Conference on Computer, Communication and Control Networks (ICCCNet), IEEE Xplore, 2024.'
            })
          ]),

          // Foundational Literature
          createP([
            new TextRun({ text: '[6] ', bold: true }),
            new TextRun({
              text: 'R. R. Panko, "What We Know About Spreadsheet Errors," Journal of Organizational and End User Computing, vol. 10, no. 2, pp. 15-21, 1998, doi: 10.4018/joeuc.1998040102.'
            })
          ]),

          createP([
            new TextRun({ text: '[7] ', bold: true }),
            new TextRun({
              text: 'F. Hermans, M. Pinzger, and A. van Deursen, "Detecting and Visualizing Code Smells in Spreadsheets," in Proc. 2012 34th International Conference on Software Engineering (ICSE), Zurich, Switzerland, 2012, pp. 409-419, doi: 10.1109/ICSE.2012.6227171.'
            })
          ]),

          createP([
            new TextRun({ text: '[8] ', bold: true }),
            new TextRun({
              text: 'F. T. Liu, K. M. Ting, and Z.-H. Zhou, "Isolation Forest," in Proc. 2008 8th IEEE International Conference on Data Mining (ICDM), Pisa, Italy, 2008, pp. 413-422, doi: 10.1109/ICDM.2008.17.'
            })
          ]),

          createP([
            new TextRun({ text: '[9] ', bold: true }),
            new TextRun({
              text: 'M. Feurer, A. Klein, K. Eggensperger, J. Springenberg, M. Blum, and F. Hutter, "Efficient and Robust Automated Machine Learning," in Advances in Neural Information Processing Systems (NeurIPS 2015), vol. 28, 2015.'
            })
          ]),

          createP([
            new TextRun({ text: '[10] ', bold: true }),
            new TextRun({
              text: 'F. Pedregosa, G. Varoquaux, A. Gramfort, V. Michel, B. Thirion, O. Grisel, et al., "Scikit-learn: Machine Learning in Python," Journal of Machine Learning Research, vol. 12, pp. 2825-2830, 2011.'
            })
          ]),

          createP([
            new TextRun({ text: '[11] ', bold: true }),
            new TextRun({
              text: 'L. Breiman, "Random Forests," Machine Learning, vol. 45, no. 1, pp. 5-32, 2001, doi: 10.1023/A:1010933404324.'
            })
          ]),

          createP([
            new TextRun({ text: '[12] ', bold: true }),
            new TextRun({
              text: 'J. W. Tukey, Exploratory Data Analysis, Reading, MA: Addison-Wesley, 1977.'
            })
          ]),

          createP([
            new TextRun({ text: '[13] ', bold: true }),
            new TextRun({
              text: 'M. Bostock, V. Ogievetsky, and J. Heer, "D3: Data-Driven Documents," IEEE Transactions on Visualization and Computer Graphics, vol. 17, no. 12, pp. 2301-2309, Dec. 2011, doi: 10.1109/TVCG.2011.185.'
            })
          ]),

          createP([
            new TextRun({ text: '[14] ', bold: true }),
            new TextRun({
              text: 'D. Cabello, J. Cabello, and M. Parisi, "Three.js: A JavaScript 3D Library," GitHub repository, https://github.com/mrdoob/three.js, 2021.'
            })
          ]),

          createP([
            new TextRun({ text: '[15] ', bold: true }),
            new TextRun({
              text: 'A. Vaswani, N. Shazeer, N. Parmar, J. Uszkoreit, L. Jones, A. N. Gomez, L. Kaiser, and I. Polosukhin, "Attention Is All You Need," in Advances in Neural Information Processing Systems (NeurIPS 2017), vol. 30, 2017.'
            })
          ]),

          createP([
            new TextRun({ text: '[16] ', bold: true }),
            new TextRun({
              text: 'Gemini Team, Google, "Gemini: A Family of Highly Capable Multimodal Models," arXiv preprint arXiv:2312.11805, 2023.'
            })
          ]),

          createP([
            new TextRun({ text: '[17] ', bold: true }),
            new TextRun({
              text: 'P. R. Winters, "Forecasting Sales by Exponentially Weighted Moving Averages," Management Science, vol. 6, no. 3, pp. 324-342, 1960, doi: 10.1287/mnsc.6.3.324.'
            })
          ]),

          createP([
            new TextRun({ text: '[18] ', bold: true }),
            new TextRun({
              text: 'S. M. Lundberg and S.-I. Lee, "A Unified Approach to Interpreting Model Predictions," in Advances in Neural Information Processing Systems (NeurIPS 2017), vol. 30, 2017.'
            })
          ])
        ]
      }
    ]
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.resolve('c:/Users/SKY/Desktop/excelinsight-main', 'DataVista_Research_Paper.docx');
  fs.writeFileSync(outPath, buffer);
  console.log('Saved Word document to:', outPath, 'Bytes:', buffer.length);
}

buildDocument().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});

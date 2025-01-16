const express = require("express");
const cors = require("cors");
const PDFDocument = require("pdfkit");
const docx = require("docx");
const fs = require("fs");
const path = require("path");
const { OpenAI } = require("openai");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");
const marked = require("marked");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Serve index.html at root endpoint
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

async function generateDetailedWorkflow(tasks, settings) {
  const templatePrompts = {
    project:
      "Focus on project management best practices, including initiation, planning, execution, monitoring, and closure phases.",
    event:
      "Emphasize event planning aspects like venue selection, scheduling, coordination, and logistics management.",
    coding:
      "Structure the workflow around software development lifecycle, including planning, development, testing, and deployment.",
  };

  const skillLevelInstructions = {
    beginner:
      "Break down tasks into very detailed, step-by-step instructions suitable for beginners. Include explanations for technical terms.",
    intermediate:
      "Provide moderately detailed instructions assuming basic knowledge of the domain. Focus on efficiency and best practices.",
    advanced:
      "Focus on high-level strategy and advanced techniques. Include optimization tips and industry best practices.",
  };

  const dependencyInstructions = [];
  if (settings.dependencies.sequential) {
    dependencyInstructions.push(
      "Organize tasks in sequential order, with each task dependent on the completion of previous tasks."
    );
  }
  if (settings.dependencies.parallel) {
    dependencyInstructions.push(
      "Identify tasks that can be performed simultaneously to optimize workflow efficiency."
    );
  }

  const templateInstruction = settings.template
    ? templatePrompts[settings.template]
    : "";
  const skillInstruction = skillLevelInstructions[settings.skillLevel];
  const dependencyInstruction = dependencyInstructions.join(" ");
  const priorityInstruction = `Prioritize tasks based on ${settings.priorityLevel} priority level.`;

  const prompt = `Create a detailed workflow for the following tasks:
${tasks.map((task) => `- ${task.title}: ${task.description}`).join("\n")}

${templateInstruction}
${skillInstruction}
${dependencyInstruction}
${priorityInstruction}

Format the response as a structured workflow with:
1. Main steps (numbered)
2. Substeps (lettered)
3. Microsteps (roman numerals)
4. Detailed descriptions for each level

The output should be well-formatted with proper line breaks and spacing.
Focus on practical implementation and best practices.
Ensure each step is clearly defined and actionable.`;

  console.log("Sending prompt to OpenAI:", prompt);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are a professional workflow planning assistant specializing in ${
            settings.template || "general"
          } workflows. Create detailed, practical, and well-structured workflows with clear hierarchical organization and proper formatting.`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const workflow = completion.choices[0].message.content;
    console.log("Generated workflow:", workflow);

    if (!workflow || workflow.trim().length === 0) {
      throw new Error("Generated workflow is empty");
    }

    return workflow;
  } catch (error) {
    console.error("Error generating workflow:", error);
    throw error;
  }
}

function createPDFDocument(workflow) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 50,
  });

  // Add title
  doc.font("Helvetica-Bold").fontSize(24).text("Detailed Workflow Plan", {
    align: "center",
  });
  doc.moveDown(2);

  // Add content with proper formatting
  doc.font("Helvetica").fontSize(12).text(workflow, {
    align: "left",
    lineGap: 5,
  });

  return doc;
}

function createDOCXDocument(workflow) {
  return new docx.Document({
    sections: [
      {
        properties: {},
        children: [
          new docx.Paragraph({
            text: "Detailed Workflow Plan",
            heading: docx.HeadingLevel.HEADING_1,
            alignment: docx.AlignmentType.CENTER,
            spacing: {
              after: 400,
            },
          }),
          new docx.Paragraph({
            text: workflow,
            spacing: {
              after: 200,
              line: 360,
              lineRule: docx.LineRuleType.AUTO,
            },
          }),
        ],
      },
    ],
  });
}

async function createInteractivePDF(workflow, tempDir, timestamp) {
  // Convert workflow to HTML with interactive elements
  const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                .section { margin-bottom: 20px; }
                .collapsible { cursor: pointer; padding: 10px; background: #f0f0f0; }
                .content { display: none; padding: 10px; }
                .step { margin: 10px 0; }
                a { color: #0066cc; }
            </style>
        </head>
        <body>
            <h1>Interactive Workflow Plan</h1>
            ${marked.parse(workflow)}
            <script>
                document.querySelectorAll('.collapsible').forEach(button => {
                    button.addEventListener('click', () => {
                        const content = button.nextElementSibling;
                        content.style.display = content.style.display === 'none' ? 'block' : 'none';
                    });
                });
            </script>
        </body>
        </html>
    `;

  const htmlPath = path.join(tempDir, `workflow_${timestamp}.html`);
  fs.writeFileSync(htmlPath, htmlContent);

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`file:${htmlPath}`, { waitUntil: "networkidle0" });

  const pdfPath = path.join(tempDir, `planner_${timestamp}.pdf`);
  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate:
      '<div style="font-size: 10px; text-align: right; width: 100%; padding: 5px;">AI Workflow Planner</div>',
    footerTemplate:
      '<div style="font-size: 10px; text-align: center; width: 100%; padding: 5px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>',
  });

  await browser.close();
  fs.unlinkSync(htmlPath);
  return pdfPath;
}

async function createExcelWorkbook(workflow, tempDir, timestamp) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Workflow Plan");

  // Style for headers
  const headerStyle = {
    font: { bold: true, size: 12 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } },
  };

  // Add headers
  worksheet.columns = [
    { header: "Level", key: "level", width: 15 },
    { header: "Step", key: "step", width: 50 },
    { header: "Details", key: "details", width: 60 },
  ];

  // Apply header styles
  worksheet.getRow(1).eachCell((cell) => {
    cell.style = headerStyle;
  });

  // Parse workflow and add rows
  const lines = workflow.split("\n");
  let currentMainStep = "";
  let currentSubStep = "";

  lines.forEach((line) => {
    if (line.match(/^\d+\./)) {
      // Main step
      currentMainStep = line;
      worksheet.addRow({ level: "Main", step: line });
    } else if (line.match(/^[a-z]\./i)) {
      // Substep
      currentSubStep = line;
      worksheet.addRow({ level: "Sub", step: line });
    } else if (line.match(/^[ivx]+\./i)) {
      // Microstep
      worksheet.addRow({ level: "Micro", step: line });
    } else if (line.trim()) {
      // Details
      worksheet.addRow({ level: "Details", step: line });
    }
  });

  // Add filters
  worksheet.autoFilter = "A1:C1";

  // Save workbook
  const excelPath = path.join(tempDir, `planner_${timestamp}.xlsx`);
  await workbook.xlsx.writeFile(excelPath);
  return excelPath;
}

function createCSV(workflow, tempDir, timestamp) {
  const lines = workflow.split("\n");
  let csvContent = "Level,Step,Details\n";

  lines.forEach((line) => {
    if (line.trim()) {
      let level = "Details";
      if (line.match(/^\d+\./)) level = "Main";
      else if (line.match(/^[a-z]\./i)) level = "Sub";
      else if (line.match(/^[ivx]+\./i)) level = "Micro";

      csvContent += `"${level}","${line.replace(/"/g, '""')}"\n`;
    }
  });

  const csvPath = path.join(tempDir, `planner_${timestamp}.csv`);
  fs.writeFileSync(csvPath, csvContent);
  return csvPath;
}

function createMarkdown(workflow, tempDir, timestamp) {
  const mdContent = `# Workflow Plan\n\n${workflow}`;
  const mdPath = path.join(tempDir, `planner_${timestamp}.md`);
  fs.writeFileSync(mdPath, mdContent);
  return mdPath;
}

// Endpoint to generate workflow planner document
app.post("/api/generate-document", async (req, res) => {
  const { tasks, format, settings } = req.body;
  const timestamp = Date.now();

  if (!tasks || tasks.length === 0) {
    return res.status(400).json({ error: "No tasks provided" });
  }

  try {
    console.log("Generating workflow for tasks:", tasks);
    console.log("Using settings:", settings);
    const detailedWorkflow = await generateDetailedWorkflow(tasks, settings);

    if (!detailedWorkflow) {
      throw new Error("Failed to generate workflow content");
    }

    const tempDir = path.join(__dirname, "temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    let filePath;
    let fileName;

    switch (format) {
      case "interactive-pdf":
        filePath = await createInteractivePDF(
          detailedWorkflow,
          tempDir,
          timestamp
        );
        fileName = "workflow_planner.pdf";
        break;
      case "excel":
        filePath = await createExcelWorkbook(
          detailedWorkflow,
          tempDir,
          timestamp
        );
        fileName = "workflow_planner.xlsx";
        break;
      case "csv":
        filePath = createCSV(detailedWorkflow, tempDir, timestamp);
        fileName = "workflow_planner.csv";
        break;
      case "markdown":
        filePath = createMarkdown(detailedWorkflow, tempDir, timestamp);
        fileName = "workflow_planner.md";
        break;
      case "pdf":
        const doc = createPDFDocument(detailedWorkflow);
        filePath = path.join(tempDir, `planner_${timestamp}.pdf`);
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);
        doc.end();
        fileName = "workflow_planner.pdf";

        await new Promise((resolve, reject) => {
          writeStream.on("finish", resolve);
          writeStream.on("error", reject);
        });
        break;
      case "docx":
        const docxDoc = createDOCXDocument(detailedWorkflow);
        filePath = path.join(tempDir, `planner_${timestamp}.docx`);
        const buffer = await docx.Packer.toBuffer(docxDoc);
        fs.writeFileSync(filePath, buffer);
        fileName = "workflow_planner.docx";
        break;
      default:
        return res.status(400).json({ error: "Invalid format specified" });
    }

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({ error: "Download failed" });
        }
      }
      // Clean up temp file
      fs.unlink(filePath, (err) => {
        if (err) console.error("File cleanup error:", err);
      });
    });
  } catch (error) {
    console.error("Document generation error:", error);
    if (!res.headersSent) {
      res
        .status(500)
        .json({ error: "Document generation failed: " + error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

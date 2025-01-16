const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const docx = require('docx');
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Serve index.html at root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/index.html'));
});

async function generateDetailedWorkflow(tasks) {
    const prompt = `Create a detailed workflow for the following tasks:
${tasks.map(task => `- ${task.title}: ${task.description}`).join('\n')}

Format the response as a structured workflow with:
1. Main steps (numbered)
2. Substeps (lettered)
3. Microsteps (roman numerals)
4. Detailed descriptions for each level

The output should be well-formatted with proper line breaks and spacing.
Focus on practical implementation and best practices.
Ensure each step is clearly defined and actionable.`;

    console.log('Sending prompt to OpenAI:', prompt);

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
                { 
                    role: "system", 
                    content: "You are a professional workflow planning assistant. Create detailed, practical, and well-structured workflows with clear hierarchical organization and proper formatting." 
                },
                { 
                    role: "user", 
                    content: prompt 
                }
            ],
            temperature: 0.7,
        });

        const workflow = completion.choices[0].message.content;
        console.log('Generated workflow:', workflow);

        if (!workflow || workflow.trim().length === 0) {
            throw new Error('Generated workflow is empty');
        }

        return workflow;
    } catch (error) {
        console.error('Error generating workflow:', error);
        throw error;
    }
}

function createPDFDocument(workflow) {
    const doc = new PDFDocument({
        size: 'A4',
        margin: 50
    });

    // Add title
    doc.font('Helvetica-Bold')
        .fontSize(24)
        .text('Detailed Workflow Plan', {
            align: 'center'
        });
    doc.moveDown(2);

    // Add content with proper formatting
    doc.font('Helvetica')
        .fontSize(12)
        .text(workflow, {
            align: 'left',
            lineGap: 5
        });

    return doc;
}

function createDOCXDocument(workflow) {
    return new docx.Document({
        sections: [{
            properties: {},
            children: [
                new docx.Paragraph({
                    text: "Detailed Workflow Plan",
                    heading: docx.HeadingLevel.HEADING_1,
                    alignment: docx.AlignmentType.CENTER,
                    spacing: {
                        after: 400
                    }
                }),
                new docx.Paragraph({
                    text: workflow,
                    spacing: {
                        after: 200,
                        line: 360,
                        lineRule: docx.LineRuleType.AUTO
                    }
                })
            ]
        }]
    });
}

// Endpoint to generate workflow planner document
app.post('/api/generate-document', async (req, res) => {
    const { tasks, format } = req.body;
    const timestamp = Date.now();
    
    if (!tasks || tasks.length === 0) {
        return res.status(400).json({ error: 'No tasks provided' });
    }

    try {
        console.log('Generating workflow for tasks:', tasks);
        const detailedWorkflow = await generateDetailedWorkflow(tasks);

        if (!detailedWorkflow) {
            throw new Error('Failed to generate workflow content');
        }

        const tempDir = path.join(__dirname, 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        if (format === 'pdf') {
            const filePath = path.join(tempDir, `planner_${timestamp}.pdf`);
            const doc = createPDFDocument(detailedWorkflow);
            const writeStream = fs.createWriteStream(filePath);
            
            doc.pipe(writeStream);
            doc.end();

            writeStream.on('finish', () => {
                res.download(filePath, 'workflow_planner.pdf', (err) => {
                    if (err) {
                        console.error('PDF download error:', err);
                        if (!res.headersSent) {
                            res.status(500).json({ error: 'Download failed' });
                        }
                    }
                    // Clean up temp file
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('File cleanup error:', err);
                    });
                });
            });

            writeStream.on('error', (error) => {
                console.error('PDF write error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to create PDF' });
                }
            });

        } else if (format === 'docx') {
            const filePath = path.join(tempDir, `planner_${timestamp}.docx`);
            const doc = createDOCXDocument(detailedWorkflow);

            try {
                const buffer = await docx.Packer.toBuffer(doc);
                fs.writeFileSync(filePath, buffer);

                res.download(filePath, 'workflow_planner.docx', (err) => {
                    if (err) {
                        console.error('DOCX download error:', err);
                        if (!res.headersSent) {
                            res.status(500).json({ error: 'Download failed' });
                        }
                    }
                    // Clean up temp file
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('File cleanup error:', err);
                    });
                });
            } catch (error) {
                console.error('DOCX creation error:', error);
                if (!res.headersSent) {
                    res.status(500).json({ error: 'Failed to create DOCX' });
                }
            }
        } else {
            res.status(400).json({ error: 'Invalid format specified' });
        }
    } catch (error) {
        console.error('Document generation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Document generation failed: ' + error.message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
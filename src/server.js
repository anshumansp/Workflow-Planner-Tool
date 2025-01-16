const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const docx = require('docx');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Serve test.html at root endpoint
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Endpoint to generate workflow planner document
app.post('/api/generate-document', async (req, res) => {
    const { tasks, format } = req.body;
    const timestamp = Date.now();
    
    try {
        if (format === 'pdf') {
            const doc = new PDFDocument();
            const filePath = path.join(__dirname, `../temp/planner_${timestamp}.pdf`);
            
            doc.pipe(fs.createWriteStream(filePath));
            
            // Add content to PDF
            doc.fontSize(25).text('Workflow Planner', { align: 'center' });
            doc.moveDown();
            doc.fontSize(14);
            
            tasks.forEach((task, index) => {
                doc.text(`${index + 1}. ${task.title}`);
                doc.fontSize(12).text(`   Deadline: ${task.deadline}`);
                doc.text(`   Description: ${task.description}`);
                doc.moveDown();
            });
            
            doc.end();
            
            // Send file after it's created
            doc.on('end', () => {
                res.download(filePath, 'workflow_planner.pdf', (err) => {
                    if (err) {
                        console.error('Download error:', err);
                        res.status(500).json({ error: 'Download failed' });
                    }
                    // Clean up temp file
                    fs.unlink(filePath, (err) => {
                        if (err) console.error('File cleanup error:', err);
                    });
                });
            });
        } else if (format === 'docx') {
            const doc = new docx.Document({
                sections: [{
                    properties: {},
                    children: [
                        new docx.Paragraph({
                            text: "Workflow Planner",
                            heading: docx.HeadingLevel.HEADING_1,
                            alignment: docx.AlignmentType.CENTER
                        }),
                        ...tasks.map((task, index) => new docx.Paragraph({
                            children: [
                                new docx.TextRun({
                                    text: `${index + 1}. ${task.title}\n`,
                                    bold: true
                                }),
                                new docx.TextRun(`Deadline: ${task.deadline}\n`),
                                new docx.TextRun(`Description: ${task.description}\n\n`)
                            ]
                        }))
                    ]
                }]
            });

            const filePath = path.join(__dirname, `../temp/planner_${timestamp}.docx`);
            const buffer = await docx.Packer.toBuffer(doc);
            fs.writeFileSync(filePath, buffer);

            res.download(filePath, 'workflow_planner.docx', (err) => {
                if (err) {
                    console.error('Download error:', err);
                    res.status(500).json({ error: 'Download failed' });
                }
                // Clean up temp file
                fs.unlink(filePath, (err) => {
                    if (err) console.error('File cleanup error:', err);
                });
            });
        } else {
            res.status(400).json({ error: 'Invalid format specified' });
        }
    } catch (error) {
        console.error('Document generation error:', error);
        res.status(500).json({ error: 'Document generation failed' });
    }
});

// Create temp directory if it doesn't exist
const tempDir = path.join(__dirname, '../temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 
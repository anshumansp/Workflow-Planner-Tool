# AI Workflow Planner Pro

A modern web application that leverages AI to create detailed, structured workflow plans with multiple export options and voice control capabilities.

## Features

### Core Functionality
- AI-powered workflow generation with customizable settings
- Multi-step personalization options
- Voice command support
- Multiple export formats (PDF, Word, Excel, CSV, Markdown)
- Save and load workflow configurations

### Workflow Settings
- Skill level adaptation (Beginner, Intermediate, Advanced)
- Priority level management
- Pre-built workflow templates:
  - Project Management
  - Event Planning
  - Development

### Document Generation
- Simple PDF export
- Interactive PDF with clickable elements
- Microsoft Word (DOCX) export
- Excel spreadsheet export
- CSV format for data portability
- Markdown format for documentation

### Voice Commands
- "Add task [title]"
- "Add description [text]"
- "Generate workflow"
- "Download [format]"
- "Clear tasks"
- "Save/Load workflow"

## Technical Stack

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5.3.2
- Bootstrap Icons 1.11.2
- Web Speech API for voice commands

### Backend
- Node.js
- Express.js
- OpenAI API for workflow generation
- Document generation libraries:
  - PDFKit
  - docx
  - ExcelJS
  - Puppeteer (for interactive PDFs)
  - marked (for Markdown)

## Setup

1. Clone the repository
2. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Access the application at `http://localhost:3000`

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key
- `PORT`: Server port (default: 3000)

## Project Structure

```
.
├── public/
│   ├── index.html    # Main frontend interface
│   └── styles/       # CSS files
├── src/
│   └── server.js     # Backend server implementation
├── temp/            # Temporary storage for generated files
├── .env             # Environment variables
├── package.json     # Project dependencies
└── README.md        # Project documentation
```

## Usage

1. Enter task details in the main form
2. Configure workflow settings in the sidebar:
   - Select skill level
   - Choose priority level
   - Pick a workflow template
3. Add multiple tasks as needed
4. Use voice commands (optional) for quick actions
5. Generate and export the workflow in your preferred format
6. Save your workflow configuration for later use

## Voice Control

Press the microphone button or use the spacebar to activate voice commands. Available commands are displayed in the tooltip when hovering over the microphone button.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - feel free to use this project for personal or commercial purposes. 
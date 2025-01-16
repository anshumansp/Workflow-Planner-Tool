# AI Workflow Planner Pro

A professional-grade, AI-powered web application that helps users create detailed workflow plans with automatically generated steps, substeps, and microsteps. The application features a modern, responsive interface with voice command support and multiple export formats.

## Key Features

### Task Management
- Intuitive task input with title and description
- Real-time task list updates
- Quick task removal
- Voice command support for hands-free operation

### AI-Powered Workflow Generation
- OpenAI GPT-4 integration for intelligent workflow creation
- Structured output organization:
  - Main steps (numbered)
  - Substeps (lettered)
  - Microsteps (roman numerals)
  - Detailed descriptions for each level

### Workflow Customization
- Skill Level Adaptation:
  - Beginner: Detailed step-by-step instructions
  - Intermediate: Balanced guidance
  - Advanced: High-level strategic overview
- Priority-based Organization:
  - Low/Medium/High priority settings
  - Task dependency management
- Template Selection:
  - Project Management
  - Event Planning
  - Software Development
- Task Dependencies:
  - Sequential task organization
  - Parallel task support

### Document Export Options
- Interactive PDF
  - Collapsible sections
  - Clickable navigation
  - Modern formatting
- Simple PDF
  - Clean, professional layout
  - Print-optimized
- Microsoft Word (DOCX)
  - Editable format
  - Maintained formatting
- Excel Spreadsheet
  - Organized task breakdown
  - Filterable columns
- CSV Format
  - Universal compatibility
  - Data analysis ready
- Markdown
  - Version control friendly
  - Easy to edit

### Voice Command Support
The application supports natural voice commands for common actions:
- "Add task [title]" - Creates a new task
- "Add description [text]" - Adds description to current task
- "Generate workflow" - Starts workflow generation
- "Download [format]" - Exports in specified format
  - Supported formats: PDF, Word, Excel, CSV, Markdown
- "Clear tasks" - Removes all tasks
- "Save workflow" - Saves current configuration
- "Load workflow" - Opens file picker for loading

### Save/Load Functionality
- Save complete workflow configurations
- Load previously saved workflows
- Maintains all settings and customizations

### Modern UI Features
- Responsive design
- Sidebar configuration panel
- Real-time visual feedback
- Loading indicators
- Hover effects and animations
- Keyboard shortcuts
- Tooltip guides

## Technical Stack

### Frontend
- HTML5 & CSS3
- Modern JavaScript (ES6+)
- Bootstrap 5.3.2
- Bootstrap Icons
- Web Speech API for voice commands

### Backend
- Node.js with Express
- OpenAI GPT-4 API
- Document Generation:
  - PDFKit & Puppeteer for PDFs
  - docx for Word documents
  - ExcelJS for spreadsheets
  - marked for Markdown
- CORS enabled for API access

## Setup

1. Clone the repository and create a `.env` file:
   ```
   OPENAI_API_KEY=your_api_key_here
   PORT=3000 (optional, defaults to 3000)
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   # Production
   npm start

   # Development with auto-reload
   npm run dev
   ```

4. Access the application:
   ```
   http://localhost:3000
   ```

## System Requirements

### Server
- Node.js 14.x or higher
- NPM 6.x or higher
- OpenAI API key
- 2GB RAM minimum
- 1GB free disk space

### Client
- Modern web browser with JavaScript enabled
- Microphone access for voice commands
- Stable internet connection
- Minimum screen resolution: 1280x720

## Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Security Features
- Environment variable protection
- CORS configuration
- Input validation
- Error handling
- Secure file operations

## Development
- Modular code structure
- Comprehensive error logging
- Clean code practices
- Performance optimized
- Mobile-responsive design

## License
MIT License - Feel free to use for personal or commercial projects.

## Contributing
Contributions are welcome! Please read our contributing guidelines before submitting pull requests. 
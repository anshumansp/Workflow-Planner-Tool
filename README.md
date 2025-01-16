# AI Workflow Planner

An AI-powered web application that helps users create detailed workflow plans with automatically generated steps, substeps, and microsteps.

## Features

- Add tasks with titles and descriptions
- AI-powered workflow generation using OpenAI GPT-4
- Structured output with:
  - Main steps (numbered)
  - Substeps (lettered)
  - Microsteps (roman numerals)
  - Detailed descriptions for each level
- Generate downloadable documents in PDF or DOCX format
- Clean and responsive user interface
- Real-time task list updates
- Loading indicator during AI generation

## Setup

1. Create a `.env` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

4. Access the application:
   Open your web browser and navigate to `http://localhost:3000`

## Usage

1. Add tasks:
   - Enter task title
   - Provide detailed description
   - Click "Add Task"

2. Manage tasks:
   - View all tasks in the list
   - Remove tasks using the "Remove" button

3. Generate AI workflow:
   - Click "Download PDF" for PDF format
   - Click "Download DOCX" for Word format
   - The AI will automatically organize your tasks into a detailed workflow

## Technical Details

- Backend: Node.js with Express
- AI Integration: OpenAI GPT-4
- Document Generation: PDFKit and docx
- Frontend: HTML, CSS (Bootstrap), JavaScript
- Cross-Origin Resource Sharing (CORS) enabled

## Requirements

- Node.js 14.x or higher
- OpenAI API key
- Modern web browser with JavaScript enabled 
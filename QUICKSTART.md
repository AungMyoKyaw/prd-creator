# 🚀 Quick Start Checklist

## First Time Setup

- [ ] **Clone the repository**
  ```bash
  git clone <repository-url>
  cd prd-creator
  ```

- [ ] **Install dependencies**
  ```bash
  npm install
  ```

- [ ] **Get your Gemini API key**
  - Visit: https://ai.google.dev/
  - Sign in with your Google account
  - Click "Get API key"
  - Create a new API key or use existing one

- [ ] **Set up environment variables**
  ```bash
  # Copy the example file
  cp .env.example .env.local
  
  # Edit .env.local and add your API key
  GEMINI_API_KEY=your_actual_api_key_here
  ```

- [ ] **Start the development server**
  ```bash
  npm run dev
  ```

- [ ] **Open your browser**
  - Navigate to http://localhost:3000
  - You should see the PRD Creator interface

## Using the Application

### ✨ Quick Start (Recommended for Beginners)

1. **Describe your product idea** (30 seconds)
   - Type a brief description in the "Quick Start" text area
   - Example: "A mobile app that helps people find and book local fitness classes"

2. **Let AI auto-fill the form** (10-15 seconds)
   - Click "Auto-fill Form with AI ✨"
   - Wait for the AI to populate all fields
   - Watch as product name, features, audience, etc. are generated

3. **Review and adjust** (2-3 minutes)
   - Check all auto-filled fields
   - Make any necessary adjustments
   - Add specific details you want to include
   - See live preview updating on the right

4. **Generate complete PRD** (20-30 seconds)
   - Click "Generate PRD"
   - Wait for AI to create comprehensive document
   - View the generated PRD on the right side

5. **Refine sections** (optional, 10-15 seconds per section)
   - Click "Refine" button on any section
   - Provide specific feedback
   - Example: "Make the tone more formal" or "Add security considerations"
   - AI updates just that section

### 📝 Manual Entry (For Experienced Users)

1. **Fill out each section manually**
   - Core Product Idea
   - Audience & Market
   - Features & Scope
   - Technical Details

2. **Watch live preview** as you type

3. **Generate PRD** when ready

4. **Refine** specific sections as needed

## Tips for Best Results

### ✅ DO:
- Be specific in your product idea description
- Include target audience in your initial description
- Mention key problems you're solving
- Use bullet points for features
- Review and refine the auto-filled content

### ❌ DON'T:
- Don't leave fields completely empty (except optional ones)
- Don't use vague descriptions like "a social media app"
- Don't skip the review step after auto-fill
- Don't expect perfection on first generation (refinement is part of the process)

## Example Product Ideas

Here are some example product ideas to try:

1. **Fitness App**
   ```
   A mobile app that helps busy professionals find and book last-minute 
   fitness classes near them, with integrated payment and calendar sync
   ```

2. **Task Manager**
   ```
   A collaborative task management tool for remote teams that uses AI to 
   automatically prioritize tasks and predict completion times
   ```

3. **Recipe Platform**
   ```
   A web platform where home cooks can share recipes, get personalized 
   meal plans, and automatically generate shopping lists based on dietary 
   preferences
   ```

4. **Language Learning**
   ```
   An app that teaches languages through real-world conversations, using 
   speech recognition to provide instant feedback on pronunciation
   ```

## Troubleshooting

### Error: "GEMINI_API_KEY environment variable not set"
- **Solution**: Make sure you created `.env.local` and added your API key
- **Check**: File should be in the root directory (same level as package.json)
- **Verify**: Open `.env.local` and confirm the key is present

### Error: API call fails
- **Solution**: Check your API key is valid and has not expired
- **Check**: Visit https://ai.google.dev/ to verify your API key
- **Note**: Free tier has rate limits (adjust usage accordingly)

### Page not loading / Build errors
- **Solution**: Clear cache and reinstall dependencies
  ```bash
  rm -rf .next node_modules
  npm install
  npm run dev
  ```

### Live preview not updating
- **Solution**: This is normal - live preview shows structure, not AI-generated content
- **Note**: Full AI generation happens when you click "Generate PRD"

## Support

If you encounter issues:
1. Check this checklist first
2. Review the main README.md for detailed documentation
3. Check the console for error messages
4. Verify your API key is correctly set

## Next Steps

After successfully generating your first PRD:
- Try the refinement feature to improve specific sections
- Copy the PRD to your documentation tool (Notion, Confluence, etc.)
- Experiment with different product ideas
- Share feedback on what works well and what could be improved

---

**Time to first PRD**: ~5 minutes from setup  
**Typical usage time**: 5-10 minutes per PRD  
**Recommended for**: Product Managers, Founders, Developers, Designers

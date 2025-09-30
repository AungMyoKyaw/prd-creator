import { NextRequest, NextResponse } from "next/server";

interface GoogleModel {
  name: string;
  displayName?: string;
  description?: string;
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  supportedGenerationMethods?: string[];
}

interface FormattedModel {
  value: string;
  label: string;
  description: string;
  displayName: string;
  inputTokenLimit: number | null;
  outputTokenLimit: number | null;
  supportedGenerationMethods: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { apiKey } = (await request.json()) as { apiKey?: string };

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: "API key is required." }, { status: 400 });
    }

    // Use fetch API directly to get models list
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.statusText}`);
    }

    const data = await response.json() as { models?: GoogleModel[] };
    
    if (!data.models || !Array.isArray(data.models)) {
      throw new Error("No models available");
    }

    // Filter for text generation models and format them
    const models: FormattedModel[] = data.models
      .filter((model: GoogleModel) => {
        // Filter for generative models (exclude embedding, etc.)
        return model.supportedGenerationMethods?.includes('generateContent') ||
               model.name.includes('gemini');
      })
      .map((model: GoogleModel): FormattedModel => ({
        value: model.name.replace('models/', ''), // Remove 'models/' prefix
        label: model.displayName || formatModelName(model.name),
        description: model.description || getDefaultDescription(model.name),
        displayName: model.displayName || formatModelName(model.name),
        inputTokenLimit: model.inputTokenLimit || null,
        outputTokenLimit: model.outputTokenLimit || null,
        supportedGenerationMethods: model.supportedGenerationMethods || [],
      }))
      .sort((a: FormattedModel, b: FormattedModel) => {
        // Sort by: Latest version > Flash > Pro > Thinking > Others
        const getPriority = (name: string) => {
          const lower = name.toLowerCase();
          
          // Gemini 2.5 - Stable first, then previews
          if (lower.includes('2.5') && lower.includes('flash') && !lower.includes('preview') && !lower.includes('lite')) return 0;
          if (lower.includes('2.5') && lower.includes('flash') && lower.includes('preview')) return 1;
          if (lower.includes('2.5') && lower.includes('flash') && lower.includes('lite')) return 2;
          if (lower.includes('2.5') && lower.includes('pro') && !lower.includes('preview')) return 3;
          if (lower.includes('2.5') && lower.includes('pro') && lower.includes('preview')) return 4;
          
          // Gemini 2.0 - Flash first, then Pro
          if (lower.includes('2.0') && lower.includes('flash') && !lower.includes('thinking') && !lower.includes('exp') && !lower.includes('lite')) return 5;
          if (lower.includes('2.0') && lower.includes('flash') && lower.includes('exp') && !lower.includes('thinking')) return 6;
          if (lower.includes('2.0') && lower.includes('flash') && lower.includes('lite')) return 7;
          if (lower.includes('2.0') && lower.includes('pro')) return 8;
          if (lower.includes('2.0') && lower.includes('flash') && lower.includes('thinking')) return 9;
          
          // Generic latest models
          if (lower.includes('flash') && lower.includes('latest') && !lower.includes('lite')) return 10;
          if (lower.includes('flash') && lower.includes('lite') && lower.includes('latest')) return 11;
          if (lower.includes('pro') && lower.includes('latest')) return 12;
          
          // Experimental/Others
          if (lower.includes('exp')) return 20;
          if (lower.includes('learnlm')) return 30;
          if (lower.includes('gemma')) return 40;
          
          return 99; // Others last
        };
        return getPriority(a.value) - getPriority(b.value);
      });

    return NextResponse.json({ models });
  } catch (error) {
    console.error("Error fetching models:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while fetching models.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper function to format model names
function formatModelName(modelName: string): string {
  const name = modelName.replace('models/', '');
  
  // Gemini 2.5 (Latest)
  if (name.includes('gemini-2.5-flash')) return 'Gemini 2.5 Flash';
  if (name.includes('gemini-2.5-pro')) return 'Gemini 2.5 Pro';
  
  // Gemini 2.0
  if (name.includes('gemini-2.0-flash-exp')) return 'Gemini 2.0 Flash (Experimental)';
  if (name.includes('gemini-2.0-flash-thinking')) return 'Gemini 2.0 Flash Thinking';
  if (name.includes('gemini-2.0-flash')) return 'Gemini 2.0 Flash';
  if (name.includes('gemini-2.0-pro')) return 'Gemini 2.0 Pro';
  
  // Gemini 1.5
  if (name.includes('gemini-1.5-pro-latest')) return 'Gemini 1.5 Pro (Latest)';
  if (name.includes('gemini-1.5-flash-latest')) return 'Gemini 1.5 Flash (Latest)';
  if (name.includes('gemini-1.5-pro')) return 'Gemini 1.5 Pro';
  if (name.includes('gemini-1.5-flash')) return 'Gemini 1.5 Flash';
  
  // Experimental
  if (name.includes('gemini-exp')) return `Gemini Experimental ${name.match(/\d{4}/)?.[0] || ''}`;
  
  // Default: capitalize and clean up
  return name
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Helper function to provide default descriptions
function getDefaultDescription(modelName: string): string {
  const name = modelName.toLowerCase();
  
  // Gemini 2.5 (Latest)
  if (name.includes('2.5') && name.includes('flash')) {
    return 'Latest Gemini model with fast performance and high quality.';
  }
  if (name.includes('2.5') && name.includes('pro')) {
    return 'Latest Gemini Pro with enhanced reasoning and capabilities.';
  }
  
  // Gemini 2.0
  if (name.includes('2.0') && name.includes('exp')) {
    return 'Experimental model with cutting-edge capabilities.';
  }
  if (name.includes('2.0') && name.includes('thinking')) {
    return 'Advanced reasoning and problem-solving with extended thinking.';
  }
  if (name.includes('2.0') && name.includes('flash')) {
    return 'Fast and efficient model with multimodal capabilities.';
  }
  if (name.includes('2.0') && name.includes('pro')) {
    return 'Enhanced reasoning with improved performance.';
  }
  
  // Gemini 1.5
  if (name.includes('1.5') && name.includes('pro')) {
    return 'Highest quality with detailed reasoning and analysis.';
  }
  if (name.includes('1.5') && name.includes('flash')) {
    return 'Balanced speed and quality for most tasks.';
  }
  
  // Experimental
  if (name.includes('exp')) {
    return 'Experimental model with latest features.';
  }
  
  return 'Generative AI model for text generation.';
}

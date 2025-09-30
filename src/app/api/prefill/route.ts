import { NextRequest, NextResponse } from "next/server";
import { Type, GoogleGenAI } from "@google/genai";
import { DEFAULT_PRD_INPUT, PrdInput } from "../../../lib/prd";

export async function POST(request: NextRequest) {
  try {
    const { productIdea, apiKey, model } = (await request.json()) as { 
      productIdea?: string;
      apiKey?: string;
      model?: string;
    };

    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ error: "API key is required." }, { status: 400 });
    }

    if (!productIdea || !productIdea.trim()) {
      return NextResponse.json({ error: "Product idea is required." }, { status: 400 });
    }

    const client = new GoogleGenAI({ apiKey });
    const prompt = `You are a brilliant product strategist. A user has provided a high-level product idea. Your task is to analyze this idea and break it down into the foundational components of a Product Requirements Document. Based on the idea, generate a plausible product name, identify a specific target audience, formulate a clear problem statement and a corresponding solution, brainstorm a few core features for an MVP, and suggest some potential business goals, future features, and a possible tech stack.

User's Idea: "${productIdea}"

Return the response as a JSON object that strictly adheres to the provided schema. For features, use bullet points within the string.`;

    const response = await client.models.generateContent({
      model: model || "gemini-2.0-flash-exp",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            productName: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            problemStatement: { type: Type.STRING },
            proposedSolution: { type: Type.STRING },
            coreFeatures: { type: Type.STRING },
            businessGoals: { type: Type.STRING },
            futureFeatures: { type: Type.STRING },
            techStack: { type: Type.STRING },
            constraints: { type: Type.STRING },
          },
          required: [
            "productName",
            "targetAudience",
            "problemStatement",
            "proposedSolution",
            "coreFeatures",
          ],
        },
      },
    });

    const jsonString = response.text?.trim();
    if (!jsonString) {
      throw new Error("Gemini returned an empty response while prefilling inputs.");
    }

    const parsed = JSON.parse(jsonString);
    const result: PrdInput = {
      productName: parsed.productName || DEFAULT_PRD_INPUT.productName,
      targetAudience: parsed.targetAudience || DEFAULT_PRD_INPUT.targetAudience,
      problemStatement: parsed.problemStatement || DEFAULT_PRD_INPUT.problemStatement,
      proposedSolution: parsed.proposedSolution || DEFAULT_PRD_INPUT.proposedSolution,
      coreFeatures: parsed.coreFeatures || DEFAULT_PRD_INPUT.coreFeatures,
      businessGoals: parsed.businessGoals || DEFAULT_PRD_INPUT.businessGoals,
      futureFeatures: parsed.futureFeatures || DEFAULT_PRD_INPUT.futureFeatures,
      techStack: parsed.techStack || DEFAULT_PRD_INPUT.techStack,
      constraints: parsed.constraints || DEFAULT_PRD_INPUT.constraints,
    };

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error("Error generating PRD inputs:", error);
    const message =
      error instanceof Error
        ? error.message
        : "An unknown error occurred while generating PRD inputs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

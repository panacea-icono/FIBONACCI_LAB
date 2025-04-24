import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeMessage(text: string): Promise<{
  analysis: string;
  sentiment: number;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: 
            "Analyze the message for social media management context. Provide a brief analysis and sentiment score (1-5). Return JSON: { 'analysis': string, 'sentiment': number }"
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content);
    return {
      analysis: result.analysis,
      sentiment: Math.max(1, Math.min(5, Math.round(result.sentiment)))
    };
  } catch (error) {
    console.error("OpenAI API error:", error);
    return {
      analysis: "Failed to analyze message",
      sentiment: 3
    };
  }
}

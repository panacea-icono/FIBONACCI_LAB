import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function analyzeSentiment(text: string): Promise<{
  rating: number;
  confidence: number;
  suggestion: string;
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a social media expert. Analyze the sentiment of the text and provide a rating from 1 to 5 stars, a confidence score between 0 and 1, and a brief suggestion for improvement. Respond with JSON in this format: { 'rating': number, 'confidence': number, 'suggestion': string }",
        },
        {
          role: "user",
          content: text,
        },
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content);

    return {
      rating: Math.max(1, Math.min(5, Math.round(result.rating))),
      confidence: Math.max(0, Math.min(1, result.confidence)),
      suggestion: result.suggestion,
    };
  } catch (error) {
    throw new Error("Failed to analyze sentiment: " + error.message);
  }
}

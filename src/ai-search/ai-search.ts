
import natural from "natural";


import { HfInference } from "@huggingface/inference";

const hf = new HfInference("your_huggingface_api_key"); 

export async function generateSummary(text: string): Promise<string> {
    try {
        const response = await hf.summarization({
            model: "facebook/bart-large-cnn",
            inputs: text,
            parameters: { max_length: 100, min_length: 30 },
        });

        return response.summary_text || "No summary available.";
    } catch (error) {
        console.error("Hugging Face Error:", error);
        return "Could not generate summary.";
    }
}


export function findBestMatch(query: string, descriptions: string[]): number {
    const tokenizer = new natural.WordTokenizer();
    const queryTokens = tokenizer.tokenize(query.toLowerCase());

    let bestIndex = -1;
    let highestScore = 0;

    descriptions.forEach((description, index) => {
        const descriptionTokens = tokenizer.tokenize(description.toLowerCase());
        const commonTokens = descriptionTokens.filter((token) => queryTokens.includes(token));
        const score = commonTokens.length / queryTokens.length;

        if (score > highestScore) {
            highestScore = score;
            bestIndex = index;
        }
    });

    return bestIndex;
};


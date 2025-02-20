"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSummary = generateSummary;
exports.findBestMatch = findBestMatch;
const natural_1 = __importDefault(require("natural"));
const inference_1 = require("@huggingface/inference");
const hf = new inference_1.HfInference("your_huggingface_api_key");
function generateSummary(text) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield hf.summarization({
                model: "facebook/bart-large-cnn",
                inputs: text,
                parameters: { max_length: 100, min_length: 30 },
            });
            return response.summary_text || "No summary available.";
        }
        catch (error) {
            console.error("Hugging Face Error:", error);
            return "Could not generate summary.";
        }
    });
}
function findBestMatch(query, descriptions) {
    const tokenizer = new natural_1.default.WordTokenizer();
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
}
;
//# sourceMappingURL=ai-search.js.map
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
exports.random = random;
exports.fetchMetadata = fetchMetadata;
exports.getMainUrl = getMainUrl;
const mql_1 = __importDefault(require("@microlink/mql"));
function random(len) {
    let options = "qwertyuioasdfghjklzxcvbnm12345678";
    let length = options.length;
    let ans = "";
    for (let i = 0; i < len; i++) {
        ans += options[Math.floor((Math.random() * length))];
    }
    return ans;
}
function fetchMetadata(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield (0, mql_1.default)(url);
            console.log(response);
            // @ts-ignore
            const { data } = response;
            return data;
        }
        catch (error) {
            console.error('Error fetching metadata:', error);
            throw error;
        }
    });
}
function getMainUrl(fullUrl) {
    try {
        const url = new URL(fullUrl);
        return url.origin;
    }
    catch (error) {
        console.error("Invalid URL:", error);
        return null;
    }
}
//# sourceMappingURL=utils.js.map
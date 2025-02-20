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
const express_1 = __importDefault(require("express"));
const auth_1 = require("./middleware/auth");
const user_schema_1 = require("./model/user-schema");
const content_schema_1 = require("./model/content-schema");
const link_schema_1 = require("./model/link-schema");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookieParser = require("cookie-parser");
const configDB_1 = require("./config/configDB");
const configJWT_1 = require("./config/configJWT");
const utils_1 = require("./lib/utils");
// import mql, { HTTPResponseRaw } from '@microlink/mql';
const scrapped_content_schema_1 = require("./model/scrapped-content-schema");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const port = 3000;
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((req, res, next) => {
    res.set('Access-Control-Allow-Origin', 'https://second-brain-frontend-tawny.vercel.app');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        res.status(200).end(); // ✅ Ensure OPTIONS request stops here
        return;
    }
    next(); // ✅ Proceed to the next middleware
});
app.use(cookieParser());
app.post('/api/v1/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    try {
        const existingUser = yield user_schema_1.User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ status: false, message: "User already exists" });
            return;
        }
        yield user_schema_1.User.create({
            username: username,
            password: password
        });
        res.status(201).json({ status: true, message: "User created successfully" });
    }
    catch (error) {
        res.status(500).json({ status: false, message: "Internal server error" });
    }
}));
app.post('/api/v1/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const password = req.body.password;
    const existingUser = yield user_schema_1.User.findOne({ username: username, password: password });
    if (existingUser) {
        const accessToken = jsonwebtoken_1.default.sign({ id: existingUser._id }, configJWT_1.JWT_ACCESS_PASSWORD, { expiresIn: '15d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: existingUser._id }, configJWT_1.JWT_REFRESH_PASSWORD, { expiresIn: '30d' });
        res.cookie('refreshToken', refreshToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, secure: true, sameSite: 'strict' });
        res.json({
            message: 'User authenticated',
            token: accessToken,
            refresh: refreshToken
        });
    }
    else {
        res.status(403).json({ message: 'Incorrect credentials' });
    }
}));
app.get('/api/v1/checkAuth', auth_1.userMiddleware, (req, res) => {
    res.status(200).json({ valid: true, message: "user authenticated" });
});
app.get('/api/v1/refresh', (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({ valid: false, message: "No refresh token provided" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, configJWT_1.JWT_REFRESH_PASSWORD);
        const accessToken = jsonwebtoken_1.default.sign({
            id: decoded.id
        }, configJWT_1.JWT_ACCESS_PASSWORD, { expiresIn: "1m" });
        res.status(201).json({ accessToken: accessToken, message: "Access token generated" });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(401).json({ valid: false, message: "Refresh token expired" });
        }
        else {
            res.status(403).json({ valid: false, message: "Invalid refresh token" });
        }
    }
});
app.get('/api/v1/content', auth_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const content = yield content_schema_1.Content.find({
        userId: userId
    }).populate("userId", "username")
        .populate({
        path: "scrapped",
        model: "Scrapped",
        select: "author title publisher imageUrl originUrl url description logoUrl"
    });
    res.status(200).json({
        content
    });
}));
app.post('/api/v1/content', auth_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // const title = req.body.title;
    const link = req.body.link;
    const type = req.body.type;
    const text = req.body.text;
    try {
        const newContent = yield content_schema_1.Content.create({
            link,
            type,
            text,
            userId: req.userId,
            tags: []
        });
        if (link) {
            const contentId = newContent._id;
            const metadata = yield (0, utils_1.fetchMetadata)(link);
            const baseUrl = (0, utils_1.getMainUrl)(link);
            yield scrapped_content_schema_1.Scrapped.create({
                contentId,
                author: metadata.author,
                title: metadata.title,
                publisher: metadata.publisher,
                imageUrl: metadata.image.url,
                originUrl: baseUrl,
                url: link,
                description: metadata.description,
                logoUrl: metadata.logo.url,
            });
        }
        res.json({
            flag: true,
            message: "Content added successfully",
        });
    }
    catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to process content' });
    }
}));
app.delete('/api/v1/:contentId', auth_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.params.contentId;
    console.log(" deleting contentId", contentId);
    const deletedContent = yield content_schema_1.Content.findByIdAndDelete(contentId);
    console.log("this is the deleted content: ", deletedContent);
    res.status(200).json({
        valid: true,
        message: "delete sucessfull"
    });
}));
// space for ai search
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const groq = new groq_sdk_1.default({ apiKey: process.env.GROQ_API_KEY });
app.post("/api/v1/query", auth_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    try {
        const query = req.body.query;
        if (!query) {
            res.status(400).json({ message: "Query is required" });
            return;
        }
        const contentList = yield content_schema_1.Content.find({ userId: req.userId });
        if (contentList.length === 0) {
            console.log("No content");
            res.status(404).json({ message: "No content found" });
            return;
        }
        const contentData = yield Promise.all(contentList.map((content) => __awaiter(void 0, void 0, void 0, function* () {
            const scrapped = yield scrapped_content_schema_1.Scrapped.findOne({ contentId: content._id });
            return {
                query: `${content.text} - ${scrapped ? scrapped.description : "No description"}- ${scrapped ? scrapped.title : "No title"}
                        - ${scrapped ? scrapped.author : "No author"}`,
                content: scrapped || content
            };
        })));
        const queries = contentData.map(item => item.query);
        const contents = contentData.map(item => item.content);
        const prompt = `
            Given the following pieces of content, find the one that best matches the user query:
            Query: "${query}"
            
            Content:
            ${queries.map((text, index) => `(${index + 1}) ${text}`).join("\n")}

            Return ONLY the number of the most relevant content (e.g., "1", "2", etc.).
        `;
        const response = yield groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
        });
        const matchText = (_c = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) === null || _c === void 0 ? void 0 : _c.trim();
        const bestMatchIndex = parseInt(matchText, 10) - 1;
        if (isNaN(bestMatchIndex) || bestMatchIndex < 0 || bestMatchIndex >= contentData.length) {
            res.status(404).json({ message: "No relevant content found" });
            return;
        }
        const bestMatch = queries[bestMatchIndex];
        const [title, description, author] = bestMatch.split('-');
        const summaryPrompt = `
        The user has asked the following query: "${query}".  
      
        You have been given the most relevant content. Present it in a clear and conversational manner without summarizing. Ensure that all details are naturally included.  
      
        **Content Details:**  
        - **Title**: ${(title === null || title === void 0 ? void 0 : title.trim()) || "Untitled"}  
        - **Description**: ${(description === null || description === void 0 ? void 0 : description.trim()) || "No description available"}  
        - **Author**: ${(author === null || author === void 0 ? void 0 : author.trim()) || "No author specified"}  
        - **Full Content**: ${contents[bestMatchIndex] ? JSON.stringify(contents[bestMatchIndex]) : "No additional content available"}  
      
        **Instructions:**  
        - Your response must start with: **"Here’s what I found:"**  
        - Do NOT omit any details from the given content.  
        - Present the content in a natural way, ensuring all fields are included. 
        - Summarize the content if necessary 
        - If any information is missing, acknowledge it appropriately rather than assuming.  
        - Maintain clarity
        - Do disclose confidential data like passwords or secrets.  
        - Do not disclose contents timestamp and Id
        Now, generate the response based on the provided details.
      `;
        const summaryResponse = yield groq.chat.completions.create({
            model: "llama3-8b-8192",
            messages: [{ role: "user", content: summaryPrompt }],
        });
        const summary = ((_f = (_e = (_d = summaryResponse.choices[0]) === null || _d === void 0 ? void 0 : _d.message) === null || _e === void 0 ? void 0 : _e.content) === null || _f === void 0 ? void 0 : _f.trim()) || "No summary available.";
        res.json({
            status: true,
            bestMatch: contents[bestMatchIndex],
            summary,
        });
    }
    catch (error) {
        console.error("AI Search Error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
}));
app.post("/api/v1/brain/share", auth_1.userMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const share = req.body.share;
    if (share) {
        const existingLink = yield link_schema_1.Link.findOne({
            userId: req.userId
        });
        if (existingLink) {
            res.json({
                hash: existingLink.hash
            });
            return;
        }
        const hash = (0, utils_1.random)(10);
        yield link_schema_1.Link.create({
            userId: req.userId,
            hash: hash
        });
        res.json({
            hash
        });
    }
    else {
        yield link_schema_1.Link.deleteOne({ userId: req.userId });
        res.json({
            message: "Removed link"
        });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = req.params.shareLink;
    const link = yield link_schema_1.Link.findOne({
        hash
    });
    if (!link) {
        res.status(411).json({
            message: "Sorry incorrect input"
        });
        return;
    }
    const content = yield content_schema_1.Content.find({
        userId: link.userId
    });
    console.log(link);
    const user = yield user_schema_1.User.findOne({
        _id: link.userId
    });
    if (!user) {
        res.status(411).json({
            message: "user not found, error should ideally not happen"
        });
        return;
    }
    res.json({
        username: user.username,
        content: content
    });
}));
app.post('/api/v1/forgot-password', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.body.username;
    const currentPassword = req.body.currentPassword;
    const newPassword = req.body.newPassword;
    const user = yield user_schema_1.User.findOne({ username });
    console.log(user);
    if (user) {
        if (currentPassword === user.password) {
            user.password = newPassword;
            yield user.save();
            res.status(200).json({ status: true, message: "password updated successfully" });
        }
        else {
            res.status(400).json({ status: false, message: "Incorrect current password" });
            return;
        }
    }
    else {
        res.status(404).json({ status: false, message: "User not found" });
        return;
    }
}));
app.get('/', (req, res) => {
    res.send('Hello World!');
});
(0, configDB_1.connectDB)();
app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
});
module.exports = app;
//# sourceMappingURL=index.js.map
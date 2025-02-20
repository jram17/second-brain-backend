"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tags = void 0;
const mongoose_1 = require("mongoose");
const TagsSchema = new mongoose_1.Schema({
    title: [{ type: String, unique: true }]
});
exports.Tags = (0, mongoose_1.model)('Tags', TagsSchema);
//# sourceMappingURL=tags-schema.js.map
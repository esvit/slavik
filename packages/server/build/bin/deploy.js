#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const openai_1 = tslib_1.__importDefault(require("openai"));
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = require("fs");
const openai = new openai_1.default({ apiKey: process.env.OPENAI_TOKEN });
async function main() {
    const dir = path_1.default.dirname(process.argv[process.argv.length - 1]);
    const content = await fs_1.promises.readFile(process.argv[process.argv.length - 1], "utf-8");
    try {
        const assistant = JSON.parse(content);
        assistant.instructions = await fs_1.promises.readFile(path_1.default.join(dir, assistant.instructionsFile), "utf-8");
        delete assistant.instructionsFile;
        const result = await openai.beta.assistants.update(process.env.OPENAI_ASSISTANT_ID, assistant);
        console.info(result);
    }
    catch (err) {
        console.info(err);
        console.error('Invalid assistant file');
    }
}
main();

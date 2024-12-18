#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const openai_1 = tslib_1.__importDefault(require("openai"));
const openai = new openai_1.default({ apiKey: process.env.OPENAI_TOKEN });
async function main() {
    const myUpdatedAssistant = await openai.beta.assistants.retrieve(process.env.OPENAI_ASSISTANT_ID);
    console.log(myUpdatedAssistant);
}
main();

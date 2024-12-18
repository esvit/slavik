#!/usr/bin/env node

import OpenAI from "openai";
import path from "path";
import { promises as fs } from "fs";

const openai = new OpenAI({ apiKey: process.env.OPENAI_TOKEN });

(async function main() {
  const dir = path.dirname(process.argv[process.argv.length - 1]);
  const content = await fs.readFile(process.argv[process.argv.length - 1], "utf-8");
  try {
    const assistant = JSON.parse(content);
    assistant.instructions = await fs.readFile(path.join(dir, assistant.instructionsFile), "utf-8");
    delete assistant.instructionsFile;

    const result = await openai.beta.assistants.update(process.env.OPENAI_ASSISTANT_ID as string, assistant);
    console.info(result);
    console.info('Done!');
  } catch (err) {
    console.info(err);
    console.error('Invalid assistant file');
  }
})();

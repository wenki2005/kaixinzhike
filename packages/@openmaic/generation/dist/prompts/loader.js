/**
 * Prompt loader for packaged Markdown templates and snippets.
 */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
// `src/prompts` and `dist/prompts` have the same depth below the package root.
// Resolve from this module's URL via path operations so app bundlers do not
// mistake the Markdown directory for a statically imported module asset.
const DEFAULT_PROMPTS_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const PROMPT_VARIABLE_DEFAULTS = {
    'pbl-actions': {
        projectSummary: '(No generated milestones are available; introduce the project topic without inventing any.)',
    },
};
function isMissingFileError(error) {
    return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
/** Load a snippet by ID. */
export function loadSnippet(snippetId, promptsDir = DEFAULT_PROMPTS_DIR) {
    const snippetPath = join(promptsDir, 'snippets', `${snippetId}.md`);
    try {
        return readFileSync(snippetPath, 'utf-8').trim();
    }
    catch {
        // Fail loud rather than silently shipping `{{snippet:foo}}` to the model.
        throw new Error(`Snippet not found: ${snippetId}`);
    }
}
/** Replace snippet includes with their file content. */
export function processSnippets(template, promptsDir = DEFAULT_PROMPTS_DIR) {
    return template.replace(/\{\{snippet:(\w[\w-]*)\}\}/g, (_, snippetId) => {
        return loadSnippet(snippetId, promptsDir);
    });
}
/** Include or remove non-nested conditional blocks according to truthiness. */
export function processConditionalBlocks(template, conditions) {
    return template.replace(/\{\{#if (\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (_, conditionName, content) => {
        return conditions[conditionName] ? content : '';
    });
}
/** Load a prompt by ID. */
export function loadPrompt(promptId, promptsDir = DEFAULT_PROMPTS_DIR) {
    const promptDir = join(promptsDir, 'templates', promptId);
    const systemPath = join(promptDir, 'system.md');
    let systemPrompt;
    try {
        systemPrompt = readFileSync(systemPath, 'utf-8').trim();
    }
    catch (error) {
        if (isMissingFileError(error))
            return null;
        throw error;
    }
    systemPrompt = processSnippets(systemPrompt, promptsDir);
    const userPath = join(promptDir, 'user.md');
    let userPromptTemplate = '';
    try {
        userPromptTemplate = readFileSync(userPath, 'utf-8').trim();
    }
    catch (error) {
        // user.md is optional, but only when it is genuinely absent.
        if (!isMissingFileError(error))
            throw error;
    }
    userPromptTemplate = processSnippets(userPromptTemplate, promptsDir);
    return {
        id: promptId,
        systemPrompt,
        userPromptTemplate,
    };
}
/** Replace camelCase or snake_case placeholders with supplied values. */
export function interpolateVariables(template, variables) {
    // `\w+` leaves kebab-case placeholders untouched by design.
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = variables[key];
        if (value === undefined)
            return match;
        if (typeof value === 'object')
            return JSON.stringify(value, null, 2);
        return String(value);
    });
}
function applyPromptVariableDefaults(promptId, variables) {
    const defaults = PROMPT_VARIABLE_DEFAULTS[promptId];
    if (!defaults)
        return variables;
    const resolved = { ...variables };
    for (const [key, value] of Object.entries(defaults)) {
        if (resolved[key] === undefined)
            resolved[key] = value;
    }
    return resolved;
}
/**
 * Build a complete prompt in this order: snippets, conditionals, variables.
 */
export function buildPrompt(promptId, variables, promptsDir = DEFAULT_PROMPTS_DIR) {
    const prompt = loadPrompt(promptId, promptsDir);
    if (!prompt)
        return null;
    const resolvedVariables = applyPromptVariableDefaults(promptId, variables);
    return {
        system: interpolateVariables(processConditionalBlocks(prompt.systemPrompt, resolvedVariables), resolvedVariables),
        user: interpolateVariables(processConditionalBlocks(prompt.userPromptTemplate, resolvedVariables), resolvedVariables),
    };
}
//# sourceMappingURL=loader.js.map
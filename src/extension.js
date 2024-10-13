const vscode = require('vscode');
const axios = require('axios');
const cheerio = require('cheerio');

function activate(context) {
    // Existing hover provider
    const hoverProvider = vscode.languages.registerHoverProvider('x86asm', {
        async provideHover(document, position, token) {
            const range = document.getWordRangeAtPosition(position, /\b[a-zA-Z0-9_]+\b/);
            const word = document.getText(range);

            if (word) {
                const instructionInfo = await fetchInstructionInfo(word.toLowerCase());
                if (instructionInfo) {
                    return new vscode.Hover(instructionInfo);
                } else if (isLabel(document, word)) {
                    return new vscode.Hover(`Label: ${word}`);
                } 
            }

            return undefined;
        }
    });

    // New definition provider (Ctrl+Click to jump)
    const definitionProvider = vscode.languages.registerDefinitionProvider('x86asm', {
        provideDefinition(document, position, token) {
            const range = document.getWordRangeAtPosition(position);
            if (!range) {
                return;
            }

            const word = document.getText(range);
            return findDefinition(document, word);
        }
    });

    context.subscriptions.push(hoverProvider, definitionProvider);
}

async function fetchInstructionInfo(instruction) {
    try {
        const url = `https://www.felixcloutier.com/x86/${instruction}`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        // Extract the title (instruction name)
        const instructionTitle = $('h1').text();

        // Extract Opcode table and relevant details
        const opcodeTable = $('table').first();
        const opcode = opcodeTable.find('tr').eq(1).find('td').eq(0).text();
        const instructionDescription = opcodeTable.find('tr').eq(1).find('td').eq(5).text();

        // Extract the operation section
        const operationSection = $('#operation').next('pre').text();

        // Extract the description section
        const descriptionSection = $('#description').nextUntil('h2', 'p').text();

        // Combine the extracted information into a formatted output
        let hoverContent = `**${instructionTitle}**\n\n`;
        hoverContent += `**Opcode:** ${opcode}\n`;
        hoverContent += `**Description:** ${instructionDescription}\n\n`;
        hoverContent += `**Details:**\n${descriptionSection}\n\n`;
        hoverContent += `**Operation:**\n${operationSection}`;

        return hoverContent;
    } catch (error) {
        if (error.response && error.response.status === 404) {
            // Handle 404 error specifically
            return undefined; // or return null based on your preference
        }
        console.error(`Failed to fetch instruction info: ${error.message}`);
        return undefined; // Handle other errors if necessary
    }
}


function findDefinition(document, word) {
    const text = document.getText();
    const lines = text.split('\n');

    // Look for .def directive
    const defRegex = new RegExp(`\\.def\\s+${word}\\s*;`, 'i');
    for (let i = 0; i < lines.length; i++) {
        if (defRegex.test(lines[i])) {
            return new vscode.Location(document.uri, new vscode.Position(i, 0));
        }
    }

    // Look for label (e.g., `function:` or `L123:`)
    const labelRegex = new RegExp(`^${word}:`, 'i');
    for (let i = 0; i < lines.length; i++) {
        if (labelRegex.test(lines[i])) {
            return new vscode.Location(document.uri, new vscode.Position(i, 0));
        }
    }

    // If no definition is found, return undefined
    return undefined;
}

// Helper function to check if a word is a label in the document
function isLabel(document, word) {
    const text = document.getText();
    const labelRegex = new RegExp(`^${word}:`, 'i');
    return labelRegex.test(text);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};
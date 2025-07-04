const vscode = require("vscode");
const fs = require("fs");
const path = require("path");

let languageConfigDisposable = null;
let instructionData = null;

function activate(context) {
  // Load instruction data from local JSON file
  loadInstructionData();

  // Set up initial language configuration
  updateLanguageConfiguration();

  // Listen for configuration changes
  const configChangeListener = vscode.workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration("assembly.comments")) {
        updateLanguageConfiguration();
      }
    }
  );

  // Hover provider for mnemonics
  const hoverProvider = vscode.languages.registerHoverProvider("x86asm", {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(
        position,
        /\b[a-zA-Z0-9_]+\b/
      );
      const word = document.getText(range);

      if (word && instructionData) {
        // Check if the word is a valid mnemonic by looking it up in the instruction data
        const instructionInfo = getInstructionInfo(word.toLowerCase());
        if (instructionInfo) {
          return new vscode.Hover(instructionInfo);
        }
      }

      return undefined;
    },
  });

  // Definition provider (Ctrl+Click to jump)
  const definitionProvider = vscode.languages.registerDefinitionProvider(
    "x86asm",
    {
      async provideDefinition(document, position, token) {
        const range = document.getWordRangeAtPosition(position);
        if (!range) {
          return;
        }

        const word = document.getText(range);
        return await findDefinition(word);
      },
    }
  );

  context.subscriptions.push(
    hoverProvider,
    definitionProvider,
    configChangeListener
  );
}

function loadInstructionData() {
  try {
    const dataPath = path.join(
      __dirname,
      "..",
      "syntaxes",
      "x86_instructions.json"
    );
    if (fs.existsSync(dataPath)) {
      const rawData = fs.readFileSync(dataPath, "utf8");
      instructionData = JSON.parse(rawData);
      console.log(
        `Loaded ${
          Object.keys(instructionData).length
        } instructions from syntaxes database`
      );
    } else {
      console.warn(
        "syntaxes/x86_instructions.json not found. Please run the scraper.py script first."
      );
      vscode.window.showWarningMessage(
        "syntaxes/x86_instructions.json not found. Please run the scraper.py script to generate the instruction database."
      );
    }
  } catch (error) {
    console.error("Error loading instruction data:", error);
    vscode.window.showErrorMessage(
      "Error loading instruction database: " + error.message
    );
  }
}

function updateLanguageConfiguration() {
  // Dispose previous language configuration if it exists
  if (languageConfigDisposable) {
    languageConfigDisposable.dispose();
  }

  // Get current configuration
  const config = vscode.workspace.getConfiguration("assembly.comments");
  const lineComment = config.get("lineComment", ";");
  const blockComment = config.get("blockComment", ["/*", "*/"]);

  // Register new language configuration
  languageConfigDisposable = vscode.languages.setLanguageConfiguration(
    "x86asm",
    {
      comments: {
        lineComment: lineComment,
        blockComment: blockComment,
      },
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
      ],
      autoClosingPairs: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
        ['"', '"'],
        ["'", "'"],
      ],
      surroundingPairs: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
        ['"', '"'],
        ["'", "'"],
      ],
      folding: {
        markers: {
          start: "\\.section",
          end: "\\.endsection",
        },
      },
    }
  );
}

function getInstructionInfo(instruction) {
  if (!instructionData) {
    return null;
  }

  const info = instructionData[instruction.toLowerCase()];
  if (!info) {
    return null;
  }

  // Format the hover content using the syntaxes/x86_instructions.json format
  // Keep title as is since it usually doesn't need paragraph breaks
  let hoverContent = `**${info.title}**\n\n`;

  if (info.opcode) {
    hoverContent += `**Opcode:** ${info.opcode}\n\n`;
  }

  if (info.description) {
    // Replace single \n with double \n for proper markdown paragraph breaks
    const formattedDescription = info.description.replace(/\n/g, "\n\n");
    hoverContent += `**Description:** ${formattedDescription}\n\n`;
  }

  if (info.url) {
    hoverContent += `[View Documentation](${info.url})`;
  }

  return hoverContent;
}

async function findDefinition(word) {
  // Get all x86 assembly files in the workspace
  const files = await vscode.workspace.findFiles(
    "**/*.s",
    "**/node_modules/**"
  );

  for (const file of files) {
    const document = await vscode.workspace.openTextDocument(file);
    const text = document.getText();
    const lines = text.split("\n");

    // Check for definitions in each file
    const location = searchForDefinition(lines, word, document);
    if (location) {
      return location;
    }
  }

  // If no definition is found, return undefined
  return undefined;
}

function searchForDefinition(lines, word, document) {
  const externRegex = new RegExp(`^extern\\s+${word}\\s*`, "i");
  const globalRegex = new RegExp(`^global\\s+${word}\\s*`, "i");
  const labelRegex = new RegExp(`^${word}:`, "i");

  for (let i = 0; i < lines.length; i++) {
    if (
      externRegex.test(lines[i]) ||
      globalRegex.test(lines[i]) ||
      labelRegex.test(lines[i])
    ) {
      return new vscode.Location(document.uri, new vscode.Position(i, 0));
    }
  }

  return undefined; // If no match is found
}

function deactivate() {
  if (languageConfigDisposable) {
    languageConfigDisposable.dispose();
  }
}

module.exports = {
  activate,
  deactivate,
};

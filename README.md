Here’s the version with emojis:

## Overview 🛠️

This Visual Studio Code extension provides comprehensive syntax highlighting for x86, x64 and ARM assembly language using Intel syntax. It's designed to improve readability and understanding of assembly code, including compiler-generated output.

## Features ✨

- Syntax highlighting for x86, x64 and ARM assembly instructions 💻
- Support for Intel syntax 🧠
- Highlighting of registers, memory operands, and numeric constants 🔍
- Recognition of common assembler directives ⚙️
- Proper highlighting of labels and function names 🏷️
- Support for compiler-generated assembly features (e.g., CFI directives) 🛡️

## Installation 🚀

1. Open Visual Studio Code
2. Go to the Extensions view (Ctrl+Shift+X or Cmd+Shift+X on macOS)
3. Search for "Universal Assembly Syntax Highlighting"
4. Click Install

## Usage 💡

Once installed, the extension will automatically provide syntax highlighting for files with the following extensions:

- `.asm`
- `.s`
- `.S`
- `.nasm`
- `.asmx`
- `.inc`

If you're working with a file that has a different extension but contains x86/x64 assembly code, you can manually set the language mode:

1. Click on the language indicator in the bottom-right corner of VS Code
2. Select "x86/x64 Assembly" from the list of languages

## Highlighted Elements 🎨

This extension provides syntax highlighting for:

- Instructions (e.g., `mov`, `push`, `call`) 📝
- Registers (e.g., `eax`, `rbp`, `r15`) 📟
- Memory operands (e.g., `DWORD PTR`, `QWORD PTR`) 📋
- Numeric constants (decimal and hexadecimal) 🔢
- Labels and function names 🏷️
- Assembler directives (e.g., `.section`, `.globl`) 🧭
- CFI directives (e.g., `.cfi_startproc`, `.cfi_endproc`) 🛡️
- Comments (lines starting with `;`) 💬

## Customization 🎨

You can customize the colors used for syntax highlighting by modifying your VS Code color theme. Add or modify entries in your `settings.json` file under `"editor.tokenColorCustomizations"`.

For example:

```json
"editor.tokenColorCustomizations": {
    "textMateRules": [
        {
            "scope": "keyword.control.instruction.x86asm",
            "settings": {
                "foreground": "#C678DD"
            }
        },
        {
            "scope": "variable.language.register.x86asm",
            "settings": {
                "foreground": "#E06C75"
            }
        }
    ]
}
```

## Contributing 🤝

If you find any issues or have suggestions for improvements, please open an issue or submit a pull request on the GitHub repository.

## License 📄

This extension is released under the MIT License. See the LICENSE file for details.

## Acknowledgements 🙌

Thanks to all contributors and users who have provided feedback and suggestions to improve this extension.

const x86x64Mnemonics = [
    // Data Transfer
    "MOV", "LEA", "PUSH", "POP", "XCHG", "MOVSX", "MOVZX", "CVTSI2SD", "CVTSD2SI",
    "MOVD", "MOVQ", "MOVSS", "MOVSD", "MOVAPD", "MOVDQA", "MOVDQU",
    "MOVNTI", "MOVNTQ", "MOVNTDQ", "MOVNTDQA", "MOVNTQ", "MOVNTDQ",
    // Arithmetic and Logical
    "ADD", "SUB", "MUL", "DIV", "INC", "DEC", "AND", "OR", "XOR", "NOT", "SHL", "SHR",
    "SAL", "SAR", "SHRD", "SHLD", "IMUL", "IDIV", "IDIVQ", "MULSD", "DIVSD",
    "ADDPD", "SUBPD", "MULPD", "DIVPD", "ANDPD", "ORPD", "XORPD",
    "ADDPS", "SUBPS", "MULPS", "DIVPS", "ANDPS", "ORPS", "XORPS",
    // Control Flow
    "JMP", "Jcc", "CALL", "RET", "LOOP", "JNZ", "JZ", "JE", "JNE", "JL", "JLE",
    "JG", "JGE", "JB", "JBE", "JA", "JAE", "LOOPNE", "LOOPE",
    "LOOPNZ", "LOOPZ", "CMOVcc", "SETcc",
    // Other
    "CMP", "TEST", "NEG", "NOT", "CLD", "STD", "CWD", "CDQ", "CQO",
    "LEA", "LES", "LDS", "LSS", "LFS", "LGS",
    "LES", "LDS", "LSS", "LFS", "LGS",
    "REP", "REPE", "REPNE", "REPZ", "REPNZ",
    "BSF", "BSR", "BT", "BTC", "BTR", "BTS", "LEAVE",
    // Floating-Point
    "FADD", "FSUB", "FMUL", "FDIV", "FCHS", "FABS", "FCOM", "FCOMP", "FCOMPP",
    "FADD", "FSUB", "FMUL", "FDIV", "FCHS", "FABS", "FCOM", "FCOMP", "FCOMPP",
    "FST", "FSTPN", "FSTP", "FLD", "FLD1", "FLDPI", "FLDL2T", "FLDL2E",
    "FLDCW", "FSTCW",
    "FCOMI", "FCOMIP", "FUCOMI", "FUCOMIP",
    // SIMD
    "MOVDQA", "MOVDQU", "PSHUFD", "PSHUFLW", "PSHUFLH", "PSLLD", "PSLLQ", "PSLLW",
    "PSRAD", "PSRAQ", "PSRAW", "PADDW", "PADDQ", "PADDUSB", "PADDUSW",
    "PSUBW", "PSUBQ", "PSUBUSB", "PSUBUSW",
    "PMADDWD", "PMULHW", "PMULLW",
    "PMAXSW", "PMAXUW", "PMINSW", "PMINUW",
    // AVX Instructions
    "VMOVD", "VMOVQ", "VMOVSS", "VMOVSD", "VMOVAPD", "VMOVDQA", "VMOVDQU",
    "VADDPD", "VADDPS", "VADDL", "VADDL2", "VADDL3", "VADDL4",
    "VSUBPD", "VSUBPS", "VSUBL", "VSUBL2", "VSUBL3", "VSUBL4",
    "VMULPD", "VMULPS", "VMULL", "VMULL2", "VMULL3", "VMULL4",
    "VDIVPD", "VDIVPS", "VDIVL", "VDIVL2", "VDIVL3", "VDIVL4",
    "VANDPD", "VANDPS", "VANDL", "VANDL2", "VANDL3", "VANDL4",
    "VORPD", "VORPS", "VORL", "VORL2", "VORL3", "VORL4",
    "VXORPD", "VXORPS", "VXORL", "VXORL2", "VXORL3", "VXORL4",
    // AVX-512 Instructions
    "VPMOVD", "VPMOVQ", "VPMOVSS", "VPMOVSD", "VPMOVAPD", "VPMOVDQA", "VPMOVDQU",
    "VPADDPD", "VPADDPS", "VPADDL", "VPADDL2", "VPADDL3", "VPADDL4",
    "VPSUBPD", "VPSUBPS", "VPSUBL", "VPSUBL2", "VPSUBL3", "VPSUBL4",
    "VPMULPD", "VPMULPS", "VPMULL", "VPMULL2", "VPMULL3", "VPMULL4",
    "VPDIVPD", "VPDIVPS", "VPDIVL", "VPDIVL2", "VPDIVL3", "VPDIVL4",
    "VPANDPD", "VPANDPS", "VPANDL", "VPANDL2", "VPANDL3", "VPANDL4",
    "VPORPD", "VPORPS", "VPORL", "VPORL2", "VPORL3", "VPORL4",
    "VPXORPD", "VPXORPS", "VPXORL", "VPXORL2", "VPXORL3", "VPXORL4",
  ];

  module.exports = {
    x86x64Mnemonics
  };
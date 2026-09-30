/**
 * MTEF v.3 → LaTeX converter for Microsoft Equation 3.0 OLE objects.
 *
 * Legacy courseware embeds formulas as OLE equation objects
 * (`progId="Equation.3"` / MathType). Their only renderable form inside the
 * .pptx is a WMF preview picture, which cannot be rasterized in this
 * environment — but the OLE binary also carries an `Equation Native` stream
 * whose payload, behind a 28-byte EQNOLEFILEHDR, is MTEF v3: a compact
 * record tree (CHAR / TMPL / LINE / EMBELL / typesize records) that fully
 * describes the equation. This module parses that binary into LaTeX so those
 * formulas import as editable `latex` elements instead of blank placeholders.
 *
 * Grammar reference: MathType MTEF v.3 (archived spec, rtf2latex2e). Tag byte
 * = record type in the low nibble, option flags in the high nibble
 * (flag 0x01 → 0x10, 0x02 → 0x20, 0x04 → 0x40, 0x08 → 0x80). All 16-bit
 * values are little-endian; v3 CHAR records always store a 16-bit character.
 *
 * Empirical notes from Equation Editor 3.x streams (validated against real
 * courseware decks): tmROOT emits slots as [radicand, null-degree] for square
 * roots; tmSCRIPT emits a null LINE for its unused slot, ordered [sub, sup];
 * fence templates carry their left/right fence CHARs at the END of their own
 * sub-object list, AFTER the main slot LINE.
 *
 * Scope note: this targets the record set Equation Editor 3.x actually emits
 * (CHAR, LINE, TMPL fences/fraction/root/scripts/big-ops, EMBELL, typesize,
 * PILE, MATRIX). Newer MathType MTEF v5 streams are rejected and fall back to
 * the picture path. Unknown constructs degrade to their slot contents rather
 * than failing the whole equation.
 */
export interface MtefConversion {
    latex: string;
    /** Flat character content, used as degrade-text when LaTeX is not viable. */
    plainText: string;
    /** True when at least one construct was skipped or approximated. */
    degraded: boolean;
}
/** Thrown when the stream is not MTEF v3 or the bytes cannot be walked. */
export declare class MtefParseError extends Error {
}
/**
 * Convert an `Equation Native` stream (EQNOLEFILEHDR + MTEF v3) to LaTeX.
 * Throws {@link MtefParseError} for non-v3 streams or malformed bytes —
 * callers should fall back to the picture path on throw.
 */
export declare function equationNativeToLatex(stream: Uint8Array): MtefConversion;

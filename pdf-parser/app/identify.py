"""Deterministic page-1 text-signature bank identification.

Exactly-one-match dispatch: zero matches or more than one match (ambiguous)
both collapse to `None`, which `main.py` maps to the `unrecognized_bank`
422 response (design Decision 2 — a refusal, not a guess).

Signatures calibrated against `.samples/*.pdf`:
- Bancolombia savings statement: "ESTADO DE CUENTA"
- Davibank credit-card statement: "Extracto de tu tarjeta de crédito"
  (note the "tu" — distinguishes it from the Rappi/Davivienda statement,
  which prints "Extracto de tarjeta de crédito" without "tu")
- Rappi (Davivienda-issued) credit-card statement: unique "Rappi" mention
"""

BankId = str

SIGNATURES: dict[BankId, str] = {
    "bancolombia": "ESTADO DE CUENTA",
    "davibank": "Extracto de tu tarjeta de crédito",
    "rappi": "Rappi",
}


def identify_bank(page1_text: str) -> BankId | None:
    matches = [bank_id for bank_id, sig in SIGNATURES.items() if sig in page1_text]
    if len(matches) == 1:
        return matches[0]
    return None

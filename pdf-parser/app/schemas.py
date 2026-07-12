"""Pydantic contract shared with the Node backend.

Mirrors `RawTransaction` / `ParseResponse` from the design doc
(`sdd/pdf-bank-import/design`). Node's `HttpPdfBankParser.assertParseResponse`
re-validates this contract at the boundary, so this schema is the source of
truth for shape but Node does not blindly trust it.
"""

from typing import Literal, Optional

from pydantic import BaseModel, Field

TransactionType = Literal["income", "expenses"]


class RawTransaction(BaseModel):
    date: str  # ISO yyyy-mm-dd
    description: str
    value: float  # signed
    type: TransactionType
    categoryName: Optional[str] = None
    rawLine: Optional[str] = None
    warnings: list[str] = Field(default_factory=list)


class Reconciliation(BaseModel):
    available: bool
    reconciled: bool = False
    openingBalance: Optional[float] = None
    closingBalance: Optional[float] = None
    computedDelta: Optional[float] = None
    expectedDelta: Optional[float] = None
    difference: Optional[float] = None


class ParseResult(BaseModel):
    transactions: list[RawTransaction]
    reconciliation: Reconciliation


class ParseResponse(BaseModel):
    bankId: str
    transactions: list[RawTransaction]
    warnings: list[str] = Field(default_factory=list)
    reconciliation: Reconciliation


class ErrorResponse(BaseModel):
    code: Literal[
        "unrecognized_bank", "too_many_pages", "parse_error", "password_required"
    ]
    message: str
    detectedSignatures: Optional[list[str]] = None

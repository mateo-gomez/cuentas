"""Rappi parser — POST-FIRST-SLICE placeholder.

Registered in the dispatcher so `identify.py` can already recognize Rappi
statements, but calibration against real sample PDFs is follow-up work
outside this slice's scope (see design: "First slice: Bancolombia
end-to-end").
"""

import pdfplumber

from app.schemas import RawTransaction


def parse(pdf: "pdfplumber.PDF") -> list[RawTransaction]:
    raise NotImplementedError(
        "Rappi parser is not yet calibrated — follow-up work after the "
        "Bancolombia first slice."
    )

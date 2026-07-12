"""Registry mapping a `BankId` to its parser callable.

Only Bancolombia is calibrated in this slice. Davibank and Rappi are
registered as stubs so the dispatcher shape is correct for follow-up work
(see design: "First slice: Bancolombia end-to-end").
"""

from app.parsers import bancolombia, davibank, rappi
from app.parsers.base import BankParser

PARSERS: dict[str, BankParser] = {
    "bancolombia": bancolombia.parse,
    "davibank": davibank.parse,
    "rappi": rappi.parse,
}

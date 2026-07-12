"""Registry mapping a `BankId` to its parser callable.

All three target banks are calibrated against anonymized samples in
repo-root `.samples/`: Bancolombia (savings account, running-balance
reconciliation) plus Davibank and Rappi (credit cards — see each module for
the section/installment handling and the credit-card reconciliation notes).
"""

from app.parsers import bancolombia, davibank, rappi
from app.parsers.base import BankParser

PARSERS: dict[str, BankParser] = {
    "bancolombia": bancolombia.parse,
    "davibank": davibank.parse,
    "rappi": rappi.parse,
}

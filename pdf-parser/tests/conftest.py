import os

import pytest

# Real (anonymized) bank-statement PDFs live in the repo-root `.samples/`
# directory, which is gitignored — they must never enter version control.
# Tests read from there and skip when a sample is absent, so a fresh clone /
# CI without the local samples still passes instead of failing.
_REPO_ROOT = os.path.dirname(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)
SAMPLES_DIR = os.path.join(_REPO_ROOT, ".samples")


def sample_path(name: str) -> str:
    return os.path.join(SAMPLES_DIR, name)


def _require_sample(name: str) -> str:
    path = sample_path(name)
    if not os.path.exists(path):
        pytest.skip(
            f"{name} not found in .samples/ (gitignored local sample); "
            "drop an anonymized statement there to run this test"
        )
    return path


@pytest.fixture(scope="session")
def bancolombia_pdf() -> str:
    return _require_sample("bancolombia.pdf")


@pytest.fixture(scope="session")
def davibank_pdf() -> str:
    return _require_sample("davibank.pdf")


@pytest.fixture(scope="session")
def rappi_pdf() -> str:
    return _require_sample("rappi.pdf")

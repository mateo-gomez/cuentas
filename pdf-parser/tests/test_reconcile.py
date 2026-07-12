import pytest

from app.parsers.base import reconcile_running_balance


def test_empty_list_is_unavailable():
    result = reconcile_running_balance([])

    assert result.available is False
    assert result.reconciled is False
    assert result.openingBalance is None
    assert result.closingBalance is None
    assert result.computedDelta is None
    assert result.expectedDelta is None
    assert result.difference is None


def test_single_transaction_is_reconciled():
    # opening = saldo - value; expected = closing - opening = value = computed
    result = reconcile_running_balance([(3.38, 4161550.40)])

    assert result.available is True
    assert result.reconciled is True
    assert result.openingBalance == pytest.approx(4161547.02)
    assert result.closingBalance == pytest.approx(4161550.40)
    assert result.computedDelta == pytest.approx(3.38)
    assert result.expectedDelta == pytest.approx(3.38)
    assert result.difference == pytest.approx(0.0)


def test_reconciled_multi_row_batch():
    pairs = [
        (3.38, 4161550.40),
        (-120000.00, 4041550.40),
        (500.00, 4042050.40),
    ]

    result = reconcile_running_balance(pairs)

    assert result.available is True
    assert result.reconciled is True
    assert result.difference == pytest.approx(0.0)


def test_mismatch_batch_is_flagged():
    # Force a mismatch: last saldo does not follow from the deltas.
    pairs = [
        (3.38, 4161550.40),
        (-120000.00, 4041550.40),
        (500.00, 5000000.00),  # inconsistent closing balance
    ]

    result = reconcile_running_balance(pairs)

    assert result.available is True
    assert result.reconciled is False
    assert result.difference != pytest.approx(0.0)

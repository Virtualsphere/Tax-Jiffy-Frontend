# GSTR-1 vs E-Invoice Reconciliation — Frontend Integration Guide

Base path for all endpoints below: `/api/gstr1/filings/{filingId}/einvoice-reco`

`{filingId}` is the `Gstr1Filing.id` returned when the sale register Excel was uploaded (`POST /api/gstr1/upload`). All endpoints require the standard auth header already used elsewhere in the app.

---

## 1. Feature overview

This page compares the sale register a user uploaded (GSTR-1 B2B invoices) against the e-invoices (IRNs) actually raised on the government portal for the same GSTIN and tax period. The goal is to surface:

- Invoices that are booked **and** properly e-invoiced (`MATCHED`)
- Invoices where the two sides disagree on value (`VALUE_MISMATCH`)
- Invoices booked in the sale register with **no e-invoice yet** (`IN_SALE_REGISTER_ONLY`) — this is the actionable "go raise these on the portal" list
- E-invoices that exist but aren't in the uploaded sale register (`IN_EINVOICE_ONLY`)

---

## 2. Screen flow

```
1. User has already uploaded the sale register for this filing (existing upload flow).
2. User opens the reconciliation page for that filing.
3. Page loads:
     - Sale register table   (GET .../sale-register)
     - E-invoice table       (GET .../einvoices)
     - Reconciliation table  (GET .../result)
4. User clicks "Sync".
     -> POST .../sync
     -> Backend fetches e-invoice data from the government API for this filing's
        period, upserts it (no duplicates on repeated syncs), then re-runs the
        comparison and rebuilds the reconciliation result.
     -> Frontend re-fetches all three GET endpoints above to refresh the page.
5. User clicks "Link" (or a similarly named button/tab).
     -> GET .../unlinked
     -> Shows only sale-register invoices with no e-invoice yet — the list of
        invoices the user still needs to raise on the government portal.
6. User goes to the government portal, raises the missing e-invoices manually.
7. User comes back and clicks "Sync" again.
     -> Same sync endpoint. Newly-raised e-invoices are picked up, previously
        unmatched invoices flip to MATCHED, reconciliation result is rebuilt.
```

Steps 4–7 can repeat any number of times — every sync fully refreshes the picture, there's no accumulation of stale data.

---

## 3. Endpoints

### 3.1 `POST /sync`

Triggers a fresh e-invoice fetch for this filing's GSTIN + tax period, then re-runs reconciliation. Call this when the user clicks the **Sync** button.

**Request body:** none

**Response:**
```json
{
  "success": true,
  "message": "Sync + reconciliation complete",
  "data": {
    "retPeriod": "102025",
    "einvoiceRowsSynced": 42,
    "reconciledCount": 58
  }
}
```

| Field | Meaning |
|---|---|
| `retPeriod` | `MMYYYY` period derived from the filing (e.g. October 2025 → `102025`) — informational only, not needed for further calls |
| `einvoiceRowsSynced` | Total IRN rows written during this sync call (new + updated) |
| `reconciledCount` | Total rows in the reconciliation result after this sync — i.e. total unique invoices across both sides |

**After this call resolves**, re-fetch `sale-register`, `einvoices`, and `result` to refresh the page — this endpoint doesn't return those full lists itself, only the summary counts.

**Error cases:**
- Standard error envelope if `filingId` doesn't exist.
- If the tax period on the filing isn't a recognized month name, the sync fails with a message like `"Unrecognized tax period: <value>"`.

---

### 3.2 `GET /sale-register`

Returns every GSTR-1 B2B row for this filing, each with a pairing flag your table should use to highlight unmatched rows.

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 501,
      "gstinOfRecipient": "29AABCU9603R1ZM",
      "receiverName": "UNITECH ELECTRONICS PVT LTD",
      "invoiceNumber": "INV-2601",
      "invoiceDate": "2025-10-20",
      "invoiceValue": 118000.00,
      "placeOfSupply": "Karnataka",
      "reverseCharge": "N",
      "invoiceType": "Regular",
      "taxableValue": 100000.00,
      "cessAmount": 0.00,
      "isPaired": true,
      "pairedIrn": "11f8ef701fe294d4a14aad0b12457e62775d0fdc41a0acf05b74fbb2ddc47acb"
    },
    {
      "id": 502,
      "gstinOfRecipient": "33AAACT2727Q1ZU",
      "invoiceNumber": "INV-2602",
      "invoiceValue": 59000.00,
      "isPaired": false,
      "pairedIrn": null
    }
  ]
}
```

**Frontend behavior:**
- `isPaired: false` → highlight this row (e.g. yellow/red background, warning icon) — it means this invoice has no matching e-invoice.
- `isPaired: true` → normal row; `pairedIrn` can be shown on hover/expand as a reference, or used to deep-link to the matching e-invoice row.

---

### 3.3 `GET /einvoices`

Returns every e-invoice (IRN) row synced for this filing's derived period, same pairing pattern.

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 9001,
      "supplierGstin": "29AABCU9603R1ZM",
      "irn": "11f8ef701fe294d4a14aad0b12457e62775d0fdc41a0acf05b74fbb2ddc47acb",
      "ackNo": 112010000002315,
      "ackDt": "20-10-2025",
      "docNum": "INV-2601",
      "docDate": "20-10-2025",
      "docType": "INV",
      "supplyType": "B2B",
      "totInvAmt": 118000.00,
      "irnStatus": "ACT",
      "ewbNo": 191008688443,
      "ewbDt": "20-10-2025",
      "ewbValidTill": "21-10-2025",
      "isPaired": true,
      "pairedGstr1B2bId": 501
    }
  ]
}
```

> **Field naming note:** `supplierGstin` on this object holds the **counterparty's GSTIN** (the buyer), not your own company's GSTIN — this mirrors the government API's own field naming (`ctin`) and matches against `gstinOfRecipient` on the sale-register side. Don't be misled by the field name when wiring up the UI.

**Frontend behavior:** same highlighting pattern as the sale register — `isPaired: false` means this e-invoice has no matching sale-register entry (i.e. it's in the e-invoice system but wasn't found in the uploaded register).

---

### 3.4 `GET /result`

The actual reconciliation table — one row per invoice (from either side), with both sides' figures shown together. This is the primary "reconciliation report" view.

**Query params:**
| Param | Required | Values |
|---|---|---|
| `matchStatus` | No | `MATCHED`, `VALUE_MISMATCH`, `IN_SALE_REGISTER_ONLY`, `IN_EINVOICE_ONLY` |

Omit `matchStatus` to get all rows; pass it to filter (e.g. a status filter dropdown/tabs on the UI).

**Response:**
```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 1,
      "recipientGstin": "29AABCU9603R1ZM",
      "invoiceNumber": "INV-2601",
      "matchStatus": "MATCHED",
      "saleRegisterInvoiceValue": 118000.00,
      "saleRegisterTaxableValue": 100000.00,
      "einvoiceInvoiceValue": 118000.00,
      "einvoiceIrn": "11f8ef701fe294d4a14aad0b12457e62775d0fdc41a0acf05b74fbb2ddc47acb",
      "einvoiceStatus": "ACT"
    },
    {
      "id": 2,
      "recipientGstin": "06AAACR5055K1ZK",
      "invoiceNumber": "INV-2603",
      "matchStatus": "VALUE_MISMATCH",
      "saleRegisterInvoiceValue": 236000.00,
      "saleRegisterTaxableValue": 200000.00,
      "einvoiceInvoiceValue": 231000.00,
      "einvoiceIrn": "a1b2c3...",
      "einvoiceStatus": "ACT"
    },
    {
      "id": 3,
      "recipientGstin": "33AAACT2727Q1ZU",
      "invoiceNumber": "INV-2602",
      "matchStatus": "IN_SALE_REGISTER_ONLY",
      "saleRegisterInvoiceValue": 59000.00,
      "saleRegisterTaxableValue": 50000.00,
      "einvoiceInvoiceValue": null,
      "einvoiceIrn": null,
      "einvoiceStatus": null
    }
  ]
}
```

**Suggested UI treatment per status:**

| `matchStatus` | Suggested color | Meaning to show the user |
|---|---|---|
| `MATCHED` | Green | Everything lines up |
| `VALUE_MISMATCH` | Yellow/orange | Both sides exist, amounts differ — needs review |
| `IN_SALE_REGISTER_ONLY` | Blue | Booked, not yet e-invoiced — actionable |
| `IN_EINVOICE_ONLY` | Red/purple | E-invoiced, missing from sale register — check for a missed upload row |

For `IN_SALE_REGISTER_ONLY` and `IN_EINVOICE_ONLY` rows, the fields for the missing side will be `null` — render as `—` or "Not found" rather than blank/zero, since `0.00` would be misleading (it's absent, not zero-valued).

---

### 3.5 `GET /unlinked`

Convenience endpoint — this is `result?matchStatus=IN_SALE_REGISTER_ONLY` pre-filtered, meant to back the **Link** button.

**Response:** same shape as `/result`, always filtered to `IN_SALE_REGISTER_ONLY`.

```json
{
  "success": true,
  "message": "OK",
  "data": [
    {
      "id": 3,
      "recipientGstin": "33AAACT2727Q1ZU",
      "invoiceNumber": "INV-2602",
      "matchStatus": "IN_SALE_REGISTER_ONLY",
      "saleRegisterInvoiceValue": 59000.00,
      "saleRegisterTaxableValue": 50000.00,
      "einvoiceInvoiceValue": null,
      "einvoiceIrn": null,
      "einvoiceStatus": null
    }
  ]
}
```

**Frontend behavior:** show this as a checklist/action list — "these invoices still need an e-invoice." No `einvoice*` fields will ever be populated here, since by definition this endpoint only returns unmatched sale-register rows.

---

## 4. Recommended page layout

A reasonable structure, though adapt to your existing design system:

```
+-----------------------------------------------------------+
|  [Sync button]                    Last synced: <time>     |
+-----------------------------------------------------------+
|  Tabs: [ All ] [ Matched ] [ Mismatch ] [ Sale Reg Only ]  |
|        [ E-Invoice Only ]                                  |
|  -> drives GET /result?matchStatus=...                     |
+-----------------------------------------------------------+
|  Reconciliation table (from /result)                       |
|  columns: Recipient GSTIN | Invoice No | Status |           |
|           Sale Reg Value | E-Invoice Value | IRN | Status   |
+-----------------------------------------------------------+
|  [Link - X invoices need e-invoicing]  -> opens /unlinked   |
|  as a checklist/modal for the user to work through          |
|  on the government portal                                   |
+-----------------------------------------------------------+
```

The **Sale Register** and **E-Invoice** raw tables (`/sale-register`, `/einvoices`) are typically shown as separate tabs or a toggle, mainly useful for a user who wants to see the full underlying data rather than just the diff.

---

## 5. Sequence for the Sync button specifically

```
User clicks "Sync"
   |
   v
Frontend: show loading state, disable button
   |
   v
POST /api/gstr1/filings/{filingId}/einvoice-reco/sync
   |
   +-- success -----------------------------------------+
   |                                                     |
   |   Frontend re-fetches in parallel:                  |
   |     GET .../sale-register                           |
   |     GET .../einvoices                               |
   |     GET .../result                                  |
   |                                                     |
   |   Update all three views, re-enable button          |
   |   Optionally show a toast:                          |
   |     "Synced {einvoiceRowsSynced} e-invoices,         |
   |      {reconciledCount} invoices reconciled"          |
   |                                                     |
   +-- error -------------------------------------------+
       Show error message from the response envelope,
       re-enable button, don't clear existing table data
```

---

## 6. Field reference — quick lookup

### Sale register row (`/sale-register`)
| Field | Type | Notes |
|---|---|---|
| `id` | number | Use as the row key; matches `pairedGstr1B2bId` on the e-invoice side |
| `gstinOfRecipient` | string | Buyer's GSTIN |
| `invoiceNumber` | string | |
| `invoiceDate` | date string | |
| `invoiceValue` | number | Total invoice value including tax |
| `taxableValue` | number | |
| `isPaired` | boolean | **Highlight `false` rows** |
| `pairedIrn` | string \| null | Populated only when `isPaired: true` |

### E-invoice row (`/einvoices`)
| Field | Type | Notes |
|---|---|---|
| `id` | number | Use as row key; matches `pairedGstr1B2bId` |
| `supplierGstin` | string | Actually the counterparty GSTIN — see note in section 3.3 |
| `irn` | string | Invoice Reference Number |
| `docNum` | string | Matches `invoiceNumber` on the sale-register side |
| `totInvAmt` | number | Total invoice value |
| `irnStatus` | string | `ACT` (active) or `CNL` (cancelled) |
| `isPaired` | boolean | **Highlight `false` rows** |
| `pairedGstr1B2bId` | number \| null | Populated only when `isPaired: true` |

### Reconciliation row (`/result`, `/unlinked`)
| Field | Type | Notes |
|---|---|---|
| `matchStatus` | enum string | `MATCHED` \| `VALUE_MISMATCH` \| `IN_SALE_REGISTER_ONLY` \| `IN_EINVOICE_ONLY` |
| `recipientGstin` | string | |
| `invoiceNumber` | string | |
| `saleRegisterInvoiceValue` | number \| null | `null` if `IN_EINVOICE_ONLY` |
| `saleRegisterTaxableValue` | number \| null | `null` if `IN_EINVOICE_ONLY` |
| `einvoiceInvoiceValue` | number \| null | `null` if `IN_SALE_REGISTER_ONLY` |
| `einvoiceIrn` | string \| null | `null` if `IN_SALE_REGISTER_ONLY` |
| `einvoiceStatus` | string \| null | `null` if `IN_SALE_REGISTER_ONLY` |

---

## 7. Things to confirm with backend before wiring up

- What the standard `ApiResponse` error shape looks like for a failed sync (e.g. period-parsing failure), so the frontend can render a useful message rather than a generic failure toast.
- Whether `/sync` should be disabled/rate-limited on the frontend for a few seconds after a click, since it makes a live call to the government API and isn't instant.
- Whether a "last synced at" timestamp should be exposed (not currently in the sync response) — useful for the page header shown in section 4.

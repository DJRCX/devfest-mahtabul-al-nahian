# Tender Document Package Builder: Tasks

Source: `PLAN.md`

## 0. Pre-start (before T+0)
- [x] Rename the public repo to `devfest-mahtabul-al-nahian` (local `origin` updated)
- [x] Confirm `LICENSE` (MIT) exists and no `.env` or secrets are committed

## 1. Scaffold and pipeline (T+0 to T+20)
- [x] Scaffold Vite + React + TS (`npm create vite`)
- [x] Add Tailwind, `pdf-lib` and the Noto Sans Bengali font
- [x] Set up `src/` layout: `lib/`, `i18n/`, `components/`
- [x] **Commit 1** (message with prompt)
- [x] Early Vercel deploy (static `dist/`, public HTTPS, no login: https://devfest-252-35-408.vercel.app)

## 2. Types, requirements, i18n (T+0 to T+20)
- [x] `lib/types.ts`: `Tender`, `Requirement`, `UploadedFile`, `Match`, `expiry`
- [x] `lib/requirements.ts`: `parseRequirements` (validate fields, sort by `order`, bilingual errors)
- [x] `RequirementsLoader` (`.json` picker + drag-drop) and `TenderSummary` (ID, title, entity, bidder, deadline, requirements with mandatory/expiry badges)
- [x] `i18n/strings.ts` (en/bn) + `useT()` hook, `localStorage` persistence, `<html lang>` update
- [x] `LanguageToggle` in the header
- [x] App state with `useReducer`, plus `App.tsx` with four numbered steps (Load, Upload, Match and check, Generate)

## 3. Upload (T+20 to T+45)
- [x] `lib/pdfFiles.ts` `readPdf`: extension, MIME and `%PDF-` magic bytes check
- [x] `readPdf`: SHA-256 hash, page count via `PDFDocument.load`, catch damaged or encrypted files
- [x] `FileUploader`: multi-select and drag-and-drop
- [x] Reject non-PDFs with a bilingual message naming the file (`company_logo.png`)
- [x] Enforce limits: at most 30 files and 50 MB total
- [x] `FileList`: name, page count, size, Remove button, "Duplicate of X" label, preview link (blob URL in a new tab)

## 4. Checklist and status (T+20 to T+45)
- [x] `lib/status.ts` `computeStatus` (string date comparison, blocking: MISSING / EXPIRY_NEEDED / EXPIRED)
- [x] `Checklist` rows sorted by `order`, with title by language
- [x] Match `<select>`: 1:1 matching, "-- none --" undo, used files disabled with "(used for R0x)"
- [x] Duplicate locking by hash across requirements
- [x] Changing a match clears that row's expiry; removing a file removes its match
- [x] `<input type="date">` only when `has_expiry` and a file is matched
- [x] Status badges with icon + text + colour
- [x] **Commit 2** (Commit for Task 4)

## 5. Package build and generate (T+45 to T+65)
- [x] `lib/buildPackage.ts`: A4 English cover (tender info, package date, numbered document list)
- [x] Copy pages by `order`, skipping optional requirements without a file
- [x] Extend each page with a 28 pt bottom band (`setMediaBox`/`setCropBox`), handling `/Rotate`
- [x] Second-pass footer `<tender_id> | Page X of Y` (Helvetica 9 pt, dark grey, centred)
- [x] `GeneratePanel`: button disabled while blocking, with a visible list of reasons
- [x] Download `<tender_id>_Package.pdf` via Blob and temporary `<a download>`
- [x] Complete all Bangla strings (labels, buttons, messages, statuses, instructions)
- [x] **Commit 3**, then redeploy to Vercel

## 6. Verification and outputs (T+65 to T+80)
- [x] Upload all 11 sample files: PNG rejected, experience certs flagged as duplicates, page counts 2, 6, 1, 1, 1, 2, 2, 1, 1, 1
- [x] Expired license check: the 2025 file with 2025-06-30 is Expired and blocks; the 2026 file with 2027-06-30 is OK
- [x] Deadline-day expiry (2026-10-20) is OK
- [x] Final package has 16 pages in the right order, with readable footers and no overlap
- [x] Switch to Bangla mid-flow: state kept and everything translated
- [x] Save `output/T-2026-0417_Package.pdf`
- [x] Take `screenshots/` (checklist statuses in English and Bangla)

## 7. README and final delivery (T+65 to T+90)
- [x] README: name (no registration number needed), live HTTPS link, run instructions (`npm install`, `npm run dev`, `npm run build`), features and bonus features, known problems, AI tools used, most useful prompt
- [x] Add `TASKS.md` to repository
- [x] **Commit 4** & final Vercel deploy
- [x] Final eligible commit before T+90

## 8. Bonus Tasks (Implemented)
- [x] **Index page after the cover**: Document schedule showing starting page number for each document (17 pages total with index page).
- [x] **Export checklist as CSV**: One-click download of `<tender_id>_Checklist.csv` with UTF-8 BOM encoding for Excel/CSV compatibility.
- [x] **Bangla text on PDF**: High-resolution canvas rendering of Bengali typography and conjuncts embedded on PDF cover and index page.
- [x] **Safe bad-file handling**: Graceful error catching for corrupt or password-protected PDFs without app crashing.

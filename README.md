# Mehra Scanner

Camera scanner + PDF tools + editor in one web app (CamScanner + iLovePDF + WPS style).

## Features
- Live multi-photo camera capture
- Crop (drag), rotate, filters, resize (% / px / target KB)
- Text, highlight, pen, white-out, photo insert
- Import PDF, images, txt, md, csv, json, html, docx, xlsx
- Search inside text PDFs, export PDF/JPG/PNG/ZIP, share
- PIN / pattern / biometric app lock, watermark

## Run
Open `index.html` in a browser. Camera needs HTTPS or localhost:

    python3 -m http.server 8000

Then open http://localhost:8000

## Files
- `index.html` - markup
- `css/style.css` - styles
- `js/app.js` - app logic

Libraries load from cdnjs: jsPDF, pdf.js, JSZip, mammoth, SheetJS.

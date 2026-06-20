# English Question QC Viewer

<p>
  <a href="./README.md"><img alt="English README" src="https://img.shields.io/badge/English-README-2f6fed?style=for-the-badge"></a>
  <a href="./README.ko.md"><img alt="Korean README" src="https://img.shields.io/badge/KOR-%ED%95%9C%EA%B5%AD%EC%96%B4%20README-6f42c1?style=for-the-badge"></a>
</p>

A small browser-only viewer for checking English workbook JSON files converted from PDF source books.

PMs, data engineers, and first-pass reviewers can upload one workbook JSON locally, inspect the raw data, and see how each question renders. The file stays in the browser and is not sent to a backend service.

## Demo

- Viewer: https://abbyheo.github.io/english-question-upload-viewer/
- Korean UI archive: https://abbyheo.github.io/english-question-upload-viewer/index-ko.html

## Try it with a sample file

1. Download the sample JSON file: [`samples/sample-question-viewer.json`](./samples/sample-question-viewer.json)
2. Open the [live viewer](https://abbyheo.github.io/english-question-upload-viewer/)
3. Drag the sample JSON file into the upload area, or click the upload area and select the file.
4. Switch between Question View, Raw JSON, and HTML Rendering.
5. Try the search box with a question ID such as `21`, `28`, or `33`.

The sample file uses made-up question text such as "This is a sample question." It is only there so you can try the viewer without using real project data.

## Why I built this

In the original QA workflow, one JSON file represented one workbook PDF. Reviewers had to move between the extracted JSON, rendered question content, and review notes. That made it harder to check what was actually ready to deliver.

A full platform feature was not available within the project timeline, so I built this lightweight browser-based viewer to keep the QA work moving. PMs, data engineers, and first-pass reviewers needed a shared way to check a workbook JSON and the rendered question output. This viewer was the lightweight version of that.

## What it does

- Upload one or more workbook `.json` files by drag-and-drop or file selection.
- Search by filename or question ID in the selected workbook.
- Check the uploaded file in three views:
  - Question View: passage, question, answer, and explanation sections.
  - Raw JSON: the original uploaded JSON.
  - HTML Rendering: the rendered HTML content.
- Keep uploaded data in browser memory only during the session.

## Privacy / confidentiality note

This repo is a public, sanitized version of the viewer. It does not include company data, customer data, internal systems, proprietary source files, or production data.

Files are read locally in the browser with the `FileReader` API. The site does not upload or store them.

## Supported file structure

The viewer displays JSON files that follow this basic shape:

```json
{
  "items": [
    {
      "id": "question-id",
      "answerType": "choice",
      "imageIds": [0],
      "passageAreaInfo": { "annotationIds": [1] },
      "questionAreaInfo": { "annotationIds": [2] },
      "answerAreaInfo": { "annotationIds": [3] },
      "explanationAreaInfo": { "annotationIds": [4] }
    }
  ],
  "annotations": [
    {
      "id": 1,
      "category_id": 3,
      "text": "This is a sample body text.",
      "html": "<div>This is a sample body text.</div>"
    }
  ],
  "images": [
    {
      "id": 0,
      "file_name": "sample_page.png",
      "page_type": "sample",
      "width": 800,
      "height": 600
    }
  ]
}
```

## Browser support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Repository structure

```text
README.md                    # English README
README.ko.md                 # Korean README
index.html                   # English UI / default GitHub Pages entry
index-ko.html                # Preserved Korean UI archive
upload-viewer-simple.js      # English UI logic
upload-viewer-simple-ko.js   # Preserved Korean UI logic
samples/sample-question-viewer.json
```

## License

This project is distributed under the MIT License.

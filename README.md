# 📚 English Question QC Viewer

<p>
  <a href="./README.md"><img alt="English README" src="https://img.shields.io/badge/English-README-2f6fed?style=for-the-badge"></a>
  <a href="./README.ko.md"><img alt="Korean README" src="https://img.shields.io/badge/KOR-%ED%95%9C%EA%B5%AD%EC%96%B4%20README-6f42c1?style=for-the-badge"></a>
</p>

A browser-only QA viewer for reviewing English exam question JSON files during a content data processing workflow.

This viewer helps PMs, data engineers, and first-pass reviewers inspect uploaded JSON locally, compare raw structured data with rendered question output, and support QA / delivery-readiness decisions without sending uploaded files to a backend service.

## Live demo

- **Viewer:** https://abbyheo.github.io/english-question-upload-viewer/
- **Korean UI archive:** https://abbyheo.github.io/english-question-upload-viewer/index-ko.html

## Try it with a sample file

1. Download the sample JSON file: [`samples/sample-question-viewer.json`](./samples/sample-question-viewer.json)
2. Open the [live viewer](https://abbyheo.github.io/english-question-upload-viewer/)
3. Drag the sample JSON file into the upload area, or click the upload area and select the file.
4. Switch between **Question View**, **Raw JSON**, and **HTML Rendering**.

The sample file contains only synthetic sample question text such as “This is a sample question.” It is included so users can test the viewer without using real project data.

## Why I built this

In an English exam content data processing project, reviewers needed a faster way to inspect extracted JSON and verify rendered question output before delivery.

Platform engineering support was not available within the project timeline, so I built a lightweight browser-based review tool to keep the QA workflow moving. The tool was designed for PMs, data engineers, and first-pass reviewers who needed a shared way to inspect uploaded JSON, rendered question content, and review context.

## What it does

- Upload one or more `.json` files by drag-and-drop or file selection.
- Validate that uploaded files are JSON.
- Display uploaded files in a local file list.
- Show extracted question data in three modes:
  - **Question View** — structured question sections such as passage, question, answer, and explanation.
  - **Raw JSON** — the original uploaded JSON structure.
  - **HTML Rendering** — rendered HTML content for reviewer inspection.
- Keep uploaded data in browser memory only during the session.

## Privacy / confidentiality note

This public repository is a sanitized demo. It does **not** include company data, customer data, proprietary source files, internal systems, or real production samples.

Uploaded files are processed locally in the browser with the `FileReader` API. They are not sent to a backend service and are not stored by this site.

## Supported file structure

The viewer expects a JSON file with an `items` array and related `annotations` / `images` data.

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

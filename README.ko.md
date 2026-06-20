# 📚 English Question QC Viewer / 영어 문항 QC 웹뷰어

<p>
  <a href="./README.md"><img alt="English README" src="https://img.shields.io/badge/English-README-2f6fed?style=for-the-badge"></a>
  <a href="./README.ko.md"><img alt="Korean README" src="https://img.shields.io/badge/KOR-%ED%95%9C%EA%B5%AD%EC%96%B4%20README-6f42c1?style=for-the-badge"></a>
</p>

영어 시험 문항 JSON 파일을 브라우저에서 업로드해 검토할 수 있는 QA 웹뷰어입니다.

PM, 데이터 엔지니어, 1차 검수자가 업로드한 JSON을 로컬 브라우저에서 확인하고, raw JSON과 렌더링된 문항 출력을 비교하며, QA / 납품 준비 판단을 더 일관되게 할 수 있도록 만든 도구입니다.

## 라이브 데모

- **Viewer:** https://abbyheo.github.io/english-question-upload-viewer/
- **국문 UI 보존본:** https://abbyheo.github.io/english-question-upload-viewer/index-ko.html

## 샘플 파일로 직접 사용해보기

1. 샘플 JSON 파일을 다운로드합니다: [`samples/sample-question-viewer.json`](./samples/sample-question-viewer.json)
2. [라이브 웹뷰어](https://abbyheo.github.io/english-question-upload-viewer/)를 엽니다.
3. 샘플 JSON 파일을 업로드 영역에 드래그하거나, 업로드 영역을 클릭해 파일을 선택합니다.
4. **Question View**, **Raw JSON**, **HTML Rendering** 탭을 전환해 확인합니다.

샘플 파일에는 “This is a sample question.” 같은 synthetic sample text만 포함되어 있습니다. 실제 프로젝트 데이터 없이 웹뷰어를 테스트할 수 있도록 포함한 파일입니다.

## 왜 만들었는가

영어 시험 콘텐츠 데이터 가공 프로젝트에서, 검수자들은 추출된 JSON과 실제 렌더링된 문항 출력을 빠르게 확인하고 납품 전 품질을 판단해야 했습니다.

프로젝트 일정 내에 플랫폼 엔지니어링 지원이 어려웠기 때문에, QA workflow를 계속 진행할 수 있도록 가벼운 browser-based review tool을 만들었습니다. 이 도구는 PM, 데이터 엔지니어, 1차 검수자가 같은 기준으로 업로드된 JSON, 렌더링된 문항, 검토 맥락을 확인할 수 있도록 설계되었습니다.

## 주요 기능

- `.json` 파일을 drag-and-drop 또는 file selection으로 업로드
- JSON 파일 형식 검증
- 업로드된 파일 목록 표시
- 세 가지 보기 모드 제공:
  - **Question View** — passage, question, answer, explanation 등 구조화된 문항 영역
  - **Raw JSON** — 업로드된 원본 JSON 구조
  - **HTML Rendering** — 검수자가 실제 출력 형태를 확인할 수 있는 HTML 렌더링
- 업로드 데이터는 세션 중 브라우저 메모리에서만 처리

## Privacy / confidentiality note

이 public repository는 sanitized demo입니다. 회사 데이터, 고객 데이터, proprietary source file, internal system, 실제 production sample은 포함하지 않습니다.

업로드한 파일은 브라우저의 `FileReader` API로 로컬에서만 처리됩니다. 이 사이트는 파일을 backend service로 전송하거나 저장하지 않습니다.

## 지원 JSON 구조

이 웹뷰어는 `items` 배열과 관련 `annotations` / `images` 데이터를 포함한 JSON 파일을 기대합니다.

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

## 브라우저 지원

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## 파일 구조

```text
README.md                    # 영어 README
README.ko.md                 # 국문 README
index.html                   # 영어 UI / 기본 GitHub Pages 진입점
index-ko.html                # 기존 국문 UI 보존본
upload-viewer-simple.js      # 영어 UI 로직
upload-viewer-simple-ko.js   # 기존 국문 UI 로직 보존본
samples/sample-question-viewer.json
```

## 라이선스

이 프로젝트는 MIT License 하에 배포됩니다.

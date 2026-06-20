# English Question QC Viewer / 영어 문항 QC 웹뷰어

<p>
  <a href="./README.md"><img alt="English README" src="https://img.shields.io/badge/English-README-2f6fed?style=for-the-badge"></a>
  <a href="./README.ko.md"><img alt="Korean README" src="https://img.shields.io/badge/KOR-%ED%95%9C%EA%B5%AD%EC%96%B4%20README-6f42c1?style=for-the-badge"></a>
</p>

PDF 문제집에서 변환한 영어 문항 JSON 파일을 브라우저에서 열어 검수할 수 있는 작은 QC 웹뷰어입니다.

PM, 데이터 엔지니어, 1차 검수자가 문제집 1권 단위의 JSON 원본과 렌더링된 문항을 같은 화면에서 확인할 수 있도록 만들었습니다. 파일은 브라우저에서만 읽고, 서버로 업로드하지 않습니다.

## 라이브 데모

- Viewer: https://abbyheo.github.io/english-question-upload-viewer/
- 국문 UI 보존본: https://abbyheo.github.io/english-question-upload-viewer/index-ko.html

## 샘플 파일로 직접 사용해보기

1. 샘플 JSON 파일을 다운로드합니다: [`samples/sample-question-viewer.json`](./samples/sample-question-viewer.json)
2. [라이브 웹뷰어](https://abbyheo.github.io/english-question-upload-viewer/)를 엽니다.
3. 샘플 JSON 파일을 업로드 영역에 드래그하거나, 업로드 영역을 클릭해 파일을 선택합니다.
4. Question View, Raw JSON, HTML Rendering 탭을 전환해 확인합니다.
5. 검색창에 `21`, `28`, `33` 같은 문항 ID를 넣어 샘플 문항이 필터링되는지 확인합니다.

샘플 파일에는 "This is a sample question." 같은 임의의 샘플 문장만 들어 있습니다. 실제 프로젝트 데이터 없이 웹뷰어를 직접 테스트해볼 수 있습니다.

## 왜 만들었는가

원래 QA 작업에서는 문제집 PDF 1권에서 변환된 JSON 1개를 기준으로 검수했습니다. 검수자는 추출된 JSON, 렌더링된 문항, 검수 메모를 따로 확인해야 했습니다. 그래서 실제로 납품 가능한 상태인지 빠르게 확인하기가 어려웠습니다.

프로젝트 일정 안에 별도 플랫폼 기능을 만들기 어려웠기 때문에, 우선 검수 흐름을 막지 않도록 가벼운 브라우저 기반 viewer를 만들었습니다. PM, 데이터 엔지니어, 1차 검수자가 문제집 JSON과 렌더링된 문항을 같은 방식으로 확인할 수 있는 화면이 필요했고, 이 viewer는 그 필요를 우선 해결하기 위한 작은 버전이었습니다.

## 주요 기능

- 문제집 단위 `.json` 파일을 drag-and-drop 또는 file selection으로 업로드
- 파일명 또는 선택한 문제집 안의 문항 ID 검색
- 업로드한 파일을 세 가지 방식으로 확인:
  - Question View: passage, question, answer, explanation 영역
  - Raw JSON: 업로드한 원본 JSON
  - HTML Rendering: 렌더링된 HTML 콘텐츠
- 업로드 데이터는 세션 중 브라우저 메모리에서만 처리

## Privacy / confidentiality note

이 repo는 포트폴리오용으로 정리한 공개 데모입니다. 회사 데이터, 고객 데이터, 내부 시스템, 비공개 소스 파일, 실제 운영 데이터는 넣지 않았습니다.

업로드한 파일은 브라우저의 `FileReader` API로 로컬에서만 읽습니다. 이 사이트는 파일을 서버로 보내거나 저장하지 않습니다.

## 지원 JSON 구조

이 웹뷰어는 대략 다음 구조의 JSON을 기준으로 표시합니다.

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

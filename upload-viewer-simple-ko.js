class UploadEnglishQuestionViewer {
    constructor() {
        this.currentData = null;
        this.quillInstances = new Map();
        this.uploadedFiles = new Map(); // 파일명 -> 파일 객체 매핑
        this.currentFileName = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // 파일 업로드 영역 클릭 이벤트
        document.getElementById('uploadArea').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // 파일 선택 이벤트
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // 드래그 앤 드롭 이벤트
        const uploadArea = document.getElementById('uploadArea');
        
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleFileSelect(e.dataTransfer.files);
        });

        // 검색 이벤트
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
            this.filterQuestions(e.target.value);
        });

        // 탭 전환 이벤트
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    // 파일 선택 처리
    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                this.processFile(file);
            } else {
                alert(`${file.name}은(는) 지원되지 않는 파일 형식입니다. JSON 파일만 업로드 가능합니다.`);
            }
        });
    }

    // 파일 처리
    processFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                this.uploadedFiles.set(file.name, {
                    file: file,
                    data: jsonData
                });
                
                this.updateFileList();
                this.showSuccess(`파일 "${file.name}"이(가) 성공적으로 업로드되었습니다.`);
                
                // 첫 번째 파일이면 자동으로 선택
                if (this.uploadedFiles.size === 1) {
                    this.selectFile(file.name);
                }
                
            } catch (error) {
                console.error('JSON 파싱 오류:', error);
                this.showError(`파일 "${file.name}"의 JSON 형식이 올바르지 않습니다.`);
            }
        };
        
        reader.onerror = () => {
            this.showError(`파일 "${file.name}"을(를) 읽는 중 오류가 발생했습니다.`);
        };
        
        reader.readAsText(file);
    }

    // 파일 목록 업데이트
    updateFileList() {
        const fileListContainer = document.getElementById('fileList');
        fileListContainer.innerHTML = '';

        if (this.uploadedFiles.size === 0) {
            fileListContainer.innerHTML = `
                <div class="empty-state">
                    <h3>업로드된 파일이 없습니다</h3>
                    <p>위에서 JSON 파일을 업로드해주세요.</p>
                </div>
            `;
            return;
        }

        this.uploadedFiles.forEach((fileInfo, fileName) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.fileName = fileName;
            
            // 파일명 표시 포맷팅
            const displayName = fileName.length > 20 ? fileName.substring(0, 20) + '...' : fileName;
            
            fileItem.innerHTML = `
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: #333;">${displayName}</div>
                    <div style="font-size: 0.85rem; color: #666;">${fileName}</div>
                </div>
                <div style="color: #667eea;">📄</div>
            `;

            fileItem.addEventListener('click', () => {
                this.selectFile(fileName);
            });

            fileListContainer.appendChild(fileItem);
        });
    }

    // 파일 검색 필터링
    filterFiles(searchTerm) {
        const fileItems = document.querySelectorAll('.file-item');
        
        fileItems.forEach(item => {
            const fileName = item.dataset.fileName;
            const isCurrentFile = fileName === this.currentFileName;
            if (!searchTerm.trim() || fileName.toLowerCase().includes(searchTerm.toLowerCase()) || isCurrentFile) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    // 선택된 파일 안의 문항 검색 결과 필터링
    filterQuestions(searchTerm) {
        const questionItems = document.querySelectorAll('#questionsTab .question-container');
        if (!questionItems.length) return;

        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        questionItems.forEach(item => {
            const searchText = item.dataset.searchText || '';
            item.style.display = !normalizedSearchTerm || searchText.includes(normalizedSearchTerm) ? 'block' : 'none';
        });
    }

    // 파일 선택
    selectFile(fileName) {
        try {
            // 이전 활성 파일 비활성화
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
            });

            // 현재 파일 활성화
            const selectedItem = document.querySelector(`[data-file-name="${fileName}"]`);
            if (selectedItem) {
                selectedItem.classList.add('active');
            }

            // 로딩 상태 표시
            this.showLoading();

            const fileInfo = this.uploadedFiles.get(fileName);
            if (!fileInfo) {
                throw new Error('파일 정보를 찾을 수 없습니다.');
            }

            this.currentData = fileInfo.data;
            this.currentFileName = fileName;

            // UI 업데이트
            this.updateFileInfo(fileName, fileInfo.data);
            this.displayQuestions(fileInfo.data);
            this.displayRawJson(fileInfo.data);
            this.displayHtmlContent(fileInfo.data);
            this.filterQuestions(document.getElementById('searchInput').value);

        } catch (error) {
            console.error('파일 로드 오류:', error);
            this.showError(`파일을 불러오는 중 오류가 발생했습니다: ${error.message}`);
        }
    }

    // 성공 메시지 표시
    showSuccess(message) {
        // 간단한 알림
        console.log('Success:', message);
    }

    // 로딩 상태 표시
    showLoading() {
        const questionsTab = document.getElementById('questionsTab');
        questionsTab.innerHTML = '<div class="loading">파일을 불러오는 중...</div>';
    }

    // 오류 메시지 표시
    showError(message) {
        const questionsTab = document.getElementById('questionsTab');
        questionsTab.innerHTML = `<div class="error">${message}</div>`;
    }

    // 파일 정보 업데이트
    updateFileInfo(fileName, data) {
        document.getElementById('currentFileName').textContent = fileName;
        
        let metaInfo = '';
        const itemCount = data.items ? data.items.length : 0;
        const annotationCount = data.annotations ? data.annotations.length : 0;
        const imageCount = data.images ? data.images.length : 0;
        
        metaInfo = `문항 수: ${itemCount}개 | 주석 수: ${annotationCount}개 | 페이지 수: ${imageCount}개`;
        if (data.info && data.info.provider) {
            metaInfo += ` | 제공자: ${data.info.provider}`;
        }
        
        document.getElementById('fileMeta').textContent = metaInfo;
    }

    // 문항 표시
    displayQuestions(data) {
        const questionsTab = document.getElementById('questionsTab');
        
        if (!data.items || data.items.length === 0) {
            questionsTab.innerHTML = `
                <div class="empty-state">
                    <h3>문항이 없습니다</h3>
                    <p>이 파일에는 표시할 문항이 없습니다.</p>
                </div>
            `;
            return;
        }

        questionsTab.innerHTML = '';

        data.items.forEach((item, index) => {
            const questionContainer = document.createElement('div');
            questionContainer.className = 'question-container';
            
            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';
            
            // 이미지 정보 가져오기
            const imageInfo = this.getImageInfo(item.imageIds, data.images);
            
            questionContainer.dataset.searchText = this.buildQuestionSearchText(item, imageInfo).toLowerCase();

            // 이미지 정보 HTML 생성
            const imageInfoHtml = imageInfo.length > 0 
                ? `<div style="margin-top: 5px; font-size: 0.85rem; color: #666; background: #f0f4ff; padding: 5px; border-radius: 3px;">
                    📄 ${imageInfo.map(img => img.file_name).join(', ')}
                   </div>`
                : `<div style="margin-top: 5px; font-size: 0.85rem; color: #999; background: #f8f8f8; padding: 5px; border-radius: 3px;">
                    📄 이미지 정보 없음
                   </div>`;
            
            questionHeader.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span class="question-number">문항 ${item.id || index + 1}</span>
                    <span class="question-type">${item.answerType || 'Unknown'}</span>
                </div>
                ${imageInfoHtml}
            `;
            
            questionContainer.appendChild(questionHeader);

            // 지문 영역 (Passage)
            if (item.passageAreaInfo && item.passageAreaInfo.annotationIds.length > 0) {
                const passageSection = this.createQuestionSection('지문', item.passageAreaInfo.annotationIds, data.annotations);
                if (passageSection) questionContainer.appendChild(passageSection);
            }

            // 문제 영역 (Question)
            if (item.questionAreaInfo && item.questionAreaInfo.annotationIds.length > 0) {
                const questionSection = this.createQuestionSection('문제', item.questionAreaInfo.annotationIds, data.annotations);
                if (questionSection) questionContainer.appendChild(questionSection);
            }

            // 답안 영역 (Answer)
            if (item.answerAreaInfo && item.answerAreaInfo.annotationIds.length > 0) {
                const answerSection = this.createQuestionSection('답안', item.answerAreaInfo.annotationIds, data.annotations);
                if (answerSection) questionContainer.appendChild(answerSection);
            }

            // 해설 영역 (Explanation)
            if (item.explanationAreaInfo && item.explanationAreaInfo.annotationIds.length > 0) {
                const explanationSection = this.createQuestionSection('해설', item.explanationAreaInfo.annotationIds, data.annotations);
                if (explanationSection) questionContainer.appendChild(explanationSection);
            }

            questionsTab.appendChild(questionContainer);
        });
    }

    // 문항 섹션 생성
    createQuestionSection(title, annotationIds, annotations) {
        const section = document.createElement('div');
        section.className = 'question-section';
        
        const titleDiv = document.createElement('div');
        titleDiv.className = 'section-title';
        titleDiv.textContent = title;
        section.appendChild(titleDiv);

        let hasContent = false;

        annotationIds.forEach(annotationId => {
            const annotation = this.findAnnotation(annotationId, annotations);
            if (annotation) {
                const contentDiv = this.createAnnotationContent(annotation, title, annotationId);
                if (contentDiv) {
                    section.appendChild(contentDiv);
                    hasContent = true;
                }
            }
        });

        return hasContent ? section : null;
    }

    // Annotation 찾기
    findAnnotation(annotationId, annotations) {
        if (!annotations) return null;
        return annotations.find(ann => ann.id === annotationId);
    }

    // 이미지 정보 가져오기
    getImageInfo(imageIds, images) {
        if (!imageIds || !images || imageIds.length === 0) {
            return [];
        }
        
        const result = imageIds.map(imageId => {
            const image = images.find(img => img.id === imageId);
            return image || null;
        }).filter(img => img !== null);
        
        return result;
    }


    // 문항 카드 검색용 경량 텍스트 생성.
    // 문제집 단위 JSON에서 문항 본문 전체를 DOM data attribute에 중복 저장하지 않도록
    // 문항 ID와 파일/페이지 메타데이터만 검색 대상으로 둔다.
    buildQuestionSearchText(item, imageInfo) {
        const parts = [item.id, item.answerType];
        imageInfo.forEach(img => parts.push(img.file_name, img.page_type));

        return parts.filter(part => part !== undefined && part !== null).join(' ');
    }

    // Annotation 콘텐츠 생성
    createAnnotationContent(annotation, sectionTitle, annotationId) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'annotation-content';
        contentDiv.style.marginBottom = '15px';
        contentDiv.style.padding = '15px';
        contentDiv.style.background = '#fafafa';
        contentDiv.style.border = '1px solid #e9ecef';
        contentDiv.style.borderRadius = '6px';

        // HTML이 있으면 HTML을 사용, 없으면 텍스트 사용
        if (annotation.html && annotation.html.trim()) {
            // HTML을 안전하게 표시
            contentDiv.innerHTML = `
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                    ID: ${annotation.id} | 카테고리: ${annotation.category_id || 'N/A'}
                </div>
                <div>${this.sanitizeHtml(annotation.html)}</div>
            `;
        } else if (annotation.text && annotation.text.trim()) {
            // 텍스트를 표시
            const textContent = annotation.text.replace(/\n/g, '<br>');
            contentDiv.innerHTML = `
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                    ID: ${annotation.id} | 카테고리: ${annotation.category_id || 'N/A'}
                </div>
                <div style="line-height: 1.6;">${textContent}</div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                    ID: ${annotation.id} | 카테고리: ${annotation.category_id || 'N/A'}
                </div>
                <em style="color: #999;">내용이 없습니다</em>
            `;
        }

        return contentDiv;
    }

    // HTML 안전화
    sanitizeHtml(html) {
        // 기본적인 HTML 태그만 허용
        const allowedTags = ['div', 'span', 'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        return tempDiv.innerHTML;
    }

    // 원본 JSON 표시
    displayRawJson(data) {
        const rawJson = document.getElementById('rawJson');
        rawJson.textContent = JSON.stringify(data, null, 2);
    }

    // HTML 콘텐츠 표시
    displayHtmlContent(data) {
        const htmlContent = document.getElementById('htmlContent');
        htmlContent.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            htmlContent.innerHTML = '<p>HTML로 표시할 콘텐츠가 없습니다.</p>';
            return;
        }

        data.items.forEach((item, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.style.marginBottom = '30px';
            questionDiv.style.border = '1px solid #ddd';
            questionDiv.style.borderRadius = '8px';
            questionDiv.style.padding = '20px';

            const titleH3 = document.createElement('h3');
            titleH3.textContent = `문항 ${item.id || index + 1}`;
            titleH3.style.color = '#667eea';
            titleH3.style.marginBottom = '10px';
            questionDiv.appendChild(titleH3);

            // 이미지 정보 추가
            const imageInfo = this.getImageInfo(item.imageIds, data.images);
            if (imageInfo.length > 0) {
                const imageInfoDiv = document.createElement('div');
                imageInfoDiv.style.fontSize = '0.9rem';
                imageInfoDiv.style.color = '#666';
                imageInfoDiv.style.marginBottom = '15px';
                imageInfoDiv.style.padding = '8px';
                imageInfoDiv.style.backgroundColor = '#f0f4ff';
                imageInfoDiv.style.borderLeft = '3px solid #667eea';
                imageInfoDiv.style.borderRadius = '3px';
                
                const imageList = imageInfo.map(img => {
                    const fileName = img.file_name;
                    const pageType = img.page_type || 'Unknown';
                    const dimensions = `${img.width}×${img.height}`;
                    return `📄 <strong>${fileName}</strong> (${pageType}, ${dimensions}px)`;
                }).join('<br>');
                
                imageInfoDiv.innerHTML = `
                    <strong>📁 원본 이미지:</strong><br>
                    ${imageList}
                `;
                questionDiv.appendChild(imageInfoDiv);
            }

            // 각 영역별로 처리
            const sections = [
                { title: '지문', ids: item.passageAreaInfo?.annotationIds || [] },
                { title: '문제', ids: item.questionAreaInfo?.annotationIds || [] },
                { title: '답안', ids: item.answerAreaInfo?.annotationIds || [] },
                { title: '해설', ids: item.explanationAreaInfo?.annotationIds || [] }
            ];

            sections.forEach(section => {
                if (section.ids.length > 0) {
                    const sectionDiv = document.createElement('div');
                    sectionDiv.style.marginBottom = '15px';

                    const sectionTitle = document.createElement('h4');
                    sectionTitle.textContent = section.title;
                    sectionTitle.style.color = '#333';
                    sectionTitle.style.marginBottom = '8px';
                    sectionDiv.appendChild(sectionTitle);

                    section.ids.forEach(annotationId => {
                        const annotation = this.findAnnotation(annotationId, data.annotations);
                        if (annotation) {
                            const contentDiv = document.createElement('div');
                            contentDiv.style.padding = '10px';
                            contentDiv.style.backgroundColor = '#f8f9fa';
                            contentDiv.style.borderRadius = '4px';
                            contentDiv.style.border = '1px solid #e9ecef';
                            contentDiv.style.marginBottom = '10px';

                            if (annotation.html && annotation.html.trim()) {
                                contentDiv.innerHTML = `
                                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                                        Annotation ID: ${annotation.id}
                                    </div>
                                    ${this.sanitizeHtml(annotation.html)}
                                `;
                            } else if (annotation.text && annotation.text.trim()) {
                                const textContent = annotation.text.replace(/\n/g, '<br>');
                                contentDiv.innerHTML = `
                                    <div style="font-size: 0.8rem; color: #666; margin-bottom: 5px;">
                                        Annotation ID: ${annotation.id}
                                    </div>
                                    <div style="line-height: 1.6;">${textContent}</div>
                                `;
                            }

                            sectionDiv.appendChild(contentDiv);
                        }
                    });

                    if (sectionDiv.children.length > 1) { // title + content가 있을 때만 추가
                        questionDiv.appendChild(sectionDiv);
                    }
                }
            });

            htmlContent.appendChild(questionDiv);
        });
    }

    // 탭 전환
    switchTab(tabName) {
        // 탭 버튼 활성화 상태 변경
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 탭 콘텐츠 표시/숨김
        document.querySelectorAll('.question-viewer').forEach(viewer => {
            viewer.classList.remove('active');
            viewer.style.display = 'none';
        });

        const activeTab = document.getElementById(`${tabName}Tab`);
        if (activeTab) {
            activeTab.classList.add('active');
            activeTab.style.display = 'block';
        }
    }
}

// 페이지 로드 시 뷰어 초기화
document.addEventListener('DOMContentLoaded', () => {
    new UploadEnglishQuestionViewer();
});

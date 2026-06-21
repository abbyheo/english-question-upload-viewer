class UploadEnglishQuestionViewer {
    constructor() {
        this.currentData = null;
        this.uploadedFiles = new Map(); // filename -> file object mapping
        this.currentFileName = null;
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // File upload area click event
        document.getElementById('uploadArea').addEventListener('click', () => {
            document.getElementById('fileInput').click();
        });

        // File selection event
        document.getElementById('fileInput').addEventListener('change', (e) => {
            this.handleFileSelect(e.target.files);
        });

        // Drag and drop events
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

        // Search event
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterFiles(e.target.value);
            this.filterQuestions(e.target.value);
        });

        // Tab switch event
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });
    }

    // Handle file selection
    handleFileSelect(files) {
        Array.from(files).forEach(file => {
            if (file.type === 'application/json' || file.name.endsWith('.json')) {
                this.processFile(file);
            } else {
                alert(`${file.name} is not a supported file type. Please upload JSON files only.`);
            }
        });
    }

    // Process file
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
                this.showSuccess(`File "${file.name}" uploaded successfully.`);
                
                // Automatically select the first uploaded file
                if (this.uploadedFiles.size === 1) {
                    this.selectFile(file.name);
                }
                
            } catch (error) {
                console.error('JSON parsing error:', error);
                this.showError(`File "${file.name}" is not valid JSON.`);
            }
        };
        
        reader.onerror = () => {
            this.showError(`An error occurred while reading file "${file.name}".`);
        };
        
        reader.readAsText(file);
    }

    // Update file list
    updateFileList() {
        const fileListContainer = document.getElementById('fileList');
        fileListContainer.innerHTML = '';

        if (this.uploadedFiles.size === 0) {
            fileListContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No files uploaded</h3>
                    <p>Upload JSON files above to begin.</p>
                </div>
            `;
            return;
        }

        this.uploadedFiles.forEach((fileInfo, fileName) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.dataset.fileName = fileName;
            
            // Format display filename
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

    // Filter files by search term
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

    // Filter visible questions in the selected file
    filterQuestions(searchTerm) {
        const questionItems = document.querySelectorAll('#questionsTab .question-container');
        if (!questionItems.length) return;

        const normalizedSearchTerm = searchTerm.trim().toLowerCase();
        questionItems.forEach(item => {
            const searchText = item.dataset.searchText || '';
            item.style.display = !normalizedSearchTerm || searchText.includes(normalizedSearchTerm) ? 'block' : 'none';
        });
    }

    // Select file
    selectFile(fileName) {
        try {
            // Deactivate previous active file
            document.querySelectorAll('.file-item').forEach(item => {
                item.classList.remove('active');
            });

            // Activate current file
            const selectedItem = document.querySelector(`[data-file-name="${fileName}"]`);
            if (selectedItem) {
                selectedItem.classList.add('active');
            }

            // Show loading state
            this.showLoading();

            const fileInfo = this.uploadedFiles.get(fileName);
            if (!fileInfo) {
                throw new Error('File information was not found.');
            }

            this.currentData = fileInfo.data;
            this.currentFileName = fileName;

            // Update UI
            this.updateFileInfo(fileName, fileInfo.data);
            this.displayQuestions(fileInfo.data);
            this.displayRawJson(fileInfo.data);
            this.displayHtmlContent(fileInfo.data);
            this.filterQuestions(document.getElementById('searchInput').value);

        } catch (error) {
            console.error('File loading error:', error);
            this.showError(`An error occurred while loading the file: ${error.message}`);
        }
    }

    // Show success message
    showSuccess(message) {
        // Simple notification
        console.log('Success:', message);
    }

    // Show loading state
    showLoading() {
        const questionsTab = document.getElementById('questionsTab');
        questionsTab.innerHTML = '<div class="loading">Loading file...</div>';
    }

    // Show error message
    showError(message) {
        const questionsTab = document.getElementById('questionsTab');
        questionsTab.innerHTML = `<div class="error">${message}</div>`;
    }

    // Update file information
    updateFileInfo(fileName, data) {
        document.getElementById('currentFileName').textContent = fileName;
        
        let metaInfo = '';
        const itemCount = data.items ? data.items.length : 0;
        const annotationCount = data.annotations ? data.annotations.length : 0;
        const imageCount = data.images ? data.images.length : 0;
        
        metaInfo = `Questions: ${itemCount} | Annotations: ${annotationCount} | Pages: ${imageCount}`;
        if (data.info && data.info.provider) {
            metaInfo += ` | Provider: ${data.info.provider}`;
        }
        
        document.getElementById('fileMeta').textContent = metaInfo;
    }

    // Display questions
    displayQuestions(data) {
        const questionsTab = document.getElementById('questionsTab');
        
        if (!data.items || data.items.length === 0) {
            questionsTab.innerHTML = `
                <div class="empty-state">
                    <h3>No questions found</h3>
                    <p>This file does not contain questions to display.</p>
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
            
            // Get image information
            const imageInfo = this.getImageInfo(item.imageIds, data.images);
            
            questionContainer.dataset.searchText = this.buildQuestionSearchText(item, imageInfo).toLowerCase();

            // Generate image information HTML
            const imageInfoHtml = imageInfo.length > 0 
                ? `<div style="margin-top: 5px; font-size: 0.85rem; color: #666; background: #f0f4ff; padding: 5px; border-radius: 3px;">
                    📄 ${imageInfo.map(img => img.file_name).join(', ')}
                   </div>`
                : `<div style="margin-top: 5px; font-size: 0.85rem; color: #999; background: #f8f8f8; padding: 5px; border-radius: 3px;">
                    📄 No image information
                   </div>`;
            
            questionHeader.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                    <span class="question-number">Question ${item.id || index + 1}</span>
                    <span class="question-type">${item.answerType || 'Unknown'}</span>
                </div>
                ${imageInfoHtml}
            `;
            
            questionContainer.appendChild(questionHeader);

            // Passage section
            if (item.passageAreaInfo && item.passageAreaInfo.annotationIds.length > 0) {
                const passageSection = this.createQuestionSection('Passage', item.passageAreaInfo.annotationIds, data.annotations);
                if (passageSection) questionContainer.appendChild(passageSection);
            }

            // Question section
            if (item.questionAreaInfo && item.questionAreaInfo.annotationIds.length > 0) {
                const questionSection = this.createQuestionSection('Question', item.questionAreaInfo.annotationIds, data.annotations);
                if (questionSection) questionContainer.appendChild(questionSection);
            }

            // Answer section
            if (item.answerAreaInfo && item.answerAreaInfo.annotationIds.length > 0) {
                const answerSection = this.createQuestionSection('Answer', item.answerAreaInfo.annotationIds, data.annotations);
                if (answerSection) questionContainer.appendChild(answerSection);
            }

            // Explanation section
            if (item.explanationAreaInfo && item.explanationAreaInfo.annotationIds.length > 0) {
                const explanationSection = this.createQuestionSection('Explanation', item.explanationAreaInfo.annotationIds, data.annotations);
                if (explanationSection) questionContainer.appendChild(explanationSection);
            }

            questionsTab.appendChild(questionContainer);
        });
    }

    // Create question section
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

    // Find annotation
    findAnnotation(annotationId, annotations) {
        if (!annotations) return null;
        return annotations.find(ann => ann.id === annotationId);
    }

    // Get image information
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


    // Build lightweight searchable text for a question card.
    // Keep this to IDs and file/page metadata so a workbook-sized JSON does not
    // duplicate all question body text in DOM data attributes.
    buildQuestionSearchText(item, imageInfo) {
        const parts = [item.id, item.answerType];
        imageInfo.forEach(img => parts.push(img.file_name, img.page_type));

        return parts.filter(part => part !== undefined && part !== null).join(' ');
    }

    // Create annotation content
    createAnnotationContent(annotation, sectionTitle, annotationId) {
        const contentDiv = document.createElement('div');
        contentDiv.className = 'annotation-content';
        contentDiv.style.marginBottom = '15px';
        contentDiv.style.padding = '15px';
        contentDiv.style.background = '#fafafa';
        contentDiv.style.border = '1px solid #e9ecef';
        contentDiv.style.borderRadius = '6px';

        // Use HTML if available; otherwise use text
        if (annotation.html && annotation.html.trim()) {
            // Display HTML safely
            contentDiv.innerHTML = `
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                    ID: ${annotation.id} | Category: ${annotation.category_id || 'N/A'}
                </div>
                <div>${this.sanitizeHtml(annotation.html)}</div>
            `;
        } else if (annotation.text && annotation.text.trim()) {
            // Display text
            const textContent = annotation.text.replace(/\n/g, '<br>');
            contentDiv.innerHTML = `
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                    ID: ${annotation.id} | Category: ${annotation.category_id || 'N/A'}
                </div>
                <div style="line-height: 1.6;">${textContent}</div>
            `;
        } else {
            contentDiv.innerHTML = `
                <div style="font-size: 0.85rem; color: #666; margin-bottom: 8px;">
                    ID: ${annotation.id} | Category: ${annotation.category_id || 'N/A'}
                </div>
                <em style="color: #999;">No content available</em>
            `;
        }

        return contentDiv;
    }

    // Sanitize HTML
    sanitizeHtml(html) {
        // Allow only basic HTML tags
        const allowedTags = ['div', 'span', 'p', 'br', 'strong', 'em', 'u', 'b', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        
        return tempDiv.innerHTML;
    }

    // Display raw JSON
    displayRawJson(data) {
        const rawJson = document.getElementById('rawJson');
        rawJson.textContent = JSON.stringify(data, null, 2);
    }

    // Display HTML content
    displayHtmlContent(data) {
        const htmlContent = document.getElementById('htmlContent');
        htmlContent.innerHTML = '';

        if (!data.items || data.items.length === 0) {
            htmlContent.innerHTML = '<p>No content available for HTML display.</p>';
            return;
        }

        data.items.forEach((item, index) => {
            const questionDiv = document.createElement('div');
            questionDiv.style.marginBottom = '30px';
            questionDiv.style.border = '1px solid #ddd';
            questionDiv.style.borderRadius = '8px';
            questionDiv.style.padding = '20px';

            const titleH3 = document.createElement('h3');
            titleH3.textContent = `Question ${item.id || index + 1}`;
            titleH3.style.color = '#667eea';
            titleH3.style.marginBottom = '10px';
            questionDiv.appendChild(titleH3);

            // Add image information
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
                    <strong>📁 Source image:</strong><br>
                    ${imageList}
                `;
                questionDiv.appendChild(imageInfoDiv);
            }

            // Process each section
            const sections = [
                { title: 'Passage', ids: item.passageAreaInfo?.annotationIds || [] },
                { title: 'Question', ids: item.questionAreaInfo?.annotationIds || [] },
                { title: 'Answer', ids: item.answerAreaInfo?.annotationIds || [] },
                { title: 'Explanation', ids: item.explanationAreaInfo?.annotationIds || [] }
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

                    if (sectionDiv.children.length > 1) { // Add only when title + content exist
                        questionDiv.appendChild(sectionDiv);
                    }
                }
            });

            htmlContent.appendChild(questionDiv);
        });
    }

    // Switch tabs
    switchTab(tabName) {
        // Update active tab button state
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Show/hide tab content
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

// Initialize viewer when page loads
document.addEventListener('DOMContentLoaded', () => {
    new UploadEnglishQuestionViewer();
});

<template>
    <div class="create-document-container">
        <DocumentTopNav :isPreview.sync="isPreview" :showSettings.sync="showSettings"
            @cancel="$router.push('/administration/documents')" @save="handleSave" />

        <!-- Main Content Area -->
        <CRow class="px-4">
            <!-- Left Sidebar Column (Data Variables) -->
            <CCol md="3" v-if="showDataSidebar || showGraphSidebar">
                <DocumentDataSidebar v-if="showDataSidebar" @insert-variable="insertVariable" />
                <DocumentGraphSidebar v-if="showGraphSidebar" @insert-variable="insertVariable" />
            </CCol>

            <!-- Editor Column -->
            <CCol :md="computeEditorColSize" ref="editorCol">


                <CCard class="toolbar-card mb-3 border-0 shadow-sm" v-show="!isPreview">
                    <CCardBody class="p-3">
                        <EditorToolbar @image-uploaded="handleToolbarImage" @insert-styled-text="handleStyledText"
                            @bring-forward="callEditorMethod('bringForward')"
                            @bring-to-front="callEditorMethod('bringToFront')"
                            @send-backward="callEditorMethod('sendBackward')"
                            @send-to-back="callEditorMethod('sendToBack')" @toggle-data-sidebar="toggleSidebar('data')"
                            @toggle-graph-sidebar="toggleSidebar('graph')" @format-text="handleFormatText"
                            @action="handleEditorAction" />
                    </CCardBody>
                </CCard>

                <div class="editor-zoom-wrapper" :style="{ height: wrapperHeight + 'px' }">
                    <div class="document-editor-full" :class="{ 'preview-mode': isPreview }"
                        :style="{ transform: `scale(${scale})` }">
                        <KonvaEditor ref="konvaEditor" :isPreview="isPreview" />
                    </div>
                </div>

                <!-- Manual Zoom Controls -->
                <div class="zoom-controls-overlay shadow-sm">
                    <CButton variant="ghost" class="zoom-btn" @click="changeZoom(-0.1)" title="Zoom Out">
                        <CIcon name="cil-minus" size="sm" />
                    </CButton>
                    <div class="zoom-slider-container">
                        <input type="range" class="zoom-slider" min="0.25" max="2" step="0.05" v-model.number="scale"
                            @input="isManualZoom = true" />
                    </div>
                    <CButton variant="ghost" class="zoom-btn" @click="changeZoom(0.1)" title="Zoom In">
                        <CIcon name="cil-plus" size="sm" />
                    </CButton>
                    <div class="zoom-percentage">{{ Math.round(scale * 100) }}%</div>
                    <div class="divider mx-2"></div>
                    <CButton variant="ghost" class="fit-btn" @click="resetToFit" title="Fit to Width">
                        <CIcon name="cil-fullscreen" size="sm" class="mr-1" /> Fit
                    </CButton>
                </div>
            </CCol>

            <!-- Sidebar Column -->
            <CCol md="3" v-if="showSettings">
                <DocumentSidebar :status.sync="status" :currentDate="currentDate" :currentTime="currentTime"
                    :title.sync="documentName" />
            </CCol>
        </CRow>
    </div>
</template>

<script>
import KonvaEditor from '../../../components/documents/editor/KonvaEditor.vue'
import DocumentTopNav from '../../../components/documents/editor/DocumentTopNav.vue'
import EditorToolbar from '../../../components/documents/editor/EditorToolbar.vue'
import DocumentSidebar from '../../../components/documents/editor/DocumentSidebar.vue'
import DocumentDataSidebar from '../../../components/documents/editor/DocumentDataSidebar.vue'
import DocumentGraphSidebar from '../../../components/documents/editor/DocumentGraphSidebar.vue'

export default {
    name: 'CreateDocument',
    components: {
        KonvaEditor,
        DocumentTopNav,
        EditorToolbar,
        DocumentSidebar,
        DocumentDataSidebar,
        DocumentGraphSidebar
    },
    data() {
        return {
            docId: null,
            documentName: 'Untitled Document',
            documentTitle: '',
            status: 'Draft',
            currentDate: '',
            currentTime: '',
            timer: null,
            isPreview: false,
            scale: 1,
            isManualZoom: false,
            wrapperHeight: 1123,
            showDataSidebar: false,
            showGraphSidebar: false,
            showSettings: false
        }
    },
    mounted() {
        this.updateDateTime();
        this.timer = setInterval(this.updateDateTime, 1000);
        this.calculateScale();
        window.addEventListener('resize', this.calculateScale);

        // Load if ID exists in query/params
        if (this.$route.params.id) {
            this.docId = this.$route.params.id;
            this.loadDocument();
        }
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        window.removeEventListener('resize', this.calculateScale);
    },
    methods: {
        async loadDocument() {
            try {
                const res = await this.$api.documents('get', this.docId);
                if (res.data && res.data.data) {
                    const doc = res.data.data;
                    this.documentName = doc.title || doc.name;
                    this.status = doc.status;
                    if (this.$refs.konvaEditor) {
                        this.$refs.konvaEditor.loadFromJSON(doc.content);
                    }
                }
            } catch (err) {
                console.error('Failed to load document', err);
            }
        },
        async handleSave() {
            if (!this.$refs.konvaEditor) return;

            const content = this.$refs.konvaEditor.saveToJSON();
            const payload = {
                title: this.documentName,
                status: this.status,
                content: content,
                // thumbnail can be added later via toDataURL
            };

            try {
                let res;
                if (this.docId) {
                    payload._id = this.docId;
                    res = await this.$api.documents('put', payload);
                } else {
                    res = await this.$api.documents('post', payload);
                    if (res.data && res.data.data) {
                        this.docId = res.data.data._id;
                        // update URL without reload if needed
                    }
                }
                alert('Document saved successfully!');
            } catch (err) {
                console.error('Failed to save document', err);
                alert('Failed to save document');
            }
        },
        handleToolbarImage(dataUrl) {
            if (this.$refs.konvaEditor && this.$refs.konvaEditor.addImage) {
                this.$refs.konvaEditor.addImage(dataUrl)
            }
        },
        handleStyledText(type) {
            if (this.$refs.konvaEditor && this.$refs.konvaEditor.addStyledTextBlock) {
                this.$refs.konvaEditor.addStyledTextBlock(type)
            }
        },
        handleFormatText(payload) {
            if (this.$refs.konvaEditor) {
                this.$refs.konvaEditor.formatSelectedNodes(payload);
            }
        },
        handleEditorAction(action) {
            if (this.$refs.konvaEditor && typeof this.$refs.konvaEditor[action] === 'function') {
                this.$refs.konvaEditor[action]();
            } else {
                console.warn(`Action ${action} is not implemented in KonvaEditor`);
            }
        },
        setLink() {
            const url = window.prompt('URL', '')
            if (url === null) return
            // konva editor doesn't use link marks; implement if needed
        },
        callEditorMethod(methodName) {
            if (this.$refs.konvaEditor && typeof this.$refs.konvaEditor[methodName] === 'function') {
                this.$refs.konvaEditor[methodName]()
            }
        },
        insertVariable(variableStr) {
            if (this.$refs.konvaEditor) {
                if (variableStr === '{GeneralCompetencies}' || variableStr === '{SpecificCompetencies}') {
                    this.$refs.konvaEditor.addCompetencyTable(variableStr);
                } else if (variableStr === '{Suggestion}') {
                    this.$refs.konvaEditor.addSuggestionTable();
                } else if (variableStr.startsWith('{Graph')) {
                    this.$refs.konvaEditor.addGraphPlaceholder(variableStr);
                } else {
                    // Apply formatting for specific basic variables
                    let textToInsert = variableStr;
                    if (variableStr === '{StudentName}') textToInsert = 'Name XXXXXX XXXXXX XXXXXX';
                    else if (variableStr === '{StudentID}') textToInsert = 'Student ID XXXXXXXXXX';
                    else if (variableStr === '{School}') textToInsert = 'School XXXXXXXXXXXXXXXXXXXX';
                    else if (variableStr === '{Program}') textToInsert = 'Major XXXXXXXXXXXXXXXXXXXX';
                    else if (variableStr === '{AcademyYear}') textToInsert = 'Academic Year XXXXXX';

                    this.$refs.konvaEditor.addTextBlock(textToInsert);
                }
            }
        },
        toggleSidebar(sidebarName) {
            if (sidebarName === 'data') {
                this.showDataSidebar = !this.showDataSidebar;
                if (this.showDataSidebar) this.showGraphSidebar = false;
            } else if (sidebarName === 'graph') {
                this.showGraphSidebar = !this.showGraphSidebar;
                if (this.showGraphSidebar) this.showDataSidebar = false;
            }
        },
        calculateScale() {
            this.$nextTick(() => {
                if (!this.$refs.editorCol) return;
                const parentEl = this.$refs.editorCol.$el || this.$refs.editorCol;
                // Get usable width minus some padding (e.g., 48px)
                const parentWidth = parentEl.clientWidth - 48;
                // A4 standard width (210mm) in px at 96 PPI
                // A4 standard dimensions at 96 PPI
                const a4WidthPx = 794;
                const a4HeightPx = 1123;

                // Fit-to-Page Auto-Calculate Scale (Height + Width)
                if (!this.isManualZoom) {
                    if (parentWidth > 0) {
                        // Calculate available height: viewport height - approximate header/toolbar heights (e.g. 300px for safety)
                        const availableHeight = window.innerHeight - 300;
                        const scaleW = parentWidth / a4WidthPx;
                        const scaleH = availableHeight / a4HeightPx;

                        // Use the smaller scale to ensure the whole page fits, but min 0.1
                        this.scale = Math.max(0.1, Math.min(1, scaleW, scaleH));
                    } else {
                        this.scale = 1;
                    }
                }

                // Adjust wrapper height to match the scaled A4 height
                // If scale is 1, it's just a4HeightPx
                this.wrapperHeight = (a4HeightPx * this.scale) + 80; // Added more padding for scroll
            });
        },

        changeZoom(delta) {
            this.isManualZoom = true;
            this.scale = Math.min(2, Math.max(0.25, this.scale + delta));
            this.calculateScale(); // recalculate wrapper height
        },
        resetToFit() {
            this.isManualZoom = false;
            this.calculateScale();
        },
        updateDateTime() {
            const now = new Date();
            this.currentDate = now.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            });
            this.currentTime = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    },
    watch: {
        showDataSidebar() { this.calculateScale(); },
        showGraphSidebar() { this.calculateScale(); },
        showSettings() { this.calculateScale(); },
        isPreview() { this.$nextTick(() => this.calculateScale()); }
    },
    computed: {
        computeEditorColSize() {
            let size = 12;
            if (this.showDataSidebar || this.showGraphSidebar) size -= 3;
            if (this.showSettings) size -= 3;
            return size;
        }
    }
}
</script>

<style scoped>
.create-document-container {
    background-color: white;
    height: 100vh;
    overflow-y: auto;
    /* Enable vertical scroll */
    overflow-x: hidden;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

/* top-nav, segmented control, and button styles moved to components */

.editor-zoom-wrapper {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    /* Center the document */
    align-items: flex-start;
    overflow: auto;
    /* Enable scroll if content exceeds space */
    margin-bottom: 24px;
    padding: 40px;
    background-color: white;
    min-height: 500px;

    /* Hide scrollbar for Chrome, Safari and Opera */
    &::-webkit-scrollbar {
        display: none;
    }

    /* Hide scrollbar for IE, Edge and Firefox */
    -ms-overflow-style: none;
    /* IE and Edge */
    scrollbar-width: none;
    /* Firefox */
}

/* A4 editor container (visual + print) */
.document-editor-full {
    transform-origin: top center;
    /* Back to center for perfect auto-fit */
    position: relative;
    box-sizing: border-box;
    background-color: white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    /* Keep size stable */
    /* remove inner scrolling as we scale it */
    overflow: visible;
    resize: none;
    /* prevent CSS resize */
}

@page {
    size: A4;
    margin: 12mm;
}

/* Toolbar Improvements */
.tiptap-toolbar .toolbar-btn {
    background-color: transparent !important;
    border: none !important;
    color: #4b5563 !important;
    box-shadow: none !important;
    font-size: 15px;
    padding: 6px 10px;
}

.tiptap-toolbar .toolbar-btn.active {
    background-color: #f3f4f6 !important;
    color: #4f46e5 !important;
    border-radius: 6px;
}

.tiptap-toolbar .toolbar-btn:hover {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
    border-radius: 6px;
}

.toolbar-divider {
    width: 1px;
    height: 24px;
    background-color: #e5e7eb;
    margin: 0 10px;
}

::v-deep .tiptap-toolbar .toolbar-dropdown .dropdown-toggle {
    background-color: transparent !important;
    border: none !important;
    color: #4b5563 !important;
    font-weight: 500;
    font-size: 14px;
    border-radius: 6px;
    padding: 6px 12px;
    box-shadow: none !important;
}

::v-deep .tiptap-toolbar .toolbar-dropdown .dropdown-toggle:hover {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
}

.document-title-input {
    width: 100%;
    border: 2px solid #111827;
    padding: 10px 15px;
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    outline: none;
    transition: border-color 0.2s;
    border-radius: 6px;
}

.document-title-input:focus {
    border-color: #3b82f6;
}

.document-title-input::placeholder {
    color: #d1d5db;
}

/* TipTap ProseMirror Styling */
::v-deep .ProseMirror {
    width: 100%;
    box-sizing: border-box;
    height: auto;
    /* make editor inner area match A4 inner size (page height minus vertical padding) */
    min-height: calc(297mm - 32mm);
    max-width: 100%;
    outline: none;
    font-size: 16px;
    line-height: 1.6;
    color: #4b5563;
    padding: 0;
    /* padding is handled by .document-editor-full */
    background: transparent;
}

/* Prevent wide content: wrap long words and constrain images to container width */
::v-deep .ProseMirror img {
    max-width: 100%;
    height: auto;
    display: block;
}

::v-deep .ProseMirror {
    word-break: break-word;
    overflow-wrap: break-word;
    white-space: normal;
}

::v-deep .ProseMirror pre,
::v-deep .ProseMirror code {
    white-space: pre-wrap;
}

.preview-mode ::v-deep .ProseMirror p.is-editor-empty:first-child::before {
    display: none;
}

.preview-mode .document-title-input {
    border-color: transparent !important;
    padding: 10px 0;
    pointer-events: none;
}

::v-deep .blue-variable {
    color: #3b82f6 !important;
    font-weight: 600;
    background-color: #eff6ff;
    padding: 0 4px;
    border-radius: 4px;
}

/* Zoom Controls Styles */
.zoom-controls-overlay {
    position: fixed;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 8px 16px;
    border-radius: 50px;
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    z-index: 1000;
    transition: all 0.3s ease;
}

.zoom-btn {
    padding: 4px 8px !important;
    color: #64748b !important;
}

.zoom-btn:hover {
    color: #4f46e5 !important;
    background: #f1f5f9 !important;
}

.zoom-slider-container {
    width: 120px;
    margin: 0 10px;
    display: flex;
    align-items: center;
}

.zoom-slider {
    width: 100%;
    accent-color: #4f46e5;
    cursor: pointer;
}

.zoom-percentage {
    min-width: 45px;
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    text-align: center;
}

.fit-btn {
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #4f46e5 !important;
}

.zoom-controls-overlay .divider {
    width: 1px;
    height: 16px;
    background-color: #e5e7eb;
}
</style>

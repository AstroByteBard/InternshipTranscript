<template>
    <div class="create-document-container">
        <DocumentTopNav v-if="isTemplateReady" :isPreview.sync="isPreview" :showSettings.sync="showSettings"
            :showHistorySidebar="showHistorySidebar" @toggle-history-sidebar="toggleSidebar('history')"
            @cancel="$router.push('/documents')" @save="handleSave" />

        <CModal :show.sync="showTemplateSetupModal" centered :close-on-backdrop="false" :close-on-esc="false"
            :close-button="false" title="Create Template" color="primary" size="lg"
            @update:show="handleTemplateModalVisibility">
            <CCard class="border-0 shadow-none mb-0">
                <CCardBody class="p-3 p-md-4">
                    <p class="text-muted mb-4">
                        Set the template name and language before you start designing the layout.
                    </p>

                    <CForm @submit.prevent="confirmTemplateSetup">
                        <CRow>
                            <CCol md="7">
                                <label class="font-weight-bold text-uppercase text-muted mb-2">Template Name</label>
                                <CInput v-model="templateNameDraft" placeholder="Enter template name" />
                            </CCol>
                            <CCol md="5">
                                <label class="font-weight-bold text-uppercase text-muted mb-2">Template Language</label>
                                <select v-model="templateLocale" class="form-control">
                                    <option value="th">th - ไทย</option>
                                    <option value="en">en - English</option>
                                </select>
                                <small class="text-muted d-block mt-2">Selected: {{ templateLocale }}</small>
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
            </CCard>
            <template #footer-wrapper>
                <div class="d-flex justify-content-end w-100 p-3 px-md-4 pb-md-4 pt-0">
                    <CButton color="light" class="mr-2" @click="cancelTemplateSetup">
                        Cancel
                    </CButton>
                    <CButton color="primary" @click="confirmTemplateSetup">
                        OK
                    </CButton>
                </div>
            </template>
        </CModal>

        <!-- Main Content Area -->
        <CRow v-if="isTemplateReady" class="px-4">
            <!-- Left Sidebar Column (Data Variables) -->
            <CCol md="3" v-if="showDataSidebar || showGraphSidebar">
                <DocumentDataSidebar v-if="showDataSidebar" @insert-variable="insertVariable" />
                <DocumentGraphSidebar v-if="showGraphSidebar" @insert-variable="insertVariable" />
            </CCol>

            <!-- Editor Column -->
            <CCol :md="computeEditorColSize" ref="editorCol">


                <CCard class="toolbar-card mb-3 border-0 shadow-sm" v-show="!isPreview">
                    <CCardBody class="p-3">
                        <EditorToolbar ref="editorToolbar" :konvaEditor="$refs.konvaEditor" :scale="scale"
                            :templateLocale="templateLocale" @image-uploaded="handleToolbarImage"
                            @insert-styled-text="handleStyledText" @bring-forward="callEditorMethod('bringForward')"
                            @bring-to-front="callEditorMethod('bringToFront')"
                            @send-backward="callEditorMethod('sendBackward')"
                            @send-to-back="callEditorMethod('sendToBack')" @toggle-data-sidebar="toggleSidebar('data')"
                            @toggle-graph-sidebar="toggleSidebar('graph')" @format-text="handleFormatText"
                            @action="handleEditorAction" @multi-edit="callEditorMethod('multiEditSelectedNodes')"
                            @zoom-in="changeZoom(0.1)" @zoom-out="changeZoom(-0.1)" @zoom-reset="resetToFit" />
                    </CCardBody>
                </CCard>

                <div class="editor-zoom-wrapper" :style="{ height: wrapperHeight + 'px' }">
                    <div class="document-editor-full" :class="{ 'preview-mode': isPreview }"
                        :style="{ transform: `scale(${scale})` }">
                        <KonvaEditor ref="konvaEditor" :isPreview="isPreview" :templateLocale="templateLocale"
                            @selection-changed="onSelectionChanged" @history-recorded="onHistoryRecorded" />
                    </div>
                </div>
            </CCol>

            <!-- Sidebar Column -->
            <CCol md="3" v-if="showSettings || showHistorySidebar">
                <DocumentSidebar v-if="showSettings" :status.sync="status" :currentDate="currentDate"
                    :currentTime="currentTime" :title.sync="documentName" />
                <HistoryLogSidebar v-else :historyLog="historyLog" @clear="clearHistoryLog" />
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
import HistoryLogSidebar from '../../../components/documents/editor/HistoryLogSidebar.vue'

export default {
    name: 'CreateDocument',
    components: {
        KonvaEditor,
        DocumentTopNav,
        EditorToolbar,
        DocumentSidebar,
        DocumentDataSidebar,
        DocumentGraphSidebar,
        HistoryLogSidebar
    },
    data() {
        return {
            docId: null,
            documentName: 'Untitled Document',
            templateNameDraft: '',
            documentTitle: '',
            templateLocale: 'th',
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
            showHistorySidebar: false,
            showSettings: false,
            showTemplateSetupModal: false,
            templateSetupConfirmed: false,
            historyLog: []
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
        } else {
            this.showTemplateSetupModal = true;
            this.templateNameDraft = '';
            this.templateLocale = 'th';
            this.templateSetupConfirmed = false;
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
                    this.documentName = doc.title;
                    this.templateNameDraft = doc.title || '';
                    this.templateLocale = doc.locale || (doc.content && doc.content.__language) || this.templateLocale || 'th';
                    this.status = doc.status;
                    this.historyLog = [];
                    this.templateSetupConfirmed = true;
                    this.showTemplateSetupModal = false;
                    if (this.$refs.konvaEditor) {
                        this.$refs.konvaEditor.loadFromJSON(doc.content);
                    }
                }
            } catch (err) {
                console.error('Failed to load document', err);
            }
        },
        async handleSave() {
            if (!this.$refs.konvaEditor) {
                console.warn('handleSave: KonvaEditor ref not available');
                window.alert && window.alert('Editor not ready. Please try again.');
                return;
            }

            const content = this.$refs.konvaEditor.saveToJSON();
            if (!content) {
                console.warn('handleSave: saveToJSON returned empty content');
                window.alert && window.alert('Nothing to save (empty document).');
                return;
            }

            // Validate serializability to catch circular refs early
            try {
                JSON.stringify(content);
            } catch (serErr) {
                console.error('handleSave: content not serializable', serErr);
                window.alert && window.alert('Cannot save document: content contains unserializable data. Check console for details.');
                return;
            }

            const payload = {
                title: this.documentName,
                status: this.status,
                locale: this.templateLocale,
                content: content,
            };

            console.log('handleSave: saving document payload', payload);

            try {
                let res;
                if (this.docId) {
                    payload._id = this.docId;
                    res = await this.$api.documents('put', payload);
                } else {
                    res = await this.$api.documents('post', payload);
                    if (res && res.data && res.data.data) {
                        this.docId = res.data.data._id;
                    }
                }

                console.log('handleSave: save response', res && res.data ? res.data : res);
                window.alert && window.alert('Document saved successfully!');
            } catch (err) {
                console.error('handleSave: Failed to save document', err);
                const msg = err && err.response && err.response.data && (err.response.data.message || err.response.data.msg || err.response.data.error)
                    ? (err.response.data.message || err.response.data.msg || err.response.data.error)
                    : (err && err.message ? err.message : 'Unknown error');
                window.alert && window.alert('Failed to save document: ' + msg);
            }
        },
        confirmTemplateSetup() {
            const name = String(this.templateNameDraft || '').trim();
            if (!name) {
                window.alert && window.alert('Template name is required.');
                return;
            }

            this.documentName = name;
            this.templateNameDraft = name;
            this.templateLocale = this.templateLocale || 'th';
            this.templateSetupConfirmed = true;
            this.showTemplateSetupModal = false;
        },
        cancelTemplateSetup() {
            this.showTemplateSetupModal = false;
            this.$router.push('/documents');
        },
        handleTemplateModalVisibility(visible) {
            if (visible) return;
            if (!this.templateSetupConfirmed) {
                this.showTemplateSetupModal = true;
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
        async handleFormatText(payload) {
            if (!this.$refs.konvaEditor) return;
            try {
                const editor = this.$refs.konvaEditor;
                if (payload && payload.type === 'fontFamily' && payload.value && typeof editor.ensureFontLoaded === 'function') {
                    await editor.ensureFontLoaded(payload.value);
                }
                // If a group selection corresponds to competency or suggestion, apply group style
                const nodes = (editor.transformer && typeof editor.transformer.nodes === 'function') ? editor.transformer.nodes() : [];
                if (nodes && nodes.length === 1) {
                    const node = nodes[0];
                    const name = node && node.name ? node.name() : '';
                    const style = {};
                    if (payload.type === 'fontFamily') style.fontFamily = payload.value;
                    else if (payload.type === 'fontSize') style.fontSize = payload.value;
                    else if (payload.type === 'color') style.fill = payload.value;
                    else if (payload.type === 'align') style.align = payload.value;
                    else if (payload.type === 'textDecoration') style.textDecoration = payload.value;
                    else if (payload.type === 'bold' || payload.type === 'italic') {
                        const cur = (node.getAttr && node.getAttr('fontStyle')) || (node.fontStyle ? node.fontStyle() : 'normal') || 'normal';
                        const want = payload.type;
                        // toggle presence
                        let parts = cur.split(/\s+/).filter(Boolean);
                        if (parts.includes(want)) {
                            parts = parts.filter(p => p !== want);
                        } else {
                            parts.push(want);
                        }
                        style.fontStyle = parts.length ? parts.join(' ') : 'normal';
                    } else if (payload.type === 'underline') {
                        const cur = (node.getAttr && node.getAttr('textDecoration')) || (node.textDecoration ? node.textDecoration() : '') || '';
                        style.textDecoration = cur === 'underline' ? '' : 'underline';
                    }
                    if (name && name.includes('competency-table')) {
                        editor.updateCompetencyGroupStyle(node, style);
                        return;
                    }
                    if (name && (name.includes('suggestion-table') || name.includes('suggestion-table-part'))) {
                        editor.updateSuggestionGroupStyle(node, style);
                        return;
                    }
                }

                // Fallback: apply to selected nodes/text
                editor.formatSelectedNodes(payload);
            } catch (err) {
                console.error('handleFormatText error', err);
            }
        },
        onSelectionChanged(info) {
            // info: { count, style }
            try {
                const tb = this.$refs.editorToolbar;
                if (!tb) return;
                if (!info || !info.style) {
                    tb.selectedFont = '';
                    tb.boldActive = false;
                    tb.italicActive = false;
                    tb.underlineActive = false;
                    return;
                }
                const s = info.style || {};
                if (typeof s.fontSize !== 'undefined' && s.fontSize !== null) tb.fontSize = Number(s.fontSize) || tb.fontSize;
                if (typeof s.fontFamily !== 'undefined' && s.fontFamily) tb.selectedFont = s.fontFamily;
                else tb.selectedFont = '';
                if (typeof s.fill !== 'undefined' && s.fill) {
                    const f = String(s.fill || '');
                    if (f.startsWith('rgb')) {
                        // convert rgb(a) to hex
                        const m = f.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
                        if (m) {
                            const r = parseInt(m[1], 10), g = parseInt(m[2], 10), b = parseInt(m[3], 10);
                            tb.hexColor = '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
                        } else {
                            tb.hexColor = f;
                        }
                    } else {
                        tb.hexColor = f;
                    }
                }
                tb.boldActive = !!(s.fontStyle && String(s.fontStyle).includes('bold'));
                tb.italicActive = !!(s.fontStyle && String(s.fontStyle).includes('italic'));
                tb.underlineActive = !!(s.textDecoration && String(s.textDecoration).includes('underline'));
            } catch (err) {
                console.warn('onSelectionChanged error', err);
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
            console.log('CreateDocument.insertVariable called with:', variableStr);
            try {
                if (this.$refs.konvaEditor && typeof this.$refs.konvaEditor.insertVariable === 'function') {
                    this.$refs.konvaEditor.insertVariable(variableStr);
                } else {
                    console.warn('KonvaEditor ref not ready or insertVariable missing', this.$refs.konvaEditor);
                    // Provide user feedback if running in browser
                    if (typeof window !== 'undefined' && window.alert) {
                        window.alert('Editor not ready. Try closing and reopening the Data sidebar, or reload the page.');
                    }
                }
            } catch (err) {
                console.error('Failed to insert variable into KonvaEditor:', err);
                if (typeof window !== 'undefined' && window.alert) {
                    window.alert('Failed to insert variable: ' + (err && err.message ? err.message : String(err)));
                }
            }
        },
        toggleSidebar(sidebarName) {
            if (sidebarName === 'data') {
                this.showDataSidebar = !this.showDataSidebar;
                if (this.showDataSidebar) this.showGraphSidebar = false;
                if (this.showDataSidebar) this.showHistorySidebar = false;
            } else if (sidebarName === 'graph') {
                this.showGraphSidebar = !this.showGraphSidebar;
                if (this.showGraphSidebar) this.showDataSidebar = false;
                if (this.showGraphSidebar) this.showHistorySidebar = false;
            } else if (sidebarName === 'history') {
                this.showHistorySidebar = !this.showHistorySidebar;
                if (this.showHistorySidebar) {
                    this.showDataSidebar = false;
                    this.showGraphSidebar = false;
                }
            }
        },
        onHistoryRecorded(entry) {
            if (!entry) return;
            this.historyLog = [entry, ...this.historyLog].slice(0, 25);
        },
        clearHistoryLog() {
            this.historyLog = [];
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
        showSettings(value) {
            this.calculateScale();
            if (value) this.showHistorySidebar = false;
        },
        showHistorySidebar(value) {
            this.calculateScale();
            if (value) this.showSettings = false;
        },
        isPreview() { this.$nextTick(() => this.calculateScale()); }
    },
    computed: {
        isTemplateReady() {
            return this.templateSetupConfirmed || !!this.docId;
        },
        computeEditorColSize() {
            if (this.showDataSidebar || this.showGraphSidebar) return 6;
            if (this.showSettings || this.showHistorySidebar) return 9;
            return 12;
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
    overflow: visible;
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

/* Keep toolbar visible while scrolling the editor column */
.toolbar-card {
    position: sticky;
    top: 12px;
    z-index: 60;
    background: rgba(255, 255, 255, 0.98);
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

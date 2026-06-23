<template>
    <div class="create-certificate-container">
        <DocumentTopNav v-if="isTemplateReady" :isPreview.sync="isPreview" :showSettings.sync="showSettings"
            :showHistorySidebar="showHistorySidebar" @toggle-history-sidebar="toggleSidebar('history')"
            @cancel="$router.push('/documents/certificate')" @back="$router.push('/documents/certificate')" @save="handleSave" />
        <div v-if="isTemplateReady" class="auto-save-indicator text-right px-4 pb-2">
            <small :class="autoSaveClass">{{ autoSaveText }}</small>
        </div>

        <CModal :show.sync="showTemplateSetupModal" centered :close-on-backdrop="false" :close-on-esc="false"
            :close-button="false" :title="$t('create_certificate_title')" color="primary" size="lg"
            @update:show="handleTemplateModalVisibility">
            <CCard class="border-0 shadow-none mb-0">
                <CCardBody class="p-3 p-md-4">
                    <p class="text-muted mb-4">
                        {{ $t('certificate_setup_instruction') }}
                    </p>

                    <CForm @submit.prevent="confirmTemplateSetup">
                        <CRow>
                            <CCol md="7">
                                <label class="font-weight-bold text-uppercase text-muted mb-2">{{ $t('certificate_name')
                                }}</label>
                                <CInput v-model="templateNameDraft" :placeholder="$t('certificate_name_prompt')" />
                            </CCol>
                            <CCol md="5">
                                <label class="font-weight-bold text-uppercase text-muted mb-2">{{
                                    $t('template_language') }}</label>
                                <select v-model="templateLocale" class="form-control">
                                    <option value="th">th - ไทย</option>
                                    <option value="en">en - English</option>
                                </select>
                                <small class="text-muted d-block mt-2">{{ $t('selected') }}: {{ templateLocale
                                }}</small>
                            </CCol>
                        </CRow>
                    </CForm>
                </CCardBody>
            </CCard>
            <template #footer-wrapper>
                <div class="d-flex justify-content-end w-100 p-3 px-md-4 pb-md-4 pt-0">
                    <CButton color="light" class="mr-2" @click="cancelTemplateSetup">
                        {{ $t('cancel') }}
                    </CButton>
                    <CButton color="primary" @click="confirmTemplateSetup">
                        {{ $t('ok') }}
                    </CButton>
                </div>
            </template>
        </CModal>

        <CRow v-if="isTemplateReady" class="px-4">
            <CCol md="3" v-if="showDataSidebar || showGraphSidebar">
                <DocumentDataSidebar v-if="showDataSidebar" @insert-variable="insertVariable" />
                <DocumentGraphSidebar v-if="showGraphSidebar" @insert-variable="insertVariable" />
            </CCol>

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
                            :pageWidth="pageWidthPx" :pageHeight="pageHeightPx" @selection-changed="onSelectionChanged"
                            @history-recorded="onHistoryRecorded" />
                    </div>
                </div>
            </CCol>

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
    name: 'CreateCertificate',
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
            documentName: 'Untitled Certificate',
            templateNameDraft: '',
            documentTitle: '',
            templateLocale: 'th',
            status: 'Draft',
            currentDate: '',
            currentTime: '',
            timer: null,
            autoSaveTimer: null,
            lastSavedContent: null,
            autoSaveStatus: 'idle',
            isPreview: false,
            scale: 1,
            isManualZoom: false,
            pageWidthPx: 1123,
            pageHeightPx: 794,
            wrapperHeight: 794,
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
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
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
                        this.lastSavedContent = JSON.stringify(doc.content);
                    }
                    this.startAutoSave();
                }
            } catch (err) {
                console.error('Failed to load certificate', err);
            }
        },
        async handleSave() {
            if (!this.$refs.konvaEditor) {
                console.warn('handleSave: KonvaEditor ref not available');
                window.alert && window.alert(this.$t('editor_not_ready'));
                return;
            }

            const content = this.$refs.konvaEditor.saveToJSON();
            if (!content) {
                console.warn('handleSave: saveToJSON returned empty content');
                window.alert && window.alert(this.$t('nothing_to_save'));
                return;
            }

            try {
                JSON.stringify(content);
            } catch (serErr) {
                console.error('handleSave: content not serializable', serErr);
                window.alert && window.alert(this.$t('failed_to_save_document', { message: 'content contains unserializable data. Check console for details.' }));
                return;
            }

            const payload = {
                title: this.documentName,
                type: 'certificate',
                status: this.status,
                locale: this.templateLocale,
                content: content,
            };

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

                this.lastSavedContent = JSON.stringify(content);
                this.autoSaveStatus = 'saved';
                window.alert && window.alert(this.$t('document_saved_successfully'));
                return res;
            } catch (err) {
                console.error('handleSave: Failed to save certificate', err);
                const msg = err && err.response && err.response.data && (err.response.data.message || err.response.data.msg || err.response.data.error)
                    ? (err.response.data.message || err.response.data.msg || err.response.data.error)
                    : (err && err.message ? err.message : 'Unknown error');
                window.alert && window.alert(this.$t('failed_to_save_document', { message: msg }));
            }
        },
        startAutoSave() {
            if (this.autoSaveTimer) {
                clearInterval(this.autoSaveTimer);
            }
            this.autoSaveTimer = setInterval(this.autoSave, 2000);
        },
        async autoSave() {
            if (!this.$refs.konvaEditor) return;

            const content = this.$refs.konvaEditor.saveToJSON();
            if (!content) return;

            let contentStr;
            try {
                contentStr = JSON.stringify(content);
            } catch (e) {
                return;
            }

            if (contentStr === this.lastSavedContent) return;

            this.autoSaveStatus = 'saving';

            const payload = {
                title: this.documentName,
                type: 'certificate',
                status: this.status,
                locale: this.templateLocale,
                content: content,
            };

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
                this.lastSavedContent = contentStr;
                this.autoSaveStatus = 'saved';
                setTimeout(() => { if (this.autoSaveStatus === 'saved') this.autoSaveStatus = 'idle'; }, 2000);
            } catch (err) {
                console.error('Auto-save failed', err);
                this.autoSaveStatus = 'error';
                setTimeout(() => { if (this.autoSaveStatus === 'error') this.autoSaveStatus = 'idle'; }, 5000);
            }
        },
        confirmTemplateSetup() {
            const name = String(this.templateNameDraft || '').trim();
            if (!name) {
                window.alert && window.alert(this.$t('template_name_required'));
                return;
            }

            this.documentName = name;
            this.templateNameDraft = name;
            this.templateLocale = this.templateLocale || 'th';
            this.templateSetupConfirmed = true;
            this.showTemplateSetupModal = false;
            this.$nextTick(() => this.startAutoSave());
        },
        cancelTemplateSetup() {
            this.showTemplateSetupModal = false;
            this.$router.push('/documents/certificate');
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

                editor.formatSelectedNodes(payload);
            } catch (err) {
                console.error('handleFormatText error', err);
            }
        },
        onSelectionChanged(info) {
            try {
                const tb = this.$refs.editorToolbar;
                if (!tb) return;
                if (!info || !info.style) {
                    tb.selectedFont = '';
                    tb.selectedAlign = '';
                    tb.boldActive = false;
                    tb.italicActive = false;
                    tb.underlineActive = false;
                    return;
                }
                const s = info.style || {};
                if (typeof s.fontSize !== 'undefined' && s.fontSize !== null) tb.fontSize = Number(s.fontSize) || tb.fontSize;
                if (typeof s.fontFamily !== 'undefined' && s.fontFamily) tb.selectedFont = s.fontFamily;
                else tb.selectedFont = '';
                tb.selectedAlign = typeof s.align !== 'undefined' && s.align ? s.align : '';
                if (typeof s.fill !== 'undefined' && s.fill) {
                    const f = String(s.fill || '');
                    if (f.startsWith('rgb')) {
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
        },
        callEditorMethod(methodName) {
            if (this.$refs.konvaEditor && typeof this.$refs.konvaEditor[methodName] === 'function') {
                this.$refs.konvaEditor[methodName]()
            }
        },
        insertVariable(variableStr) {
            console.log('CreateCertificate.insertVariable called with:', variableStr);
            try {
                if (this.$refs.konvaEditor && typeof this.$refs.konvaEditor.insertVariable === 'function') {
                    this.$refs.konvaEditor.insertVariable(variableStr);
                } else {
                    console.warn('KonvaEditor ref not ready or insertVariable missing', this.$refs.konvaEditor);
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
                const parentWidth = parentEl.clientWidth - 48;
                const pageWidthPx = this.pageWidthPx;
                const pageHeightPx = this.pageHeightPx;

                if (!this.isManualZoom) {
                    if (parentWidth > 0) {
                        const availableHeight = window.innerHeight - 300;
                        const scaleW = parentWidth / pageWidthPx;
                        const scaleH = availableHeight / pageHeightPx;
                        this.scale = Math.max(0.1, Math.min(1, scaleW, scaleH));
                    } else {
                        this.scale = 1;
                    }
                }

                this.wrapperHeight = (pageHeightPx * this.scale) + 80;
            });
        },
        changeZoom(delta) {
            this.isManualZoom = true;
            this.scale = Math.min(2, Math.max(0.25, this.scale + delta));
            this.calculateScale();
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
        },
        autoSaveText() {
            if (this.autoSaveStatus === 'saving') return 'Saving...';
            if (this.autoSaveStatus === 'saved') return 'Auto-saved';
            if (this.autoSaveStatus === 'error') return 'Auto-save failed';
            return '';
        },
        autoSaveClass() {
            if (this.autoSaveStatus === 'saving') return 'text-info';
            if (this.autoSaveStatus === 'saved') return 'text-success';
            if (this.autoSaveStatus === 'error') return 'text-danger';
            return '';
        }
    }
}
</script>

<style scoped>
.create-certificate-container {
    background-color: white;
    height: 100vh;
    overflow-y: auto;
    overflow-x: hidden;

    &::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
}

.editor-zoom-wrapper {
    width: 100%;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    overflow: visible;
    margin-bottom: 24px;
    padding: 40px;
    background-color: white;
    min-height: 500px;

    &::-webkit-scrollbar {
        display: none;
    }

    -ms-overflow-style: none;
    scrollbar-width: none;
}

.document-editor-full {
    transform-origin: top center;
    position: relative;
    box-sizing: border-box;
    background-color: white;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    flex-shrink: 0;
    overflow: visible;
    resize: none;
}

@page {
    size: A4 landscape;
    margin: 12mm;
}

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

.toolbar-card {
    position: sticky;
    top: 12px;
    z-index: 60;
    background: rgba(255, 255, 255, 0.98);
}

::v-deep .ProseMirror {
    width: 100%;
    box-sizing: border-box;
    height: auto;
    min-height: calc(210mm - 32mm);
    max-width: 100%;
    outline: none;
    font-size: 16px;
    line-height: 1.6;
    color: #4b5563;
    padding: 0;
    background: transparent;
}

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

.auto-save-indicator small {
    font-size: 0.7rem;
    font-weight: 600;
    transition: opacity 0.3s;
}
</style>

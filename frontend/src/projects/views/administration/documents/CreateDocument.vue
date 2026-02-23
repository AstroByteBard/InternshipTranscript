<template>
    <div class="create-document-container">
        <!-- Top Navbar -->
        <CRow class="top-nav m-0 py-3 bg-white border-bottom shadow-sm mb-4 align-items-center">
            <CCol sm="4" class="d-flex align-items-center">
                <CButton variant="ghost" class="btn-back mr-3" @click="$router.push('/documents')">
                    <CIcon name="cil-chevron-left" />
                </CButton>
                <h4 class="mb-0 font-weight-bold">Compose Document</h4>
            </CCol>

            <CCol sm="8" class="d-flex align-items-center justify-content-end">
                <!-- Segmented Control 1: Document / Certification -->
                <div class="custom-segmented-control mr-3">
                    <CButtonGroup class="w-100">
                        <CButton class="segment-btn active">
                            <CIcon name="cil-file" class="mr-2" size="sm" /> Document
                        </CButton>
                        <CButton class="segment-btn disabled-text">
                            <CIcon name="cil-badge" class="mr-2" size="sm" /> Certification
                        </CButton>
                    </CButtonGroup>
                </div>

                <!-- Segmented Control 2: Write / Preview -->
                <div class="custom-segmented-control mr-4">
                    <CButtonGroup class="w-100">
                        <CButton class="segment-btn" :class="{ 'active': !isPreview, 'text-muted': isPreview }"
                            @click="isPreview = false">
                            <CIcon name="cil-pencil" class="mr-2" size="sm" /> Write
                        </CButton>
                        <CButton class="segment-btn" :class="{ 'active': isPreview, 'text-muted': !isPreview }"
                            @click="isPreview = true">
                            <CIcon name="cil-eye" class="mr-2" size="sm" /> Preview
                        </CButton>
                    </CButtonGroup>
                </div>

                <CButton variant="ghost" class="text-muted font-weight-bold mr-3"
                    @click="$router.push('/administration/documents')">
                    Cancel
                </CButton>
                <CButton color="danger" class="btn-save font-weight-bold text-white px-4">
                    <CIcon name="cil-save" class="mr-2" /> Save Document
                </CButton>
            </CCol>
        </CRow>

        <!-- Main Content Area -->
        <CRow class="px-4">
            <!-- Editor Column -->
            <CCol md="9">
                <CCard class="editor-card h-100 border-0 shadow-sm">
                    <CCardBody class="p-5 d-flex flex-column" :class="{ 'preview-mode': isPreview }">
                        <!-- Toolbar -->
                        <div class="tiptap-toolbar d-flex align-items-center mb-4 pb-3 border-bottom flex-wrap"
                            v-if="editor && !isPreview">
                            <!-- Undo/Redo -->
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                @click="editor.chain().focus().undo().run()"
                                :disabled="!editor.can().chain().focus().undo().run()">
                                <CIcon name="cil-action-undo" size="sm" />
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1"
                                @click="editor.chain().focus().redo().run()"
                                :disabled="!editor.can().chain().focus().redo().run()">
                                <CIcon name="cil-action-redo" size="sm" />
                            </CButton>

                            <div class="toolbar-divider"></div>

                            <!-- Typography / Lists -->
                            <CDropdown color="light" class="toolbar-dropdown mr-1" toggler-text="H">
                                <CDropdownItem @click="editor.chain().focus().setParagraph().run()"
                                    :class="{ 'text-primary font-weight-bold': editor.isActive('paragraph') }">Paragraph
                                </CDropdownItem>
                                <CDropdownItem @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                                    :class="{ 'text-primary font-weight-bold': editor.isActive('heading', { level: 1 }) }">
                                    Heading 1</CDropdownItem>
                                <CDropdownItem @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                                    :class="{ 'text-primary font-weight-bold': editor.isActive('heading', { level: 2 }) }">
                                    Heading 2</CDropdownItem>
                                <CDropdownItem @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
                                    :class="{ 'text-primary font-weight-bold': editor.isActive('heading', { level: 3 }) }">
                                    Heading 3</CDropdownItem>
                            </CDropdown>

                            <CDropdown color="light" class="toolbar-dropdown mr-1" toggler-text="List">
                                <CDropdownItem @click="editor.chain().focus().toggleBulletList().run()"
                                    :class="{ 'text-primary font-weight-bold': editor.isActive('bulletList') }">
                                    <CIcon name="cil-list" size="sm" class="mr-2" /> Bullet List
                                </CDropdownItem>
                                <CDropdownItem @click="editor.chain().focus().toggleOrderedList().run()"
                                    :class="{ 'text-primary font-weight-bold': editor.isActive('orderedList') }">
                                    <CIcon name="cil-list-numbered" size="sm" class="mr-2" /> Ordered List
                                </CDropdownItem>
                            </CDropdown>

                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1"
                                :class="{ 'active': editor.isActive('blockquote') }"
                                @click="editor.chain().focus().toggleBlockquote().run()">
                                <CIcon name="cil-double-quote-sans-left" size="sm" />
                            </CButton>

                            <div class="toolbar-divider"></div>

                            <!-- Inline Formatting -->
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive('bold') }"
                                @click="editor.chain().focus().toggleBold().run()">
                                <strong>B</strong>
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                style="font-style: italic;" :class="{ 'active': editor.isActive('italic') }"
                                @click="editor.chain().focus().toggleItalic().run()">
                                <em>I</em>
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive('strike') }"
                                @click="editor.chain().focus().toggleStrike().run()">
                                <del>S</del>
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive('code') }"
                                @click="editor.chain().focus().toggleCode().run()">
                                &lt;/&gt;
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive('underline') }"
                                @click="editor.chain().focus().toggleUnderline().run()">
                                <u>U</u>
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive('highlight') }"
                                @click="editor.chain().focus().toggleHighlight().run()">
                                <CIcon name="cil-color-palette" size="sm" />
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1"
                                :class="{ 'active': editor.isActive('link') }" @click="setLink">
                                <CIcon name="cil-link" size="sm" />
                            </CButton>

                            <div class="toolbar-divider"></div>

                            <!-- Sub/Superscript -->
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive('superscript') }"
                                @click="editor.chain().focus().toggleSuperscript().run()">
                                x²
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1"
                                :class="{ 'active': editor.isActive('subscript') }"
                                @click="editor.chain().focus().toggleSubscript().run()">
                                x₂
                            </CButton>

                            <div class="toolbar-divider"></div>

                            <!-- Alignment -->
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive({ textAlign: 'left' }) }"
                                @click="editor.chain().focus().setTextAlign('left').run()">
                                <CIcon name="cil-align-left" size="sm" />
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive({ textAlign: 'center' }) }"
                                @click="editor.chain().focus().setTextAlign('center').run()">
                                <CIcon name="cil-align-center" size="sm" />
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                                :class="{ 'active': editor.isActive({ textAlign: 'right' }) }"
                                @click="editor.chain().focus().setTextAlign('right').run()">
                                <CIcon name="cil-align-right" size="sm" />
                            </CButton>
                            <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1"
                                :class="{ 'active': editor.isActive({ textAlign: 'justify' }) }"
                                @click="editor.chain().focus().setTextAlign('justify').run()">
                                <CIcon name="cil-justify-center" size="sm" />
                            </CButton>

                            <div class="toolbar-divider"></div>

                            <!-- Post options -->
                            <CDropdown color="light" class="toolbar-dropdown mr-1 border-0" toggler-text="+ Add">
                                <CDropdownItem @click="insertVariable('{StudentName}')">Student Name Variable
                                </CDropdownItem>
                                <CDropdownItem @click="insertVariable('{StudentID}')">Student ID Variable
                                </CDropdownItem>
                                <CDropdownItem @click="insertVariable('{School}')">School Variable</CDropdownItem>
                                <CDropdownItem @click="insertVariable('{Program}')">Program Variable</CDropdownItem>
                                <CDropdownItem @click="insertVariable('{AcademyYear}')">Academy Year Variable
                                </CDropdownItem>
                                <CDropdownItem divider></CDropdownItem>
                                <CDropdownItem @click="$refs.imageUpload.click()">Upload Image</CDropdownItem>
                            </CDropdown>
                            <input type="file" ref="imageUpload" accept="image/*" class="d-none"
                                @change="handleImageUpload">
                        </div>

                        <!-- Title Input -->
                        <div class="mb-4">
                            <input type="text" class="document-title-input" placeholder="Untitled Document"
                                v-model="documentTitle" />
                        </div>

                        <!-- Body Input -->
                        <div class="flex-grow-1 document-body-container">
                            <editor-content :editor="editor" class="h-100" />
                        </div>
                    </CCardBody>
                </CCard>
            </CCol>

            <!-- Sidebar Column -->
            <CCol md="3">
                <div class="sidebar-info p-4 bg-white rounded shadow-sm"
                    style="height: 100%; border: 1px solid #e5e7eb;">
                    <h6 class="sidebar-heading text-muted text-uppercase mb-3 font-weight-bold">Properties</h6>
                    <div class="mb-4">
                        <label class="text-muted small font-weight-bold mb-2">Status</label>
                        <CSelect custom class="status-select" :options="['Draft', 'Published', 'Archived']"
                            :value.sync="status" />
                    </div>

                    <hr class="my-4 border-light" />

                    <h6 class="sidebar-heading text-muted text-uppercase mb-3 font-weight-bold">Info</h6>
                    <div class="info-list text-muted small mb-4">
                        <div class="mb-3 d-flex align-items-center font-weight-bold">
                            <CIcon name="cil-user" class="mr-3" /> Admin User
                        </div>
                        <div class="mb-3 d-flex align-items-center font-weight-bold">
                            <CIcon name="cil-calendar" class="mr-3" /> {{ currentDate }}
                        </div>
                        <div class="mb-3 d-flex align-items-center font-weight-bold">
                            <CIcon name="cil-clock" class="mr-3" /> {{ currentTime }}
                        </div>
                    </div>

                    <hr class="my-4 border-light" />

                    <div class="tip-box p-3 rounded">
                        <div class="d-flex align-items-start font-weight-bold text-primary mb-2"
                            style="font-size: 13px;">
                            <CIcon name="cil-list" size="sm" class="mr-2 mt-1" /> Formatting Tips
                        </div>
                        <p class="small text-primary mb-0" style="line-height: 1.5;">
                            This is a plain text editor. For rich formatting, please use an external tool and attach the
                            file, or wait for our upcoming Markdown update.
                        </p>
                    </div>
                </div>
            </CCol>
        </CRow>
    </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-2'
import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'
import { Decoration, DecorationSet } from '@tiptap/pm/view'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

const VariableHighlight = Extension.create({
    name: 'variableHighlight',

    addProseMirrorPlugins() {
        return [
            new Plugin({
                key: new PluginKey('variableHighlight'),
                state: {
                    init(_, { doc }) {
                        return this.spec.findVariables(doc)
                    },
                    apply(tr, old) {
                        return tr.docChanged ? this.spec.findVariables(tr.doc) : old
                    },
                },
                props: {
                    decorations(state) {
                        return this.getState(state)
                    },
                },
                findVariables(doc) {
                    const decorations = []
                    const regex = /\{[^}]+\}/g

                    doc.descendants((node, pos) => {
                        if (node.isText) {
                            let match
                            while ((match = regex.exec(node.text)) !== null) {
                                decorations.push(
                                    Decoration.inline(pos + match.index, pos + match.index + match[0].length, {
                                        class: 'blue-variable'
                                    })
                                )
                            }
                        }
                    })

                    return DecorationSet.create(doc, decorations)
                },
            }),
        ]
    },
})

export default {
    name: 'CreateDocument',
    components: {
        EditorContent
    },
    data() {
        return {
            documentTitle: '',
            status: 'Draft',
            currentDate: '',
            currentTime: '',
            timer: null,
            editor: null,
            isPreview: false
        }
    },
    watch: {
        isPreview(val) {
            if (this.editor) {
                this.editor.setEditable(!val)
            }
        }
    },
    mounted() {
        this.updateDateTime();
        this.timer = setInterval(this.updateDateTime, 1000);

        this.editor = new Editor({
            content: '<p>Start typing your document content here...</p>',
            extensions: [
                StarterKit,
                Underline,
                Highlight.configure({ multicolor: true }),
                Superscript,
                Subscript,
                Link.configure({ openOnClick: false }),
                TextAlign.configure({ types: ['heading', 'paragraph'] }),
                Image,
                VariableHighlight,
            ],
            onUpdate: () => {
                // To fetch HTML: this.editor.getHTML()
            },
        })
    },
    beforeDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        if (this.editor) {
            this.editor.destroy();
        }
    },
    methods: {
        insertVariable(variableStr) {
            this.editor.chain().focus().insertContent(variableStr).run();
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.editor.chain().focus().setImage({ src: e.target.result }).run();
                event.target.value = ''; // Reset input
            };
            reader.readAsDataURL(file);
        },
        setLink() {
            const previousUrl = this.editor.getAttributes('link').href
            const url = window.prompt('URL', previousUrl)

            if (url === null) {
                return
            }

            if (url === '') {
                this.editor.chain().focus().extendMarkRange('link').unsetLink().run()
                return
            }

            this.editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
        },
        updateDateTime() {
            const now = new Date();
            // Format to exactly MM/DD/YYYY
            this.currentDate = now.toLocaleDateString('en-US', {
                month: 'numeric',
                day: 'numeric',
                year: 'numeric'
            });
            // Format to HH:MM AM/PM
            this.currentTime = now.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });
        }
    }
}
</script>

<style scoped>
.create-document-container {
    background-color: #f9fafb;
}

.top-nav {
    position: sticky;
    top: 0;
    z-index: 1000;
}

.btn-back {
    width: 32px;
    height: 32px;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    color: #6b7280;
}

.btn-back:hover {
    background-color: #f3f4f6;
    color: #111827;
}

/* Segmented Controls */
.custom-segmented-control {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
}

.segment-btn {
    background-color: transparent;
    color: #6b7280;
    border: none;
    padding: 6px 14px;
    font-size: 13px;
    font-weight: 600;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    box-shadow: none;
    display: flex;
    align-items: center;
}

.segment-btn:hover:not(.active) {
    color: #374151;
}

.segment-btn.active {
    background-color: #ffffff !important;
    color: #111827 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.disabled-text {
    opacity: 0.5;
}

.btn-save {
    background-color: #dc2626 !important;
    border-color: #dc2626 !important;
}

.btn-save:hover {
    background-color: #b91c1c !important;
    border-color: #b91c1c !important;
}

/* Editor Card (A4 format) */
.editor-card {
    min-height: 1123px;
    border-radius: 8px;
    border: 1px solid #e5e7eb !important;
    background-color: white;
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

.document-body-container {
    padding: 15px;
    border-radius: 6px;
    height: 100%;
}

/* TipTap ProseMirror Styling */
::v-deep .ProseMirror {
    height: 100%;
    min-height: 800px;
    outline: none;
    font-size: 16px;
    line-height: 1.6;
    color: #4b5563;
}

::v-deep .ProseMirror p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    float: left;
    color: #9ca3af;
    pointer-events: none;
    height: 0;
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

.document-body-input:focus,
.document-body-input:hover {
    border-color: #e5e7eb;
}

.document-body-input::placeholder {
    color: #9ca3af;
}

/* Sidebar */
.sidebar-heading {
    font-size: 11px;
    letter-spacing: 0.05em;
    margin-bottom: 20px !important;
}

.status-select {
    background-color: #f3f4f6;
    border-color: #f3f4f6;
    font-weight: 600;
    color: #374151;
    border-radius: 6px;
}

.status-select:focus {
    background-color: #ffffff;
    border-color: #d1d5db;
    box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

.tip-box {
    background-color: #eff6ff !important;
    border: 1px solid #dbeafe;
}
</style>

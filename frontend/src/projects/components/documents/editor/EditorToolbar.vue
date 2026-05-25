<template>
    <div class="tiptap-toolbar d-flex align-items-center mb-4 pb-3 border-bottom flex-wrap">
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0" @click="handleAction('undo')"
            :disabled="!canUndo()">
            <CIcon name="cil-action-undo" size="sm" />
        </CButton>
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1" @click="handleAction('redo')"
            :disabled="!canRedo()">
            <CIcon name="cil-action-redo" size="sm" />
        </CButton>

        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0" title="Zoom Out" @click="$emit('zoom-out')">
            <CIcon name="cil-zoom-out" size="sm" />
        </CButton>
        <span class="zoom-percentage-text px-1 font-weight-bold"
            style="font-size: 11px; min-width: 36px; text-align: center; display: inline-block; color: #4b5563; user-select: none; cursor: pointer;"
            title="Double click to Fit" @dblclick="$emit('zoom-reset')">
            {{ Math.round(scale * 100) }}%
        </span>
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1" title="Zoom In"
            @click="$emit('zoom-in')">
            <CIcon name="cil-zoom-in" size="sm" />
        </CButton>

        <div class="toolbar-divider"></div>

        <!-- Font Family Picker -->
        <div class="font-family-picker mr-1">
            <select class="font-select" v-model="selectedFont" @change="handleFontFamily($event)">
                <option value="" disabled hidden></option>
                <option v-for="f in fontList" :key="f.value" :value="f.value" :style="{ fontFamily: f.value }">
                    {{ f.label }}
                </option>
            </select>
        </div>

        <!-- Font Size Stepper -->
        <div class="font-size-stepper mr-1">
            <button class="size-btn" @click="changeFontSize(-1)" title="Decrease font size">−</button>
            <input type="number" class="size-input text-center font-weight-bold" :value="fontSize"
                @input="handleFontSizeInput" @change="handleFontSizeChange" @blur="handleFontSizeChange"
                @keydown.enter="handleFontSizeEnter"
                style="width: 32px; border: none; padding: 0; font-size: 12px; height: 26px; outline: none; margin: 0; background: transparent; text-align: center; font-weight: 600; color: #374151;" />
            <button class="size-btn" @click="changeFontSize(1)" title="Increase font size">+</button>
        </div>

        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1" title="Edit selected"
            @click="$emit('multi-edit')">
            <CIcon name="cil-pencil" size="sm" />
        </CButton>

        <div class="toolbar-divider"></div>

        <CDropdown color="light" class="toolbar-dropdown mr-1" :toggler-text="headingDropdownLabel">
            <CDropdownItem v-for="item in headingDropdownItems" :key="item.value"
                @click="$emit('insert-styled-text', item.value)">
                {{ item.label }}
            </CDropdownItem>
        </CDropdown>

        <CDropdown color="light" class="toolbar-dropdown mr-1" :toggler-text="listDropdownLabel">
            <CDropdownItem @click="handleAction('toggleBulletList')"
                :class="{ 'text-primary font-weight-bold': isActive('bulletList') }">
                <CIcon name="cil-list" size="sm" class="mr-2" /> {{ bulletListLabel }}
            </CDropdownItem>
            <CDropdownItem @click="handleAction('toggleOrderedList')"
                :class="{ 'text-primary font-weight-bold': isActive('orderedList') }">
                <CIcon name="cil-list-numbered" size="sm" class="mr-2" /> {{ orderedListLabel }}
            </CDropdownItem>
        </CDropdown>



        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
            :class="{ 'active': (boldActive || isActive('bold')) }" @click="handleFormat('bold')">
            <strong>B</strong>
        </CButton>
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0" style="font-style: italic;"
            :class="{ 'active': (italicActive || isActive('italic')) }" @click="handleFormat('italic')">
            <em>I</em>
        </CButton>
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
            :class="{ 'active': (underlineActive || isActive('underline')) }" @click="handleFormat('underline')">
            <u>U</u>
        </CButton>

        <CDropdown color="light" class="toolbar-dropdown mr-1" placement="bottom-start">
            <template #toggler>
                <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
                    :class="{ 'active': isActive('highlight') }">
                    <CIcon name="cil-color-palette" size="sm" />
                </CButton>
            </template>
            <div class="p-2" style="width:180px">
                <input type="color" v-model="hexColor" @input="handleFormat('color', hexColor)">
                <div class="mt-2 text-center">
                    {{ hexColor }}
                </div>
            </div>
        </CDropdown>

        <div class="toolbar-divider"></div>

        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
            :class="{ 'active': selectedAlign === 'left' }" @click="handleFormat('align', 'left')">
            <CIcon name="cil-align-left" size="sm" />
        </CButton>
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
            :class="{ 'active': selectedAlign === 'center' }" @click="handleFormat('align', 'center')">
            <CIcon name="cil-align-center" size="sm" />
        </CButton>
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0"
            :class="{ 'active': selectedAlign === 'right' }" @click="handleFormat('align', 'right')">
            <CIcon name="cil-align-right" size="sm" />
        </CButton>
        <CButton color="light" size="sm" class="toolbar-btn px-2 border-0 mr-1"
            :class="{ 'active': selectedAlign === 'justify' }" @click="handleFormat('align', 'justify')">
            <CIcon name="cil-justify-center" size="sm" />
        </CButton>

        <div class="toolbar-divider"></div>

        <CDropdown color="light" class="toolbar-dropdown mr-1 border-0" toggler-text="Layer">
            <CDropdownItem @click="$emit('bring-forward')">
                <div class="d-flex justify-content-between align-items-center w-100" style="min-width: 180px;">
                    <span>
                        <CIcon name="cil-level-up" class="mr-2" />Bring forward
                    </span>
                    <span class="text-muted ml-3" style="font-size: 12px;">Ctrl+]</span>
                </div>
            </CDropdownItem>
            <CDropdownItem @click="$emit('bring-to-front')">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <span>
                        <CIcon name="cil-arrow-thick-to-top" class="mr-2" />Bring to front
                    </span>
                    <span class="text-muted ml-3" style="font-size: 12px;">Ctrl+Alt+]</span>
                </div>
            </CDropdownItem>
            <CDropdownItem divider></CDropdownItem>
            <CDropdownItem @click="$emit('send-backward')">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <span>
                        <CIcon name="cil-level-down" class="mr-2" />Send backward
                    </span>
                    <span class="text-muted ml-3" style="font-size: 12px;">Ctrl+[</span>
                </div>
            </CDropdownItem>
            <CDropdownItem @click="$emit('send-to-back')">
                <div class="d-flex justify-content-between align-items-center w-100">
                    <span>
                        <CIcon name="cil-arrow-thick-to-bottom" class="mr-2" />Send to back
                    </span>
                    <span class="text-muted ml-3" style="font-size: 12px;">Ctrl+Alt+[</span>
                </div>
            </CDropdownItem>
        </CDropdown>

        <div class="toolbar-divider"></div>

        <CDropdown color="light" class="toolbar-dropdown mr-1 border-0" toggler-text="+ Add">
            <CDropdownItem @click="$emit('toggle-data-sidebar')">
                <CIcon name="cil-code" class="mr-2" />Data Variable
            </CDropdownItem>
            <CDropdownItem @click="$emit('toggle-graph-sidebar')">
                <CIcon name="cil-chart-pie" class="mr-2" />Graph (Chart)
            </CDropdownItem>
            <CDropdownDivider />
            <CDropdownItem @click="triggerFileInput">
                <CIcon name="cil-image1" class="mr-2" />Image (Upload)
            </CDropdownItem>
        </CDropdown>
        <input type="file" ref="imageUpload" accept="image/*" class="d-none" @change="handleImageUpload">
    </div>
</template>

<script>
const EN_FONT_OPTIONS = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Poppins',
    'Montserrat',
    'Nunito',
    'Merriweather',
    'Playfair Display',
    'Source Sans 3',
]

const TH_FONT_OPTIONS = [
    'Sarabun',
    'Prompt',
    'Kanit',
    'Noto Sans Thai',
    'IBM Plex Sans Thai',
    'Mali',
    'Mitr',
    'Pridi',
    'KoHo',
    'Chakra Petch',
]

export default {
    name: 'EditorToolbar',
    props: {
        editor: { type: Object, required: false },
        konvaEditor: { type: Object, required: false },
        scale: { type: Number, default: 1 },
        templateLocale: { type: String, default: 'th' }
    },
    data() {
        return {
            hexColor: "#000000",
            fontSize: 16,
            tempFontSize: null,
            selectedFont: '',
            selectedAlign: '',
            boldActive: false,
            italicActive: false,
            underlineActive: false,
        }
    },
    computed: {
        localeIsThai() {
            return String(this.templateLocale || 'th').toLowerCase().startsWith('th')
        },
        headingDropdownLabel() {
            return 'H'
        },
        listDropdownLabel() {
            return 'List'
        },
        headingDropdownItems() {
            return [
                { label: 'Heading 1', value: 'h1' },
                { label: 'Heading 2', value: 'h2' },
                { label: 'Heading 3', value: 'h3' },
                { label: 'Paragraph', value: 'paragraph' },
            ]
        },
        bulletListLabel() {
            return 'Bullet List'
        },
        orderedListLabel() {
            return 'Ordered List'
        },
        alignLabel() {
            return this.selectedAlign || '-'
        },
        localeFont() {
            return this.localeIsThai ? 'Noto Sans Thai' : 'Source Sans 3'
        },
        fontList() {
            const fonts = this.localeIsThai ? TH_FONT_OPTIONS : EN_FONT_OPTIONS

            return fonts.map((fontName) => ({
                label: fontName,
                value: fontName,
            }))
        }
    },
    watch: {
        templateLocale: {
            immediate: true,
            handler() {
                this.selectedFont = ''
                this.selectedAlign = ''
            }
        }
    },
    methods: {
        isActive(name, opts) {
            if (!this.editor || !this.editor.isActive) return false
            try {
                return this.editor.isActive(name, opts)
            } catch (e) {
                return false
            }
        },
        canUndo() {
            if (this.editor && this.editor.can) {
                try {
                    return this.editor.can().chain().focus().undo().run()
                } catch (e) {
                    return false
                }
            } else if (this.konvaEditor) {
                // For Konva Editor
                return this.konvaEditor.historyIndex > 0
            }
            return false
        },
        canRedo() {
            if (this.editor && this.editor.can) {
                try {
                    return this.editor.can().chain().focus().redo().run()
                } catch (e) {
                    return false
                }
            } else if (this.konvaEditor) {
                // For Konva Editor
                return this.konvaEditor.historyIndex < this.konvaEditor.history.length - 1
            }
            return false
        },
        handleFormat(type, value) {
            if (type === 'align') {
                this.selectedAlign = value;
            }
            if (this.editor && this.editor.chain) {
                const chain = this.editor.chain().focus();
                if (type === 'bold') chain.toggleBold().run();
                else if (type === 'italic') chain.toggleItalic().run();
                else if (type === 'underline') chain.toggleUnderline().run();
                else if (type === 'color') chain.setColor(value).run();
                else if (type === 'align') chain.setTextAlign(value).run();
            } else {
                // For Konva
                this.$emit('format-text', { type, value });
            }
        },
        handleAction(action) {
            if (this.editor && this.editor.chain) {
                const chain = this.editor.chain().focus();
                if (action === 'undo') chain.undo().run();
                else if (action === 'redo') chain.redo().run();
                else if (action === 'toggleBulletList') chain.toggleBulletList().run();
                else if (action === 'toggleOrderedList') chain.toggleOrderedList().run();
            } else if (this.konvaEditor) {
                // For Konva Editor
                if (action === 'undo') this.konvaEditor.undo();
                else if (action === 'redo') this.konvaEditor.redo();
                else this.$emit('action', action);
            } else {
                this.$emit('action', action);
            }
        },
        handleFontFamily(event) {
            const value = event && event.target ? event.target.value : this.selectedFont;
            this.selectedFont = value;
            this.$emit('format-text', { type: 'fontFamily', value });
        },
        changeFontSize(delta) {
            const min = 6;
            const max = 120;
            this.fontSize = Math.min(max, Math.max(min, this.fontSize + delta));
            this.$emit('format-text', { type: 'fontSize', value: this.fontSize });
        },
        handleFontSizeInput(e) {
            this.tempFontSize = e.target.value;
        },
        handleFontSizeChange(e) {
            this.commitFontSize(e.target.value);
        },
        handleFontSizeEnter(e) {
            this.commitFontSize(e.target.value);
            e.target.blur();
        },
        commitFontSize(inputValue) {
            if (inputValue === '' || inputValue === null || isNaN(inputValue)) {
                return;
            }
            const min = 6;
            const max = 120;
            const parsed = Number(inputValue);
            this.fontSize = Math.min(max, Math.max(min, parsed));
            this.$emit('format-text', { type: 'fontSize', value: this.fontSize });
            this.tempFontSize = null;
        },
        triggerFileInput() {
            this.$refs.imageUpload.click()
        },
        handleImageUpload(event) {
            const file = event.target.files[0]
            if (!file) return
            const reader = new FileReader()
            reader.onload = (e) => {
                this.$emit('image-uploaded', e.target.result)
                event.target.value = ''
            }
            reader.readAsDataURL(file)
        },
    }
}
</script>

<style scoped>
.tiptap-toolbar .toolbar-btn {
    background-color: transparent !important;
    border: none !important;
    color: #4b5563 !important;
    box-shadow: none !important;
    font-size: 11px;
    padding: 3px 6px;
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
    height: 18px;
    background-color: #e5e7eb;
    margin: 0 6px;
}

::v-deep .tiptap-toolbar .toolbar-dropdown .dropdown-toggle {
    background-color: transparent !important;
    border: none !important;
    color: #4b5563 !important;
    font-weight: 500;
    font-size: 11px;
    border-radius: 4px;
    padding: 4px 8px;
    box-shadow: none !important;
}

::v-deep .tiptap-toolbar .toolbar-dropdown .dropdown-toggle:hover {
    background-color: #f3f4f6 !important;
    color: #111827 !important;
}

/* Font Family Picker */
.font-family-picker {
    display: flex;
    align-items: center;
}

.font-select {
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 3px 6px;
    font-size: 12px;
    color: #374151;
    background: white;
    cursor: pointer;
    height: 28px;
    min-width: 110px;
    max-width: 140px;
    outline: none;
    appearance: none;
    -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%236b7280'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 6px center;
    padding-right: 20px;
}

.font-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
}

/* Font Size Stepper */
.font-size-stepper {
    display: flex;
    align-items: center;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    overflow: hidden;
    height: 28px;
    background: white;
}

.size-btn {
    background: transparent;
    border: none;
    width: 22px;
    height: 28px;
    font-size: 14px;
    color: #6b7280;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    padding: 0;
    transition: background 0.15s;
}

.size-btn:hover {
    background: #f3f4f6;
    color: #111827;
}

.size-value {
    min-width: 30px;
    text-align: center;
    font-size: 12px;
    font-weight: 600;
    color: #374151;
    user-select: none;
}

/* Hide number input spinners */
.size-input::-webkit-outer-spin-button,
.size-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

.size-input {
    -moz-appearance: textfield;
    appearance: textfield;
}
</style>

<template>
    <div class="konva-editor-root">
        <div ref="stageContainer" class="konva-stage-container"></div>
    </div>
</template>

<script>
import Konva from 'konva'
import computeSelectionStyle from './KonvaEditor/computeSelectionStyle'
import emitSelectionChange from './KonvaEditor/emitSelectionChange'
import multiEditSelectedNodes from './KonvaEditor/multiEditSelectedNodes'
import handleNodeSelection from './KonvaEditor/handleNodeSelection'
import updateSelectionHighlights from './KonvaEditor/updateSelectionHighlights'

import bakeNodeScale from './KonvaEditor/bakeNodeScale'
import bakeGroup from './KonvaEditor/bakeGroup'

import computeNodeRect from './KonvaEditor/computeNodeRect'
import showAlignmentGuides from './KonvaEditor/showAlignmentGuides'
import clearAlignmentGuides from './KonvaEditor/clearAlignmentGuides'
import drawVerticalGuideLine from './KonvaEditor/drawVerticalGuideLine'
import drawHorizontalGuideLine from './KonvaEditor/drawHorizontalGuideLine'

import getCaretIndexFromPointer from './KonvaEditor/getCaretIndexFromPointer'
import updateCaretPosition from './KonvaEditor/updateCaretPosition'
import startEditingText from './KonvaEditor/startEditingText'
import startInlineEditing from './KonvaEditor/startInlineEditing'
import endInlineEditing from './KonvaEditor/endInlineEditing'

import measureTextWidth from './KonvaEditor/measureTextWidth'
import mmToPx from './KonvaEditor/mmToPx'
import createStage from './KonvaEditor/createStage'
import onResize from './KonvaEditor/onResize'
import applyTextStyle from './KonvaEditor/applyTextStyle'
import updateCompetencyGroupStyle from './KonvaEditor/updateCompetencyGroupStyle'
import updateSuggestionGroupStyle from './KonvaEditor/updateSuggestionGroupStyle'
import applySavedAttrs from './KonvaEditor/applySavedAttrs'
import assignCreationOrder from './KonvaEditor/assignCreationOrder'
import addImage from './KonvaEditor/addImage'
import addTextBlock from './KonvaEditor/addTextBlock'
import addCompetencyTable from './KonvaEditor/addCompetencyTable'
import addSuggestionTable from './KonvaEditor/addSuggestionTable'
import addSuggestionColumn from './KonvaEditor/addSuggestionColumn'
import relayoutSuggestionColumn from './KonvaEditor/relayoutSuggestionColumn'
import updateSuggestionPlaceholderForGroup from './KonvaEditor/updateSuggestionPlaceholderForGroup'
import addImagePlaceholder from './KonvaEditor/addImagePlaceholder'
import addGraphPlaceholder from './KonvaEditor/addGraphPlaceholder'
import drawRoundRect from './KonvaEditor/drawRoundRect'
import onKeyDown from './KonvaEditor/onKeyDown'
import addStyledTextBlock from './KonvaEditor/addStyledTextBlock'
import clear from './KonvaEditor/clear'
import bringForward from './KonvaEditor/bringForward'
import bringToFront from './KonvaEditor/bringToFront'
import sendBackward from './KonvaEditor/sendBackward'
import sendToBack from './KonvaEditor/sendToBack'
import toDataURL from './KonvaEditor/toDataURL'
import formatSelectedNodes from './KonvaEditor/formatSelectedNodes'
import applyFormatToTextNode from './KonvaEditor/applyFormatToTextNode'
import saveHistory from './KonvaEditor/saveHistory'
import undo from './KonvaEditor/undo'
import redo from './KonvaEditor/redo'
import insertVariable from './KonvaEditor/insertVariable'
import saveToJSON from './KonvaEditor/saveToJSON'
import loadFromJSON from './KonvaEditor/loadFromJSON'
import fetchTemplateData from './KonvaEditor/fetchTemplateData'
import getStoreList from './KonvaEditor/getStoreList'
import pickFirst from './KonvaEditor/pickFirst'
import pickSpecificByProgram from './KonvaEditor/pickSpecificByProgram'
import getProgramTitleEn from './KonvaEditor/getProgramTitleEn'
import normalizeText from './KonvaEditor/normalizeText'
import getLocalizedValue from './KonvaEditor/getLocalizedValue'
import extractSoftskillLabels from './KonvaEditor/extractSoftskillLabels'
import extractHardskillLabels from './KonvaEditor/extractHardskillLabels'
import extractSuggestionLabels from './KonvaEditor/extractSuggestionLabels'
import getGeneralCompetencyLabels from './KonvaEditor/getGeneralCompetencyLabels'
import getSpecificCompetencyLabels from './KonvaEditor/getSpecificCompetencyLabels'
import getSpecificCompetencyPlaceholders from './KonvaEditor/getSpecificCompetencyPlaceholders'
import getSuggestionLabels from './KonvaEditor/getSuggestionLabels'
import buildSuggestionPlaceholder from './KonvaEditor/buildSuggestionPlaceholder'
import fetchExampleData from './KonvaEditor/fetchExampleData'
import showSuggestionPicker from './KonvaEditor/showSuggestionPicker'
import toggleBulletList from './KonvaEditor/toggleBulletList'
import toggleOrderedList from './KonvaEditor/toggleOrderedList'
import enableManualDataVariableLinking, { renderManualDataVariableConnectors, clearManualDataVariableLinkPreview } from './KonvaEditor/manualDataVariableLinks'

export default {
    name: 'KonvaEditor',
    props: {
        isPreview: { type: Boolean, default: false },
        templateLocale: { type: String, default: 'th' }
    },
    data() {
        return {
            stage: null,
            layer: null,
            transformer: null,
            // inline editing (no DOM overlay)
            inlineEditMode: true,
            editingNode: null,
            caret: null,
            caretInterval: null,
            caretIndex: 0,
            creationSeq: 0,
            history: [],
            historyIndex: -1,
            _historySnapshot: null,
            isApplyingHistory: false,
            isLoading: false,
            historyLog: [],
            generalCompetencyLabels: [],
            generalCompetencyDocName: '',
            specificCompetencyLabels: [],
            suggestionLabels: [],
            suggestionCharCount: 38,
            // snapping/guides
            snapToGuides: true,
            snapThreshold: 6,
            // multiplier controlling how strongly font sizes follow visual scale
            // 1 = direct proportional (fontSize *= scale), 0.5 = softer, 2 = stronger
            fontScaleMultiplier: 1,
            // Example data from database
            exampleData: {
                studentName: 'Name',
                studentID: 'Student ID',
                school: 'School',
                program: 'Major',
                academyYear: new Date().getFullYear().toString(),
                competencies: {
                    programWithMostCompetencies: 'Major',
                    competenciesCount: 0,
                    competenciesList: []
                }
            }
        }
    },
    async mounted() {
        this.createStage()
        if (typeof this.ensureFontLoaded === 'function') {
            await this.ensureFontLoaded(this.templateLocale === 'th' ? 'Noto Sans Thai' : 'Source Sans 3')
        }
        await this.fetchExampleData()
    },
    watch: {
        templateLocale() {
            this.fetchExampleData()
            // If currently in preview, refresh displayed linked variable texts
            this.$nextTick(() => {
                if (this.isPreview) this.updateLinkedVariableDisplay(true)
            })
        },
        isPreview(newVal) {
            // When entering or leaving preview, update linked variable displays
            this.$nextTick(() => this.updateLinkedVariableDisplay(Boolean(newVal)))
        }
    },
    beforeDestroy() {
        // Clean up keydown listener
        if (this._onKeyDownHandler) {
            document.removeEventListener('keydown', this._onKeyDownHandler)
        }
    },
    methods: {
        async ensureFontLoaded(fontFamily) {
            const family = String(fontFamily || '').trim()
            if (!family || typeof document === 'undefined' || !document.fonts) return
            try {
                await document.fonts.load(`16px "${family}"`)
                await document.fonts.ready
            } catch (err) { /* ignore font-loading failures */ }
        },
        computeSelectionStyle,
        emitSelectionChange,
        multiEditSelectedNodes,
        handleNodeSelection,
        updateSelectionHighlights,

        bakeNodeScale,
        bakeGroup,

        computeNodeRect,
        showAlignmentGuides,
        clearAlignmentGuides,
        drawVerticalGuideLine,
        drawHorizontalGuideLine,

        getCaretIndexFromPointer,
        updateCaretPosition,
        startEditingText,
        startInlineEditing,
        endInlineEditing,

        measureTextWidth,
        mmToPx,

        createStage,
        onResize,

        applyTextStyle,
        updateCompetencyGroupStyle,
        updateSuggestionGroupStyle,
        applySavedAttrs,
        assignCreationOrder,

        addImage,
        addTextBlock,
        addCompetencyTable,
        addSuggestionTable,
        addSuggestionColumn,
        relayoutSuggestionColumn,
        updateSuggestionPlaceholderForGroup,

        addImagePlaceholder,
        addGraphPlaceholder,
        drawRoundRect,
        onKeyDown,
        addStyledTextBlock,

        clear,
        bringForward,
        bringToFront,
        sendBackward,
        sendToBack,

        toDataURL,
        formatSelectedNodes,
        applyFormatToTextNode,

        saveHistory,
        undo,
        redo,

        insertVariable,
        saveToJSON,
        loadFromJSON,

        fetchTemplateData,
        getStoreList,
        pickFirst,
        pickSpecificByProgram,
        getProgramTitleEn,
        normalizeText,
        getLocalizedValue,
        extractSoftskillLabels,
        extractHardskillLabels,
        extractSuggestionLabels,
        getGeneralCompetencyLabels,
        getSpecificCompetencyLabels,
        getSpecificCompetencyPlaceholders,
        getSuggestionLabels,
        buildSuggestionPlaceholder,
        fetchExampleData,
        showSuggestionPicker,
        toggleBulletList,
        toggleOrderedList,
        enableManualDataVariableLinking,
        renderManualDataVariableConnectors,
        clearManualDataVariableLinkPreview,

        updateLinkedVariableDisplay(showPreview = false) {
            if (!this.layer || typeof this.layer.getChildren !== 'function') return

            const locale = String(this.templateLocale || 'th').toLowerCase()
            const isThai = locale.startsWith('th')

            const mapping = {
                // Strict language selection: only use Th or En specific fields.
                '{StudentName}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.studentNameTh ? this.exampleData.studentNameTh : '') : (this.exampleData && this.exampleData.studentNameEn ? this.exampleData.studentNameEn : ''),
                '{StudentID}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.studentIDTh ? this.exampleData.studentIDTh : '') : (this.exampleData && this.exampleData.studentIDEn ? this.exampleData.studentIDEn : ''),
                '{School}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.schoolTh ? this.exampleData.schoolTh : '') : (this.exampleData && this.exampleData.schoolEn ? this.exampleData.schoolEn : ''),
                '{Program}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.programTh ? this.exampleData.programTh : '') : (this.exampleData && this.exampleData.programEn ? this.exampleData.programEn : ''),
                '{AcademyYear}': (locale.startsWith('th')) ? (this.exampleData && this.exampleData.academyYearTh ? this.exampleData.academyYearTh : '') : (this.exampleData && this.exampleData.academyYearEn ? this.exampleData.academyYearEn : '')
            }

            // iterate text nodes and update those with variableName attr
            this.layer.getChildren().forEach((node) => {
                try {
                    if (!node || typeof node.getClassName !== 'function' || node.getClassName() !== 'Text') return
                    const variableName = node.getAttr && node.getAttr('variableName')
                    if (!variableName) return

                    if (showPreview) {
                        // store original text so we can revert later
                        if (!node.getAttr('originalText')) node.setAttr('originalText', (typeof node.text === 'function') ? node.text() : (node.text || ''))
                        // Select language-specific mapping only; do not fall back to originalText (which may be in the other language).
                        const getMappingValue = (k) => (k && Object.prototype.hasOwnProperty.call(mapping, k) && mapping[k] !== '') ? mapping[k] : ''
                        const newText = getMappingValue(variableName) || getMappingValue(node.getAttr('placeholder')) || ''
                        if (typeof node.text === 'function') node.text(newText)
                        else node.setAttr('text', newText)
                    } else {
                        // revert to original
                        const orig = node.getAttr && node.getAttr('originalText')
                        if (typeof orig !== 'undefined' && orig !== null) {
                            if (typeof node.text === 'function') node.text(orig)
                            else node.setAttr('text', orig)
                            node.setAttr('originalText', null)
                        }
                    }
                } catch (err) { /* ignore individual node errors */ }
            })

            if (typeof this.layer.batchDraw === 'function') this.layer.batchDraw()
        }
    }
}
</script>

<style scoped>
.konva-stage-container {
    width: 100%;
    height: 100%;
}

.konva-editor-root {
    width: 100%;
    height: 100%;
    position: relative;
}
</style>
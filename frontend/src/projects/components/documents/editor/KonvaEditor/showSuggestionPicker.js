export default async function showSuggestionPicker() {
    return new Promise((resolve) => {
        try {
            const locale = String(this.templateLocale || (this.$i18n && this.$i18n.locale) || 'th').toLowerCase();
            const isThai = locale.startsWith('th');
            // remove existing overlay if present
            const existing = document.querySelector('.suggestion-picker-overlay');
            if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

            const overlay = document.createElement('div');
            overlay.className = 'suggestion-picker-overlay';
            overlay.style.position = 'fixed';
            overlay.style.left = '0';
            overlay.style.top = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.background = 'rgba(0,0,0,0.45)';
            overlay.style.display = 'flex';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.zIndex = '999999';

            const modal = document.createElement('div');
            modal.className = 'suggestion-picker-modal';
            modal.style.background = '#ffffff';
            modal.style.padding = '16px';
            modal.style.borderRadius = '8px';
            modal.style.minWidth = '360px';
            modal.style.maxWidth = '90%';
            modal.style.boxShadow = '0 8px 28px rgba(0,0,0,0.25)';

            const title = document.createElement('div');
            title.style.fontSize = '16px';
            title.style.fontWeight = '600';
            title.style.marginBottom = '10px';
            title.textContent = isThai ? 'เลือกหัวข้อสำหรับสองคอลัมน์ (ซ้าย / ขวา)' : 'Choose labels for the two columns (left / right)';
            modal.appendChild(title);

            const form = document.createElement('div');
            form.style.display = 'grid';
            form.style.gridTemplateColumns = '1fr 1fr';
            form.style.gap = '10px';

            // If there are suggestion documents in the store, show selectors
            const suggestionDocs = (this.getStoreList && typeof this.getStoreList === 'function')
                ? this.getStoreList('competencies/proposition/proposition') : [];
            if (Array.isArray(suggestionDocs) && suggestionDocs.length) {
                const docsRow = document.createElement('div');
                docsRow.style.display = 'grid';
                docsRow.style.gridTemplateColumns = '1fr 1fr';
                docsRow.style.gap = '10px';
                docsRow.style.marginBottom = '8px';

                const makeSelect = (side) => {
                    const wrap = document.createElement('div');
                    const lbl = document.createElement('div');
                    lbl.style.fontSize = '13px';
                    lbl.style.marginBottom = '6px';
                    lbl.textContent = side === 'left' ? (isThai ? 'เลือกเอกสารสำหรับคอลัมน์ซ้าย' : 'Choose a document for the left column') : (isThai ? 'เลือกเอกสารสำหรับคอลัมน์ขวา' : 'Choose a document for the right column');
                    wrap.appendChild(lbl);
                    const sel = document.createElement('select');
                    sel.style.width = '100%';
                    sel.style.padding = '8px';
                    sel.style.border = '1px solid #e6e6e6';
                    const emptyOpt = document.createElement('option');
                    emptyOpt.value = '';
                    emptyOpt.textContent = isThai ? '-- ไม่เลือก (ใช้ค่าเริ่มต้น/กำหนดเอง) --' : '-- None (use default/custom) --';
                    sel.appendChild(emptyOpt);
                    suggestionDocs.forEach((doc, idx) => {
                        const opt = document.createElement('option');
                        const title = this.getLocalizedValue && typeof this.getLocalizedValue === 'function'
                            ? this.getLocalizedValue(doc && doc.title, 'en')
                            : (doc && doc.title) || (`Doc ${idx + 1}`);
                        opt.value = String(idx);
                        opt.textContent = title || (`Doc ${idx + 1}`);
                        sel.appendChild(opt);
                    });
                    const customOpt = document.createElement('option');
                    customOpt.value = 'custom';
                    customOpt.textContent = isThai ? '-- กำหนดเอง --' : '-- Custom --';
                    sel.appendChild(customOpt);
                    wrap.appendChild(sel);
                    return { wrap, sel };
                };

                const leftSelObj = makeSelect('left');
                const rightSelObj = makeSelect('right');
                docsRow.appendChild(leftSelObj.wrap);
                docsRow.appendChild(rightSelObj.wrap);
                modal.appendChild(docsRow);

                // wire selection to populate inputs
                leftSelObj.sel.addEventListener('change', () => {
                    const v = leftSelObj.sel.value;
                    if (!v) return; // leave manual value
                    if (v === 'custom') { leftInput.focus(); return; }
                    const doc = suggestionDocs[Number(v)];
                    if (!doc) return;
                    const labels = (this.extractSuggestionLabels && typeof this.extractSuggestionLabels === 'function')
                        ? this.extractSuggestionLabels(doc) : [];
                    leftInput.value = (Array.isArray(labels) && labels.length) ? labels.join(', ') : (this.getLocalizedValue ? this.getLocalizedValue(doc && doc.title, 'en') : (doc && doc.title) || '');
                });

                rightSelObj.sel.addEventListener('change', () => {
                    const v = rightSelObj.sel.value;
                    if (!v) return;
                    if (v === 'custom') { rightInput.focus(); return; }
                    const doc = suggestionDocs[Number(v)];
                    if (!doc) return;
                    const labels = (this.extractSuggestionLabels && typeof this.extractSuggestionLabels === 'function')
                        ? this.extractSuggestionLabels(doc) : [];
                    rightInput.value = (Array.isArray(labels) && labels.length) ? labels.join(', ') : (this.getLocalizedValue ? this.getLocalizedValue(doc && doc.title, 'en') : (doc && doc.title) || '');
                });
            }
            const leftWrap = document.createElement('div');
            const leftLabel = document.createElement('div');
            leftLabel.style.fontSize = '13px';
            leftLabel.style.marginBottom = '6px';
            leftLabel.textContent = isThai ? 'หัวข้อคอลัมน์ซ้าย' : 'Left column label';
            leftWrap.appendChild(leftLabel);
            const leftInput = document.createElement('input');
            leftInput.type = 'text';
            leftInput.value = (this.getSuggestionLabels()[0] || (isThai ? 'จุดเด่น' : 'Outstanding'));
            leftInput.style.width = '100%';
            leftInput.style.padding = '8px';
            leftInput.style.border = '1px solid #e6e6e6';
            leftWrap.appendChild(leftInput);

            const rightWrap = document.createElement('div');
            const rightLabel = document.createElement('div');
            rightLabel.style.fontSize = '13px';
            rightLabel.style.marginBottom = '6px';
            rightLabel.textContent = isThai ? 'หัวข้อคอลัมน์ขวา' : 'Right column label';
            rightWrap.appendChild(rightLabel);
            const rightInput = document.createElement('input');
            rightInput.type = 'text';
            rightInput.value = (this.getSuggestionLabels()[1] || (isThai ? 'จุดที่ควรพัฒนา' : 'Opportunity'));
            rightInput.style.width = '100%';
            rightInput.style.padding = '8px';
            rightInput.style.border = '1px solid #e6e6e6';
            rightWrap.appendChild(rightInput);

            form.appendChild(leftWrap);
            form.appendChild(rightWrap);
            modal.appendChild(form);

            const btnRow = document.createElement('div');
            btnRow.style.display = 'flex';
            btnRow.style.justifyContent = 'flex-end';
            btnRow.style.gap = '8px';
            btnRow.style.marginTop = '12px';

            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = isThai ? 'ยกเลิก' : 'Cancel';
            cancelBtn.style.padding = '8px 12px';
            cancelBtn.style.borderRadius = '6px';
            cancelBtn.style.border = '1px solid #e5e7eb';
            cancelBtn.style.background = '#f1f5f9';
            cancelBtn.onclick = () => { overlay.remove(); resolve(null); };

            const insertBtn = document.createElement('button');
            insertBtn.textContent = isThai ? 'แทรก' : 'Insert';
            insertBtn.style.padding = '8px 12px';
            insertBtn.style.borderRadius = '6px';
            insertBtn.style.border = 'none';
            insertBtn.style.background = '#2563eb';
            insertBtn.style.color = '#fff';
            insertBtn.onclick = () => {
                const left = String(leftInput.value || '').split(',').map(s => s.trim()).filter(Boolean);
                const right = String(rightInput.value || '').split(',').map(s => s.trim()).filter(Boolean);
                overlay.remove();
                resolve({ leftLabels: left.length ? left : [isThai ? 'จุดเด่น' : 'Outstanding'], rightLabels: right.length ? right : [isThai ? 'จุดที่ควรพัฒนา' : 'Opportunity'] });
            };

            btnRow.appendChild(cancelBtn);
            btnRow.appendChild(insertBtn);
            modal.appendChild(btnRow);

            overlay.appendChild(modal);
            document.body.appendChild(overlay);

            const onKey = (ev) => {
                if (ev.key === 'Escape') {
                    overlay.remove();
                    window.removeEventListener('keydown', onKey);
                    resolve(null);
                } else if (ev.key === 'Enter') {
                    insertBtn.click();
                    window.removeEventListener('keydown', onKey);
                }
            };
            window.addEventListener('keydown', onKey);
        } catch (err) {
            console.error('showSuggestionPicker error', err);
            resolve({ leftLabels: [isThai ? 'จุดเด่น' : 'Outstanding'], rightLabels: [isThai ? 'จุดที่ควรพัฒนา' : 'Opportunity'] });
        }
    });
}
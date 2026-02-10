// src/mixins/optionsMixin.js
export default {
    methods: {
        /**
         * สร้าง options ที่มี label / value ตามภาษาปัจจุบัน
         * ใช้สำหรับ dropdown เช่น organization, agencies, department
         */
        buildOptions(list = []) {
            const lang = this.lang || this.$store.getters['setting/lang']
            const base = []
            if (!Array.isArray(list)) return base

            const mapped = list.map(obj => {
                const title = obj.title?.find(t => t.key === lang)
                return {
                    label: title?.value || '-',
                    value: obj._id,
                }
            })

            return [...base, ...mapped]
        },

        buildGeneralDataDetail(list) {
            const lang = this.lang || this.$store.getters['setting/lang'] || this.$i18n.locale
            const base = { title: '', description: '', config: [] }
            if (!list) return base

            const title = list.title?.find(t => t.key === lang)
            const description = list.description?.find(t => t.key === lang)
            const config = list.config?.filter(item => item).map(item => {
                return {
                    _id: item._id,
                    label: item.label?.find(l => l.key === lang),
                    question: item.question?.find(q => q.key === lang)
                }
            })

            return {
                title: title?.value || '',
                description: description?.value || '',
                config: config,
            }
        },

    },
}

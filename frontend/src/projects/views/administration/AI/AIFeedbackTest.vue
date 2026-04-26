<template>
    <div class="ai-feedback-test container">
        <h3>AI Feedback Tester</h3>
        <div class="form-group">
            <label>Feedback (ข้อความยาว):</label>
            <textarea v-model="feedback" rows="8" class="form-control"></textarea>
        </div>
        <div class="mb-2">
            <button class="btn btn-primary" :disabled="loading" @click="submit">{{ loading ? 'กำลังประมวลผล...' :
                'วิเคราะห์' }}</button>
            <button class="btn btn-secondary ml-2" @click="fillExample">เติมตัวอย่าง</button>
        </div>

        <div v-if="error" class="alert alert-danger">{{ error }}</div>

        <div v-if="result" class="mt-3">
            <h5>Outstanding</h5>
            <ul>
                <li v-for="(o, i) in result.outstanding" :key="i">{{ o }}</li>
            </ul>
            <h5>Opportunity</h5>
            <ul>
                <li v-for="(o, i) in result.opportunity" :key="i">{{ o }}</li>
            </ul>
        </div>

        <div v-if="raw" class="mt-3">
            <h6>Raw model output (for debugging)</h6>
            <pre>{{ raw }}</pre>
        </div>
    </div>
</template>

<script>
import axios from 'axios'

export default {
    name: 'AIFeedbackTest',
    data() {
        return {
            feedback: '',
            result: null,
            raw: null,
            loading: false,
            error: null
        }
    },
    methods: {
        async submit() {
            this.error = null
            this.result = null
            this.raw = null
            if (!this.feedback.trim()) { this.error = 'กรุณาใส่ Feedback'; return }
            this.loading = true
            try {
                const res = await axios.post('http://localhost:8081/api/v1/ai/feedback-summary', { feedback: this.feedback })
                this.result = res.data
            } catch (e) {
                this.error = e.response?.data?.error || e.message || 'Request failed'
                this.raw = e.response?.data?.raw || null
            } finally {
                this.loading = false
            }
        },
        fillExample() {
            this.feedback = `พี่ชอบความกระตือรือร้นของเรานะ สั่งอะไรไปคือลุยทันที พลังงานเหลืาล้นมาก ซึ่งมันดีมากสำหรับคนเป็น Developer\n\nแต่พี่ขอติเพื่อก่อเรื่องนึง คือเรื่อง 'ความละเอียด' บางทีเราเน้นส่งไวไปนิด จนลืมเช็กพวก Edge Case หรือลืมลบ Console.log ออกก่อนส่ง PR พี่อยากให้เราลองฝึกสวมหมวกเป็น User หรือเป็น QA ก่อนจะกดส่งงานดู คิดเสมอว่า 'ถ้าใส่ input เพี้ยนๆ เข้าไป มันจะพังไหม?'`
        }
    }
}
</script>

<style scoped>
.ai-feedback-test textarea {
    width: 100%;
    resize: vertical;
}
</style>

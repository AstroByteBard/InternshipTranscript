<template>
  <div class="rating-selector d-flex align-items-center justify-content-between" :class="{ 'rating-disabled': disabled }">
    <div v-for="n in 5" :key="n" class="rating-item" :class="{ active: value === n }" @click="!disabled && $emit('input', n)">
      <div class="rating-circle shadow-sm">
        {{ n }}
      </div>
      <div class="rating-label" v-if="n === 1">Poor</div>
      <div class="rating-label" v-if="n === 3">Good</div>
      <div class="rating-label" v-if="n === 5">Excellent</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RatingSelector',
  props: {
    value: { type: Number, default: 0 },
    disabled: { type: Boolean, default: false }
  }
}
</script>

<style scoped>
.rating-selector {
  max-width: 400px;
  margin: 0 auto;
}

.rating-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  width: 60px;
}

.rating-circle {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #f8fafc;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #64748b;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  margin-bottom: 8px;
}

.rating-item:hover .rating-circle {
  border-color: #dc2626;
  color: #dc2626;
  transform: translateY(-2px);
  background: white;
}

.rating-item.active .rating-circle {
  background: #dc2626;
  border-color: #dc2626;
  color: white;
  transform: scale(1.15);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
}

.rating-label {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  color: #94a3b8;
  letter-spacing: 0.5px;
  position: absolute;
  top: 50px;
  white-space: nowrap;
}

.rating-item.active .rating-label {
  color: #dc2626;
}

.rating-disabled {
  opacity: 0.6;
  pointer-events: none;
  filter: grayscale(0.5);
}
</style>

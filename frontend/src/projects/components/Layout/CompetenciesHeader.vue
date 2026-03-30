<template>
  <div class="competencies-hero-container mb-4 shadow-lg animate-fade-in">
    <div class="hero-content d-flex justify-content-between align-items-center">
      <div class="hero-text-section px-4">
        <h1 class="hero-title animate-slide-up">Competencies & Assessment</h1>
        <p class="hero-subtitle animate-slide-up-delay-1">Mae Fah Luang University (MFU) | Assessment Standard</p>
        <div class="hero-meta mt-3 d-flex align-items-center animate-slide-up-delay-2 flex-wrap">
            <div class="hero-badge mr-3 mb-2">
                <CIcon name="cil-star" class="mr-2 icon-gold" size="sm"/>
                General Competencies
            </div>
            <div class="hero-badge mr-3 mb-2">
                <CIcon name="cil-check-circle" class="mr-2 icon-gold" size="sm"/>
                Specific Skills
            </div>
            <div class="hero-badge mb-2">
                <CIcon name="cil-chat-bubble" class="mr-2 icon-gold" size="sm"/>
                Propositions
            </div>
        </div>
      </div>
      <div class="hero-actions pr-4 animate-scale-in">
        <CButton color="light" class="btn-hero-action px-4 py-3 font-weight-bold shadow" @click="$emit('export-assessment')">
          <CIcon name="cil-notes" class="mr-2 text-danger"/>
          Assessment Form
        </CButton>
      </div>
    </div>
    <!-- Abstract decorative elements from Dashboard -->
    <div class="hero-shape hero-shape-1"></div>
    <div class="hero-shape hero-shape-2"></div>
    <div class="hero-shape hero-gradient-overlay"></div>
  </div>
</template>

<script>
export default {
  name: 'CompetenciesHeader'
}
</script>

<style scoped>
.competencies-hero-container {
  background: linear-gradient(135deg, #8c1515 0%, #b91c1c 100%);
  border-radius: 20px;
  padding: 48px 24px;
  position: relative;
  overflow: hidden;
  color: white;
  min-height: 220px;
  display: flex;
  align-items: center;
}

.hero-content {
  width: 100%;
  position: relative;
  z-index: 10;
}

.hero-title {
  font-size: 36px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 18px;
  opacity: 0.95;
  font-weight: 500;
  color: #FEC260; /* MFU Gold accent */
}

.hero-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 8px 18px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
}

.hero-badge:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.icon-gold {
  color: #FEC260;
}

.btn-hero-action {
  border-radius: 12px;
  border: none;
  background-color: white;
  color: #111827;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 20;
}

.btn-hero-action:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2);
  background-color: #f9fafb;
}

/* Illustration circle */
.illustration-circle {
    width: 100px;
    height: 100px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.illustration-inner-icon {
    width: 48px;
    height: 48px;
    color: #FEC260;
    opacity: 0.9;
}

/* Decorative Shapes */
.hero-shape {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.hero-shape-1 {
  width: 450px;
  height: 450px;
  background: radial-gradient(circle, rgba(254, 194, 96, 0.15) 0%, transparent 70%);
  top: -200px;
  right: -100px;
  border-radius: 50%;
}

.hero-shape-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(254, 194, 96, 0.08) 0%, transparent 70%);
  bottom: -150px;
  left: 5%;
  border-radius: 50%;
}

.hero-gradient-overlay {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(140, 21, 21, 0.2) 0%, transparent 100%);
  z-index: 2;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out forwards;
}

.animate-slide-up-delay-1 {
  animation: slideUp 0.6s ease-out 0.1s forwards;
  opacity: 0;
}

.animate-slide-up-delay-2 {
  animation: slideUp 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>

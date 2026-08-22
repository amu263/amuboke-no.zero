<script setup lang="ts">
import { ref } from 'vue'
import type { PostCommentPayload } from '@/types'

const emit = defineEmits<{
  submit: [payload: Omit<PostCommentPayload, 'slug'>]
}>()

const name = ref('')
const body = ref('')
const submitting = ref(false)
const error = ref<string | null>(null)

async function handleSubmit() {
  const trimmedBody = body.value.trim()
  if (!trimmedBody) {
    error.value = '评论内容不能为空'
    return
  }
  submitting.value = true
  error.value = null
  try {
    emit('submit', { name: name.value.trim() || undefined, body: trimmedBody })
    body.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <form class="comment-form" @submit.prevent="handleSubmit">
    <h3 class="comment-form__title">
      <svg class="comment-form__icon" viewBox="0 0 20 20" aria-hidden="true">
        <path d="M2 5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H7l-4 4v-4H4a2 2 0 0 1-2-2V5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
      发表评论
    </h3>

    <div v-if="error" class="comment-form__error">{{ error }}</div>

    <div class="comment-form__field">
      <label for="comment-name" class="comment-form__label">昵称（可选）</label>
      <input
        id="comment-name"
        v-model="name"
        type="text"
        class="comment-form__input"
        placeholder="叫什么好呢"
        maxlength="50"
        autocomplete="nickname"
      />
    </div>

    <div class="comment-form__field">
      <label for="comment-body" class="comment-form__label">评论内容 <span class="comment-form__required">*</span></label>
      <textarea
        id="comment-body"
        v-model="body"
        class="comment-form__textarea"
        placeholder="写下你的评论..."
        rows="4"
        maxlength="2000"
        required
      />
    </div>

    <button
      type="submit"
      class="comment-form__submit"
      :disabled="submitting || !body.trim()"
    >
      <svg v-if="submitting" class="comment-form__spinner" viewBox="0 0 20 20" aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="25 50" />
      </svg>
      {{ submitting ? '提交中...' : '发送评论' }}
    </button>
  </form>
</template>

<style scoped>
.comment-form {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--theme-scrim);
  border-radius: var(--theme-radius-md);
  border: 1px solid var(--theme-border, currentColor);
}
.comment-form__title {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-base);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 1rem;
}
.comment-form__icon {
  width: 1.125em;
  height: 1.125em;
  color: var(--theme-accent);
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
.comment-form__error {
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-error, #f44336);
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  background: rgba(244, 67, 54, 0.1);
  border-radius: var(--theme-radius-sm);
}
.comment-form__field {
  margin-bottom: 0.875rem;
}
.comment-form__label {
  display: block;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-xs);
  opacity: 0.7;
  margin-bottom: 0.375rem;
}
.comment-form__required {
  color: var(--theme-error, #f44336);
}
.comment-form__input,
.comment-form__textarea {
  width: 100%;
  background: transparent;
  border: 1px solid var(--theme-border, currentColor);
  border-radius: var(--theme-radius-sm);
  padding: 0.5rem 0.75rem;
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  color: var(--theme-on-surface);
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.comment-form__input:focus,
.comment-form__textarea:focus {
  border-color: var(--theme-accent);
}
.comment-form__textarea {
  resize: vertical;
  min-height: 100px;
  line-height: 1.6;
}
.comment-form__submit {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: var(--theme-accent);
  color: var(--theme-on-accent, #fff);
  border: none;
  border-radius: var(--theme-radius-sm);
  font-family: var(--theme-font-mono);
  font-size: var(--theme-font-size-sm);
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}
.comment-form__submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.comment-form__spinner {
  width: 1em;
  height: 1em;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>

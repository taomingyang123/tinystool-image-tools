<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  disabled?: boolean;
  compact?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  compact: false,
});

const emit = defineEmits<{
  (e: "files-added", files: File[]): void;
}>();

const { t } = useI18n();

const fileInputRef = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const files = Array.from(target.files);
  emit("files-added", files);
  // 清空 input 使得选择相同文件仍可再次触发
  target.value = "";
};

const handleDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (props.disabled) return;
  isDragOver.value = true;
};

const handleDragLeave = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
};

const handleDrop = (e: DragEvent) => {
  e.preventDefault();
  isDragOver.value = false;
  if (props.disabled) return;

  if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    const files = Array.from(e.dataTransfer.files);
    emit("files-added", files);
  }
};

const triggerFileInput = () => {
  if (props.disabled) return;
  fileInputRef.value?.click();
};

// 支持全局剪贴板图片粘贴
const handlePaste = (e: ClipboardEvent) => {
  if (props.disabled) return;
  const items = e.clipboardData?.items;
  if (!items) return;

  const imageFiles: File[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.kind === "file" && item.type.startsWith("image/")) {
      const file = item.getAsFile();
      if (file) {
        const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
        const renamed = new File([file], `clipboard-${Date.now()}.${ext}`, { type: file.type });
        imageFiles.push(renamed);
      }
    }
  }

  if (imageFiles.length > 0) {
    emit("files-added", imageFiles);
  }
};

onMounted(() => {
  window.addEventListener("paste", handlePaste);
});

onUnmounted(() => {
  window.removeEventListener("paste", handlePaste);
});
</script>

<template>
  <div
    tabindex="0"
    role="button"
    :aria-label="t('uploader.dragOrClick')"
    class="relative rounded-2xl transition-all duration-200 cursor-pointer select-none border border-dashed group focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--studio-cobalt)]"
    :class="[
      compact ? 'px-5 py-4' : 'px-6 py-12 sm:py-16 text-center studio-checkerboard-sm',
      isDragOver
        ? 'border-[var(--studio-emerald)] bg-[var(--studio-emerald-bg)] shadow-md'
        : 'border-[var(--studio-border-strong)] bg-[var(--studio-surface)] hover:border-[var(--studio-ink)]',
      disabled ? 'opacity-50 pointer-events-none' : '',
    ]"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="triggerFileInput"
    @keydown.enter.prevent="triggerFileInput"
    @keydown.space.prevent="triggerFileInput"
  >
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="handleFileSelect"
    />

    <!-- 紧凑条模式（当队列已有任务时） -->
    <div v-if="compact" class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3 min-w-0">
        <div
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors"
          :class="
            isDragOver
              ? 'bg-[var(--studio-emerald)] text-white border-[var(--studio-emerald)]'
              : 'bg-[var(--studio-surface-subtle)] text-[var(--studio-ink)] border-[var(--studio-border)]'
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div class="min-w-0">
          <p class="text-xs sm:text-sm font-semibold text-[var(--studio-ink)] truncate">
            {{ isDragOver ? t("uploader.dropNow") : t("uploader.compactHint") }}
          </p>
          <p class="text-[11px] mono text-[var(--studio-ink-muted)] truncate">
            JPG · PNG · WebP · {{ t("uploader.maxSizeBadge") }}
          </p>
        </div>
      </div>

      <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--studio-surface-subtle)] text-[var(--studio-ink)] border border-[var(--studio-border)] group-hover:bg-[var(--studio-primary)] group-hover:text-[var(--studio-primary-ink)] group-hover:border-[var(--studio-primary)] transition-colors shrink-0">
        {{ t("uploader.addMoreBtn") }}
      </span>
    </div>

    <!-- 完整工作室取景框画布模式（队列为空时） -->
    <div v-else class="relative">
      <!-- 取景器四角校准线 -->
      <span class="hidden sm:block absolute -top-6 -left-1 w-4 h-4 border-t-2 border-l-2 border-[var(--studio-border-strong)] group-hover:border-[var(--studio-ink)] transition-colors" aria-hidden="true"></span>
      <span class="hidden sm:block absolute -top-6 -right-1 w-4 h-4 border-t-2 border-r-2 border-[var(--studio-border-strong)] group-hover:border-[var(--studio-ink)] transition-colors" aria-hidden="true"></span>
      <span class="hidden sm:block absolute -bottom-6 -left-1 w-4 h-4 border-b-2 border-l-2 border-[var(--studio-border-strong)] group-hover:border-[var(--studio-ink)] transition-colors" aria-hidden="true"></span>
      <span class="hidden sm:block absolute -bottom-6 -right-1 w-4 h-4 border-b-2 border-r-2 border-[var(--studio-border-strong)] group-hover:border-[var(--studio-ink)] transition-colors" aria-hidden="true"></span>

      <div class="max-w-md mx-auto bg-[var(--studio-surface)]/95 backdrop-blur-sm rounded-2xl border border-[var(--studio-border)] px-6 py-8 shadow-sm flex flex-col items-center space-y-4">
        <div
          class="w-14 h-14 rounded-2xl flex items-center justify-center border transition-transform duration-200 group-hover:-translate-y-0.5"
          :class="
            isDragOver
              ? 'bg-[var(--studio-emerald)] text-white border-[var(--studio-emerald)]'
              : 'bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] border-[var(--studio-primary)]'
          "
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.9" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
        </div>

        <div class="space-y-1.5">
          <h3 class="text-base sm:text-lg font-bold tracking-tight text-[var(--studio-ink)]">
            {{ isDragOver ? t("uploader.dropNow") : t("uploader.dragOrClick") }}
          </h3>
          <p class="text-xs sm:text-sm text-[var(--studio-ink-secondary)]">
            {{ t("uploader.pasteSupported") }}
          </p>
        </div>

        <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span class="px-2 py-0.5 rounded text-[11px] mono font-medium bg-[var(--studio-surface-subtle)] text-[var(--studio-ink)] border border-[var(--studio-border)]">
            JPG / JPEG
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] mono font-medium bg-[var(--studio-surface-subtle)] text-[var(--studio-ink)] border border-[var(--studio-border)]">
            PNG
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] mono font-medium bg-[var(--studio-surface-subtle)] text-[var(--studio-ink)] border border-[var(--studio-border)]">
            WebP
          </span>
          <span class="px-2 py-0.5 rounded text-[11px] mono text-[var(--studio-ink-muted)] border border-[var(--studio-border)]">
            {{ t("uploader.maxSizeBadge") }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

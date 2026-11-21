<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useI18n } from "vue-i18n";
import { formatBytes } from "../lib/image/policy";

interface Props {
  modelValue: boolean;
  originalUrl?: string;
  resultUrl?: string;
  originalName?: string;
  originalBytes?: number;
  resultBytes?: number;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  originalUrl: "",
  resultUrl: "",
  originalName: "",
  originalBytes: 0,
  resultBytes: 0,
  width: 0,
  height: 0,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "download"): void;
}>();

const { t } = useI18n();

const sliderPos = ref(50);
const containerRef = ref<HTMLDivElement | null>(null);
const stageRef = ref<HTMLDivElement | null>(null);
const isDragging = ref(false);
const dialogRef = ref<HTMLDivElement | null>(null);
let returnFocus: HTMLElement | null = null;
let previousOverflow = "";

const savingsPercent = computed(() => {
  if (props.originalBytes <= 0) return 0;
  return (((props.originalBytes - props.resultBytes) / props.originalBytes) * 100).toFixed(1);
});

const close = () => {
  emit("update:modelValue", false);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (!props.modelValue) return;

  if (e.key === "Tab") {
    const items = dialogRef.value?.querySelectorAll<HTMLElement>('button:not(:disabled), [tabindex="0"]');
    if (!items?.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    return;
  }
  if (e.key === "Escape") {
    close();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    sliderPos.value = Math.max(0, sliderPos.value - 5);
  } else if (e.key === "ArrowRight") {
    e.preventDefault();
    sliderPos.value = Math.min(100, sliderPos.value + 5);
  } else if (e.key === "Home") {
    e.preventDefault();
    sliderPos.value = 0;
  } else if (e.key === "End") {
    e.preventDefault();
    sliderPos.value = 100;
  }
};

/**
 * 依据实际渲染的图片 stageRef 几何矩形计算滑块百分比
 * 保证滑块在 0%~100% 之间精准对应图片左右边缘
 */
const updateSlider = (clientX: number) => {
  const target = stageRef.value || containerRef.value;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  if (rect.width <= 0) return;
  const x = clientX - rect.left;
  const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
  sliderPos.value = Number(percentage.toFixed(2));
};

const onMouseDown = (e: MouseEvent) => {
  isDragging.value = true;
  updateSlider(e.clientX);
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  updateSlider(e.clientX);
};

const onMouseUp = () => {
  isDragging.value = false;
};

const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length > 0) {
    isDragging.value = true;
    updateSlider(e.touches[0].clientX);
  }
};

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  if (e.touches.length > 0) {
    updateSlider(e.touches[0].clientX);
  }
};

const onTouchEnd = () => {
  isDragging.value = false;
};

const resetCenter = () => {
  sliderPos.value = 50;
};

watch(
  () => props.modelValue,
  async (val) => {
    if (val) {
      sliderPos.value = 50;
      if (typeof document !== "undefined") {
        returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        await nextTick();
        if (props.modelValue) dialogRef.value?.querySelector<HTMLElement>("button")?.focus();
      }
    } else {
      if (typeof document !== "undefined") {
        document.body.style.overflow = previousOverflow;
        returnFocus?.focus();
      }
    }
  },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("mouseup", onMouseUp);
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("touchend", onTouchEnd);
  window.addEventListener("touchmove", onTouchMove);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeyDown);
  window.removeEventListener("mouseup", onMouseUp);
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("touchend", onTouchEnd);
  window.removeEventListener("touchmove", onTouchMove);
  if (typeof document !== "undefined") {
    document.body.style.overflow = previousOverflow;
  }
});
</script>

<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/65 backdrop-blur-sm animate-fadeIn"
    @click.self="close"
  >
    <div
      ref="dialogRef"
      role="dialog"
      aria-modal="true"
      :aria-label="t('compare.compareTitle')"
      class="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-[var(--studio-surface)] border border-[var(--studio-border)] rounded-2xl shadow-2xl overflow-hidden"
    >
      <!-- 弹窗顶部栏（包含弹窗内全部可聚焦按钮，保证 Tab 焦点顺序严谨） -->
      <div class="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-2 h-2 rounded-full bg-[var(--studio-emerald)] shrink-0" aria-hidden="true"></span>
          <h3 class="text-sm sm:text-base font-bold text-[var(--studio-ink)] truncate max-w-[200px] sm:max-w-md">
            {{ originalName }}
          </h3>
          <span v-if="width && height" class="text-xs mono tabular-nums text-[var(--studio-ink-muted)] hidden sm:inline">
            {{ width }}×{{ height }}
          </span>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <span
            v-if="resultBytes > 0"
            class="px-2.5 py-1 rounded-md text-xs mono tabular-nums font-bold border"
            :class="
              resultBytes < originalBytes
                ? 'bg-[var(--studio-emerald-bg)] text-[var(--studio-emerald-ink)] border-[var(--studio-emerald-border)]'
                : 'bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border-[var(--studio-border)]'
            "
          >
            {{ resultBytes < originalBytes ? `-${savingsPercent}%` : resultBytes > originalBytes ? `+${Math.abs(Number(savingsPercent))}%` : t("queue.unchanged") }}
          </span>

          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] hover:bg-[var(--studio-primary-hover)] transition-colors flex items-center gap-1.5 cursor-pointer"
            @click="emit('download')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <span>{{ t("queue.download") }}</span>
          </button>

          <button
            type="button"
            class="w-8 h-8 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] flex items-center justify-center transition-colors cursor-pointer"
            :title="t('common.close')"
            :aria-label="t('common.close')"
            @click="close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <!-- 对比视口（标准透明棋盘格底纹 + 统一锁定的舞台） -->
      <div
        ref="containerRef"
        class="relative flex-1 min-h-[340px] sm:min-h-[460px] max-h-[72vh] studio-checkerboard flex items-center justify-center p-4 sm:p-8 select-none overflow-hidden cursor-ew-resize"
        @mousedown="onMouseDown"
        @touchstart.passive="onTouchStart"
      >
        <!-- 悬浮读数角标：原图 -->
        <div class="absolute top-3 left-3 z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-[var(--studio-surface)]/92 border border-[var(--studio-border)] shadow-sm text-xs mono tabular-nums flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-[var(--studio-ink-muted)]" aria-hidden="true"></span>
          <span class="font-semibold text-[var(--studio-ink)]">{{ t("compare.before") }}</span>
          <span class="text-[var(--studio-ink-secondary)]">{{ formatBytes(originalBytes) }}</span>
        </div>

        <!-- 悬浮读数角标：压缩后 -->
        <div class="absolute top-3 right-3 z-20 pointer-events-none px-3 py-1.5 rounded-lg bg-[var(--studio-surface)]/92 border border-[var(--studio-border)] shadow-sm text-xs mono tabular-nums flex items-center gap-2">
          <span class="font-semibold text-[var(--studio-ink)]">{{ t("compare.after") }}</span>
          <span class="text-[var(--studio-emerald)] font-semibold">{{ formatBytes(resultBytes || originalBytes) }}</span>
          <span class="w-2 h-2 rounded-full bg-[var(--studio-emerald)]" aria-hidden="true"></span>
        </div>

        <!-- 核心舞台：首个 <img> 为压缩结果，且滑块为对话框内最后一个可聚焦元素 -->
        <div
          ref="stageRef"
          role="slider"
          tabindex="0"
          :aria-label="t('compare.compareTitle')"
          aria-valuemin="0"
          aria-valuemax="100"
          :aria-valuenow="sliderPos"
          class="relative inline-block max-w-full max-h-full rounded-lg overflow-hidden shadow-lg ring-1 ring-black/10 select-none"
          @dblclick="resetCenter"
        >
          <!-- 底层：压缩后图片 -->
          <img
            :src="resultUrl || originalUrl"
            :alt="t('compare.after')"
            class="block max-w-full max-h-[64vh] w-auto h-auto object-contain pointer-events-none"
            draggable="false"
          />

          <!-- 顶层：原始图片卷帘层 -->
          <div
            class="absolute inset-0 pointer-events-none overflow-hidden"
            :style="{
              clipPath: `polygon(0 0, ${sliderPos}% 0, ${sliderPos}% 100%, 0 100%)`,
            }"
          >
            <img
              :src="originalUrl"
              :alt="t('compare.before')"
              class="absolute top-0 left-0 w-full h-full object-fill pointer-events-none"
              draggable="false"
            />
          </div>

          <!-- 垂直标尺线与拖拽手柄 -->
          <div
            class="absolute top-0 bottom-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_0_1px_rgba(0,0,0,0.35)] pointer-events-none flex items-center justify-center"
            :style="{ left: `${sliderPos}%` }"
          >
            <div class="w-8 h-8 rounded-full shrink-0 bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] border-2 border-white shadow-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <polyline points="8 9 5 12 8 15" />
                <polyline points="16 9 19 12 16 15" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作提示栏 -->
      <div class="px-4 sm:px-5 py-2.5 bg-[var(--studio-surface-muted)] border-t border-[var(--studio-border)] flex items-center justify-between gap-4 text-xs text-[var(--studio-ink-secondary)]">
        <span>{{ t("compare.dragTip") }}</span>
        <span class="mono text-[11px] text-[var(--studio-ink-muted)] hidden sm:inline">← / → · ESC {{ t("common.close") }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
.animate-fadeIn {
  animation: fadeIn 0.16s ease-out forwards;
}
</style>

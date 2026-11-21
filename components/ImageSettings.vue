<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { CompressionOptions, OutputMode } from "../lib/image/types";

interface Props {
  modelValue: CompressionOptions;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: CompressionOptions): void;
}>();

const { t } = useI18n();

type EdgePreset = "none" | "1920" | "1280" | "custom";

function derivePreset(edge: number | null): EdgePreset {
  if (edge === null) return "none";
  if (edge === 1920) return "1920";
  if (edge === 1280) return "1280";
  return "custom";
}

// 输出格式
const currentOutput = computed({
  get: () => props.modelValue.output,
  set: (val: OutputMode) => {
    emit("update:modelValue", { ...props.modelValue, output: val });
  },
});

// 图片质量（仅有损或量化模式显示）
const currentQuality = computed({
  get: () => props.modelValue.quality,
  set: (val: number) => {
    emit("update:modelValue", { ...props.modelValue, quality: val });
  },
});

// 独立维护预设状态与草稿值，避免输入 1920 / 1280 时输入框被卸载失焦
const edgePreset = ref<EdgePreset>(derivePreset(props.modelValue.maxLongEdge));
const customEdgeInput = ref<string>(String(props.modelValue.maxLongEdge ?? 1024));

watch(
  () => props.modelValue.maxLongEdge,
  (val) => {
    if (edgePreset.value === "custom") {
      if (val !== null) {
        const parsed = Number(customEdgeInput.value);
        if (!Number.isFinite(parsed) || Math.round(parsed) !== val) {
          customEdgeInput.value = String(val);
        }
      }
      return;
    }
    edgePreset.value = derivePreset(val);
    if (val !== null) {
      customEdgeInput.value = String(val);
    }
  },
);

const selectEdgePreset = (preset: EdgePreset) => {
  edgePreset.value = preset;
  if (preset === "none") {
    emit("update:modelValue", { ...props.modelValue, maxLongEdge: null });
  } else if (preset === "1920") {
    emit("update:modelValue", { ...props.modelValue, maxLongEdge: 1920 });
  } else if (preset === "1280") {
    emit("update:modelValue", { ...props.modelValue, maxLongEdge: 1280 });
  } else {
    const parsed = Number(customEdgeInput.value);
    const nextVal = Number.isFinite(parsed) && parsed >= 1 ? Math.min(10000, Math.round(parsed)) : 1024;
    customEdgeInput.value = String(nextVal);
    emit("update:modelValue", { ...props.modelValue, maxLongEdge: nextVal });
  }
};

const handleCustomEdgeInput = (event: Event) => {
  const raw = (event.target as HTMLInputElement).value;
  customEdgeInput.value = raw;
  if (!raw.trim()) return;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) return;
  const clamped = Math.min(10000, Math.round(parsed));
  emit("update:modelValue", { ...props.modelValue, maxLongEdge: clamped });
};

const handleCustomEdgeBlur = () => {
  const parsed = Number(customEdgeInput.value);
  const fallback = props.modelValue.maxLongEdge ?? 1024;
  const nextVal = Number.isFinite(parsed) && parsed >= 1 ? Math.min(10000, Math.round(parsed)) : fallback;
  customEdgeInput.value = String(nextVal);
  if (props.modelValue.maxLongEdge !== nextVal) {
    emit("update:modelValue", { ...props.modelValue, maxLongEdge: nextVal });
  }
};

const qualityPresets = [60, 80, 90] as const;
</script>

<template>
  <fieldset
    :disabled="disabled"
    data-testid="settings"
    class="studio-card rounded-2xl overflow-hidden transition-opacity duration-200 min-w-0"
    :class="{ 'opacity-60 pointer-events-none': disabled }"
  >
    <!-- 检查器顶栏 -->
    <div class="px-5 py-3.5 border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)] flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 min-w-0">
        <span class="w-2 h-2 rounded-full bg-[var(--studio-emerald)] shrink-0" aria-hidden="true"></span>
        <h2 class="text-sm font-semibold text-[var(--studio-ink)] truncate">
          {{ t("settings.title") }}
        </h2>
      </div>
      <span class="text-[11px] mono text-[var(--studio-ink-muted)] shrink-0">
        {{ t("settings.localSafeBadge") }}
      </span>
    </div>

    <div class="divide-y divide-[var(--studio-border)]">
      <!-- 01 / 输出格式 -->
      <section class="p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[11px] mono font-semibold text-[var(--studio-ink-muted)]">{{ t("settings.stepFormat") }}</span>
            <span class="text-xs font-semibold uppercase tracking-wider text-[var(--studio-ink-secondary)]">
              {{ t("settings.outputFormat") }}
            </span>
          </div>
          <span class="text-[11px] mono px-2 py-0.5 rounded bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]">
            {{
              currentOutput === "keep"
                ? t("settings.formatKeep")
                : currentOutput === "jpeg"
                ? "JPEG"
                : t("settings.formatPng")
            }}
          </span>
        </div>

        <div class="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[var(--studio-surface-subtle)] border border-[var(--studio-border)]">
          <button
            type="button"
            data-output="keep"
            class="px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center leading-tight"
            :class="
              currentOutput === 'keep'
                ? 'bg-[var(--studio-surface)] text-[var(--studio-ink)] font-semibold shadow-sm border border-[var(--studio-border)]'
                : 'text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] border border-transparent'
            "
            @click="currentOutput = 'keep'"
          >
            {{ t("settings.formatKeep") }}
          </button>
          <button
            type="button"
            data-output="jpeg"
            class="px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center leading-tight"
            :class="
              currentOutput === 'jpeg'
                ? 'bg-[var(--studio-surface)] text-[var(--studio-ink)] font-semibold shadow-sm border border-[var(--studio-border)]'
                : 'text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] border border-transparent'
            "
            @click="currentOutput = 'jpeg'"
          >
            JPEG
          </button>
          <button
            type="button"
            data-output="png"
            class="px-2 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer text-center leading-tight"
            :class="
              currentOutput === 'png'
                ? 'bg-[var(--studio-surface)] text-[var(--studio-ink)] font-semibold shadow-sm border border-[var(--studio-border)]'
                : 'text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] border border-transparent'
            "
            @click="currentOutput = 'png'"
          >
            {{ t("settings.formatPng") }}
          </button>
        </div>

        <!-- 上下文格式说明 -->
        <p
          v-if="currentOutput === 'keep'"
          class="text-xs leading-relaxed text-[var(--studio-ink-secondary)] bg-[var(--studio-surface-muted)] border border-[var(--studio-border)] rounded-lg px-3 py-2.5"
        >
          {{ t("settings.keepDesc") }}
        </p>
        <p
          v-else-if="currentOutput === 'jpeg'"
          class="text-xs leading-relaxed text-[var(--studio-amber-ink)] bg-[var(--studio-amber-bg)] border border-[var(--studio-amber-border)] rounded-lg px-3 py-2.5"
        >
          {{ t("settings.jpegWhiteBgNotice") }}
        </p>
        <p
          v-else
          class="text-xs leading-relaxed text-[var(--studio-ink-secondary)] bg-[var(--studio-surface-muted)] border border-[var(--studio-border)] rounded-lg px-3 py-2.5"
        >
          {{ t("settings.pngSmartDesc") }}
        </p>
      </section>

      <!-- 02 / 质量控制（原格式下绝不展示滑块与质量百分比） -->
      <section class="p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[11px] mono font-semibold text-[var(--studio-ink-muted)]">{{ t("settings.stepQuality") }}</span>
            <span class="text-xs font-semibold uppercase tracking-wider text-[var(--studio-ink-secondary)]">
              {{ t("settings.quality") }}
            </span>
          </div>

          <span
            v-if="currentOutput === 'keep'"
            class="text-[11px] mono font-medium px-2 py-0.5 rounded bg-[var(--studio-emerald-bg)] text-[var(--studio-emerald-ink)] border border-[var(--studio-emerald-border)]"
          >
            {{ t("settings.losslessSmart") }}
          </span>
          <div v-else class="flex items-center gap-2">
            <span class="text-[11px] text-[var(--studio-ink-muted)]">
              {{ t("settings.recommended") }} 80
            </span>
            <span class="text-sm mono tabular-nums font-bold px-2 py-0.5 rounded bg-[var(--studio-surface-subtle)] text-[var(--studio-ink)] border border-[var(--studio-border)]">
              {{ currentQuality }}
            </span>
          </div>
        </div>

        <!-- 原格式无损优化提示卡片 -->
        <div
          v-if="currentOutput === 'keep'"
          class="rounded-xl bg-[var(--studio-emerald-bg)] border border-[var(--studio-emerald-border)] px-3.5 py-3 flex items-start gap-2.5 text-xs text-[var(--studio-emerald-ink)]"
        >
          <span class="w-4 h-4 rounded-full bg-[var(--studio-emerald)] text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" aria-hidden="true">
            ✓
          </span>
          <div class="space-y-1 min-w-0">
            <p class="font-semibold">{{ t("settings.keepMode") }}</p>
            <p class="text-[11px] opacity-90 leading-relaxed">{{ t("settings.pngLosslessDesc") }}</p>
          </div>
        </div>

        <!-- 有损/量化滑块区域（竖向堆叠保证 320px/390px 零溢出） -->
        <div v-else class="space-y-3">
          <div class="rounded-xl bg-[var(--studio-surface-muted)] border border-[var(--studio-border)] px-3.5 py-3 space-y-2.5">
            <input
              v-model.number="currentQuality"
              type="range"
              :aria-label="t('settings.quality')"
              min="1"
              max="100"
              step="1"
              class="studio-range"
            />
            <div class="flex items-center justify-between gap-2 text-[11px] text-[var(--studio-ink-muted)]">
              <span>{{ t("settings.qualityLow") }}</span>
              <span>{{ t("settings.qualityHigh") }}</span>
            </div>
          </div>

          <!-- 快捷预设档位 -->
          <div class="flex items-center gap-1.5">
            <button
              v-for="preset in qualityPresets"
              :key="preset"
              type="button"
              class="flex-1 py-1.5 rounded-lg text-xs mono tabular-nums border transition-colors cursor-pointer"
              :class="
                currentQuality === preset
                  ? 'bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] border-[var(--studio-primary)] font-semibold'
                  : 'bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] border-[var(--studio-border)] hover:border-[var(--studio-border-strong)] hover:text-[var(--studio-ink)]'
              "
              @click="currentQuality = preset"
            >
              {{ preset }}
            </button>
          </div>
        </div>
      </section>

      <!-- 03 / 最长边等比缩放 -->
      <section class="p-5 space-y-3">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="text-[11px] mono font-semibold text-[var(--studio-ink-muted)]">{{ t("settings.stepResize") }}</span>
            <span class="text-xs font-semibold uppercase tracking-wider text-[var(--studio-ink-secondary)]">
              {{ t("settings.maxLongEdge") }}
            </span>
          </div>
          <span class="text-[11px] mono tabular-nums px-2 py-0.5 rounded bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]">
            {{ edgePreset === "none" ? t("settings.edgeOriginal") : `${modelValue.maxLongEdge ?? customEdgeInput}px` }}
          </span>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-1.5">
          <button
            type="button"
            class="px-2 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer text-center"
            :class="
              edgePreset === 'none'
                ? 'bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] border-[var(--studio-primary)] font-semibold'
                : 'bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] border-[var(--studio-border)] hover:border-[var(--studio-border-strong)] hover:text-[var(--studio-ink)]'
            "
            @click="selectEdgePreset('none')"
          >
            {{ t("settings.edgeOriginal") }}
          </button>
          <button
            type="button"
            class="px-2 py-2 rounded-lg text-xs mono tabular-nums font-medium border transition-colors cursor-pointer text-center"
            :class="
              edgePreset === '1920'
                ? 'bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] border-[var(--studio-primary)] font-semibold'
                : 'bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] border-[var(--studio-border)] hover:border-[var(--studio-border-strong)] hover:text-[var(--studio-ink)]'
            "
            @click="selectEdgePreset('1920')"
          >
            1920px
          </button>
          <button
            type="button"
            class="px-2 py-2 rounded-lg text-xs mono tabular-nums font-medium border transition-colors cursor-pointer text-center"
            :class="
              edgePreset === '1280'
                ? 'bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] border-[var(--studio-primary)] font-semibold'
                : 'bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] border-[var(--studio-border)] hover:border-[var(--studio-border-strong)] hover:text-[var(--studio-ink)]'
            "
            @click="selectEdgePreset('1280')"
          >
            1280px
          </button>
          <button
            type="button"
            class="px-2 py-2 rounded-lg text-xs font-medium border transition-colors cursor-pointer text-center"
            :class="
              edgePreset === 'custom'
                ? 'bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] border-[var(--studio-primary)] font-semibold'
                : 'bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] border-[var(--studio-border)] hover:border-[var(--studio-border-strong)] hover:text-[var(--studio-ink)]'
            "
            @click="selectEdgePreset('custom')"
          >
            {{ t("settings.edgeCustom") }}
          </button>
        </div>

        <!-- 自定义像素输入区（保持稳定挂载，输入 1920/1280 时不卸载失焦） -->
        <div
          v-if="edgePreset === 'custom'"
          class="rounded-xl bg-[var(--studio-surface-muted)] border border-[var(--studio-border)] p-3 space-y-2"
        >
          <div class="flex items-center gap-2">
            <input
              :value="customEdgeInput"
              type="number"
              inputmode="numeric"
              :aria-label="t('settings.maxLongEdge')"
              min="1"
              max="10000"
              step="10"
              class="w-full min-w-0 bg-[var(--studio-surface)] border border-[var(--studio-border-strong)] rounded-lg px-3 py-2 text-xs mono tabular-nums text-[var(--studio-ink)] focus:outline-none focus:border-[var(--studio-cobalt)]"
              :placeholder="t('settings.pixelPlaceholder')"
              @input="handleCustomEdgeInput"
              @blur="handleCustomEdgeBlur"
            />
            <span class="text-xs mono font-medium text-[var(--studio-ink-secondary)] shrink-0">px</span>
          </div>
          <p class="text-[11px] text-[var(--studio-ink-muted)]">
            {{ t("settings.customEdgeHint") }}
          </p>
        </div>
      </section>
    </div>
  </fieldset>
</template>

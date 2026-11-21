<script setup lang="ts">
import { computed, ref } from "vue";
import type { QueueItem, QueueStats } from "../composables/useCompressionQueue.client";
import { formatBytes } from "../lib/image/policy";
import { downloadTask, downloadOriginalTask, downloadTasksAsZip, generateZipFilename } from "../lib/image/download";

interface Props {
  tasks: QueueItem[];
  stats: QueueStats;
  isProcessing: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: "cancel", taskId: string): void;
  (e: "retry", taskId: string): void;
  (e: "remove", taskId: string): void;
  (e: "clear-all"): void;
  (e: "recompress-all"): void;
  (e: "compare", task: QueueItem): void;
}>();

const { t } = useI18n();
const isZipping = ref(false);
const zipError = ref<string | null>(null);

const handleDownloadAllZip = async () => {
  if (isZipping.value) return;
  isZipping.value = true;
  zipError.value = null;

  try {
    const filename = generateZipFilename();
    await downloadTasksAsZip(props.tasks, filename);
  } catch (err: any) {
    zipError.value = t(err?.code === "ZIP_TOO_LARGE" ? "errors.ZIP_TOO_LARGE" : "errors.UNKNOWN");
  } finally {
    isZipping.value = false;
  }
};

const handleSingleDownload = (task: QueueItem) => {
  try {
    downloadTask(task);
  } catch (err) {
    console.error("Download failed:", err);
  }
};

const getSavingsPercent = (task: QueueItem): string => {
  if (!task.result || task.originalBytes <= 0) return "0";
  const percent = ((task.originalBytes - task.result.resultBytes) / task.originalBytes) * 100;
  return percent.toFixed(1);
};

const getTaskErrorMessage = (task: QueueItem): string => {
  if (task.errorCode && task.errorCode !== "UNKNOWN") {
    const errorKey = `errors.${task.errorCode}`;
    const localized = t(errorKey);
    if (localized && localized !== errorKey) {
      return localized;
    }
  }
  return t("errors.UNKNOWN");
};

const outputRatioPercent = computed(() => {
  if (props.stats.totalOriginalBytes <= 0) return 100;
  const ratio = (props.stats.totalResultBytes / props.stats.totalOriginalBytes) * 100;
  return Math.max(4, Math.min(100, Math.round(ratio)));
});
</script>

<template>
  <div v-if="tasks.length > 0" data-testid="task-list" class="space-y-4">
    <!-- 批量总控与压缩收益看板 -->
    <div class="studio-card rounded-2xl overflow-hidden">
      <div class="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1.5 min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-sm font-bold text-[var(--studio-ink)]">
              {{ t("queue.totalCount", { count: stats.total }) }}
            </span>
            <span class="px-2 py-0.5 rounded-md text-xs mono tabular-nums font-medium bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]">
              {{ stats.completed }}/{{ stats.total }}
            </span>
            <span
              v-if="stats.completed > 0 && stats.overallSavingsPercent !== 0"
              class="px-2 py-0.5 rounded-md text-xs mono tabular-nums font-bold border"
              :class="
                stats.overallSavingsPercent > 0
                  ? 'bg-[var(--studio-emerald-bg)] text-[var(--studio-emerald-ink)] border-[var(--studio-emerald-border)]'
                  : 'bg-[var(--studio-amber-bg)] text-[var(--studio-amber-ink)] border-[var(--studio-amber-border)]'
              "
            >
              {{ stats.overallSavingsPercent < 0 ? "+" : "-" }}{{ Math.abs(stats.overallSavingsPercent).toFixed(1) }}%
            </span>
          </div>

          <div v-if="stats.completed > 0" class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--studio-ink-secondary)] mono tabular-nums">
            <span>{{ t("queue.originalTotal") }}: {{ formatBytes(stats.totalOriginalBytes) }}</span>
            <span aria-hidden="true">→</span>
            <span class="font-semibold text-[var(--studio-ink)]">{{ t("queue.compressedTotal") }}: {{ formatBytes(stats.totalResultBytes) }}</span>
            <span class="text-[var(--studio-ink-muted)]">·</span>
            <span :class="stats.totalSavedBytes >= 0 ? 'text-[var(--studio-emerald)] font-semibold' : 'text-[var(--studio-amber)] font-semibold'">
              {{ t(stats.totalSavedBytes < 0 ? "queue.totalIncreased" : "queue.totalSaved") }}: {{ formatBytes(Math.abs(stats.totalSavedBytes)) }}
            </span>
          </div>
        </div>

        <!-- 批量操作栏 -->
        <div class="flex flex-wrap xl:flex-nowrap items-center gap-2 shrink-0">
          <button
            type="button"
            :disabled="isProcessing || isZipping"
            class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border border-[var(--studio-border)] bg-[var(--studio-surface)] text-[var(--studio-ink)] hover:border-[var(--studio-border-strong)] hover:bg-[var(--studio-surface-subtle)] transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            :title="t('queue.recompressAllTip')"
            @click="emit('recompress-all')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            <span>{{ t("queue.recompressAll") }}</span>
          </button>

          <button
            type="button"
            :disabled="isZipping"
            class="px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border border-[var(--studio-border)] bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] hover:border-[var(--studio-border-strong)] hover:bg-[var(--studio-surface-subtle)] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            @click="emit('clear-all')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
            </svg>
            <span>{{ t("queue.clearAll") }}</span>
          </button>

          <button
            type="button"
            :disabled="stats.completed === 0 || isZipping"
            class="px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5"
            :class="
              stats.completed > 0 && !isZipping
                ? 'bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] hover:bg-[var(--studio-primary-hover)] shadow-sm cursor-pointer'
                : 'bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-muted)] border border-[var(--studio-border)] cursor-not-allowed'
            "
            @click="handleDownloadAllZip"
          >
            <svg
              v-if="!isZipping"
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
            <svg
              v-else
              class="animate-spin w-3.5 h-3.5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isZipping ? t("queue.zipping") : t("queue.downloadAllZip") }}</span>
          </button>
        </div>
      </div>

      <!-- 体积占比可视化条 -->
      <div v-if="stats.completed > 0" class="h-1.5 w-full bg-[var(--studio-surface-subtle)] border-t border-[var(--studio-border)] overflow-hidden">
        <div
          class="h-full transition-all duration-300"
          :class="stats.totalSavedBytes >= 0 ? 'bg-[var(--studio-emerald)]' : 'bg-[var(--studio-amber)]'"
          :style="{ width: `${outputRatioPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- ZIP 错误提示 -->
    <div
      v-if="zipError"
      role="alert"
      class="px-4 py-3 rounded-xl bg-[var(--studio-rose-bg)] border border-[var(--studio-rose-border)] text-[var(--studio-rose-ink)] text-xs flex items-center justify-between gap-3"
    >
      <span>{{ zipError }}</span>
      <button type="button" class="underline font-semibold cursor-pointer shrink-0" @click="zipError = null">{{ t("common.close") }}</button>
    </div>

    <!-- 任务清单 -->
    <div class="studio-card rounded-2xl divide-y divide-[var(--studio-border)] overflow-hidden">
      <div
        v-for="task in tasks"
        :key="task.id"
        data-testid="task"
        :data-status="task.status"
        class="p-4 flex flex-col gap-3 hover:bg-[var(--studio-surface-muted)] transition-colors"
      >
        <div class="flex items-start sm:items-center justify-between gap-3">
          <!-- 左侧：缩略图与文件信息 -->
          <div class="flex items-center gap-3.5 min-w-0 flex-1">
            <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-xl studio-checkerboard-sm border border-[var(--studio-border)] shrink-0 overflow-hidden flex items-center justify-center">
              <img
                v-if="task.previewUrl"
                :src="task.previewUrl"
                :alt="task.originalName"
                class="w-full h-full object-cover"
              />
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5 text-[var(--studio-ink-muted)]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>

            <div class="min-w-0 flex-1 space-y-1">
              <div class="flex flex-wrap items-center gap-1.5">
                <h4 class="text-sm font-semibold text-[var(--studio-ink)] truncate max-w-[180px] sm:max-w-[280px]" :title="task.originalName">
                  {{ task.originalName }}
                </h4>
                <span
                  v-if="task.result?.extension"
                  class="px-1.5 py-0.5 rounded text-[10px] mono uppercase font-semibold bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]"
                >
                  {{ task.result.extension }}
                </span>
                <span
                  v-if="task.result?.width && task.result?.height"
                  class="text-[11px] mono tabular-nums text-[var(--studio-ink-muted)]"
                >
                  {{ task.result.width }}×{{ task.result.height }}
                </span>
                <span
                  v-else-if="task.originalWidth && task.originalHeight"
                  class="text-[11px] mono tabular-nums text-[var(--studio-ink-muted)]"
                >
                  {{ task.originalWidth }}×{{ task.originalHeight }}
                </span>
              </div>

              <!-- 体积对比与异常说明 -->
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs mono tabular-nums">
                <span class="text-[var(--studio-ink-secondary)]">{{ formatBytes(task.originalBytes) }}</span>

                <template v-if="task.status === 'success' && task.result">
                  <span class="text-[var(--studio-ink-muted)]" aria-hidden="true">→</span>
                  <span class="font-bold text-[var(--studio-ink)]">{{ formatBytes(task.result.resultBytes) }}</span>
                  <span
                    class="px-1.5 py-0.5 rounded text-[11px] font-bold border"
                    :class="
                      task.result.resultBytes < task.originalBytes
                        ? 'bg-[var(--studio-emerald-bg)] text-[var(--studio-emerald-ink)] border-[var(--studio-emerald-border)]'
                        : 'bg-[var(--studio-amber-bg)] text-[var(--studio-amber-ink)] border-[var(--studio-amber-border)]'
                    "
                  >
                    {{ task.result.resultBytes < task.originalBytes ? `-${getSavingsPercent(task)}%` : `+${Math.abs(Number(getSavingsPercent(task))).toFixed(1)}%` }}
                  </span>
                </template>

                <template v-else-if="task.status === 'skipped'">
                  <span class="text-[var(--studio-emerald)] font-medium">✓ {{ t("queue.unchanged") }}</span>
                </template>

                <template v-else-if="task.status === 'failed'">
                  <span class="font-sans text-[var(--studio-rose)] break-words">
                    {{ getTaskErrorMessage(task) }}
                  </span>
                </template>
              </div>
            </div>
          </div>

          <!-- 右侧：状态徽章 + 移除图标 -->
          <div class="flex items-center gap-2 shrink-0">
            <span
              v-if="task.status === 'queued' || task.status === 'validating'"
              class="px-2.5 py-1 rounded-full text-[11px] mono bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]"
            >
              {{ t(task.status === "validating" ? "queue.validating" : "queue.queued") }}
            </span>

            <span
              v-else-if="task.status === 'processing'"
              class="px-2.5 py-1 rounded-full text-[11px] mono bg-[var(--studio-cobalt-bg)] text-[var(--studio-cobalt)] border border-[var(--studio-cobalt-border)] inline-flex items-center gap-1.5"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-[var(--studio-cobalt)] animate-pulse" aria-hidden="true"></span>
              <span>
                {{
                  task.progressPhase === "decode"
                    ? t("queue.phaseDecode")
                    : task.progressPhase === "resize"
                    ? t("queue.phaseResize")
                    : task.progressPhase === "encode"
                    ? t("queue.phaseEncode")
                    : t("queue.processing")
                }}
              </span>
            </span>

            <span
              v-else-if="task.status === 'success'"
              class="px-2.5 py-1 rounded-full text-[11px] mono font-medium bg-[var(--studio-emerald-bg)] text-[var(--studio-emerald-ink)] border border-[var(--studio-emerald-border)]"
            >
              ✓ {{ t("queue.success") }}
            </span>

            <span
              v-else-if="task.status === 'skipped'"
              class="px-2.5 py-1 rounded-full text-[11px] mono font-medium bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]"
            >
              {{ t("queue.skipped") }}
            </span>

            <span
              v-else-if="task.status === 'cancelled'"
              class="px-2.5 py-1 rounded-full text-[11px] mono bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-muted)] border border-[var(--studio-border)]"
            >
              {{ t("queue.cancelled") }}
            </span>

            <span
              v-else-if="task.status === 'failed'"
              class="px-2.5 py-1 rounded-full text-[11px] mono font-medium bg-[var(--studio-rose-bg)] text-[var(--studio-rose-ink)] border border-[var(--studio-rose-border)]"
            >
              ✕ {{ t("queue.failed") }}
            </span>

            <button
              type="button"
              class="w-7 h-7 rounded-lg text-[var(--studio-ink-muted)] hover:text-[var(--studio-rose)] hover:bg-[var(--studio-rose-bg)] flex items-center justify-center transition-colors cursor-pointer"
              :title="t('queue.remove')"
              :aria-label="t('queue.remove')"
              @click="emit('remove', task.id)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        <!-- 底部操作按钮行（统一样式、清晰可点、移动端自动折行） -->
        <div
          v-if="task.status === 'success' || task.status === 'skipped' || task.status === 'validating' || task.status === 'queued' || task.status === 'processing' || task.status === 'failed' || task.status === 'cancelled'"
          class="flex flex-wrap items-center justify-end gap-2 pt-1 sm:pl-[4.25rem]"
        >
          <template v-if="task.status === 'success' || task.status === 'skipped'">
            <button
              type="button"
              class="px-2.5 py-1.5 rounded-lg text-xs font-medium text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] bg-[var(--studio-surface)] hover:bg-[var(--studio-surface-subtle)] border border-[var(--studio-border)] transition-colors cursor-pointer"
              @click="downloadOriginalTask(task)"
            >
              {{ t("queue.downloadOriginal") }}
            </button>

            <button
              type="button"
              class="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--studio-ink)] bg-[var(--studio-surface-subtle)] hover:bg-[var(--studio-border)] border border-[var(--studio-border)] transition-colors flex items-center gap-1.5 cursor-pointer"
              :title="t('compare.compareTitle')"
              @click="emit('compare', task)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
              </svg>
              <span>{{ t("compare.button") }}</span>
            </button>

            <button
              type="button"
              class="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] hover:bg-[var(--studio-primary-hover)] transition-colors flex items-center gap-1.5 cursor-pointer"
              :title="t('queue.download')"
              @click="handleSingleDownload(task)"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
              <span>{{ t("queue.download") }}</span>
            </button>
          </template>

          <button
            v-if="task.status === 'validating' || task.status === 'queued' || task.status === 'processing'"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] bg-[var(--studio-surface)] hover:bg-[var(--studio-surface-subtle)] border border-[var(--studio-border)] transition-colors cursor-pointer"
            @click="emit('cancel', task.id)"
          >
            {{ t("queue.cancel") }}
          </button>

          <button
            v-if="task.status === 'failed' || task.status === 'cancelled'"
            type="button"
            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-[var(--studio-ink)] bg-[var(--studio-surface-subtle)] hover:bg-[var(--studio-border)] border border-[var(--studio-border)] transition-colors flex items-center gap-1.5 cursor-pointer"
            @click="emit('retry', task.id)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clip-rule="evenodd" />
            </svg>
            <span>{{ t("queue.retry") }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

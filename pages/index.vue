<script setup lang="ts">
import { computed, ref } from "vue";
import type { QueueItem } from "../composables/useCompressionQueue.client";
import { downloadTask } from "../lib/image/download";

const { t } = useI18n();

usePageSeo({
  titleKey: "home.title",
  descriptionKey: "home.description",
  schemaType: "WebApplication",
  applicationCategory: "MultimediaApplication",
});

const faqJsonLd = computed(() => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [1, 2, 3, 4, 5].map((i) => ({
    "@type": "Question",
    name: t(`faq.q${i}`),
    acceptedAnswer: {
      "@type": "Answer",
      text: t(`faq.a${i}`),
    },
  })),
}));

useHead(() => ({
  script: [
    {
      type: "application/ld+json",
      key: "faq-ld-json",
      children: JSON.stringify(faqJsonLd.value).replace(/</g, "\\u003c"),
    },
  ],
}));

// 客户端压缩队列与状态管理
const queue = useCompressionQueue();
const {
  tasks,
  globalOptions,
  admissionError,
  isProcessing,
  stats,
  addFiles,
  cancelTask,
  retryTask,
  recompressAll,
  removeTask,
  clearAll,
} = queue;

// 画质前后对比弹窗状态
const isCompareOpen = ref(false);
const activeCompareTask = ref<QueueItem | null>(null);

const handleOpenCompare = (task: QueueItem) => {
  activeCompareTask.value = task;
  isCompareOpen.value = true;
};

const handleDownloadActiveCompare = () => {
  if (activeCompareTask.value) {
    downloadTask(activeCompareTask.value);
  }
};
</script>

<template>
  <div class="w-full space-y-10">
    <!-- 紧凑编辑式头部与硬件级规格条 -->
    <header class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6 items-end pb-6 border-b border-[var(--studio-border)]">
      <div class="lg:col-span-6 space-y-2.5">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs mono font-medium bg-[var(--studio-emerald-bg)] text-[var(--studio-emerald-ink)] border border-[var(--studio-emerald-border)]">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--studio-emerald)]" aria-hidden="true"></span>
          <span>{{ t("settings.localSafeBadge") }}</span>
        </div>

        <h1 class="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--studio-ink)] leading-tight">
          {{ t("home.heading") }}
        </h1>

        <p class="text-sm sm:text-base text-[var(--studio-ink-secondary)] max-w-xl leading-relaxed">
          {{ t("home.subheading") }}
        </p>
      </div>

      <!-- 3项技术规格摘要卡 -->
      <div class="lg:col-span-6 studio-card rounded-2xl grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--studio-border)] overflow-hidden">
        <div class="px-3.5 py-2.5 sm:py-3 space-y-0.5">
          <div class="text-[10px] mono uppercase tracking-wider text-[var(--studio-ink-muted)]">
            {{ t("home.specLocalLabel") }}
          </div>
          <div class="text-xs font-semibold text-[var(--studio-ink)]">
            {{ t("home.specLocalValue") }}
          </div>
        </div>
        <div class="px-3.5 py-2.5 sm:py-3 space-y-0.5">
          <div class="text-[10px] mono uppercase tracking-wider text-[var(--studio-ink-muted)]">
            {{ t("home.specEngineLabel") }}
          </div>
          <div class="text-xs font-semibold text-[var(--studio-ink)]">
            {{ t("home.specEngineValue") }}
          </div>
        </div>
        <div class="px-3.5 py-2.5 sm:py-3 space-y-0.5">
          <div class="text-[10px] mono uppercase tracking-wider text-[var(--studio-ink-muted)]">
            {{ t("home.specBatchLabel") }}
          </div>
          <div class="text-xs font-semibold text-[var(--studio-ink)]">
            {{ t("home.specBatchValue") }}
          </div>
        </div>
      </div>
    </header>

    <!-- 主工作台：左侧参数检查器 + 右侧上传画布与任务队列 -->
    <ClientOnly>
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-4 lg:sticky lg:top-20 min-w-0">
          <ImageSettings
            v-model="globalOptions"
            :disabled="isProcessing"
          />
        </div>

        <div class="lg:col-span-8 min-w-0 space-y-5">
          <ImageDropzone
            :compact="tasks.length > 0"
            @files-added="addFiles"
          />

          <p
            v-if="admissionError"
            role="alert"
            class="px-4 py-3 rounded-xl text-xs sm:text-sm font-medium bg-[var(--studio-amber-bg)] text-[var(--studio-amber-ink)] border border-[var(--studio-amber-border)]"
          >
            {{ t(`errors.${admissionError}`) }}
          </p>

          <ImageTaskList
            :tasks="tasks"
            :stats="stats"
            :is-processing="isProcessing"
            @cancel="cancelTask"
            @retry="retryTask"
            @recompress-all="recompressAll"
            @remove="removeTask"
            @clear-all="clearAll"
            @compare="handleOpenCompare"
          />
        </div>
      </div>

      <!-- SSG 预渲染占位骨架屏 -->
      <template #fallback>
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div class="lg:col-span-4 studio-card rounded-2xl p-6 space-y-4">
            <div class="h-4 w-28 rounded bg-[var(--studio-surface-subtle)]"></div>
            <div class="h-10 w-full rounded-xl bg-[var(--studio-surface-subtle)]"></div>
            <div class="h-16 w-full rounded-xl bg-[var(--studio-surface-subtle)]"></div>
          </div>
          <div class="lg:col-span-8 studio-card rounded-2xl p-12 text-center space-y-3">
            <div class="w-10 h-10 rounded-xl bg-[var(--studio-surface-subtle)] mx-auto"></div>
            <p class="text-sm text-[var(--studio-ink-secondary)]">{{ t("home.engineLoading") }}</p>
          </div>
        </div>
      </template>
    </ClientOnly>

    <!-- 画质对比弹窗 -->
    <ImageCompareModal
      v-model="isCompareOpen"
      :original-url="activeCompareTask?.previewUrl"
      :result-url="activeCompareTask?.resultUrl"
      :original-name="activeCompareTask?.originalName"
      :original-bytes="activeCompareTask?.originalBytes"
      :result-bytes="activeCompareTask?.result?.resultBytes"
      :width="activeCompareTask?.result?.width || activeCompareTask?.originalWidth"
      :height="activeCompareTask?.result?.height || activeCompareTask?.originalHeight"
      @download="handleDownloadActiveCompare"
    />

    <!-- 技术规格矩阵与常见问答 -->
    <ImageFaq />
  </div>
</template>

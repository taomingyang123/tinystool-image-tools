<script setup lang="ts">
const { t } = useI18n();

usePageSeo({
  titleKey: "privacy.title",
  descriptionKey: "privacy.description",
  schemaType: "WebPage",
});

const metadata = [
  { labelKey: "privacy.metaScopeLabel", valueKey: "privacy.metaScopeValue" },
  { labelKey: "privacy.metaEngineLabel", valueKey: "privacy.metaEngineValue" },
  { labelKey: "privacy.metaStorageLabel", valueKey: "privacy.metaStorageValue" },
  { labelKey: "privacy.metaHostLabel", valueKey: "privacy.metaHostValue" },
] as const;

const sections = [
  { num: "01", titleKey: "privacy.s1Title", contentKey: "privacy.s1Content" },
  { num: "02", titleKey: "privacy.s2Title", contentKey: "privacy.s2Content" },
  { num: "03", titleKey: "privacy.s3Title", contentKey: "privacy.s3Content" },
  { num: "04", titleKey: "privacy.s4Title", contentKey: "privacy.s4Content" },
] as const;
</script>

<template>
  <div class="w-full space-y-8">
    <header class="space-y-3 pb-6 border-b border-[var(--studio-border)]">
      <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs mono font-medium bg-[var(--studio-emerald-bg)] text-[var(--studio-emerald-ink)] border border-[var(--studio-emerald-border)]">
        <span class="w-1.5 h-1.5 rounded-full bg-[var(--studio-emerald)]" aria-hidden="true"></span>
        <span>{{ t("privacy.badge") }}</span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-bold tracking-tight text-[var(--studio-ink)]">
        {{ t("privacy.title") }}
      </h1>

      <p class="text-xs sm:text-sm mono text-[var(--studio-ink-muted)]">
        Tiny Image (image.tinystool.org) · 100% Client-Side Processing
      </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- 左侧：声明摘要 -->
      <aside class="lg:col-span-4 lg:sticky lg:top-20 studio-card rounded-2xl overflow-hidden">
        <dl class="divide-y divide-[var(--studio-border)] text-xs">
          <div v-for="item in metadata" :key="item.labelKey" class="px-4 py-3.5 space-y-1">
            <dt class="mono uppercase tracking-wider text-[11px] text-[var(--studio-ink-muted)]">
              {{ t(item.labelKey) }}
            </dt>
            <dd class="font-semibold text-[var(--studio-ink)]">
              {{ t(item.valueKey) }}
            </dd>
          </div>
        </dl>
      </aside>

      <!-- 右侧：正式条款正文 -->
      <article class="lg:col-span-8 space-y-4">
        <section
          v-for="sec in sections"
          :key="sec.num"
          class="studio-card rounded-2xl p-6 space-y-2.5"
        >
          <h2 class="text-base sm:text-lg font-bold text-[var(--studio-ink)]">
            {{ t(sec.titleKey) }}
          </h2>
          <p class="text-sm text-[var(--studio-ink-secondary)] leading-relaxed">
            {{ t(sec.contentKey) }}
          </p>
        </section>
      </article>
    </div>
  </div>
</template>

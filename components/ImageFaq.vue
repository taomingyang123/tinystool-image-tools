<script setup lang="ts">
import { ref } from "vue";

const { t } = useI18n();

const openIndex = ref<number | null>(0);

const toggle = (index: number) => {
  openIndex.value = openIndex.value === index ? null : index;
};

const faqs = [
  { qKey: "faq.q1", aKey: "faq.a1" },
  { qKey: "faq.q2", aKey: "faq.a2" },
  { qKey: "faq.q3", aKey: "faq.a3" },
  { qKey: "faq.q4", aKey: "faq.a4" },
  { qKey: "faq.q5", aKey: "faq.a5" },
] as const;

const specs = [
  { labelKey: "faq.specInputLabel", valueKey: "faq.specInputValue" },
  { labelKey: "faq.specOutputLabel", valueKey: "faq.specOutputValue" },
  { labelKey: "faq.specAlphaLabel", valueKey: "faq.specAlphaValue" },
  { labelKey: "faq.specIsolationLabel", valueKey: "faq.specIsolationValue" },
] as const;
</script>

<template>
  <section class="pt-12 border-t border-[var(--studio-border)]">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
      <!-- 左侧：标题与格式能力矩阵 -->
      <div class="lg:col-span-5 space-y-5">
        <div class="space-y-2">
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight text-[var(--studio-ink)]">
            {{ t("faq.sectionTitle") }}
          </h2>
          <p class="text-sm text-[var(--studio-ink-secondary)] leading-relaxed">
            {{ t("faq.sectionSubtitle") }}
          </p>
        </div>

        <div class="studio-card rounded-2xl overflow-hidden">
          <div class="px-4 py-3 border-b border-[var(--studio-border)] bg-[var(--studio-surface-muted)]">
            <h3 class="text-xs font-semibold uppercase tracking-wider text-[var(--studio-ink-secondary)]">
              {{ t("faq.specTitle") }}
            </h3>
          </div>
          <dl class="divide-y divide-[var(--studio-border)] text-xs">
            <div v-for="spec in specs" :key="spec.labelKey" class="px-4 py-3 space-y-1">
              <dt class="font-semibold text-[var(--studio-ink)]">
                {{ t(spec.labelKey) }}
              </dt>
              <dd class="text-[var(--studio-ink-secondary)] leading-relaxed">
                {{ t(spec.valueKey) }}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <!-- 右侧：编号问答手风琴 -->
      <div class="lg:col-span-7 studio-card rounded-2xl divide-y divide-[var(--studio-border)] overflow-hidden">
        <div v-for="(item, idx) in faqs" :key="item.qKey">
          <button
            type="button"
            :aria-expanded="openIndex === idx"
            :aria-controls="`faq-panel-${idx}`"
            class="w-full px-5 py-4 text-left flex items-start justify-between gap-4 hover:bg-[var(--studio-surface-muted)] transition-colors cursor-pointer"
            @click="toggle(idx)"
          >
            <div class="flex items-baseline gap-3 min-w-0">
              <span class="text-xs mono tabular-nums text-[var(--studio-ink-muted)] shrink-0">
                {{ String(idx + 1).padStart(2, "0") }}
              </span>
              <span class="text-sm font-semibold text-[var(--studio-ink)] leading-snug">
                {{ t(item.qKey) }}
              </span>
            </div>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-4 h-4 shrink-0 mt-0.5 transition-transform duration-200 text-[var(--studio-ink-muted)]"
              :class="{ 'rotate-180 text-[var(--studio-ink)]': openIndex === idx }"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <div
            v-show="openIndex === idx"
            :id="`faq-panel-${idx}`"
            class="px-5 pb-5 pl-12 text-sm text-[var(--studio-ink-secondary)] leading-relaxed"
          >
            {{ t(item.aKey) }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

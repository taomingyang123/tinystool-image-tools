<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { NuxtError } from "#app";

const props = defineProps<{ error: NuxtError }>();
const { t, locale } = useI18n();
const localePath = useLocalePath();
const siteName = useRuntimeConfig().public.siteName;
const { isDark } = useTheme();

const isNotFound = computed(() => props.error.statusCode === 404);
const title = computed(() => t(isNotFound.value ? "error.notFound" : "error.unavailable"));

const htmlLang = computed(() => {
  if (locale.value === "zh") return "zh-CN";
  if (locale.value === "ja") return "ja";
  return "en";
});

useHead(() => ({
  title: `${title.value} | ${siteName}`,
  htmlAttrs: {
    lang: htmlLang.value,
    class: isDark.value ? "dark" : "",
  },
  meta: [{ name: "robots", content: "noindex, nofollow" }],
}));
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <main class="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center py-16">
      <div class="studio-card rounded-2xl p-8 sm:p-10 max-w-md w-full space-y-5">
        <div class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs mono font-medium bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]">
          <span>HTTP {{ error.statusCode || 500 }}</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--studio-ink)]">
          {{ title }}
        </h1>
        <p class="text-sm text-[var(--studio-ink-secondary)] leading-relaxed">
          {{ t("error.description") }}
        </p>
        <div class="pt-2">
          <button
            type="button"
            class="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] hover:bg-[var(--studio-primary-hover)] transition-colors cursor-pointer"
            @click="clearError({ redirect: localePath('/') })"
          >
            {{ t("common.home") }}
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

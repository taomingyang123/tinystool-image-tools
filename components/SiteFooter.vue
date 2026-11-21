<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const siteName = useRuntimeConfig().public.siteName;
</script>

<template>
  <footer class="border-t border-[var(--studio-border)] bg-[var(--studio-surface-muted)]">
    <div class="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-[var(--studio-ink-secondary)]">
      <div class="flex items-center gap-2.5">
        <span class="w-2 h-2 rounded-full bg-[var(--studio-emerald)]" aria-hidden="true"></span>
        <p class="m-0">
          <span class="font-semibold text-[var(--studio-ink)]">{{ siteName }}</span>
          <span class="mx-1.5 text-[var(--studio-ink-muted)]">·</span>
          <span>{{ t("common.siteTagline") }}</span>
          <span class="mx-1.5 text-[var(--studio-ink-muted)]">·</span>
          <span class="mono text-xs text-[var(--studio-ink-muted)]">© 2026</span>
        </p>
      </div>

      <div class="flex flex-wrap items-center gap-5">
        <NuxtLink :to="localePath('/privacy')" class="hover:text-[var(--studio-ink)] transition-colors">
          {{ t("common.privacy") }}
        </NuxtLink>
        <a href="/third-party-licenses.txt" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--studio-ink)] transition-colors">
          {{ t("common.licenses") }}
        </a>
        <a href="https://tinystool.org" target="_blank" rel="noopener noreferrer" class="hover:text-[var(--studio-ink)] transition-colors">
          Tiny's Tool ↗
        </a>
      </div>
    </div>
  </footer>
</template>

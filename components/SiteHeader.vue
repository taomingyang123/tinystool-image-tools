<script setup lang="ts">
const { t } = useI18n();
const localePath = useLocalePath();
const switchLocalePath = useSwitchLocalePath();
const siteName = useRuntimeConfig().public.siteName;
const { isDark, toggleTheme } = useTheme();

const languages = [
  { code: "zh", label: "中文", lang: "zh-CN" },
  { code: "en", label: "EN", lang: "en" },
  { code: "ja", label: "日本語", lang: "ja" },
] as const;
</script>

<template>
  <header class="sticky top-0 z-40 border-b border-[var(--studio-border)] bg-[var(--studio-bg)]/90 backdrop-blur-md">
    <div class="w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
      <!-- 品牌标识 -->
      <NuxtLink :to="localePath('/')" class="flex items-center gap-2.5 group shrink-0">
        <div class="w-8 h-8 rounded-lg bg-[var(--studio-primary)] text-[var(--studio-primary-ink)] flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3" />
            <rect x="8" y="8" width="8" height="8" rx="1.5" />
          </svg>
        </div>
        <div class="flex items-baseline gap-2">
          <span class="text-base sm:text-lg font-bold tracking-tight text-[var(--studio-ink)]">
            {{ siteName }}
          </span>
          <span class="hidden md:inline-block text-[11px] mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--studio-surface-subtle)] text-[var(--studio-ink-secondary)] border border-[var(--studio-border)]">
            WASM
          </span>
        </div>
      </NuxtLink>

      <!-- 主导航与工具栏 -->
      <nav :aria-label="t('common.navigation')" class="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
        <div class="flex items-center gap-1">
          <NuxtLink
            :to="localePath('/')"
            class="px-2.5 py-1.5 rounded-md font-medium text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] hover:bg-[var(--studio-surface-subtle)] transition-colors"
            exact-active-class="!text-[var(--studio-ink)] !bg-[var(--studio-surface)] shadow-sm border border-[var(--studio-border)]"
          >
            {{ t("common.home") }}
          </NuxtLink>
          <NuxtLink
            :to="localePath('/privacy')"
            class="px-2.5 py-1.5 rounded-md font-medium text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] hover:bg-[var(--studio-surface-subtle)] transition-colors"
            exact-active-class="!text-[var(--studio-ink)] !bg-[var(--studio-surface)] shadow-sm border border-[var(--studio-border)]"
          >
            {{ t("common.privacy") }}
          </NuxtLink>
        </div>

        <div class="h-4 w-px bg-[var(--studio-border)] hidden sm:block" aria-hidden="true"></div>

        <div class="flex items-center gap-1.5">
          <!-- 主题切换（浅色工作室 / 暗房模式） -->
          <button
            type="button"
            class="w-8 h-8 rounded-lg border border-[var(--studio-border)] bg-[var(--studio-surface)] text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] hover:border-[var(--studio-border-strong)] flex items-center justify-center transition-colors cursor-pointer"
            :aria-label="isDark ? t('common.switchToLight') : t('common.switchToDark')"
            :title="isDark ? t('common.switchToLight') : t('common.switchToDark')"
            @click="toggleTheme"
          >
            <svg v-if="isDark" xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
            </svg>
          </button>

          <!-- 语言切换分段控件 -->
          <div class="inline-flex items-center p-0.5 rounded-lg bg-[var(--studio-surface-subtle)] border border-[var(--studio-border)]">
            <NuxtLink
              v-for="item in languages"
              :key="item.code"
              :to="switchLocalePath(item.code)"
              :lang="item.lang"
              class="px-2 py-1 rounded-md text-[11px] sm:text-xs mono font-medium text-[var(--studio-ink-secondary)] hover:text-[var(--studio-ink)] transition-colors whitespace-nowrap"
              active-class="!bg-[var(--studio-surface)] !text-[var(--studio-ink)] !font-semibold shadow-sm"
            >
              {{ item.label }}
            </NuxtLink>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

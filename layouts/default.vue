<template>
  <div class="min-h-screen flex flex-col">
    <SiteHeader />
    <main id="main-content" class="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <slot />
    </main>
    <SiteFooter />
  </div>
</template>

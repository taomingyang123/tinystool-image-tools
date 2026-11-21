import { computed } from "vue";

export type StudioTheme = "light" | "dark";

/**
 * 工作室主题状态管理（默认浅色工作室，支持一键切换暗房模式；不写入持久化存储）
 */
export function useTheme() {
  const theme = useState<StudioTheme>("studio-theme", () => "light");
  const isDark = computed(() => theme.value === "dark");

  const toggleTheme = () => {
    theme.value = theme.value === "dark" ? "light" : "dark";
  };

  return {
    theme,
    isDark,
    toggleTheme,
  };
}

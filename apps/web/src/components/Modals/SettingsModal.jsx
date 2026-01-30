import { X, RotateCcw } from "lucide-react";
import { useSettings } from "@/hooks/useSettings";

const FONT_SIZES = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
  { value: "xl", label: "Extra Large" },
];

const DENSITY_OPTIONS = [
  { value: "compact", label: "Compact" },
  { value: "comfortable", label: "Comfortable" },
  { value: "spacious", label: "Spacious" },
];

const DISPLAY_MODES = [
  { value: "todo-strike", label: "Task (Strikethrough)" },
  { value: "todo-no-strike", label: "Task (No Strikethrough)" },
  { value: "bullet", label: "Bullet Point" },
  { value: "log-clock", label: "Log (Clock)" },
];

const SORT_OPTIONS = [
  { value: "created", label: "Date Created" },
  { value: "priority", label: "Priority" },
  { value: "alphabetical", label: "Alphabetical" },
];

const DARK_MODE_OPTIONS = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

function SectionHeader({ children }) {
  return (
    <h3 className="text-xs font-bold text-[#A8ADB4] uppercase tracking-wider mt-6 mb-3 first:mt-0">
      {children}
    </h3>
  );
}

function SettingRow({ label, children }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-[#EDEDED] dark:border-[#333333] last:border-b-0">
      <span className="text-sm text-[#1E1E1E] dark:text-white">{label}</span>
      <div className="flex items-center">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        checked ? "bg-[#219079]" : "bg-[#E2E2E2] dark:bg-[#333333]"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-[#F7F7F7] dark:bg-[#262626] text-[#1E1E1E] dark:text-white text-sm py-1.5 px-3 rounded-xl border border-[#EDEDED] dark:border-[#333333] outline-none"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export function SettingsModal({ isOpen, onClose }) {
  const { settings, updateSetting, resetSettings } = useSettings();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-lg rounded-3xl p-8 shadow-2xl max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={resetSettings}
              className="text-[#70757F] hover:text-[#1E1E1E] dark:hover:text-white p-1"
              title="Reset to defaults"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={onClose}
              className="text-[#70757F] hover:text-[#1E1E1E] dark:hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 pr-1">
          <SectionHeader>Appearance</SectionHeader>
          <SettingRow label="Dark Mode">
            <Select
              value={settings.darkMode}
              onChange={(v) => updateSetting("darkMode", v)}
              options={DARK_MODE_OPTIONS}
            />
          </SettingRow>
          <SettingRow label="Font Size">
            <Select
              value={settings.fontSize}
              onChange={(v) => updateSetting("fontSize", v)}
              options={FONT_SIZES}
            />
          </SettingRow>
          <SettingRow label="List Density">
            <Select
              value={settings.listDensity}
              onChange={(v) => updateSetting("listDensity", v)}
              options={DENSITY_OPTIONS}
            />
          </SettingRow>

          <SectionHeader>List Defaults</SectionHeader>
          <SettingRow label="Default Display Mode">
            <Select
              value={settings.defaultDisplayMode}
              onChange={(v) => updateSetting("defaultDisplayMode", v)}
              options={DISPLAY_MODES}
            />
          </SettingRow>
          <SettingRow label="Show Completed Items">
            <Toggle
              checked={settings.showCompleted}
              onChange={(v) => updateSetting("showCompleted", v)}
            />
          </SettingRow>
          <SettingRow label="Default Sort">
            <Select
              value={settings.defaultSort}
              onChange={(v) => updateSetting("defaultSort", v)}
              options={SORT_OPTIONS}
            />
          </SettingRow>

          <SectionHeader>Export</SectionHeader>
          <SettingRow label="Default Export Format">
            <Select
              value={settings.lastExportFormat}
              onChange={(v) => updateSetting("lastExportFormat", v)}
              options={[
                { value: "text", label: "Plain Text" },
                { value: "ics", label: "Apple Reminders (.ics)" },
                { value: "json", label: "JSON" },
              ]}
            />
          </SettingRow>
          <SettingRow label="Include Completed in Export">
            <Toggle
              checked={settings.exportIncludeCompleted}
              onChange={(v) => updateSetting("exportIncludeCompleted", v)}
            />
          </SettingRow>

          <SectionHeader>Account</SectionHeader>
          <div className="py-3">
            <a
              href="/account/signin"
              className="text-sm text-[#219079] hover:underline"
            >
              Manage Account
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

import { View, Text, ScrollView, Switch, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useSettings } from "@/hooks/useSettings";

function SectionHeader({ children }) {
  return <Text style={styles.sectionHeader}>{children}</Text>;
}

function SettingRow({ label, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.control}>{children}</View>
    </View>
  );
}

function SettingPicker({ value, onChange, items }) {
  return (
    <Picker
      selectedValue={value}
      onValueChange={onChange}
      style={styles.picker}
      itemStyle={styles.pickerItem}
    >
      {items.map((item) => (
        <Picker.Item key={item.value} label={item.label} value={item.value} />
      ))}
    </Picker>
  );
}

export function SettingsScreen() {
  const { settings, updateSetting } = useSettings();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <SectionHeader>Appearance</SectionHeader>
      <SettingRow label="Dark Mode">
        <SettingPicker
          value={settings.darkMode}
          onChange={(v) => updateSetting("darkMode", v)}
          items={[
            { value: "system", label: "System" },
            { value: "light", label: "Light" },
            { value: "dark", label: "Dark" },
          ]}
        />
      </SettingRow>
      <SettingRow label="Font Size">
        <SettingPicker
          value={settings.fontSize}
          onChange={(v) => updateSetting("fontSize", v)}
          items={[
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
            { value: "xl", label: "Extra Large" },
          ]}
        />
      </SettingRow>
      <SettingRow label="List Density">
        <SettingPicker
          value={settings.listDensity}
          onChange={(v) => updateSetting("listDensity", v)}
          items={[
            { value: "compact", label: "Compact" },
            { value: "comfortable", label: "Comfortable" },
            { value: "spacious", label: "Spacious" },
          ]}
        />
      </SettingRow>

      <SectionHeader>List Defaults</SectionHeader>
      <SettingRow label="Default Display Mode">
        <SettingPicker
          value={settings.defaultDisplayMode}
          onChange={(v) => updateSetting("defaultDisplayMode", v)}
          items={[
            { value: "todo-strike", label: "Task (Strikethrough)" },
            { value: "todo-no-strike", label: "Task (No Strike)" },
            { value: "bullet", label: "Bullet Point" },
            { value: "log-clock", label: "Log (Clock)" },
          ]}
        />
      </SettingRow>
      <SettingRow label="Show Completed">
        <Switch
          value={settings.showCompleted}
          onValueChange={(v) => updateSetting("showCompleted", v)}
          trackColor={{ true: "#219079" }}
        />
      </SettingRow>
      <SettingRow label="Default Sort">
        <SettingPicker
          value={settings.defaultSort}
          onChange={(v) => updateSetting("defaultSort", v)}
          items={[
            { value: "created", label: "Date Created" },
            { value: "priority", label: "Priority" },
            { value: "alphabetical", label: "Alphabetical" },
          ]}
        />
      </SettingRow>

      <SectionHeader>Export</SectionHeader>
      <SettingRow label="Default Format">
        <SettingPicker
          value={settings.lastExportFormat}
          onChange={(v) => updateSetting("lastExportFormat", v)}
          items={[
            { value: "text", label: "Plain Text" },
            { value: "ics", label: "Apple Reminders" },
            { value: "json", label: "JSON" },
          ]}
        />
      </SettingRow>
      <SettingRow label="Include Completed">
        <Switch
          value={settings.exportIncludeCompleted}
          onValueChange={(v) => updateSetting("exportIncludeCompleted", v)}
          trackColor={{ true: "#219079" }}
        />
      </SettingRow>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F9F9" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 24, fontWeight: "800", color: "#1E1E1E", marginBottom: 20 },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A8ADB4",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 6,
  },
  label: { fontSize: 14, color: "#1E1E1E", flex: 1 },
  control: { alignItems: "flex-end" },
  picker: { width: 160, height: 36 },
  pickerItem: { fontSize: 14 },
});

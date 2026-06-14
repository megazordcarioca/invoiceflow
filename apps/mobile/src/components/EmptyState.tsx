import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Props {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color="#d1d5db" />
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.button} onPress={onAction}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", padding: 32 },
  title: { fontSize: 16, fontWeight: "600", color: "#111827", marginTop: 16, marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  button: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: { color: "#fff", fontSize: 14, fontWeight: "600" },
});

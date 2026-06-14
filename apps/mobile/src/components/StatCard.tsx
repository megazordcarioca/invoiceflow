import { View, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  value: string;
  variant?: "default" | "warning";
}

export default function StatCard({ label, value, variant = "default" }: Props) {
  return (
    <View style={[styles.card, variant === "warning" && styles.warningCard]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, variant === "warning" && styles.warningValue]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  warningCard: { borderColor: "#fde68a", backgroundColor: "#fffbeb" },
  label: { fontSize: 12, fontWeight: "500", color: "#6b7280", marginBottom: 4 },
  value: { fontSize: 28, fontWeight: "700", color: "#111827" },
  warningValue: { color: "#d97706" },
});

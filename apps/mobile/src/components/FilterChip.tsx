import { TouchableOpacity, Text, StyleSheet } from "react-native";

interface Props {
  label: string;
  active: boolean;
  onPress: () => void;
}

export default function FilterChip({ label, active, onPress }: Props) {
  return (
    <TouchableOpacity style={[styles.chip, active && styles.activeChip]} onPress={onPress}>
      <Text style={[styles.label, active && styles.activeLabel]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  activeChip: { backgroundColor: "#dbeafe", borderColor: "#2563eb" },
  label: { fontSize: 13, color: "#6b7280", fontWeight: "500" },
  activeLabel: { color: "#2563eb" },
});

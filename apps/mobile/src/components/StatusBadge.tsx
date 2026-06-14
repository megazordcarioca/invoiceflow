import { View, Text, StyleSheet } from "react-native";
import { InvoiceStatus } from "../types/invoice";
import { STATUS_COLORS } from "../lib/constants";

interface Props {
  status: InvoiceStatus;
}

export default function StatusBadge({ status }: Props) {
  const config = STATUS_COLORS[status];
  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  text: { fontSize: 11, fontWeight: "600" },
});

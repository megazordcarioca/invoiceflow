import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Invoice } from "../types/invoice";
import StatusBadge from "./StatusBadge";

interface Props {
  invoice: Invoice;
  onPress: () => void;
  onDelete?: () => void;
}

export default function InvoiceCard({ invoice, onPress }: Props) {
  const total = invoice.line_items?.reduce((s, i) => s + i.quantity * i.unit_price, 0) ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.topRow}>
        <Text style={styles.invoiceNumber}>{invoice.invoice_number}</Text>
        <Text style={styles.dueDate}>Due: {invoice.due_date}</Text>
      </View>
      <View style={styles.bottomRow}>
        <Text style={styles.clientName} numberOfLines={1}>
          {invoice.client_name}
        </Text>
        <StatusBadge status={invoice.status} />
      </View>
      <Text style={styles.amount}>${total.toFixed(2)}</Text>
      <View style={styles.divider} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  invoiceNumber: { fontSize: 13, fontWeight: "600", color: "#111827" },
  dueDate: { fontSize: 12, color: "#6b7280" },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  clientName: { fontSize: 15, color: "#111827", flex: 1, marginRight: 8 },
  amount: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 8 },
  divider: { height: 1, backgroundColor: "#f3f4f6" },
});

import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRoute, RouteProp } from "@react-navigation/native";
import { api } from "../api/client";
import { Invoice } from "../types/invoice";
import StatusBadge from "../components/StatusBadge";
import { InvoicesStackParamList } from "../navigation/RootNavigator";

type DetailRoute = RouteProp<InvoicesStackParamList, "InvoiceDetail">;
type ScreenState = "loading" | "error" | "not_found" | "default";

export default function InvoiceDetailScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const route = useRoute<DetailRoute>();
  const { id } = route.params;
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [state, setState] = useState<ScreenState>("loading");

  const fetchInvoice = useCallback(async () => {
    setState("loading");
    try {
      const result = await api.get<Invoice>(`/invoices/${id}`);
      if (!result) {
        setState("not_found");
      } else {
        setInvoice(result);
        setState("default");
      }
    } catch {
      setState("error");
    }
  }, [id]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handleMarkPaid = async () => {
    try {
      await api.post(`/invoices/${id}/pay`);
      Alert.alert("Success", "Invoice marked as paid");
      fetchInvoice();
    } catch {
      Alert.alert("Error", "Failed to mark as paid");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Invoice", "Are you sure you want to delete this invoice?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/invoices/${id}`);
            Alert.alert("Deleted", "Invoice deleted", [
              { text: "OK", onPress: () => navigation.goBack() },
            ]);
          } catch {
            Alert.alert("Error", "Failed to delete invoice");
          }
        },
      },
    ]);
  };

  const handleSendReminder = async () => {
    try {
      await api.post(`/invoices/${id}/reminders`);
      Alert.alert("Success", "Reminder sent to client");
    } catch {
      Alert.alert("Error", "Failed to send reminder");
    }
  };

  const handleShare = async () => {
    if (!invoice) return;
    try {
      await Share.share({
        message: `Invoice ${invoice.invoice_number} - $${invoice.line_items?.reduce((s, i) => s + i.quantity * i.unit_price, 0).toFixed(2) ?? "0.00"}`,
      });
    } catch {
      // user cancelled
    }
  };

  if (state === "loading") {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (state === "error") {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Failed to load invoice</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInvoice}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === "not_found" || !invoice) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Invoice not found</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Back to invoices</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const lineTotal = invoice.line_items?.reduce((s, i) => s + i.quantity * i.unit_price, 0) ?? 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>&lt; Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{invoice.invoice_number}</Text>
        <TouchableOpacity onPress={handleShare}>
          <Text style={styles.menuButton}>⋮</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusRow}>
          <StatusBadge status={invoice.status} />
          <Text style={styles.dueText}>Due: {invoice.due_date}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Bill To</Text>
          <Text style={styles.cardText}>{invoice.client_name}</Text>
          <Text style={styles.cardSubtext}>{invoice.client_email}</Text>
          {invoice.client_address && (
            <Text style={styles.cardSubtext}>{invoice.client_address}</Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableCol, styles.colDesc]}>Description</Text>
            <Text style={styles.tableCol}>Qty</Text>
            <Text style={[styles.tableCol, styles.colPrice]}>Price</Text>
          </View>
          {invoice.line_items?.map((item, i) => (
            <View key={i} style={styles.tableRow}>
              <Text style={[styles.tableCol, styles.colDesc]}>{item.description}</Text>
              <Text style={styles.tableCol}>{item.quantity}</Text>
              <Text style={[styles.tableCol, styles.colPrice]}>${item.unit_price.toFixed(2)}</Text>
            </View>
          ))}
          <View style={styles.tableTotal}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${lineTotal.toFixed(2)}</Text>
          </View>
        </View>

        {invoice.notes && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.cardText}>{invoice.notes}</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={handleMarkPaid}>
            <Text style={styles.actionText}>Mark as Paid</Text>
          </TouchableOpacity>
          {invoice.status === "overdue" && (
            <TouchableOpacity
              style={[styles.actionButton, styles.warningButton]}
              onPress={handleSendReminder}
            >
              <Text style={styles.actionText}>Send Reminder</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.actionButton, styles.errorButton]}
            onPress={handleDelete}
          >
            <Text style={styles.actionText}>Delete Invoice</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { fontSize: 15, color: "#2563eb", fontWeight: "500" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  menuButton: { fontSize: 22, color: "#111827", fontWeight: "700" },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  dueText: { fontSize: 13, color: "#6b7280" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cardTitle: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 8 },
  cardText: { fontSize: 15, color: "#111827", marginBottom: 4 },
  cardSubtext: { fontSize: 13, color: "#6b7280" },
  tableHeader: {
    flexDirection: "row",
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  tableCol: { fontSize: 14, color: "#111827" },
  colDesc: { flex: 2 },
  colPrice: { textAlign: "right" },
  tableTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: { fontSize: 14, fontWeight: "600", color: "#111827" },
  totalValue: { fontSize: 16, fontWeight: "700", color: "#111827" },
  actions: { gap: 12, marginTop: 8 },
  actionButton: {
    height: 48,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  warningButton: { backgroundColor: "#d97706" },
  errorButton: { backgroundColor: "#dc2626" },
  actionText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  errorText: { fontSize: 15, color: "#6b7280", marginBottom: 12 },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});

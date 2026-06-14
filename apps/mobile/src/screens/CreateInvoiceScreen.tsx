import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";
import { LineItem, InvoiceFormData } from "../types/invoice";
import { FREE_TIER_LIMIT } from "../lib/constants";

export default function CreateInvoiceScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<InvoiceFormData>({
    client_name: "",
    client_email: "",
    client_address: "",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: "",
    notes: "",
    line_items: [{ description: "", quantity: 1, unit_price: 0 }],
  });

  const addLineItem = () => {
    setForm((prev) => ({
      ...prev,
      line_items: [...prev.line_items, { description: "", quantity: 1, unit_price: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    if (form.line_items.length <= 1) return;
    setForm((prev) => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index),
    }));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setForm((prev) => {
      const items = [...prev.line_items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, line_items: items };
    });
  };

  const total = form.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmit = async () => {
    if (!form.client_name.trim()) {
      Alert.alert("Validation", "Client name is required");
      return;
    }
    if (!form.client_email.trim()) {
      Alert.alert("Validation", "Client email is required");
      return;
    }
    if (!form.due_date) {
      Alert.alert("Validation", "Due date is required");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/invoices", form);
      Alert.alert("Success", "Invoice created", [
        { text: "OK", onPress: () => navigation.navigate("Invoices") },
      ]);
    } catch (err: any) {
      if (err.status === 403) {
        Alert.alert(
          "Tier Limit",
          `You've reached the free tier limit of ${FREE_TIER_LIMIT} invoices per month.`
        );
      } else {
        Alert.alert("Error", err.message ?? "Failed to create invoice");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>&lt; Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Invoice</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionLabel}>Client Information</Text>
          <TextInput
            style={styles.input}
            placeholder="Client Name *"
            value={form.client_name}
            onChangeText={(v) => setForm((prev) => ({ ...prev, client_name: v }))}
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            placeholder="Client Email *"
            value={form.client_email}
            onChangeText={(v) => setForm((prev) => ({ ...prev, client_email: v }))}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9ca3af"
          />
          <TextInput
            style={styles.input}
            placeholder="Client Address (optional)"
            value={form.client_address}
            onChangeText={(v) => setForm((prev) => ({ ...prev, client_address: v }))}
            placeholderTextColor="#9ca3af"
          />

          <Text style={styles.sectionLabel}>Invoice Details</Text>
          <View style={styles.dateRow}>
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="Issue Date *"
              value={form.issue_date}
              onChangeText={(v) => setForm((prev) => ({ ...prev, issue_date: v }))}
              placeholderTextColor="#9ca3af"
            />
            <TextInput
              style={[styles.input, styles.dateInput]}
              placeholder="Due Date *"
              value={form.due_date}
              onChangeText={(v) => setForm((prev) => ({ ...prev, due_date: v }))}
              placeholderTextColor="#9ca3af"
            />
          </View>

          <View style={styles.lineItemsHeader}>
            <Text style={styles.sectionLabel}>Line Items</Text>
            <TouchableOpacity onPress={addLineItem}>
              <Text style={styles.addItem}>+ Add</Text>
            </TouchableOpacity>
          </View>

          {form.line_items.map((item, index) => (
            <View key={index} style={styles.lineItemCard}>
              <View style={styles.lineItemRow}>
                <TextInput
                  style={[styles.input, styles.descriptionInput]}
                  placeholder="Description"
                  value={item.description}
                  onChangeText={(v) => updateLineItem(index, "description", v)}
                  placeholderTextColor="#9ca3af"
                />
                <TouchableOpacity onPress={() => removeLineItem(index)}>
                  <Text style={styles.removeItem}>✕</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.lineItemDetails}>
                <TextInput
                  style={[styles.input, styles.qtyInput]}
                  placeholder="Qty"
                  value={String(item.quantity)}
                  onChangeText={(v) => updateLineItem(index, "quantity", parseInt(v) || 0)}
                  keyboardType="number-pad"
                  placeholderTextColor="#9ca3af"
                />
                <TextInput
                  style={[styles.input, styles.priceInput]}
                  placeholder="Price"
                  value={String(item.unit_price)}
                  onChangeText={(v) => updateLineItem(index, "unit_price", parseFloat(v) || 0)}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>
          ))}

          <TextInput
            style={[styles.input, styles.notesInput]}
            placeholder="Notes (optional)"
            value={form.notes}
            onChangeText={(v) => setForm((prev) => ({ ...prev, notes: v }))}
            multiline
            placeholderTextColor="#9ca3af"
          />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total:</Text>
            <Text style={styles.totalValue}>${total.toFixed(2)}</Text>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.submitDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitText}>Create Invoice</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: { fontSize: 15, color: "#2563eb", fontWeight: "500" },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  dateRow: { flexDirection: "row", gap: 12 },
  dateInput: { flex: 1 },
  lineItemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  addItem: { fontSize: 14, color: "#2563eb", fontWeight: "600" },
  lineItemCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  lineItemRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  descriptionInput: { flex: 1, marginBottom: 0 },
  removeItem: { fontSize: 18, color: "#dc2626", padding: 4 },
  lineItemDetails: { flexDirection: "row", gap: 12, marginTop: 8 },
  qtyInput: { flex: 1, marginBottom: 0 },
  priceInput: { flex: 2, marginBottom: 0 },
  notesInput: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 8,
  },
  totalLabel: { fontSize: 16, fontWeight: "600", color: "#111827" },
  totalValue: { fontSize: 20, fontWeight: "700", color: "#111827" },
  submitButton: {
    height: 48,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "600" },
});

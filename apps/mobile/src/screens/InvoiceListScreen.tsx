import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { api } from "../api/client";
import { Invoice, InvoiceStatus } from "../types/invoice";
import InvoiceCard from "../components/InvoiceCard";
import EmptyState from "../components/EmptyState";
import FilterChip from "../components/FilterChip";
import { InvoicesStackParamList } from "../navigation/RootNavigator";

type InvoiceListNav = NativeStackNavigationProp<InvoicesStackParamList, "InvoiceList">;

type ScreenState = "loading" | "error" | "empty" | "default";

const STATUS_FILTERS: (InvoiceStatus | "all")[] = ["all", "draft", "sent", "paid", "overdue"];

export default function InvoiceListScreen({ navigation }: { navigation: InvoiceListNav }) {
  const insets = useSafeAreaInsets();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [state, setState] = useState<ScreenState>("loading");
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<InvoiceStatus | "all">("all");

  const fetchInvoices = useCallback(async () => {
    setState("loading");
    try {
      const result = await api.get<Invoice[]>("/invoices");
      setInvoices(result);
      setState(result.length === 0 ? "empty" : "default");
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const filtered = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.client_name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || inv.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (invoice: Invoice) => {
    Alert.alert("Delete Invoice", `Delete ${invoice.invoice_number}?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/invoices/${invoice.id}`);
            fetchInvoices();
          } catch {
            Alert.alert("Error", "Failed to delete invoice");
          }
        },
      },
    ]);
  };

  if (state === "loading" && invoices.length === 0) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (state === "error") {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Failed to load invoices</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInvoices}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Invoices</Text>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.navigate("CreateInvoice")}
          style={styles.addButton}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search invoices..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#9ca3af"
          />
        </View>
      </View>

      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <FilterChip
            label={item === "all" ? "All" : item.charAt(0).toUpperCase() + item.slice(1)}
            active={activeFilter === item}
            onPress={() => setActiveFilter(item)}
          />
        )}
      />

      {filtered.length === 0 ? (
        <View style={styles.center}>
          <EmptyState
            icon="search-outline"
            title="No invoices found"
            subtitle={
              search || activeFilter !== "all"
                ? "Try a different search or filter"
                : "Create your first invoice"
            }
            actionLabel={search || activeFilter !== "all" ? "Clear Filters" : "Create Invoice"}
            onAction={() => {
              if (search || activeFilter !== "all") {
                setSearch("");
                setActiveFilter("all");
              } else {
                navigation.getParent()?.navigate("CreateInvoice");
              }
            }}
          />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <InvoiceCard
              invoice={item}
              onPress={() => navigation.navigate("InvoiceDetail", { id: item.id })}
              onDelete={() => handleDelete(item)}
            />
          )}
          refreshControl={<RefreshControl refreshing={false} onRefresh={fetchInvoices} />}
          contentContainerStyle={styles.listContent}
          ListFooterComponent={
            <Text style={styles.footer}>
              Showing {filtered.length} of {invoices.length} invoices
            </Text>
          }
        />
      )}
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
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 22, lineHeight: 24 },
  searchRow: { paddingHorizontal: 16, marginBottom: 8 },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    height: 44,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, color: "#111827" },
  filterRow: { paddingHorizontal: 16, gap: 8, marginBottom: 12 },
  listContent: { paddingBottom: 24 },
  footer: {
    textAlign: "center",
    fontSize: 12,
    color: "#9ca3af",
    paddingVertical: 16,
  },
  errorText: { fontSize: 15, color: "#6b7280", marginBottom: 12 },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});

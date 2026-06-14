import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../api/client";
import { DashboardData, Invoice } from "../types/invoice";
import StatCard from "../components/StatCard";
import InvoiceCard from "../components/InvoiceCard";
import EmptyState from "../components/EmptyState";
import { APP_NAME } from "../lib/constants";

type ScreenState = "loading" | "error" | "empty" | "default";

export default function DashboardScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<DashboardData | null>(null);
  const [state, setState] = useState<ScreenState>("loading");

  const fetchDashboard = useCallback(async () => {
    setState("loading");
    try {
      const result = await api.get<DashboardData>("/dashboard");
      setData(result);
      if (result.recentInvoices.length === 0 && result.stats.totalEarned === 0) {
        setState("empty");
      } else {
        setState("default");
      }
    } catch {
      setState("error");
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleInvoicePress = (invoice: Invoice) => {
    navigation.navigate("Invoices", {
      screen: "InvoiceDetail",
      params: { id: invoice.id },
    });
  };

  if (state === "loading" && !data) {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (state === "error") {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <Text style={styles.errorText}>Failed to load dashboard</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchDashboard}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (state === "empty") {
    return (
      <View style={[styles.center, { paddingTop: insets.top }]}>
        <EmptyState
          icon="document-text-outline"
          title="No invoices yet"
          subtitle="Create your first invoice to get started"
          actionLabel="Create Invoice"
          onAction={() => navigation.navigate("CreateInvoice")}
        />
      </View>
    );
  }

  const stats = data!.stats;
  const recentInvoices = data!.recentInvoices;

  const ListHeader = (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>{APP_NAME}</Text>
      <View style={styles.metricRow}>
        <View style={styles.metricHalf}>
          <StatCard label="Total Earned" value={`$${stats.totalEarned.toFixed(2)}`} />
        </View>
        <View style={styles.metricHalf}>
          <StatCard label="Pending" value={`$${stats.pending.toFixed(2)}`} />
        </View>
      </View>
      {stats.overdue > 0 && (
        <View style={styles.metricFull}>
          <StatCard label="Overdue" value={`$${stats.overdue.toFixed(2)}`} variant="warning" />
        </View>
      )}
      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>Recent Invoices</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Invoices")}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <FlatList
        data={recentInvoices}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <InvoiceCard invoice={item} onPress={() => handleInvoicePress(item)} />
        )}
        refreshControl={<RefreshControl refreshing={false} onRefresh={fetchDashboard} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { paddingHorizontal: 16, paddingTop: 12 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 16,
  },
  metricRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  metricHalf: { flex: 1 },
  metricFull: { marginBottom: 12 },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "600", color: "#111827" },
  seeAll: { fontSize: 13, color: "#2563eb", fontWeight: "500" },
  listContent: { paddingBottom: 24 },
  errorText: { fontSize: 15, color: "#6b7280", marginBottom: 12 },
  retryButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "600" },
});

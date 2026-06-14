import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { signOut, supabase } from "../lib/supabase";
import { APP_NAME } from "../lib/constants";

export default function SettingsScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Account</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Subscription</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Notifications</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Support</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Help & FAQ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Contact Us</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.version}>{APP_NAME} v1.0.0</Text>
        </View>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "600", color: "#111827" },
  content: { flex: 1, paddingHorizontal: 16 },
  section: { marginTop: 24 },
  sectionLabel: { fontSize: 13, fontWeight: "600", color: "#6b7280", marginBottom: 8 },
  menuItem: {
    backgroundColor: "#fff",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  menuText: { fontSize: 15, color: "#111827" },
  version: { fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 16 },
  signOutButton: {
    marginTop: 32,
    height: 48,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: { color: "#dc2626", fontSize: 15, fontWeight: "600" },
});

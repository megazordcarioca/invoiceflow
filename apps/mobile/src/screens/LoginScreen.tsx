import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmail, signUpWithEmail, getSession } from "../lib/supabase";
import { APP_NAME } from "../lib/constants";
import { RootStackParamList } from "../navigation/RootNavigator";

type LoginNav = NativeStackNavigationProp<RootStackParamList, "Login">;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUpWithEmail(email, password);
        if (error) {
          Alert.alert("Error", error.message);
        } else {
          Alert.alert("Check your email", "We sent you a confirmation link.");
        }
      } else {
        const { error } = await signInWithEmail(email, password);
        if (error) {
          Alert.alert("Error", error.message);
        } else {
          const { session } = await getSession();
          if (session) navigation.replace("Main");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{APP_NAME}</Text>
        <Text style={styles.subtitle}>
          {isSignUp ? "Create your account" : "Sign in to your account"}
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#9ca3af"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9ca3af"
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{isSignUp ? "Sign Up" : "Sign In"}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)} style={styles.link}>
          <Text style={styles.linkText}>
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 32,
  },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  button: {
    height: 48,
    backgroundColor: "#2563eb",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 15, fontWeight: "600" },
  link: { marginTop: 16, alignItems: "center" },
  linkText: { color: "#2563eb", fontSize: 14 },
});

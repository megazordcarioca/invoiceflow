import { View, Text, TextInput, StyleSheet } from "react-native";

interface Props {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: "default" | "email-address" | "number-pad" | "decimal-pad";
  multiline?: boolean;
  required?: boolean;
}

export default function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = "default",
  multiline = false,
  required = false,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          error ? styles.inputError : null,
          multiline ? styles.multiline : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        keyboardType={keyboardType}
        multiline={multiline}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "500", color: "#6b7280", marginBottom: 6 },
  required: { color: "#dc2626" },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  inputError: { borderColor: "#dc2626" },
  multiline: { height: 80, textAlignVertical: "top", paddingTop: 12 },
  errorText: { fontSize: 12, color: "#dc2626", marginTop: 4 },
});

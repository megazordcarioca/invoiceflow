import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardScreen";
import InvoiceListScreen from "../screens/InvoiceListScreen";
import CreateInvoiceScreen from "../screens/CreateInvoiceScreen";
import InvoiceDetailScreen from "../screens/InvoiceDetailScreen";
import SettingsScreen from "../screens/SettingsScreen";
import LoginScreen from "../screens/LoginScreen";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Invoices: undefined;
  CreateInvoice: undefined;
  Settings: undefined;
};

export type InvoicesStackParamList = {
  InvoiceList: undefined;
  InvoiceDetail: { id: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const InvoicesStack = createNativeStackNavigator<InvoicesStackParamList>();

function InvoicesStackScreen() {
  return (
    <InvoicesStack.Navigator screenOptions={{ headerShown: false }}>
      <InvoicesStack.Screen name="InvoiceList" component={InvoiceListScreen} />
      <InvoicesStack.Screen name="InvoiceDetail" component={InvoiceDetailScreen} />
    </InvoicesStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarLabelStyle: { fontSize: 10, fontWeight: "500" as const },
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 4 },
        tabBarIcon: ({ color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = "home";
          switch (route.name) {
            case "Dashboard":
              iconName = "home-outline";
              break;
            case "Invoices":
              iconName = "document-text-outline";
              break;
            case "CreateInvoice":
              iconName = "add-circle";
              break;
            case "Settings":
              iconName = "settings-outline";
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Invoices" component={InvoicesStackScreen} />
      <Tab.Screen
        name="CreateInvoice"
        component={CreateInvoiceScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Ionicons name="add-circle" size={32} color="#2563eb" style={{ marginTop: -4 }} />
          ),
        }}
      />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

import React, { useState } from "react";
import MerchantDashboard from "./components/MerchantDashboard";
import DeliveryDashboard from "./components/DeliveryDashboard";
import CustomerStore from "./components/CustomerStore";
import PapsBackoffice from "./components/PapsBackoffice";
import HomeScreen from "./components/screens/HomeScreen";
import LoginScreen from "./components/screens/LoginScreen";

export default function App() {
  const [currentView, setCurrentView] = useState<
    "home" | "merchant" | "delivery" | "customer" | "paps" | "login"
  >(() => {
    // Vérifier si on accède directement à une boutique via l'URL
    const urlParams = new URLSearchParams(
      window.location.search,
    );
    const merchantParam = urlParams.get("merchant");
    return merchantParam ? "customer" : "home";
  });
  const [currentMerchantId, setCurrentMerchantId] = useState(
    () => {
      const urlParams = new URLSearchParams(
        window.location.search,
      );
      return urlParams.get("merchant") || "merchant_1";
    },
  );
  const [currentDeliveryId, setCurrentDeliveryId] =
    useState("delivery_1");

  const handleLogin = (type: 'merchant' | 'delivery', id: string) => {
    if (type === 'merchant') {
      setCurrentMerchantId(id);
      setCurrentView('merchant');
    } else {
      setCurrentDeliveryId(id);
      setCurrentView('delivery');
    }
  };

  const handleMerchantAccess = (merchantId: string) => {
    setCurrentMerchantId(merchantId);
    setCurrentView('merchant');
  };

  if (currentView === "login") {
    return (
      <LoginScreen
        onBack={() => setCurrentView("home")}
        onLogin={handleLogin}
      />
    );
  }

  if (currentView === "merchant") {
    return (
      <MerchantDashboard
        merchantId={currentMerchantId}
        onBack={() => setCurrentView("home")}
        onSwitchToStore={() => setCurrentView("customer")}
      />
    );
  }

  if (currentView === "delivery") {
    return (
      <DeliveryDashboard
        deliveryId={currentDeliveryId}
        onBack={() => setCurrentView("home")}
      />
    );
  }

  if (currentView === "customer") {
    return (
      <CustomerStore
        merchantId={currentMerchantId}
        onBack={() => setCurrentView("home")}
        onMerchantAccess={handleMerchantAccess}
      />
    );
  }

  if (currentView === "paps") {
    return (
      <PapsBackoffice onBack={() => setCurrentView("home")} />
    );
  }

  return <HomeScreen onNavigate={setCurrentView} />;
}
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import api from "./api/api";
import AnalyticsCharts from "./components/AnalyticsCharts";
import {
  mockProducts,
  mockBatches,
  mockWarehouses,
  mockRiskScores,
  mockCampaigns,
  mockTransfers,
} from "./mockData";
import "./App.css";

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const emptyCampaign = () => ({
  batchId: "",
  campaignName: "",
  campaignType: "DISCOUNT",
  discountPercentage: "25",
  startDate: today(),
  endDate: "",
  status: "DRAFT",
});

const emptyProduct = () => ({
  sku: "",
  productName: "",
  category: "Dairy",
  unitPrice: "",
});

const emptyBatch = () => ({
  batchNumber: "",
  productId: "",
  warehouseId: "1",
  quantity: "",
  manufacturingDate: today(),
  expiryDate: "",
});

const emptyTransfer = () => ({
  batchId: "",
  fromWarehouseId: "1",
  toWarehouseId: "3",
  quantity: "",
  reason: "Rebalance near-expiry inventory to prevent waste",
});

const getArray = (value) => {
  if (Array.isArray(value)) return value;
  if (Array.isArray(value?.content)) return value.content;
  if (Array.isArray(value?.data)) return value.data;
  return [];
};

const money = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const dateString = String(value).slice(0, 10);
  const date = new Date(`${dateString}T00:00:00`);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const getDaysLeft = (expiryDate) => {
  if (!expiryDate) return null;
  const dateString = String(expiryDate).slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return null;
  const expiry = new Date(`${dateString}T00:00:00`);
  const current = new Date(`${today()}T00:00:00`);
  if (Number.isNaN(expiry.getTime())) return null;
  return Math.round((expiry.getTime() - current.getTime()) / 86400000);
};

const getProductIcon = (name = "", category = "") => {
  const text = `${name} ${category}`.toLowerCase();
  if (text.includes("milk") || text.includes("cream")) return "🥛";
  if (text.includes("cheese") || text.includes("yogurt")) return "🧀";
  if (text.includes("salmon") || text.includes("prawn") || text.includes("fish") || text.includes("seafood")) return "🐟";
  if (text.includes("beef") || text.includes("chicken") || text.includes("meat") || text.includes("steak")) return "🥩";
  if (text.includes("salad") || text.includes("spinach") || text.includes("lettuce")) return "🥗";
  if (text.includes("berry") || text.includes("strawberr") || text.includes("fruit")) return "🫐";
  if (text.includes("bread") || text.includes("croissant") || text.includes("bakery") || text.includes("pita")) return "🥐";
  if (text.includes("juice") || text.includes("coffee") || text.includes("beverage")) return "🧃";
  if (text.includes("avocado")) return "🥑";
  if (text.includes("mushroom")) return "🍄";
  return "📦";
};

const getErrorMessage = (error, fallback) =>
  error.response?.data?.message ||
  error.response?.data?.error ||
  (typeof error.response?.data === "string" ? error.response.data : "") ||
  error.message ||
  fallback;

const getDemandEstimate = (category) => {
  const value = String(category ?? "").trim().toLowerCase();
  if (!value) return { label: "Unknown", className: "neutral", description: "Category needed" };
  const high = ["dairy", "produce", "meat", "bakery", "seafood", "beverages", "daily essentials"];
  const low = ["seasonal", "luxury", "specialty", "slow moving"];

  if (high.some((w) => value.includes(w))) {
    return { label: "High Velocity", className: "safe", description: "Fast turnaround daily stock" };
  }
  if (low.some((w) => value.includes(w))) {
    return { label: "Low Velocity", className: "critical", description: "Slow moving; watch closely" };
  }
  return { label: "Medium", className: "warning", description: "Standard inventory velocity" };
};

const pageRoutes = {
  Dashboard: "/",
  Products: "/products",
  Warehouses: "/warehouses",
  "Inventory Batches": "/batches",
  "Expiry Alerts": "/expiry-alerts",
  "Risk Analysis": "/risk-analysis",
  Campaigns: "/campaigns",
  Transfers: "/transfers",
  Analytics: "/analytics",
};

const routePages = Object.fromEntries(
  Object.entries(pageRoutes).map(([page, path]) => [path, page])
);

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const activePage = routePages[location.pathname] || "Dashboard";

  const navigateToPage = (page) => {
    navigate(pageRoutes[page] || "/");
  };

  useEffect(() => {
    if (!routePages[location.pathname]) {
      navigate("/", { replace: true });
    }
  }, [location.pathname, navigate]);

  // Theme state: dark (default) or light
  const [theme, setTheme] = useState("dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Enterprise Role & Filter state
  const [currentRole, setCurrentRole] = useState("SupplyChainManager");
  const [selectedWarehouseFilter, setSelectedWarehouseFilter] = useState("ALL");

  // Core entities
  const [products, setProducts] = useState(mockProducts);
  const [batches, setBatches] = useState(mockBatches);
  const [warehouses, setWarehouses] = useState(mockWarehouses);
  const [riskScores, setRiskScores] = useState(mockRiskScores);
  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [transfers, setTransfers] = useState(mockTransfers);
  const [recommendations, setRecommendations] = useState([]);

  // Stats
  const [stats, setStats] = useState({
    totalWasteValue: 248450,
    totalSavings: 182640,
    totalWastedQuantity: 155,
    totalSavedQuantity: 1400,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [expiryFilter, setExpiryFilter] = useState("ALL");

  // Forms
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [savingCampaign, setSavingCampaign] = useState(false);
  const [campaignMessage, setCampaignMessage] = useState("");
  const [campaignError, setCampaignError] = useState("");
  const [editingCampaignId, setEditingCampaignId] = useState(null);
  const [campaignForm, setCampaignForm] = useState(emptyCampaign);
  const [campaignSearch, setCampaignSearch] = useState("");

  const [showProductForm, setShowProductForm] = useState(false);
  const [productMessage, setProductMessage] = useState("");
  const [productError, setProductError] = useState("");
  const [savingProduct, setSavingProduct] = useState(false);
  const [productForm, setProductForm] = useState(emptyProduct);

  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchMessage, setBatchMessage] = useState("");
  const [batchError, setBatchError] = useState("");
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchForm, setBatchForm] = useState(emptyBatch);
  const [editingBatchId, setEditingBatchId] = useState(null);

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferMessage, setTransferMessage] = useState("");
  const [transferError, setTransferError] = useState("");
  const [savingTransfer, setSavingTransfer] = useState(false);
  const [transferForm, setTransferForm] = useState(emptyTransfer);

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvStatus, setCsvStatus] = useState("");

  const [calculatingRisks, setCalculatingRisks] = useState(false);
  const [riskActionMessage, setRiskActionMessage] = useState("");

  const readNumber = (response) => {
    const value = response?.data;
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const requests = await Promise.allSettled([
        api.get("/products"),
        api.get("/batches"),
        api.get("/analytics/total-waste-value"),
        api.get("/waste-prevention-savings/total-value-saved"),
        api.get("/analytics/total-wasted-quantity"),
        api.get("/waste-prevention-savings/total-quantity-saved"),
        api.get("/risk-scores"),
        api.get("/warehouses"),
        api.get("/campaigns"),
        api.get("/warehouse-transfers"),
        api.get("/recommendations"),
      ]);

      const getResult = (index) =>
        requests[index].status === "fulfilled" ? requests[index].value : null;

      const getArrayResult = (index) => getArray(getResult(index)?.data);

      const prodRes = getArrayResult(0);
      const batchRes = getArrayResult(1);
      const riskRes = getArrayResult(6);
      const whRes = getArrayResult(7);
      const campRes = getArrayResult(8);
      const transRes = getArrayResult(9);
      const recRes = getArrayResult(10);

      setProducts(prodRes.length > 0 ? prodRes : mockProducts);
      setBatches(batchRes.length > 0 ? batchRes : mockBatches);

      const wasteVal = readNumber(getResult(2));
      const savedVal = readNumber(getResult(3));

      setStats({
        totalWasteValue: wasteVal > 0 ? wasteVal : 248450,
        totalSavings: savedVal > 0 ? savedVal : 182640,
        totalWastedQuantity: readNumber(getResult(4)) || 155,
        totalSavedQuantity: readNumber(getResult(5)) || 1400,
      });

      setRiskScores(riskRes.length > 0 ? riskRes : mockRiskScores);
      setWarehouses(whRes.length > 0 ? whRes : mockWarehouses);
      setCampaigns(campRes.length > 0 ? campRes : mockCampaigns);
      setTransfers(transRes.length > 0 ? transRes : mockTransfers);
      setRecommendations(recRes);
    } catch (err) {
      setError(getErrorMessage(err, "Unable to load live dashboard data."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const getProduct = useCallback(
    (productId) => products.find((item) => Number(item.id) === Number(productId)),
    [products]
  );

  const getProductName = useCallback(
    (batch) => {
      const p = getProduct(batch?.productId);
      return batch?.productName || p?.productName || `Product #${batch?.productId ?? "—"}`;
    },
    [getProduct]
  );

  const getWarehouseName = useCallback(
    (warehouseId) => {
      const wh = warehouses.find((item) => Number(item.id) === Number(warehouseId));
      return wh ? (wh.warehouseName || wh.warehouseCode) : `Warehouse #${warehouseId ?? "—"}`;
    },
    [warehouses]
  );

  const getBatchLabel = (batch) =>
    batch?.batchNumber || `BAT-${String(batch?.id).padStart(4, "0")}`;

  const getExpiryCountdownBadge = (batch) => {
    const days = getDaysLeft(batch?.expiryDate);
    if (days === null) return <span className="countdown-badge safe">Safe</span>;
    if (days < 0) return <span className="countdown-badge critical">Expired</span>;
    if (days === 0) return <span className="countdown-badge critical">Today</span>;
    if (days === 1) return <span className="countdown-badge critical">1 day left</span>;
    if (days <= 7) return <span className="countdown-badge urgent">{days} days left</span>;
    if (days <= 30) return <span className="countdown-badge warning">{days} days left</span>;
    return <span className="countdown-badge safe">{days} days left</span>;
  };

  const getExpiryClass = (batch) => {
    const days = getDaysLeft(batch?.expiryDate);
    if (days === null) return "safe";
    if (days < 0) return "critical";
    if (days <= 7) return "urgent";
    if (days <= 30) return "warning";
    return "safe";
  };

  const getRiskValue = (item) =>
    Number(item.riskScore ?? item.score ?? item.riskPercentage ?? 0);

  const getRiskLabel = (item) => {
    const value = getRiskValue(item);
    if (item.riskLevel) return item.riskLevel;
    if (value >= 80) return "CRITICAL";
    if (value >= 60) return "HIGH";
    if (value >= 40) return "MEDIUM";
    return "LOW";
  };

  // Filtered Batches
  const filteredBatches = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return batches.filter((batch) => {
      if (selectedWarehouseFilter !== "ALL" && String(batch.warehouseId) !== selectedWarehouseFilter) {
        return false;
      }
      const product = getProduct(batch.productId);
      const matchesSearch =
        !query ||
        [batch.batchNumber, product?.productName, product?.sku].some((v) =>
          String(v ?? "").toLowerCase().includes(query)
        );

      const daysLeft = getDaysLeft(batch.expiryDate);
      const matchesExpiry =
        expiryFilter === "ALL" ||
        (expiryFilter === "EXPIRED" && daysLeft !== null && daysLeft < 0) ||
        (expiryFilter === "7" && daysLeft !== null && daysLeft >= 0 && daysLeft <= 7) ||
        (expiryFilter === "30" && daysLeft !== null && daysLeft >= 0 && daysLeft <= 30);

      return matchesSearch && matchesExpiry;
    });
  }, [batches, getProduct, searchText, expiryFilter, selectedWarehouseFilter]);

  const expiringBatches = useMemo(
    () =>
      batches
        .filter((batch) => {
          const days = getDaysLeft(batch.expiryDate);
          return days !== null && days <= 30;
        })
        .sort((a, b) => getDaysLeft(a.expiryDate) - getDaysLeft(b.expiryDate)),
    [batches]
  );

  const expiringSoonCount = batches.filter((batch) => {
    const days = getDaysLeft(batch.expiryDate);
    return days !== null && days >= 0 && days <= 7;
  }).length;

  const highRiskCount = riskScores.filter((item) =>
    ["HIGH", "CRITICAL"].includes(getRiskLabel(item).toUpperCase())
  ).length;

  // Recalculate All Risks
  const handleCalculateAllRisks = async () => {
    setCalculatingRisks(true);
    setRiskActionMessage("");
    try {
      await api.post("/risk-scores/calculate-all");
      setRiskActionMessage("Risk scores re-analyzed for all batches successfully.");
      await loadDashboard();
    } catch (err) {
      setRiskActionMessage(getErrorMessage(err, "Failed to run risk analysis."));
    } finally {
      setCalculatingRisks(false);
    }
  };

  // Generate Recommendation trigger
  const handleGenerateRecommendation = async (batchId, riskLevel) => {
    try {
      await api.post(`/recommendations/generate/${batchId}?riskLevel=${riskLevel}`);
      setRiskActionMessage(`Generated preventive action plan for Batch #${batchId}`);
      await loadDashboard();
    } catch (err) {
      setRiskActionMessage(getErrorMessage(err, "Could not generate recommendation."));
    }
  };

  // Transfer Handlers
  const handleTransferSubmit = async (event) => {
    event.preventDefault();
    setTransferError("");
    setTransferMessage("");

    if (!transferForm.batchId || !transferForm.fromWarehouseId || !transferForm.toWarehouseId) {
      setTransferError("Please select the batch and source/destination facilities.");
      return;
    }
    if (transferForm.fromWarehouseId === transferForm.toWarehouseId) {
      setTransferError("Source and Destination warehouses must be different.");
      return;
    }
    if (!transferForm.quantity || Number(transferForm.quantity) <= 0) {
      setTransferError("Quantity must be greater than zero.");
      return;
    }

    setSavingTransfer(true);
    try {
      await api.post("/warehouse-transfers", {
        batchId: Number(transferForm.batchId),
        fromWarehouseId: Number(transferForm.fromWarehouseId),
        toWarehouseId: Number(transferForm.toWarehouseId),
        quantity: Number(transferForm.quantity),
        reason: transferForm.reason || "Waste prevention inventory balancing",
        status: "PENDING",
        requestedDate: today(),
      });
      setTransferMessage("Inter-facility transfer request submitted.");
      setTransferForm(emptyTransfer());
      setShowTransferForm(false);
      await loadDashboard();
    } catch (err) {
      setTransferError(getErrorMessage(err, "Failed to create transfer request."));
    } finally {
      setSavingTransfer(false);
    }
  };

  const handleUpdateTransferStatus = async (id, status) => {
    try {
      await api.put(`/warehouse-transfers/${id}/status?status=${status}`);
      await loadDashboard();
    } catch (err) {
      alert(getErrorMessage(err, "Failed to update transfer status."));
    }
  };

  // Campaign Handlers
  const resetCampaignForm = () => {
    setCampaignForm(emptyCampaign());
    setEditingCampaignId(null);
    setShowCampaignForm(false);
    setCampaignError("");
  };

  const handleCampaignSubmit = async (event) => {
    event.preventDefault();
    setCampaignError("");
    setCampaignMessage("");

    if (!campaignForm.batchId) {
      setCampaignError("Please select a target batch.");
      return;
    }
    if (!campaignForm.campaignName.trim()) {
      setCampaignError("Campaign name is required.");
      return;
    }
    if (!campaignForm.startDate || !campaignForm.endDate) {
      setCampaignError("Please specify campaign start and end dates.");
      return;
    }

    const payload = {
      batchId: Number(campaignForm.batchId),
      campaignName: campaignForm.campaignName.trim(),
      campaignType: campaignForm.campaignType,
      discountPercentage: Number(campaignForm.discountPercentage) || null,
      startDate: campaignForm.startDate,
      endDate: campaignForm.endDate,
      status: campaignForm.status,
    };

    setSavingCampaign(true);
    try {
      if (editingCampaignId !== null) {
        await api.put(`/campaigns/${editingCampaignId}`, payload);
        setCampaignMessage("Campaign updated successfully.");
      } else {
        await api.post("/campaigns", payload);
        setCampaignMessage("Clearance campaign launched successfully.");
      }
      resetCampaignForm();
      await loadDashboard();
      navigateToPage("Campaigns");
    } catch (err) {
      setCampaignError(getErrorMessage(err, "Could not save campaign."));
    } finally {
      setSavingCampaign(false);
    }
  };

  const startCampaignForBatch = (batch) => {
    const p = getProduct(batch.productId);
    setCampaignForm({
      ...emptyCampaign(),
      batchId: String(batch.id),
      campaignName: `${p?.productName || "Surplus"} - 25% Flash Clearance`,
      campaignType: "CLEARANCE",
      discountPercentage: "25",
      startDate: today(),
      endDate: String(batch.expiryDate).slice(0, 10),
      status: "ACTIVE",
    });
    setEditingCampaignId(null);
    setShowCampaignForm(true);
    navigateToPage("Campaigns");
  };

  const startTransferForBatch = (batch) => {
    setTransferForm({
      ...emptyTransfer(),
      batchId: String(batch.id),
      fromWarehouseId: String(batch.warehouseId || "1"),
      toWarehouseId: batch.warehouseId === 1 ? "3" : "1",
      quantity: String(Math.floor((Number(batch.quantity) || 100) / 2)),
      reason: `Proactive transfer to balance surplus before expiry date (${formatDate(batch.expiryDate)})`,
    });
    setShowTransferForm(true);
    navigateToPage("Transfers");
  };

  // Product Handlers
  const handleProductSubmit = async (event) => {
    event.preventDefault();
    setProductError("");
    setProductMessage("");
    if (!productForm.sku.trim() || !productForm.productName.trim()) {
      setProductError("SKU and product name are required.");
      return;
    }
    setSavingProduct(true);
    try {
      await api.post("/products", {
        sku: productForm.sku.trim(),
        productName: productForm.productName.trim(),
        category: productForm.category.trim(),
        unitPrice: Number(productForm.unitPrice) || 0,
      });
      setProductMessage("Product catalog entry added.");
      setProductForm(emptyProduct());
      setShowProductForm(false);
      await loadDashboard();
    } catch (err) {
      setProductError(getErrorMessage(err, "Could not add product."));
    } finally {
      setSavingProduct(false);
    }
  };

  // Batch Handlers
  const handleBatchSubmit = async (event) => {
    event.preventDefault();
    setBatchError("");
    setBatchMessage("");
    if (!batchForm.batchNumber.trim() || !batchForm.productId || !batchForm.expiryDate) {
      setBatchError("Batch number, Product, and Expiry date are required.");
      return;
    }
    const payload = {
      batchNumber: batchForm.batchNumber.trim(),
      productId: Number(batchForm.productId),
      warehouseId: batchForm.warehouseId ? Number(batchForm.warehouseId) : 1,
      quantity: Number(batchForm.quantity) || 0,
      receivedDate: batchForm.manufacturingDate || today(),
      expiryDate: batchForm.expiryDate,
    };
    setSavingBatch(true);
    try {
      if (editingBatchId !== null) {
        await api.put(`/batches/${editingBatchId}`, payload);
        setBatchMessage("Batch details updated.");
      } else {
        const res = await api.post("/batches", payload);
        if (res.data?.id) {
          try {
            await api.post(`/risk-scores/calculate/${res.data.id}`);
          } catch {
            // ignore
          }
        }
        setBatchMessage("Batch added and analyzed by Risk Engine.");
      }
      setBatchForm(emptyBatch());
      setEditingBatchId(null);
      setShowBatchForm(false);
      await loadDashboard();
    } catch (err) {
      setBatchError(getErrorMessage(err, "Could not save batch."));
    } finally {
      setSavingBatch(false);
    }
  };

  // CSV Import Mock
  const handleImportSampleCsv = async () => {
    setCsvStatus("Validating and importing sample inventory batches...");
    try {
      const p = await api.post("/products", {
        sku: `SKU-PRD-${Date.now().toString().slice(-4)}`,
        productName: "Golden Honeycrisp Apples 1kg",
        category: "Produce",
        unitPrice: 240.0,
      });
      if (p.data?.id) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 5);
        const b = await api.post("/batches", {
          batchNumber: `BAT-APP-${Date.now().toString().slice(-4)}`,
          productId: p.data.id,
          warehouseId: 2,
          quantity: 500,
          receivedDate: today(),
          expiryDate: nextWeek.toISOString().slice(0, 10),
        });
        if (b.data?.id) {
          await api.post(`/risk-scores/calculate/${b.data.id}`);
        }
      }
      setCsvStatus("Sample SKU batch successfully imported & analyzed!");
      await loadDashboard();
      setTimeout(() => setShowCsvModal(false), 1400);
    } catch {
      setCsvStatus("Import failed. Check connection.");
    }
  };

  const navigation = [
    { label: "Dashboard", icon: "▦" },
    { label: "Products", icon: "▤" },
    { label: "Warehouses", icon: "⌂" },
    { label: "Inventory Batches", icon: "▣" },
    { label: "Expiry Alerts", icon: "◷" },
    { label: "Risk Analysis", icon: "⚠" },
    { label: "Campaigns", icon: "％" },
    { label: "Transfers", icon: "⇄" },
    { label: "Analytics", icon: "▥" },
  ];

  const pageDescriptions = {
    Dashboard: "Detect risks early → Recommend preventive action → Recover value → Reduce waste.",
    Products: "Registered SKU master with predictive consumption velocity.",
    Warehouses: "Enterprise multi-site network, cold chain storage, and distribution facilities.",
    "Inventory Batches": "Lot-level tracking, real-time expiry horizons, and freshness status.",
    "Expiry Alerts": "Urgent near-expiry warnings and priority dispatch queues.",
    "Risk Analysis": "Weighted risk formula: Expiry (40%) + Demand (25%) + Stock (20%) + Movement (15%).",
    Campaigns: "Clearance campaigns, bundles, and discount schemes for sellable surplus.",
    Transfers: "Inter-warehouse stock redistribution to balance regional demand.",
    Analytics: "Outcome measurement: waste avoided, value recovered, and sustainability reporting.",
  };

  // --- RENDERING PAGE VIEWS ---

  const renderDashboard = () => (
    <>
      {/* 4 Hero KPI Banners matching Slide 1 */}
      <div className="kpi-grid">
        <div className="kpi-card danger">
          <div className="kpi-card-header">
            <span className="kpi-label">At-Risk Inventory</span>
            <span className="kpi-badge-icon">📉</span>
          </div>
          <div className="kpi-value crimson">{money(stats.totalWasteValue)}</div>
          <div className="kpi-subtext">
            <span className="kpi-pill amber">12% of total inventory</span>
            <span>Unmitigated surplus</span>
          </div>
        </div>

        <div className="kpi-card urgent">
          <div className="kpi-card-header">
            <span className="kpi-label">Expiring Soon (≤ 7d)</span>
            <span className="kpi-badge-icon">⏳</span>
          </div>
          <div className="kpi-value amber">{money(96320)}</div>
          <div className="kpi-subtext">
            <span className="kpi-pill amber">{expiringSoonCount} lots urgent</span>
            <span>Requires fast action</span>
          </div>
        </div>

        <div className="kpi-card highlight">
          <div className="kpi-card-header">
            <span className="kpi-label">Value Recovered</span>
            <span className="kpi-badge-icon">💰</span>
          </div>
          <div className="kpi-value green">{money(stats.totalSavings)}</div>
          <div className="kpi-subtext">
            <span className="kpi-pill green">From waste prevention</span>
            <span>Through offers & transfers</span>
          </div>
        </div>

        <div className="kpi-card highlight">
          <div className="kpi-card-header">
            <span className="kpi-label">Waste Avoided</span>
            <span className="kpi-badge-icon">🌱</span>
          </div>
          <div className="kpi-value green">3.4 tons</div>
          <div className="kpi-subtext">
            <span className="kpi-pill green">Last 30 days</span>
            <span>Diversion rate 94.2%</span>
          </div>
        </div>
      </div>

      {/* ESG Sustainability Highlights Banner */}
      <div className="esg-banner">
        <div className="esg-stat-group">
          <div className="esg-stat">
            <span className="esg-stat-icon">🍽</span>
            <div className="esg-stat-text">
              <strong>28,500 Meals</strong>
              <span>Redirected to nutrition programs</span>
            </div>
          </div>
          <div className="esg-stat">
            <span className="esg-stat-icon">🍃</span>
            <div className="esg-stat-text">
              <strong>18% CO₂e Reduced</strong>
              <span>Lower greenhouse gas emissions</span>
            </div>
          </div>
          <div className="esg-stat">
            <span className="esg-stat-icon">⚡</span>
            <div className="esg-stat-text">
              <strong>4 Facilities Connected</strong>
              <span>Automated risk scoring</span>
            </div>
          </div>
        </div>
        <button className="btn-secondary" onClick={() => navigateToPage("Analytics")}>
          View ESG Report →
        </button>
      </div>

      {/* Row 1: Inventory Risk Matrix & Expiry Alerts Feed (Matching Slide 1) */}
      <div className="dashboard-row-2">
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2><span>⚠</span> Inventory Risk Watchlist</h2>
              <p>Batches at risk of spoilage, surplus, or slow movement</p>
            </div>
            <button className="btn-secondary" onClick={() => navigateToPage("Risk Analysis")}>
              View All Risk ({riskScores.length})
            </button>
          </div>

          <div className="risk-cards-grid">
            {expiringBatches.slice(0, 6).map((b) => {
              const p = getProduct(b.productId);
              const days = getDaysLeft(b.expiryDate);
              const icon = getProductIcon(p?.productName, p?.category);
              const unitPrice = Number(p?.unitPrice) || 120;
              const atRiskValue = (Number(b.quantity) || 0) * unitPrice;
              const isCrit = days !== null && days <= 2;

              return (
                <div key={b.id} className="risk-item-card">
                  <div className="risk-item-top">
                    <div className="risk-item-icon">{icon}</div>
                    <div className="risk-item-info">
                      <strong>{p?.productName || getProductName(b)}</strong>
                      <span>{getWarehouseName(b.warehouseId)} • {b.quantity} units</span>
                    </div>
                  </div>
                  <div className="risk-item-bottom">
                    <span className={`status-pill ${isCrit ? "critical" : "urgent"}`}>
                      {isCrit ? "Critical Risk" : "High Risk"} • {days < 0 ? "Expired" : `${days}d left`}
                    </span>
                    <span className="risk-item-value">{money(atRiskValue)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <div>
              <h2><span>◷</span> Expiry Alert Center</h2>
              <p>Urgent countdown requiring preventive decision</p>
            </div>
            <button className="btn-secondary" onClick={() => navigateToPage("Expiry Alerts")}>
              All ({expiringBatches.length})
            </button>
          </div>

          <div className="expiry-feed">
            {expiringBatches.slice(0, 5).map((b) => {
              const p = getProduct(b.productId);
              const icon = getProductIcon(p?.productName, p?.category);

              return (
                <div key={b.id} className="expiry-feed-row">
                  <div className="expiry-feed-info">
                    <span style={{ fontSize: "20px" }}>{icon}</span>
                    <div>
                      <strong style={{ fontSize: "13px" }}>{p?.productName || getProductName(b)}</strong>
                      <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                        {getWarehouseName(b.warehouseId)} • {b.quantity} units
                      </div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {getExpiryCountdownBadge(b)}
                    <button className="btn-small" onClick={() => startCampaignForBatch(b)}>
                      ％ Offer
                    </button>
                    <button className="btn-small" onClick={() => startTransferForBatch(b)}>
                      ⇄ Move
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 2: Warehouse Transfer Stepper & Clearance Campaign Hero */}
      <div className="dashboard-row-2">
        <div className="transfer-wizard-card">
          <div className="panel-header" style={{ marginBottom: "12px" }}>
            <div>
              <h2><span>⇄</span> Warehouse Transfer Redistribution</h2>
              <p>Move near-expiry surplus before value is lost</p>
            </div>
            <button className="btn-primary" onClick={() => navigateToPage("Transfers")}>
              Start Transfer
            </button>
          </div>

          <div className="wizard-steps">
            <div className="wizard-step active">
              <div className="step-circle">1</div>
              <span className="step-label">Select Items</span>
            </div>
            <div className="wizard-step active">
              <div className="step-circle">2</div>
              <span className="step-label">Choose Source</span>
            </div>
            <div className="wizard-step active">
              <div className="step-circle">3</div>
              <span className="step-label">Destination</span>
            </div>
            <div className="wizard-step">
              <div className="step-circle">4</div>
              <span className="step-label">Confirm</span>
            </div>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Batch Lot</th>
                  <th>Route</th>
                  <th>Quantity</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transfers.slice(0, 3).map((t) => (
                  <tr key={t.id}>
                    <td><strong>Batch #{t.batchId}</strong></td>
                    <td>{getWarehouseName(t.fromWarehouseId)} → {getWarehouseName(t.toWarehouseId)}</td>
                    <td>{t.quantity} units</td>
                    <td>
                      <span className={`status-pill ${String(t.status || "PENDING").toLowerCase()}`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="campaign-promo-card">
          <div className="campaign-promo-content">
            <span className="status-pill clearance" style={{ marginBottom: "10px" }}>
              ⚡ Featured Clearance Campaign
            </span>
            <h3>Fresh Berries & Milk — 25% Off</h3>
            <p>
              Turn near-expiry inventory into revenue. Accelerates sales velocity by 3.8x and cuts avoidable write-offs by 82%.
            </p>
            <div style={{ marginTop: "16px", display: "flex", gap: "10px" }}>
              <button className="btn-primary" onClick={() => navigateToPage("Campaigns")}>
                + Create Campaign
              </button>
              <button className="btn-secondary" onClick={() => navigateToPage("Campaigns")}>
                View Active ({campaigns.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  const renderProducts = () => (
    <>
      <div className="section-toolbar">
        <div>
          <h2>Product & SKU Master ({products.length})</h2>
          <p>Product catalog with automatic consumption velocity estimation.</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-secondary" onClick={() => setShowCsvModal(true)}>
            📥 CSV Batch Import
          </button>
          <button className="btn-primary" onClick={() => setShowProductForm(!showProductForm)}>
            {showProductForm ? "Close Form" : "+ Add Product"}
          </button>
        </div>
      </div>

      {productMessage && <p className="message-success">{productMessage}</p>}
      {productError && <p className="message-error">{productError}</p>}

      {showProductForm && (
        <section className="panel">
          <h2>Register SKU Master Entry</h2>
          <form className="data-form" onSubmit={handleProductSubmit}>
            <label>
              SKU Code
              <input
                value={productForm.sku}
                onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                placeholder="SKU-DRY-025"
                required
              />
            </label>
            <label>
              Product Name
              <input
                value={productForm.productName}
                onChange={(e) => setProductForm({ ...productForm, productName: e.target.value })}
                placeholder="Almond Milk Organic 1L"
                required
              />
            </label>
            <label>
              Category
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
              >
                <option value="Dairy">Dairy</option>
                <option value="Produce">Produce</option>
                <option value="Meat">Meat & Poultry</option>
                <option value="Seafood">Seafood</option>
                <option value="Bakery">Bakery</option>
                <option value="Beverages">Beverages</option>
                <option value="Deli">Deli & Prepared</option>
              </select>
            </label>
            <label>
              Unit Price (₹)
              <input
                type="number"
                step="0.01"
                value={productForm.unitPrice}
                onChange={(e) => setProductForm({ ...productForm, unitPrice: e.target.value })}
                placeholder="180.00"
                required
              />
            </label>
            <div className="form-actions">
              <button className="btn-primary" disabled={savingProduct}>
                {savingProduct ? "Saving..." : "Save Product SKU"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Product Catalog {searchText ? `(${products.filter(p => p.productName.toLowerCase().includes(searchText.toLowerCase()) || p.sku.toLowerCase().includes(searchText.toLowerCase())).length} matching of ${products.length})` : `(${products.length})`}</h2>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              className="search-input"
              style={{ width: "260px", height: "36px", padding: "0 12px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "var(--text-primary)" }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search products (e.g. paneer)..."
            />
            {searchText && (
              <button
                className="btn-secondary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => setSearchText("")}
              >
                ✕ Clear
              </button>
            )}
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Product Item</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Sales Velocity</th>
                <th>Active Batches</th>
              </tr>
            </thead>
            <tbody>
              {products.filter(p => !searchText || p.productName.toLowerCase().includes(searchText.toLowerCase()) || p.sku.toLowerCase().includes(searchText.toLowerCase())).map((p) => {
                const dem = getDemandEstimate(p.category);
                const icon = getProductIcon(p.productName, p.category);
                const batchCount = batches.filter(b => Number(b.productId) === Number(p.id)).length;

                return (
                  <tr key={p.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "20px" }}>{icon}</span>
                        <strong>{p.productName}</strong>
                      </div>
                    </td>
                    <td><code>{p.sku}</code></td>
                    <td>{p.category || "—"}</td>
                    <td><strong>{money(p.unitPrice)}</strong></td>
                    <td>
                      <span className={`status-pill ${dem.className}`} title={dem.description}>
                        {dem.label}
                      </span>
                    </td>
                    <td>
                      <span className="status-pill safe">{batchCount} lots</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderWarehouses = () => (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Enterprise Multi-Warehouse Network ({warehouses.length})</h2>
          <p>Distribution centers, cold storage facilities, and logistics hubs.</p>
        </div>
      </div>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Facility Code</th>
              <th>Warehouse Name</th>
              <th>Location</th>
              <th>Stored Batches</th>
              <th>Total Stock</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {warehouses.map((wh) => {
              const whBatches = batches.filter((b) => Number(b.warehouseId) === Number(wh.id));
              const totalQty = whBatches.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0);

              return (
                <tr key={wh.id}>
                  <td><code>{wh.warehouseCode}</code></td>
                  <td><strong>{wh.warehouseName}</strong></td>
                  <td>{wh.location || "—"}</td>
                  <td><span className="status-pill safe">{whBatches.length} lots</span></td>
                  <td><strong>{totalQty.toLocaleString()} units</strong></td>
                  <td><span className="status-pill approved">Operational</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderBatches = () => (
    <>
      <div className="section-toolbar">
        <div>
          <h2>Inventory Batches ({filteredBatches.length})</h2>
          <p>Lot-level tracking with real-time freshness countdowns.</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            if (showBatchForm) {
              setEditingBatchId(null);
              setBatchForm(emptyBatch());
            }
            setShowBatchForm(!showBatchForm);
          }}
        >
          {showBatchForm ? "Close Form" : "+ Add Batch Lot"}
        </button>
      </div>

      {batchMessage && <p className="message-success">{batchMessage}</p>}
      {batchError && <p className="message-error">{batchError}</p>}

      {showBatchForm && (
        <section className="panel">
          <h2>{editingBatchId ? "Edit Batch Lot" : "Register Batch Lot"}</h2>
          <form className="data-form" onSubmit={handleBatchSubmit}>
            <label>
              Batch Number / Lot Code
              <input
                value={batchForm.batchNumber}
                onChange={(e) => setBatchForm({ ...batchForm, batchNumber: e.target.value })}
                placeholder="BAT-MILK-2026-99"
                required
              />
            </label>
            <label>
              Product
              <select
                value={batchForm.productId}
                onChange={(e) => setBatchForm({ ...batchForm, productId: e.target.value })}
                required
              >
                <option value="">Select product SKU</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.sku} - {p.productName}</option>
                ))}
              </select>
            </label>
            <label>
              Warehouse Facility
              <select
                value={batchForm.warehouseId}
                onChange={(e) => setBatchForm({ ...batchForm, warehouseId: e.target.value })}
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>
                ))}
              </select>
            </label>
            <label>
              Quantity Units
              <input
                type="number"
                min="1"
                value={batchForm.quantity}
                onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })}
                required
              />
            </label>
            <label>
              Manufacturing / Received Date
              <input
                type="date"
                value={batchForm.manufacturingDate}
                onChange={(e) => setBatchForm({ ...batchForm, manufacturingDate: e.target.value })}
              />
            </label>
            <label>
              Expiry Date
              <input
                type="date"
                value={batchForm.expiryDate}
                onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })}
                required
              />
            </label>
            <div className="form-actions">
              <button className="btn-primary" disabled={savingBatch}>
                {savingBatch ? "Saving..." : editingBatchId ? "Update Batch" : "Save & Analyze Lot"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Monitored Inventory Lots</h2>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <select
              style={{ height: "36px", padding: "0 10px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#fff" }}
              value={expiryFilter}
              onChange={(e) => setExpiryFilter(e.target.value)}
            >
              <option value="ALL">All Expiry Windows</option>
              <option value="EXPIRED">Expired</option>
              <option value="7">≤ 7 Days (Urgent)</option>
              <option value="30">≤ 30 Days (Warning)</option>
            </select>
            <input
              style={{ width: "220px", height: "36px", padding: "0 12px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#fff" }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search batches..."
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Batch Lot</th>
                <th>Product</th>
                <th>Facility</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Freshness Horizon</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.map((b) => {
                const p = getProduct(b.productId);
                const icon = getProductIcon(p?.productName, p?.category);

                return (
                  <tr key={b.id}>
                    <td><code>{getBatchLabel(b)}</code></td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span>{icon}</span>
                        <strong>{p?.productName || getProductName(b)}</strong>
                      </div>
                    </td>
                    <td>{getWarehouseName(b.warehouseId)}</td>
                    <td><strong>{b.quantity} units</strong></td>
                    <td>{formatDate(b.expiryDate)}</td>
                    <td>{getExpiryCountdownBadge(b)}</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-small" onClick={() => startCampaignForBatch(b)}>
                          ％ Offer
                        </button>
                        <button className="btn-small" onClick={() => startTransferForBatch(b)}>
                          ⇄ Move
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderExpiryAlerts = () => (
    <section className="panel">
      <div className="panel-header">
        <div>
          <h2>Expiry Alert Center ({expiringBatches.length})</h2>
          <p>Prioritize time-sensitive stock to prevent avoidable write-offs.</p>
        </div>
        <select
          style={{ height: "36px", padding: "0 10px", background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "8px", color: "#fff" }}
          value={expiryFilter}
          onChange={(e) => setExpiryFilter(e.target.value)}
        >
          <option value="ALL">All At-Risk Lots</option>
          <option value="EXPIRED">Expired</option>
          <option value="7">≤ 7 Days Left</option>
          <option value="30">≤ 30 Days Left</option>
        </select>
      </div>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Lot</th>
              <th>Product</th>
              <th>Warehouse</th>
              <th>Quantity</th>
              <th>Expiry Date</th>
              <th>Time Left</th>
              <th>Recommended Preventive Action</th>
            </tr>
          </thead>
          <tbody>
            {expiringBatches.map((b) => {
              const p = getProduct(b.productId);
              const days = getDaysLeft(b.expiryDate);
              const icon = getProductIcon(p?.productName, p?.category);

              return (
                <tr key={b.id}>
                  <td><code>{getBatchLabel(b)}</code></td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span>{icon}</span>
                      <strong>{p?.productName || getProductName(b)}</strong>
                    </div>
                  </td>
                  <td>{getWarehouseName(b.warehouseId)}</td>
                  <td><strong>{b.quantity} units</strong></td>
                  <td>{formatDate(b.expiryDate)}</td>
                  <td>{getExpiryCountdownBadge(b)}</td>
                  <td>
                    {days < 0 ? (
                      <span className="status-pill critical">Isolate for audit & disposal</span>
                    ) : (
                      <div className="table-actions">
                        <button className="btn-small" onClick={() => startCampaignForBatch(b)}>
                          ％ Launch Clearance Scheme
                        </button>
                        <button className="btn-small" onClick={() => startTransferForBatch(b)}>
                          ⇄ Inter-Facility Transfer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderRiskAnalysis = () => (
    <>
      <div className="section-toolbar">
        <div>
          <h2>Waste Risk Intelligence Engine</h2>
          <p>
            Weighted Formula: <strong>Expiry (40%) + Demand (25%) + Stock (20%) + Movement (15%)</strong>
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={handleCalculateAllRisks}
          disabled={calculatingRisks}
        >
          {calculatingRisks ? "Calculating..." : "⚡ Run Risk Engine on All Batches"}
        </button>
      </div>

      {riskActionMessage && <p className="message-success">{riskActionMessage}</p>}

      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Batch Risk Assessment Matrix ({riskScores.length})</h2>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Batch Lot</th>
                <th>Product</th>
                <th>Expiry (40%)</th>
                <th>Demand (25%)</th>
                <th>Stock (20%)</th>
                <th>Movement (15%)</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Governed Action</th>
              </tr>
            </thead>
            <tbody>
              {riskScores.map((r, i) => {
                const b = batches.find((item) => Number(item.id) === Number(r.batchId));
                const p = getProduct(b?.productId);
                const rec = recommendations.find((rc) => Number(rc.batchId) === Number(r.batchId));
                const level = getRiskLabel(r);

                return (
                  <tr key={r.id ?? i}>
                    <td><code>{b ? getBatchLabel(b) : `Batch #${r.batchId}`}</code></td>
                    <td><strong>{p?.productName || "Surplus Item"}</strong></td>
                    <td>{r.expiryScore}</td>
                    <td>{r.demandScore}</td>
                    <td>{r.stockScore}</td>
                    <td>{r.movementScore}</td>
                    <td><strong style={{ fontSize: "15px" }}>{r.riskScore}</strong></td>
                    <td>
                      <span className={`status-pill ${level.toLowerCase()}`}>
                        {level}
                      </span>
                    </td>
                    <td>
                      {rec ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span className="status-pill clearance">{rec.recommendationType}</span>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {rec.recommendationMessage}
                          </span>
                        </div>
                      ) : (
                        <button
                          className="btn-small"
                          onClick={() => handleGenerateRecommendation(r.batchId, level)}
                        >
                          💡 Generate AI Action
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderCampaigns = () => (
    <>
      <div className="section-toolbar">
        <div>
          <h2>Clearance & Special Schemes ({campaigns.length})</h2>
          <p>Discounts and targeted promotions to move high-risk inventory.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowCampaignForm(!showCampaignForm)}>
          {showCampaignForm ? "Close Form" : "+ Create Campaign"}
        </button>
      </div>

      {campaignMessage && <p className="message-success">{campaignMessage}</p>}
      {campaignError && <p className="message-error">{campaignError}</p>}

      {showCampaignForm && (
        <section className="panel">
          <h2>Launch Clearance Campaign</h2>
          <form className="data-form" onSubmit={handleCampaignSubmit}>
            <label>
              Campaign Scheme Name
              <input
                value={campaignForm.campaignName}
                onChange={(e) => setCampaignForm({ ...campaignForm, campaignName: e.target.value })}
                placeholder="Organic Milk 25% Clearance Deal"
                required
              />
            </label>
            <label>
              Target Batch
              <select
                value={campaignForm.batchId}
                onChange={(e) => setCampaignForm({ ...campaignForm, batchId: e.target.value })}
                required
              >
                <option value="">Select batch lot</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {getBatchLabel(b)} — {getProductName(b)} ({b.quantity} units)
                  </option>
                ))}
              </select>
            </label>
            <label>
              Campaign Type
              <select
                value={campaignForm.campaignType}
                onChange={(e) => setCampaignForm({ ...campaignForm, campaignType: e.target.value })}
              >
                <option value="CLEARANCE">Urgent Clearance</option>
                <option value="DISCOUNT">Percentage Discount</option>
                <option value="SPECIAL_OFFER">Bundle Offer</option>
                <option value="FLASH_SALE">Flash Sale</option>
              </select>
            </label>
            <label>
              Discount Percentage (%)
              <input
                type="number"
                min="5"
                max="90"
                value={campaignForm.discountPercentage}
                onChange={(e) => setCampaignForm({ ...campaignForm, discountPercentage: e.target.value })}
                placeholder="25"
              />
            </label>
            <label>
              Start Date
              <input
                type="date"
                value={campaignForm.startDate}
                onChange={(e) => setCampaignForm({ ...campaignForm, startDate: e.target.value })}
                required
              />
            </label>
            <label>
              End Date
              <input
                type="date"
                value={campaignForm.endDate}
                onChange={(e) => setCampaignForm({ ...campaignForm, endDate: e.target.value })}
                required
              />
            </label>
            <div className="form-actions">
              <button className="btn-primary" disabled={savingCampaign}>
                {savingCampaign ? "Launching..." : "Launch Campaign"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Campaign Name</th>
                <th>Target Batch</th>
                <th>Strategy</th>
                <th>Discount</th>
                <th>Validity Dates</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id}>
                  <td><strong>{c.campaignName}</strong></td>
                  <td><code>Batch #{c.batchId}</code></td>
                  <td><span className="status-pill clearance">{c.campaignType}</span></td>
                  <td><strong>{c.discountPercentage ? `${c.discountPercentage}%` : "—"}</strong></td>
                  <td>{formatDate(c.startDate)} → {formatDate(c.endDate)}</td>
                  <td><span className="status-pill approved">{c.status || "ACTIVE"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderTransfers = () => (
    <>
      <div className="section-toolbar">
        <div>
          <h2>Inter-Warehouse Redistribution ({transfers.length})</h2>
          <p>Redistribute near-expiry inventory across facilities to balance demand.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowTransferForm(!showTransferForm)}>
          {showTransferForm ? "Close Form" : "+ Request Stock Transfer"}
        </button>
      </div>

      {transferMessage && <p className="message-success">{transferMessage}</p>}
      {transferError && <p className="message-error">{transferError}</p>}

      {showTransferForm && (
        <section className="panel">
          <h2>Request Inter-Facility Stock Redistribution</h2>
          <form className="data-form" onSubmit={handleTransferSubmit}>
            <label>
              Batch to Relocate
              <select
                value={transferForm.batchId}
                onChange={(e) => {
                  const b = batches.find((item) => String(item.id) === e.target.value);
                  setTransferForm({
                    ...transferForm,
                    batchId: e.target.value,
                    fromWarehouseId: b ? String(b.warehouseId) : transferForm.fromWarehouseId,
                  });
                }}
                required
              >
                <option value="">Select a batch lot</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {getBatchLabel(b)} — {getProductName(b)} ({b.quantity} in {getWarehouseName(b.warehouseId)})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Source Warehouse
              <select
                value={transferForm.fromWarehouseId}
                onChange={(e) => setTransferForm({ ...transferForm, fromWarehouseId: e.target.value })}
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>
                ))}
              </select>
            </label>
            <label>
              Destination Facility (Higher Consumption Velocity)
              <select
                value={transferForm.toWarehouseId}
                onChange={(e) => setTransferForm({ ...transferForm, toWarehouseId: e.target.value })}
                required
              >
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.warehouseCode} - {w.warehouseName}</option>
                ))}
              </select>
            </label>
            <label>
              Transfer Quantity (Units)
              <input
                type="number"
                min="1"
                value={transferForm.quantity}
                onChange={(e) => setTransferForm({ ...transferForm, quantity: e.target.value })}
                required
              />
            </label>
            <label>
              Operational Justification
              <input
                value={transferForm.reason}
                onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                placeholder="Surplus stock in NY hub; high velocity in Chicago"
              />
            </label>
            <div className="form-actions">
              <button className="btn-primary" disabled={savingTransfer}>
                {savingTransfer ? "Submitting..." : "Submit Redistribution Request"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="panel">
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Batch Lot</th>
                <th>Origin Facility</th>
                <th>Destination Facility</th>
                <th>Quantity</th>
                <th>Justification</th>
                <th>Approval Status</th>
                <th>Manager Governance</th>
              </tr>
            </thead>
            <tbody>
              {transfers.map((t) => (
                <tr key={t.id}>
                  <td><code>#{t.id}</code></td>
                  <td><strong>Batch #{t.batchId}</strong></td>
                  <td>{getWarehouseName(t.fromWarehouseId)}</td>
                  <td><strong style={{ color: "var(--accent-emerald-light)" }}>{getWarehouseName(t.toWarehouseId)}</strong></td>
                  <td><strong>{t.quantity} units</strong></td>
                  <td>{t.reason || "Waste prevention"}</td>
                  <td>
                    <span className={`status-pill ${String(t.status || "PENDING").toLowerCase()}`}>
                      {t.status || "PENDING"}
                    </span>
                  </td>
                  <td>
                    {t.status === "PENDING" ? (
                      <div className="table-actions">
                        <button
                          className="btn-small"
                          style={{ background: "var(--accent-emerald)", color: "#fff" }}
                          onClick={() => handleUpdateTransferStatus(t.id, "APPROVED")}
                        >
                          ✓ Approve
                        </button>
                        <button
                          className="btn-small btn-danger"
                          onClick={() => handleUpdateTransferStatus(t.id, "REJECTED")}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    ) : t.status === "APPROVED" ? (
                      <button
                        className="btn-small"
                        onClick={() => handleUpdateTransferStatus(t.id, "COMPLETED")}
                      >
                        ✓ Mark In-Transit / Done
                      </button>
                    ) : (
                      <span className="muted-text">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );

  const renderAnalytics = () => (
    <>
      <div className="kpi-grid">
        <div className="kpi-card danger">
          <div className="kpi-card-header"><span className="kpi-label">At-Risk Inventory</span></div>
          <div className="kpi-value crimson">{money(stats.totalWasteValue)}</div>
          <div className="kpi-subtext"><span>Identified write-off potential</span></div>
        </div>
        <div className="kpi-card highlight">
          <div className="kpi-card-header"><span className="kpi-label">Value Recovered</span></div>
          <div className="kpi-value green">{money(stats.totalSavings)}</div>
          <div className="kpi-subtext"><span>Direct revenue retained</span></div>
        </div>
        <div className="kpi-card highlight">
          <div className="kpi-card-header"><span className="kpi-label">Total Quantity Saved</span></div>
          <div className="kpi-value green">{stats.totalSavedQuantity.toLocaleString()} units</div>
          <div className="kpi-subtext"><span>Saved from landfill</span></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-card-header"><span className="kpi-label">Avoided Write-offs</span></div>
          <div className="kpi-value">94.2%</div>
          <div className="kpi-subtext"><span>Waste mitigation rate</span></div>
        </div>
      </div>

      <AnalyticsCharts batches={batches} products={products} />
    </>
  );

  const renderPage = () => {
    switch (activePage) {
      case "Products": return renderProducts();
      case "Warehouses": return renderWarehouses();
      case "Inventory Batches": return renderBatches();
      case "Expiry Alerts": return renderExpiryAlerts();
      case "Risk Analysis": return renderRiskAnalysis();
      case "Campaigns": return renderCampaigns();
      case "Transfers": return renderTransfers();
      case "Analytics": return renderAnalytics();
      case "Dashboard":
      default: return renderDashboard();
    }
  };

  return (
    <div className="app-container">
      {/* Precision Enterprise Sidebar */}
      <aside className="sidebar">
        <div className="logo-section">
          <div className="logo-badge">W</div>
          <div className="logo-text">
            <h1>WasteZero</h1>
            <span>Intelligence Platform</span>
          </div>
        </div>

        <div className="nav-section-title">Navigation</div>
        <nav className="sidebar-nav">
          {navigation.map((item) => (
            <NavLink
              key={item.label}
              to={pageRoutes[item.label]}
              end={item.label === "Dashboard"}
              className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span>{item.label}</span>
              {item.label === "Expiry Alerts" && expiringSoonCount > 0 && (
                <span className="nav-counter alert-counter">{expiringSoonCount}</span>
              )}
              {item.label === "Campaigns" && campaigns.length > 0 && (
                <span className="nav-counter">{campaigns.length}</span>
              )}
              {item.label === "Transfers" && transfers.filter(t => t.status === "PENDING").length > 0 && (
                <span className="nav-counter" style={{ background: "var(--accent-amber)", color: "#000" }}>
                  {transfers.filter(t => t.status === "PENDING").length}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-heading">
            <span>♻</span> Sustainable Enterprise
          </div>
          <p>
            Detect early → Recommend action → Recover value → Reduce waste.
          </p>
        </div>
      </aside>

      {/* Main App Workspace */}
      <main className="main-content">
        {/* Sleek Topbar matching Slide 1 */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-greeting">
              <h2>Inventory Command Center</h2>
              <p>Real-time waste prevention, risk analytics & recovery actions.</p>
            </div>
            <div className="search-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search inventory, products, or locations..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
              {searchText ? (
                <button
                  type="button"
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", fontSize: "14px", cursor: "pointer", background: "none", border: "none" }}
                  onClick={() => setSearchText("")}
                  title="Clear search"
                >
                  ✕
                </button>
              ) : (
                <span className="search-shortcut">⌘K</span>
              )}
            </div>
          </div>

          <div className="topbar-right">
            {/* Facility Filter */}
            <div className="facility-filter">
              <span>🏢</span>
              <select
                value={selectedWarehouseFilter}
                onChange={(e) => setSelectedWarehouseFilter(e.target.value)}
              >
                <option value="ALL">All Warehouses ({warehouses.length})</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={String(w.id)}>{w.warehouseCode} ({w.location})</option>
                ))}
              </select>
            </div>

            {/* Theme Toggle Button */}
            <button
              className="btn-secondary"
              style={{ padding: "7px 12px", fontSize: "13px" }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle Theme"
            >
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>

            {/* Role Switcher */}
            <div className="role-badge">
              <span>Role:</span>
              <select
                className="role-select"
                value={currentRole}
                onChange={(e) => setCurrentRole(e.target.value)}
              >
                <option value="SupplyChainManager">Supply Chain Manager</option>
                <option value="InventoryManager">Inventory Manager</option>
                <option value="WarehouseManager">Warehouse Lead</option>
                <option value="ESGExecutive">Sustainability Lead</option>
              </select>
            </div>

            {/* Enterprise Ops Profile */}
            <div className="user-profile">
              <div className="user-avatar">WZ</div>
              <div className="user-meta">
                <span className="user-name">Enterprise Ops</span>
                <span className="user-title">Active Session</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="page-workspace">
          <div className="page-header">
            <div className="page-title-group">
              <div className="eyebrow">WASTE MANAGEMENT INTELLIGENCE</div>
              <h1>{activePage}</h1>
              <p>{pageDescriptions[activePage]}</p>
            </div>
            <div className="page-header-actions">
              <button
                className="btn-secondary"
                onClick={loadDashboard}
                disabled={loading}
              >
                {loading ? "Refreshing..." : "↻ Refresh Data"}
              </button>
            </div>
          </div>

          {error && <div className="message-error">{error}</div>}

          {renderPage()}
        </div>
      </main>

      {/* CSV Import Modal */}
      {showCsvModal && (
        <div className="modal-overlay" onClick={() => setShowCsvModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h3>📥 CSV Inventory Batch Import</h3>
            <p>
              Bulk-upload SKU batches with expiry horizons, receiving dates, and facility assignments.
            </p>
            <div className="csv-preview">
sku,product_name,category,unit_price,batch_lot,warehouse_code,quantity,expiry_date
SKU-PRD-025,Golden Honeycrisp Apples 1kg,Produce,240.00,BAT-APP-2026-99,WH-02,500,2026-10-18
SKU-DRY-026,Organic Oat Milk Barista 1L,Dairy,175.00,BAT-OAT-2026-45,WH-01,650,2026-10-24
            </div>
            {csvStatus && <p style={{ color: "var(--accent-emerald-light)", fontWeight: 600 }}>{csvStatus}</p>}
            <div className="form-actions">
              <button className="btn-primary" onClick={handleImportSampleCsv}>
                Validate & Import Sample Batches
              </button>
              <button className="btn-secondary" onClick={() => setShowCsvModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
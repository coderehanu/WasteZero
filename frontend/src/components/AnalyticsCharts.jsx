
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const RISK_COLORS = {
  Expired: "#d9534f",
  "Expiring in 7 days": "#f1c75b",
  "Expiring in 8–30 days": "#e5a13d",
  Safe: "#247b4d",
};

const DEMAND_COLORS = {
  High: "#247b4d",
  Medium: "#e5b93f",
  Low: "#d9534f",
};

const CATEGORY_ORDER = [
  "Expired",
  "Expiring in 7 days",
  "Expiring in 8–30 days",
  "Safe",
];

function getDemandCategory(product) {
  const category = String(product.category || "").toLowerCase();
  const name = String(product.productName || "").toLowerCase();

  const commonlyUsedCategories = [
    "food grains",
    "grocery",
    "dairy",
    "beverages",
    "food",
    "vegetables",
    "fruits",
    "daily essentials",
  ];

  const commonlyUsedProducts = [
    "rice",
    "wheat",
    "flour",
    "milk",
    "bread",
    "oil",
    "sugar",
  ];

  if (
    commonlyUsedCategories.some((item) => category.includes(item)) ||
    commonlyUsedProducts.some((item) => name.includes(item))
  ) {
    return "High";
  }

  if (
    category.includes("personal care") ||
    category.includes("household") ||
    category.includes("cleaning")
  ) {
    return "Medium";
  }

  return "Low";
}

function AnalyticsCharts({ batches = [], products = [] }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;

    const dateText = String(expiryDate).slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      return null;
    }

    const [year, month, day] = dateText.split("-").map(Number);

    const expiryTime = Date.UTC(year, month - 1, day);
    const expiry = new Date(expiryTime);

    if (
      expiry.getUTCFullYear() !== year ||
      expiry.getUTCMonth() !== month - 1 ||
      expiry.getUTCDate() !== day
    ) {
      return null;
    }

    const currentTime = Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );

    return Math.round((expiryTime - currentTime) / 86400000);
  };

  const categoryCounts = {
    Expired: 0,
    "Expiring in 7 days": 0,
    "Expiring in 8–30 days": 0,
    Safe: 0,
  };

  let batchesWithoutValidExpiry = 0;

  batches.forEach((batch) => {
    const days = getDaysUntilExpiry(batch.expiryDate);
    const quantity = Math.max(0, Number(batch.quantity) || 0);

    if (days === null) {
      batchesWithoutValidExpiry += 1;
      return;
    }

    if (days < 0) {
      categoryCounts.Expired += quantity;
    } else if (days <= 7) {
      categoryCounts["Expiring in 7 days"] += quantity;
    } else if (days <= 30) {
      categoryCounts["Expiring in 8–30 days"] += quantity;
    } else {
      categoryCounts.Safe += quantity;
    }
  });

  const expiryData = CATEGORY_ORDER.map((name) => ({
    name,
    quantity: categoryCounts[name],
    fill: RISK_COLORS[name],
  }));

  const pieData = expiryData.filter((item) => item.quantity > 0);
  const hasInventory = pieData.length > 0;

  const demandCounts = {
    High: 0,
    Medium: 0,
    Low: 0,
  };

  products.forEach((product) => {
    demandCounts[getDemandCategory(product)] += 1;
  });

  const demandData = Object.entries(demandCounts).map(
    ([name, count]) => ({
      name,
      products: count,
      fill: DEMAND_COLORS[name],
    })
  );

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;

    const item = payload[0].payload;

    return (
      <div
        style={{
          background: "#fff",
          border: "1px solid #e0e8e2",
          borderRadius: 8,
          padding: "10px 14px",
          boxShadow: "0 3px 12px rgba(0,0,0,0.1)",
        }}
      >
        <strong style={{ color: item.fill || "#244332" }}>
          {item.name}
        </strong>

        {item.quantity !== undefined && (
          <div>Stock quantity: {item.quantity}</div>
        )}

        {item.products !== undefined && (
          <div>Number of products: {item.products}</div>
        )}
      </div>
    );
  };

  const renderLegend = () => (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "10px 14px",
        padding: "8px 4px",
        fontSize: 12,
      }}
    >
      {expiryData.map((item) => (
        <div
          key={item.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            color: item.fill,
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              backgroundColor: item.fill,
              borderRadius: 2,
              flexShrink: 0,
            }}
          />
          {item.name} ({item.quantity})
        </div>
      ))}
    </div>
  );

  return (
    <section className="analytics-grid">
      {/* Inventory Expiry Distribution */}
      <div className="dashboard-panel analytics-panel">
        <h2>Inventory Expiry Distribution</h2>

        <p className="analytics-description">
          Batch quantities grouped by expiry risk.
        </p>

        {hasInventory ? (
          <>
            <ResponsiveContainer width="100%" height={350}>
              <PieChart
                margin={{
                  top: 25,
                  right: 25,
                  bottom: 8,
                  left: 25,
                }}
              >
                <Pie
                  data={pieData}
                  dataKey="quantity"
                  nameKey="name"
                  cx="50%"
                  cy="42%"
                  outerRadius={80}
                  paddingAngle={2}
                  minAngle={3}
                  label={({ percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                  labelLine
                >
                  {pieData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.fill}
                      stroke="#fff"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>

                <Tooltip content={<CustomTooltip />} />

                <Legend content={renderLegend} />
              </PieChart>
            </ResponsiveContainer>

            {batchesWithoutValidExpiry > 0 && (
              <p
                style={{
                  color: "#85670d",
                  background: "#fff9df",
                  border: "1px solid #f1d778",
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {batchesWithoutValidExpiry} batch(es) have missing or
                invalid expiry dates and are excluded from the expiry
                distribution.
              </p>
            )}
          </>
        ) : (
          <p>
            {batchesWithoutValidExpiry > 0
              ? "No valid expiry data is available for the inventory batches."
              : "No inventory data available."}
          </p>
        )}
      </div>

      {/* Quantity by Expiry Risk */}
      <div className="dashboard-panel analytics-panel">
        <h2>Quantity by Expiry Risk</h2>

        <p className="analytics-description">
          Compare stock quantities across risk categories.
        </p>

        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={expiryData}
            margin={{
              top: 16,
              right: 12,
              left: 0,
              bottom: 40,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              angle={-12}
              textAnchor="end"
              interval={0}
              height={65}
              tick={{ fontSize: 10 }}
            />

            <YAxis allowDecimals={false} />

            <Tooltip content={<CustomTooltip />} />

            <Bar
              dataKey="quantity"
              name="Stock quantity"
              radius={[6, 6, 0, 0]}
              maxBarSize={55}
            >
              {expiryData.map((item) => (
                <Cell
                  key={item.name}
                  fill={item.fill}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div
          style={{
            background: "#fff9df",
            border: "1px solid #f1d778",
            borderRadius: 10,
            padding: 12,
            marginTop: 8,
          }}
        >
          <strong style={{ color: "#85670d" }}>
            Offer Priority
          </strong>

          <p style={{ margin: "5px 0 0", fontSize: 13 }}>
            {categoryCounts["Expiring in 7 days"] > 0
              ? `${categoryCounts["Expiring in 7 days"]} units are expiring within 7 days. Prioritize these batches for offers.`
              : categoryCounts["Expiring in 8–30 days"] > 0
                ? "No stock is expiring within 7 days. Review the 8–30 day category for upcoming promotions."
                : "No valid stock is currently classified as expiring within 30 days."}
          </p>

          {batchesWithoutValidExpiry > 0 && (
            <p
              style={{
                margin: "8px 0 0",
                fontSize: 12,
                color: "#85670d",
              }}
            >
              Check the {batchesWithoutValidExpiry} batch(es) without
              valid expiry dates before making stock decisions.
            </p>
          )}
        </div>
      </div>

      {/* Estimated Product Demand */}
      <div className="dashboard-panel analytics-panel">
        <h2>Estimated Product Demand</h2>

        <p className="analytics-description">
          Preliminary category-based estimates, not actual sales.
        </p>

        {products.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={demandData}
                margin={{
                  top: 20,
                  right: 15,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12 }}
                />

                <YAxis
                  allowDecimals={false}
                  label={{
                    value: "Products",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />

                <Tooltip content={<CustomTooltip />} />

                <Bar
                  dataKey="products"
                  name="Number of products"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={65}
                >
                  {demandData.map((item) => (
                    <Cell
                      key={item.name}
                      fill={item.fill}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: 16,
                fontSize: 13,
                padding: "8px 0",
              }}
            >
              {Object.entries(DEMAND_COLORS).map(([name, color]) => (
                <span
                  key={name}
                  style={{
                    color,
                    fontWeight: 600,
                  }}
                >
                  ● {name} demand
                </span>
              ))}
            </div>

            <p
              style={{
                color: "#78897e",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              Use these estimates as a starting point. Actual demand
              requires sales history or market data.
            </p>
          </>
        ) : (
          <p>No products available for demand estimation.</p>
        )}
      </div>
    </section>
  );
}

export default AnalyticsCharts;

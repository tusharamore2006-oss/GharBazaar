import { useEffect, useState } from "react";
import "./AdminDashboard.css";
import { API_BASE_URL } from "./config";

// Formats prices in Indian Lakhs/Crores standard
const formatPrice = (price, listingType) => {
  if (price === undefined || price === null || price === "") return "";
  const num = Number(price);
  if (isNaN(num)) return `₹${price}`;

  if (listingType === "Rent") {
    return `₹${num.toLocaleString("en-IN")}/mo`;
  }
  if (num >= 10000000) {
    const cr = (num / 10000000).toFixed(2).replace(/\.00$/, "");
    return `₹${cr} Cr`;
  }
  if (num >= 100000) {
    const lakh = (num / 100000).toFixed(2).replace(/\.00$/, "");
    return `₹${lakh} Lakh`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatDate = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function AdminDashboard({
  token,
  user,
  onBack,
  onLogout,
  onUnauthorized,
}) {
  const [tab, setTab] = useState("users");

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalEnquiries: 0,
  });

  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [editingProperty, setEditingProperty] = useState(null);
  const [savingProperty, setSavingProperty] = useState(false);

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  // ======================================
  // FETCH DASHBOARD DATA
  // ======================================

  const fetchAdminData = async () => {
    setLoading(true);
    setError("");
    setUnauthorized(false);

    try {
      const [statsRes, usersRes, propertiesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/admin/stats`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/admin/users`, { headers: authHeaders }),
        fetch(`${API_BASE_URL}/admin/properties`, { headers: authHeaders }),
      ]);

      // Session expired or not an admin
      if (statsRes.status === 401 || statsRes.status === 403) {
        const data = await statsRes.json().catch(() => ({}));
        setUnauthorized(true);
        setError(data.message || "Session expired. Please login again as admin.");
        setLoading(false);
        return;
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats({
          totalUsers: data.totalUsers || 0,
          totalProperties: data.totalProperties || 0,
          totalEnquiries: data.totalEnquiries || 0,
        });
      }

      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users || []);
      }

      if (propertiesRes.ok) {
        const data = await propertiesRes.json();
        setProperties(data.properties || []);
      }

      if (!statsRes.ok || !usersRes.ok || !propertiesRes.ok) {
        const data = await statsRes.json().catch(() => ({}));
        setError(data.message || "Failed to load some dashboard data");
      }
    } catch (err) {
      console.log(err);
      setError("Unable to connect to backend server");
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ======================================
  // DELETE USER
  // ======================================

  const handleDeleteUser = async (userId) => {
    const target = users.find((u) => (u._id || u.id) === userId);
    const label = target ? target.name : "this user";

    if (!window.confirm(`Delete user "${label}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(userId);
    setError("");
    setUnauthorized(false);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setUnauthorized(true);
        }
        setError(data.message || "Failed to delete user");
        return;
      }

      setUsers((current) =>
        current.filter((u) => (u._id || u.id) !== userId)
      );

      setStats((current) => ({
        ...current,
        totalUsers: Math.max(0, current.totalUsers - 1),
      }));
    } catch (err) {
      console.log(err);
      setError("Unable to connect to backend server");
    }

    setDeletingId("");
  };

  // ======================================
  // DELETE PROPERTY
  // ======================================

  const handleDeleteProperty = async (propertyId) => {
    const target = properties.find((p) => p._id === propertyId);
    const label = target ? target.title : "this property";

    if (!window.confirm(`Delete property "${label}"? This cannot be undone.`)) {
      return;
    }

    setDeletingId(propertyId);
    setError("");
    setUnauthorized(false);

    try {
      const res = await fetch(`${API_BASE_URL}/admin/properties/${propertyId}`, {
        method: "DELETE",
        headers: authHeaders,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          setUnauthorized(true);
        }
        setError(data.message || "Failed to delete property");
        return;
      }

      setProperties((current) => current.filter((p) => p._id !== propertyId));

      setStats((current) => ({
        ...current,
        totalProperties: Math.max(0, current.totalProperties - 1),
      }));
    } catch (err) {
      console.log(err);
      setError("Unable to connect to backend server");
    }

    setDeletingId("");
  };

  const handleSaveProperty = async (event) => {
    event.preventDefault();
    if (!editingProperty) return;

    setSavingProperty(true);
    setError("");

    const fields = [
      "title",
      "description",
      "price",
      "area",
      "bedrooms",
      "bathrooms",
      "yearBuilt",
      "location",
      "propertyType",
      "listingType",
      "furnished",
      "status",
    ];
    const updates = Object.fromEntries(
      fields.map((field) => [field, editingProperty[field]])
    );

    try {
      const response = await fetch(
        `${API_BASE_URL}/admin/properties/${editingProperty._id}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify(updates),
        }
      );
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setUnauthorized(true);
        }
        setError(data.message || "Failed to update property");
        return;
      }

      setProperties((current) =>
        current.map((property) =>
          property._id === data.property._id ? data.property : property
        )
      );
      setEditingProperty(null);
    } catch (err) {
      console.log(err);
      setError("Unable to connect to backend server");
    } finally {
      setSavingProperty(false);
    }
  };

  // ======================================
  // RENDER
  // ======================================

  return (
    <div className="admin-dashboard">
      {/* HEADER */}
      <header className="admin-header">
        <div
          className="admin-header-brand"
          onClick={onBack}
          style={{ cursor: "pointer" }}
        >
          <span className="brand-icon">🏠</span>
          <span className="brand-text">
            Ghar<span>Bazaar</span>
          </span>
          <span className="admin-header-tag">🛡️ Admin</span>
        </div>

        <div className="admin-header-actions">
          <span className="admin-header-user">{user?.name}</span>

          <button
            type="button"
            className="admin-btn admin-btn-secondary"
            onClick={onBack}
          >
            Back to Site
          </button>

          <button
            type="button"
            className="admin-btn admin-btn-danger"
            onClick={onLogout}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="admin-main">
        <h1 className="admin-title">Admin Dashboard</h1>

        {/* ALERTS */}
        {error && (
          <div className="admin-alert">
            <span>{error}</span>

            <div className="admin-alert-actions">
              {unauthorized && (
                <button
                  type="button"
                  className="admin-btn admin-btn-danger"
                  onClick={onUnauthorized}
                >
                  Go to Admin Login
                </button>
              )}

              {!unauthorized && (
                <button
                  type="button"
                  className="admin-btn admin-btn-secondary"
                  onClick={fetchAdminData}
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        )}

        {/* STATS */}
        <section className="admin-stats">
          <div className="admin-stat-card">
            <span className="admin-stat-icon">👥</span>
            <div className="admin-stat-body">
              <strong>{stats.totalUsers}</strong>
              <small>Total Users</small>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">🏠</span>
            <div className="admin-stat-body">
              <strong>{stats.totalProperties}</strong>
              <small>Total Properties</small>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-icon">📩</span>
            <div className="admin-stat-body">
              <strong>{stats.totalEnquiries}</strong>
              <small>Total Enquiries</small>
            </div>
          </div>
        </section>

        {/* TABS */}
        <div className="admin-tabs">
          <button
            type="button"
            className={`admin-tab ${tab === "users" ? "active" : ""}`}
            onClick={() => setTab("users")}
          >
            👥 Users ({users.length})
          </button>

          <button
            type="button"
            className={`admin-tab ${tab === "properties" ? "active" : ""}`}
            onClick={() => setTab("properties")}
          >
            🏠 Properties ({properties.length})
          </button>
        </div>

        {loading ? (
          <p className="admin-loading">Loading dashboard data...</p>
        ) : (
          <section className="admin-panel">
            {/* ==================================
                USERS TABLE
            ================================== */}
            {tab === "users" &&
              (users.length === 0 ? (
                <p className="admin-empty">No users found.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {users.map((u) => {
                        const uid = u._id || u.id;
                        const isSelf =
                          String(uid) === String(user?.id || user?._id);

                        return (
                          <tr key={uid}>
                            <td data-label="Name">{u.name}</td>
                            <td data-label="Email">{u.email}</td>
                            <td data-label="Phone">{u.phone || "—"}</td>

                            <td data-label="Role">
                              <span
                                className={`admin-role-badge role-${(
                                  u.role || "User"
                                ).toLowerCase()}`}
                              >
                                {u.role || "User"}
                              </span>
                            </td>

                            <td data-label="Joined">
                              {formatDate(u.createdAt)}
                            </td>

                            <td data-label="Actions">
                              <button
                                type="button"
                                className="admin-btn admin-btn-delete"
                                disabled={isSelf || deletingId === uid}
                                onClick={() => handleDeleteUser(uid)}
                                title={
                                  isSelf
                                    ? "You cannot delete your own account"
                                    : "Delete user"
                                }
                              >
                                {deletingId === uid ? "Deleting..." : "Delete"}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}

            {/* ==================================
                PROPERTIES TABLE
            ================================== */}
            {tab === "properties" &&
              (properties.length === 0 ? (
                <p className="admin-empty">No properties found.</p>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Location</th>
                        <th>Owner</th>
                        <th>Listed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>

                    <tbody>
                      {properties.map((p) => (
                        <tr key={p._id}>
                          <td data-label="Title">{p.title}</td>

                          <td data-label="Type">
                            {p.propertyType} · {p.listingType}
                          </td>

                          <td data-label="Price">
                            {formatPrice(p.price, p.listingType)}
                          </td>

                          <td data-label="Location">{p.location}</td>

                          <td data-label="Owner">
                            {p.owner
                              ? `${p.owner.name || "—"}${
                                  p.owner.email ? ` (${p.owner.email})` : ""
                                }`
                              : "—"}
                          </td>

                          <td data-label="Listed">
                            {formatDate(p.createdAt)}
                          </td>

                          <td data-label="Actions">
                            <a
                              className="admin-btn admin-btn-view"
                              href={`/property/${p._id}`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              View
                            </a>

                            <button
                              type="button"
                              className="admin-btn admin-btn-edit"
                              onClick={() => setEditingProperty({ ...p })}
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              className="admin-btn admin-btn-delete"
                              disabled={deletingId === p._id}
                              onClick={() => handleDeleteProperty(p._id)}
                            >
                              {deletingId === p._id ? "Deleting..." : "Delete"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </section>
        )}

        {editingProperty && (
          <div
            className="admin-modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !savingProperty) {
                setEditingProperty(null);
              }
            }}
          >
            <form className="admin-edit-form" onSubmit={handleSaveProperty}>
              <h2>Edit Property</h2>
              <label>
                Title
                <input
                  value={editingProperty.title || ""}
                  onChange={(event) => setEditingProperty({ ...editingProperty, title: event.target.value })}
                  required
                />
              </label>
              <label>
                Description
                <textarea
                  rows="3"
                  value={editingProperty.description || ""}
                  onChange={(event) => setEditingProperty({ ...editingProperty, description: event.target.value })}
                />
              </label>
              <div className="admin-edit-grid">
                <label>
                  Price
                  <input type="number" min="0" value={editingProperty.price ?? ""} onChange={(event) => setEditingProperty({ ...editingProperty, price: event.target.value })} required />
                </label>
                <label>
                  Area (sq ft)
                  <input type="number" min="0" value={editingProperty.area ?? ""} onChange={(event) => setEditingProperty({ ...editingProperty, area: event.target.value })} required />
                </label>
                <label>
                  Location
                  <input value={editingProperty.location || ""} onChange={(event) => setEditingProperty({ ...editingProperty, location: event.target.value })} required />
                </label>
                <label>
                  Property Type
                  <select value={editingProperty.propertyType || "House"} onChange={(event) => setEditingProperty({ ...editingProperty, propertyType: event.target.value })}>
                    <option>House</option>
                    <option>Flat</option>
                    <option>Villa</option>
                    <option>Plot</option>
                  </select>
                </label>
                <label>
                  Listing Type
                  <select value={editingProperty.listingType || "Sale"} onChange={(event) => setEditingProperty({ ...editingProperty, listingType: event.target.value })}>
                    <option>Sale</option>
                    <option>Rent</option>
                  </select>
                </label>
                <label>
                  Status
                  <select value={editingProperty.status || "Available"} onChange={(event) => setEditingProperty({ ...editingProperty, status: event.target.value })}>
                    <option>Available</option>
                    <option>Sold</option>
                  </select>
                </label>
              </div>
              {error && <p className="admin-edit-error">{error}</p>}
              <div className="admin-edit-actions">
                <button type="button" className="admin-btn admin-btn-secondary" disabled={savingProperty} onClick={() => setEditingProperty(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn admin-btn-primary" disabled={savingProperty}>
                  {savingProperty ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

export default AdminDashboard;
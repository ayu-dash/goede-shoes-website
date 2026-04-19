// ===========================
// DASHBOARD INTERACTIONS
// ===========================

document.addEventListener("DOMContentLoaded", () => {
  // =========================
  // PRICE CONFIGURATION
  // =========================
  const SERVICE_PRICES = {
    "Deep Clean (Regular)": 40000,
    "Fast Clean": 25000,
    "Deep Clean Express": 60000,
    "Premium Repaint": 150000,
  };

  const ADDON_PRICES = {
    "Unyellowing": 50000,
    "Glue & Repress": 60000,
    "Leather Polish": 30000,
    "Deodorizer": 15000,
  };

  const LOGISTICS_FEE = 15000;

  // =========================
  // UPDATE SUMMARY LOGIC
  // =========================
  const updateOrderSummary = () => {
    const summaryContainer = document.getElementById("summary-items-container");
    const subtotalEl = document.getElementById("summary-subtotal");
    const logisticsEl = document.getElementById("summary-logistics");
    const totalEl = document.getElementById("summary-total");

    if (!summaryContainer) return;

    let subtotal = 0;
    const items = [];

    document.querySelectorAll(".shoe-item").forEach((item) => {
      const shoeName = item.querySelector(".shoe-name").value || "Sepatu Tanpa Nama";
      const serviceType = item.querySelector(".service-type").value;
      const addons = [];
      let itemPrice = SERVICE_PRICES[serviceType] || 40000;

      item.querySelectorAll(".addon-tag input:checked").forEach((cb) => {
        addons.push(cb.value);
        itemPrice += ADDON_PRICES[cb.value] || 0;
      });

      subtotal += itemPrice;
      items.push({ shoeName, serviceType, addons, itemPrice });
    });

    // Update Items List
    if (items.length === 0) {
      summaryContainer.innerHTML = `<div class="order-summary-item placeholder-item"><p class="text-muted">Tambahkan sepatu untuk melihat ringkasan</p></div>`;
    } else {
      summaryContainer.innerHTML = items.map(item => `
        <div class="order-summary-item">
          <div>
            <span class="summary-item-name">${item.shoeName.length > 20 ? item.shoeName.substring(0, 17) + "..." : item.shoeName}</span>
            <span class="summary-item-service">${item.serviceType.toUpperCase()} ${item.addons.length > 0 ? "+ " + item.addons.join(", ").toUpperCase() : ""}</span>
          </div>
          <span class="summary-item-price">Rp ${item.itemPrice.toLocaleString('id-ID')}</span>
        </div>
      `).join("");
    }

    // Update Logistics
    const pickupMethod = document.querySelector("[data-group='pickup'].active")?.dataset.value;
    const deliveryMethod = document.querySelector("[data-group='delivery'].active")?.dataset.value;
    const logisticsFee = (pickupMethod === "pickup" || deliveryMethod === "delivery") ? LOGISTICS_FEE : 0;

    // Update Totals
    subtotalEl.innerText = `Rp ${subtotal.toLocaleString('id-ID')}`;
    logisticsEl.innerText = `Rp ${logisticsFee.toLocaleString('id-ID')}`;
    totalEl.innerText = `Rp ${(subtotal + logisticsFee).toLocaleString('id-ID')}`;
  };

  // Listen for changes
  document.addEventListener("input", (e) => {
    if (e.target.classList.contains("shoe-name") || 
        e.target.classList.contains("service-type") || 
        e.target.type === "checkbox") {
      updateOrderSummary();
    }
  });

  // Re-bind logistics buttons to update summary
  const originalToggleLogic = (btn) => {
      const group = btn.closest(".logistics-toggle");
      group.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateOrderSummary();
  };
  // =========================
  // ADD-ON TAG TOGGLE
  // =========================
  document.querySelectorAll(".addon-tag").forEach((tag) => {
    tag.addEventListener("click", (e) => {
      e.preventDefault();
      const checkbox = tag.querySelector("input[type='checkbox']");
      if (checkbox) {
        checkbox.checked = !checkbox.checked;
      }
      tag.classList.toggle("active");
    });
  });

  // =========================
  // LOGISTICS TOGGLE BUTTONS
  // =========================
  document.querySelectorAll(".logistics-toggle .toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const group = btn.closest(".logistics-toggle");
      group.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateOrderSummary();
    });
  });

  // =========================
  // PAYMENT CARD SELECTION
  // =========================
  document.querySelectorAll(".payment-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".payment-card").forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
    });
  });

  // =========================
  // ORDER FILTER TABS
  // =========================
  document.querySelectorAll(".order-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".order-tab").forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  // =========================
  // ADD SHOE ITEM (Create Order)
  // =========================
  const addShoeBtn = document.getElementById("btn-add-shoe");
  if (addShoeBtn) {
    let shoeCount = document.querySelectorAll(".shoe-item").length;

    addShoeBtn.addEventListener("click", () => {
      shoeCount++;
      const shoeItem = document.createElement("div");
      shoeItem.className = "shoe-item";
      shoeItem.id = `shoe-item-${shoeCount}`;
      shoeItem.innerHTML = `
        <div class="shoe-item-header">
          <span class="shoe-item-label">Item ${shoeCount}</span>
          <button type="button" class="shoe-item-remove" data-item="${shoeCount}">Hapus</button>
        </div>
        <div class="shoe-item-fields">
          <div class="form-group">
            <label class="form-label form-label--upper">Nama Sepatu</label>
            <input type="text" class="form-input shoe-name" placeholder="Masukkan nama sepatu" />
          </div>
          <div class="form-group">
            <label class="form-label form-label--upper">Jenis Layanan</label>
            <select class="form-input form-select service-type">
              <option>Deep Clean (Regular)</option>
              <option>Fast Clean</option>
              <option>Deep Clean Express</option>
              <option>Premium Repaint</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label form-label--upper">Layanan Tambahan (Add-Ons)</label>
          <div class="addon-tags">
            <label class="addon-tag"><input type="checkbox" value="Unyellowing" /> Unyellowing</label>
            <label class="addon-tag"><input type="checkbox" value="Glue & Repress" /> Glue & Repress</label>
            <label class="addon-tag"><input type="checkbox" value="Leather Polish" /> Leather Polish</label>
            <label class="addon-tag"><input type="checkbox" value="Deodorizer" /> Deodorizer</label>
          </div>
        </div>
      `;

      // Insert before the last shoe item's parent's end
      const container = document.querySelector(".order-section");
      container.appendChild(shoeItem);

      // Re-bind addon tag events
      shoeItem.querySelectorAll(".addon-tag").forEach((tag) => {
        tag.addEventListener("click", (e) => {
          e.preventDefault();
          const checkbox = tag.querySelector("input[type='checkbox']");
          if (checkbox) checkbox.checked = !checkbox.checked;
          tag.classList.toggle("active");
        });
      });

      // Bind remove button
      shoeItem.querySelector(".shoe-item-remove").addEventListener("click", () => {
        shoeItem.remove();
        updateOrderSummary();
      });

      updateOrderSummary();
    });
  }

  // =========================
  // REMOVE SHOE ITEM
  // =========================
  document.querySelectorAll(".shoe-item-remove").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".shoe-item");
      if (item) {
        item.remove();
        updateOrderSummary();
      }
    });
  });

  // =========================
  // CONFIRM ORDER
  // =========================
  const confirmOrderBtn = document.getElementById("btn-confirm-order");
  if (confirmOrderBtn) {
    confirmOrderBtn.addEventListener("click", async () => {
      const shoeItems = [];
      document.querySelectorAll(".shoe-item").forEach((item) => {
        const shoeName = item.querySelector(".shoe-name").value;
        const serviceType = item.querySelector(".service-type").value;
        const addons = [];
        item.querySelectorAll(".addon-tag input:checked").forEach((cb) => {
          addons.push(cb.value);
        });

        if (shoeName) {
          shoeItems.push({ shoeName, serviceType, addons });
        }
      });

      if (shoeItems.length === 0) {
        alert("Mohon tambahkan setidaknya satu sepatu.");
        return;
      }

      const pickupMethod = document.querySelector("[data-group='pickup'].active").dataset.value;
      const deliveryMethod = document.querySelector("[data-group='delivery'].active").dataset.value;
      const address = document.getElementById("pickup-address").value;

      const paymentMethod = document.querySelector("input[name='payment']:checked").value;

      const orderData = {
        items: shoeItems,
        logistics: {
          pickupMethod,
          deliveryMethod,
          address,
        },
        payment: {
          method: paymentMethod,
        },
      };

      try {
        confirmOrderBtn.disabled = true;
        confirmOrderBtn.innerText = "Memproses...";

        const response = await fetch("/api/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        const result = await response.json();

        if (result.status === "success") {
          alert("Pesanan berhasil dibuat!");
          window.location.href = "/customer/my-orders";
        } else {
          alert("Gagal membuat pesanan: " + result.message);
          confirmOrderBtn.disabled = false;
          confirmOrderBtn.innerText = "Konfirmasi Pesanan";
        }
      } catch (err) {
        console.error("Error creating order:", err);
        alert("Terjadi kesalahan sistem. Silakan coba lagi.");
        confirmOrderBtn.disabled = false;
        confirmOrderBtn.innerText = "Konfirmasi Pesanan";
      }
    });
  }
});

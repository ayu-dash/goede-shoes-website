/**
 * Table Pagination - Reusable client-side pagination
 * Auto-initializes on all tables with class 'admin-table' inside '.admin-table-wrapper' or '.admin-table-container'
 */
(function () {
  const ROWS_PER_PAGE = 25;

  function initPagination(wrapper) {
    const table = wrapper.querySelector(".admin-table");
    if (!table) return;

    const tbody = table.querySelector("tbody");
    if (!tbody) return;

    const rows = Array.from(tbody.querySelectorAll("tr"));
    if (rows.length <= ROWS_PER_PAGE) return; // No pagination needed

    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / ROWS_PER_PAGE);
    let currentPage = 1;

    // Create pagination container
    const paginationEl = document.createElement("div");
    paginationEl.className = "table-pagination";
    wrapper.parentNode.insertBefore(paginationEl, wrapper.nextSibling);

    function renderPage(page) {
      currentPage = page;
      const start = (page - 1) * ROWS_PER_PAGE;
      const end = start + ROWS_PER_PAGE;

      rows.forEach((row, i) => {
        row.style.display = i >= start && i < end ? "" : "none";
      });

      renderControls();
    }

    function renderControls() {
      const start = (currentPage - 1) * ROWS_PER_PAGE + 1;
      const end = Math.min(currentPage * ROWS_PER_PAGE, totalRows);

      let html = `<span class="table-pagination-info">Menampilkan ${start}–${end} dari ${totalRows} data</span>`;
      html += `<div class="table-pagination-controls">`;

      // Prev button
      html += `<button data-page="prev" ${currentPage === 1 ? "disabled" : ""}><i class="fa-solid fa-chevron-left"></i></button>`;

      // Page numbers with smart ellipsis
      const pages = getPageNumbers(currentPage, totalPages);
      pages.forEach((p) => {
        if (p === "...") {
          html += `<button disabled>…</button>`;
        } else {
          html += `<button data-page="${p}" class="${p === currentPage ? "active" : ""}">${p}</button>`;
        }
      });

      // Next button
      html += `<button data-page="next" ${currentPage === totalPages ? "disabled" : ""}><i class="fa-solid fa-chevron-right"></i></button>`;
      html += `</div>`;

      paginationEl.innerHTML = html;

      // Bind click events
      paginationEl.querySelectorAll("button[data-page]").forEach((btn) => {
        btn.addEventListener("click", () => {
          const target = btn.getAttribute("data-page");
          if (target === "prev") renderPage(currentPage - 1);
          else if (target === "next") renderPage(currentPage + 1);
          else renderPage(parseInt(target));
        });
      });
    }

    function getPageNumbers(current, total) {
      if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1);
      }

      const pages = [];
      pages.push(1);

      if (current > 3) pages.push("...");

      const rangeStart = Math.max(2, current - 1);
      const rangeEnd = Math.min(total - 1, current + 1);

      for (let i = rangeStart; i <= rangeEnd; i++) {
        pages.push(i);
      }

      if (current < total - 2) pages.push("...");

      pages.push(total);
      return pages;
    }

    renderPage(1);
  }

  // Auto-init on DOM ready
  document.addEventListener("DOMContentLoaded", () => {
    const wrappers = document.querySelectorAll(
      ".admin-table-wrapper, .admin-table-container",
    );
    wrappers.forEach((wrapper) => {
      // Skip small tables inside modals
      if (wrapper.closest(".modal-overlay")) return;
      initPagination(wrapper);
    });
  });
})();

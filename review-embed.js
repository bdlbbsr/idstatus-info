(function () {
  const SITE_ORIGIN = "https://idstatus.com";
  const API_ORIGIN =
    (typeof window !== "undefined" && window.__IDSTATUS_PUBLIC_API__) ||
    SITE_ORIGIN;
  const API_BASE = `${String(API_ORIGIN).replace(/\/$/, "")}/api/public/reviewWidget/`;
  const ATTR = "data-idstatus-review-embed";

  const CATEGORY_LABELS = [
    { key: "workLifeBalance", label: "Work-life balance" },
    { key: "salaryBenefits", label: "Salary & Benefits" },
    { key: "careerGrowth", label: "Career Growth" },
    { key: "jobSecurity", label: "Job security" },
    { key: "skillDevelopment", label: "Skill development" },
    { key: "workSatisfaction", label: "Work satisfaction" },
    { key: "companyCulture", label: "Company culture" },
    { key: "management", label: "Management" },
  ];

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function profileUrl(username) {
    const clean = String(username || "").trim().replace(/^\/+/, "");
    if (!clean) return SITE_ORIGIN;
    return `${SITE_ORIGIN}/${encodeURIComponent(clean)}`;
  }

  function formatCount(n) {
    const num = Number(n) || 0;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
    return String(num);
  }

  function formatScore(n) {
    const num = Number(n);
    if (!Number.isFinite(num) || num <= 0) return "0.0";
    return (Math.round(num * 10) / 10).toFixed(1);
  }

  function relativeTime(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 8) return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
    return date.toLocaleDateString();
  }

  function initials(name) {
    const parts = String(name || "A")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "A";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }

  function starsHtml(rating, sizePx) {
    const value = Math.max(0, Math.min(5, Number(rating) || 0));
    const size = sizePx || 14;
    let html = `<span class="ids-rw-stars" style="font-size:${size}px;letter-spacing:1px;color:#f5b301;line-height:1;">`;
    for (let i = 1; i <= 5; i += 1) {
      if (value >= i) html += "★";
      else if (value >= i - 0.5) html += "⯨";
      else html += `<span style="color:#d0d5dd;">★</span>`;
    }
    html += "</span>";
    return html;
  }

  function buildingIcon() {
    return `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 21V9l8-5 8 5v12" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 21v-6h6v6" stroke="#2563eb" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M9 10h.01M15 10h.01M9 13h.01M15 13h.01" stroke="#2563eb" stroke-width="2" stroke-linecap="round"/>
    </svg>`;
  }

  function pinIcon() {
    return `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style="flex-shrink:0">
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" stroke="#667085" stroke-width="1.7"/>
      <circle cx="12" cy="10" r="2.2" stroke="#667085" stroke-width="1.7"/>
    </svg>`;
  }

  function ensureStyles() {
    if (document.getElementById("ids-review-embed-css")) return;
    const style = document.createElement("style");
    style.id = "ids-review-embed-css";
    style.textContent = `
      .ids-rw{font-family:Inter,Roboto,Arial,sans-serif;color:#101828;box-sizing:border-box;width:100%;}
      .ids-rw *,.ids-rw *::before,.ids-rw *::after{box-sizing:border-box;}
      .ids-rw a{text-decoration:none;color:inherit;}
      .ids-rw-card{background:#fff;border:1px solid #e4e7ec;border-radius:12px;padding:14px 16px;}
      .ids-rw-compact{display:flex;align-items:center;gap:12px;cursor:pointer;transition:box-shadow .15s;}
      .ids-rw-compact:hover{box-shadow:0 4px 14px rgba(16,24,40,.08);}
      .ids-rw-logo{width:48px;height:48px;border-radius:10px;background:#eff4ff;display:flex;align-items:center;justify-content:center;overflow:hidden;flex-shrink:0;}
      .ids-rw-logo img{width:100%;height:100%;object-fit:cover;}
      .ids-rw-body{flex:1;min-width:0;}
      .ids-rw-name{font-weight:700;font-size:15px;margin:0 0 4px;display:flex;align-items:center;gap:6px;}
      .ids-rw-verified{color:#2563eb;font-size:14px;line-height:1;}
      .ids-rw-meta{font-size:12px;color:#667085;margin:2px 0;display:flex;align-items:center;gap:4px;}
      .ids-rw-rating-row{display:flex;align-items:center;gap:6px;margin:2px 0 4px;}
      .ids-rw-score{font-weight:700;font-size:13px;}
      .ids-rw-count{color:#667085;font-size:12px;}
      .ids-rw-chevron{color:#98a2b3;font-size:18px;flex-shrink:0;}
      .ids-rw-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;}
      .ids-rw-header-left{display:flex;gap:12px;align-items:flex-start;min-width:0;}
      .ids-rw-btn{background:#2563eb;color:#fff!important;border:none;border-radius:8px;padding:8px 14px;font-size:13px;font-weight:600;white-space:nowrap;cursor:pointer;display:inline-block;}
      .ids-rw-btn:hover{background:#1d4ed8;}
      .ids-rw-summary{border:1px solid #e4e7ec;border-radius:10px;padding:14px;display:flex;gap:18px;flex-wrap:wrap;margin-bottom:12px;}
      .ids-rw-overall{min-width:110px;}
      .ids-rw-overall-num{font-size:36px;font-weight:800;line-height:1;margin:0 0 6px;}
      .ids-rw-bars{flex:1;min-width:180px;display:flex;flex-direction:column;gap:5px;}
      .ids-rw-bar-row{display:flex;align-items:center;gap:6px;font-size:11px;color:#475467;}
      .ids-rw-bar-track{flex:1;height:7px;background:#f2f4f7;border-radius:99px;overflow:hidden;}
      .ids-rw-bar-fill{height:100%;background:#f5b301;border-radius:99px;}
      .ids-rw-cats{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:8px;}
      .ids-rw-cat{border:1px solid #e4e7ec;border-radius:8px;padding:10px;text-align:center;}
      .ids-rw-cat-label{font-size:11px;color:#667085;margin-bottom:4px;}
      .ids-rw-cat-score{font-weight:700;font-size:15px;}
      .ids-rw-reviews{border:1px solid #e4e7ec;border-radius:10px;padding:4px 12px;margin-top:12px;}
      .ids-rw-review{display:flex;gap:10px;padding:12px 0;border-bottom:1px solid #f2f4f7;}
      .ids-rw-review:last-child{border-bottom:none;}
      .ids-rw-avatar{width:36px;height:36px;border-radius:50%;background:#e4e7ec;color:#344054;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;}
      .ids-rw-review-top{display:flex;justify-content:space-between;gap:8px;align-items:flex-start;}
      .ids-rw-review-name{font-weight:700;font-size:13px;margin:0 0 2px;}
      .ids-rw-review-text{font-size:13px;color:#344054;margin:6px 0 0;line-height:1.45;}
      .ids-rw-empty{color:#667085;font-size:13px;padding:8px 0;}
      .ids-rw-powered{margin-top:8px;font-size:11px;color:#98a2b3;text-align:right;}
      .ids-rw-powered a{color:#2563eb;}
    `;
    document.head.appendChild(style);
  }

  function logoHtml(org) {
    if (org.avatar) {
      return `<div class="ids-rw-logo"><img src="${escapeHtml(org.avatar)}" alt="" loading="lazy" /></div>`;
    }
    return `<div class="ids-rw-logo">${buildingIcon()}</div>`;
  }

  function nameHtml(org) {
    const badge = org.isVerified
      ? `<span class="ids-rw-verified" title="Verified">✔</span>`
      : "";
    return `<div class="ids-rw-name">${escapeHtml(org.fullname)}${badge}</div>`;
  }

  function ratingRow(stats, compact) {
    const countLabel = compact
      ? `(${formatCount(stats.total)})`
      : `(${Number(stats.total || 0).toLocaleString()} review${stats.total === 1 ? "" : "s"})`;
    return `<div class="ids-rw-rating-row">
      ${starsHtml(stats.average, compact ? 13 : 15)}
      <span class="ids-rw-score">${formatScore(stats.average)}</span>
      <span class="ids-rw-count">${countLabel}</span>
    </div>`;
  }

  function categoryCards(employerAverages) {
    const cats = employerAverages?.categories || {};
    const count = employerAverages?.count || 0;
    if (!count) return "";
    const items = CATEGORY_LABELS.slice(0, 4)
      .map(({ key, label }) => {
        const score = cats[key] || 0;
        return `<div class="ids-rw-cat">
          <div class="ids-rw-cat-label">${escapeHtml(label)}</div>
          <div class="ids-rw-cat-score">${formatScore(score)} <span style="color:#f5b301">★</span></div>
        </div>`;
      })
      .join("");
    return `<div class="ids-rw-cats">${items}</div>`;
  }

  function distributionBars(distribution) {
    let html = `<div class="ids-rw-bars">`;
    for (let star = 5; star >= 1; star -= 1) {
      const pct = Number(distribution?.[star]) || 0;
      html += `<div class="ids-rw-bar-row">
        <span>${star}★</span>
        <div class="ids-rw-bar-track"><div class="ids-rw-bar-fill" style="width:${pct}%"></div></div>
        <span>${pct}%</span>
      </div>`;
    }
    html += `</div>`;
    return html;
  }

  function writeReviewBtn(org) {
    return `<a class="ids-rw-btn" href="${escapeHtml(profileUrl(org.username))}" target="_blank" rel="noopener noreferrer">Write a Review</a>`;
  }

  function poweredBy() {
    return `<div class="ids-rw-powered">Powered by <a href="${SITE_ORIGIN}" target="_blank" rel="noopener noreferrer">ID Status</a></div>`;
  }

  function renderCompact(data) {
    const org = data.organization;
    const stats = data.stats;
    const href = profileUrl(org.username);
    return `<a class="ids-rw ids-rw-card ids-rw-compact" href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
      ${logoHtml(org)}
      <div class="ids-rw-body">
        ${nameHtml(org)}
        ${ratingRow(stats, true)}
        ${org.industry ? `<div class="ids-rw-meta">${escapeHtml(org.industry)}</div>` : ""}
        ${org.location ? `<div class="ids-rw-meta">${pinIcon()}<span>${escapeHtml(org.location)}</span></div>` : ""}
      </div>
      <div class="ids-rw-chevron">›</div>
    </a>`;
  }

  function renderSummary(data, withReviews) {
    const org = data.organization;
    const stats = data.stats;
    let html = `<div class="ids-rw ids-rw-card">
      <div class="ids-rw-header">
        <div class="ids-rw-header-left">
          ${logoHtml(org)}
          <div>
            ${nameHtml(org)}
            ${org.industry ? `<div class="ids-rw-meta">${escapeHtml(org.industry)}</div>` : ""}
            ${org.location ? `<div class="ids-rw-meta">${pinIcon()}<span>${escapeHtml(org.location)}</span></div>` : ""}
          </div>
        </div>
        ${writeReviewBtn(org)}
      </div>
      <div class="ids-rw-summary">
        <div class="ids-rw-overall">
          <div class="ids-rw-overall-num">${formatScore(stats.average)}</div>
          <div>${starsHtml(stats.average, 16)}</div>
          <div class="ids-rw-count" style="margin-top:6px">(${Number(stats.total || 0).toLocaleString()} review${stats.total === 1 ? "" : "s"})</div>
        </div>
        ${distributionBars(stats.distribution)}
      </div>
      ${categoryCards(data.employerAverages)}`;

    if (withReviews) {
      html += `<div class="ids-rw-reviews">`;
      const list = Array.isArray(data.reviews) ? data.reviews : [];
      if (!list.length) {
        html += `<div class="ids-rw-empty">No public reviews yet.</div>`;
      } else {
        list.forEach((review) => {
          html += `<div class="ids-rw-review">
            <div class="ids-rw-avatar">${escapeHtml(initials(review.reviewer))}</div>
            <div style="flex:1;min-width:0">
              <div class="ids-rw-review-top">
                <div>
                  <div class="ids-rw-review-name">${escapeHtml(review.reviewer || "Anonymous")}</div>
                  ${starsHtml(review.rating, 12)}
                  <span class="ids-rw-count"> · ${escapeHtml(relativeTime(review.createdAt))}</span>
                </div>
              </div>
              <p class="ids-rw-review-text">${escapeHtml(review.comment || review.title || "")}</p>
            </div>
          </div>`;
        });
      }
      html += `</div>`;
    }

    html += `${poweredBy()}</div>`;
    return html;
  }

  function renderWidget(type, data) {
    if (type === "details") return renderSummary(data, true);
    if (type === "summary" || type === "small") return renderSummary(data, false);
    return renderCompact(data);
  }

  function mount(el) {
    const username = (el.getAttribute("data-username") || "").trim();
    const type = (el.getAttribute("data-widget") || "compact").trim().toLowerCase();
    if (!username) {
      el.innerHTML = `<div class="ids-rw ids-rw-empty">Missing organization username.</div>`;
      return;
    }
    el.innerHTML = `<div class="ids-rw ids-rw-empty">Loading reviews…</div>`;
    ensureStyles();
    fetch(`${API_BASE}${encodeURIComponent(username)}`, {
      method: "GET",
      credentials: "omit",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((payload) => {
        const data = payload?.data;
        if (!data?.organization) throw new Error("Invalid payload");
        el.innerHTML = renderWidget(type, data);
      })
      .catch(() => {
        el.innerHTML = `<div class="ids-rw ids-rw-empty">Unable to load review widget.</div>`;
      });
  }

  function boot() {
    const nodes = document.querySelectorAll(`[${ATTR}]`);
    nodes.forEach(mount);
  }

  window.IdStatusReviewEmbed = {
    mount,
    refresh: boot,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

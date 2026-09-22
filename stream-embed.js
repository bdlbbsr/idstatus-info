(function () {
  const API_BASE = "https://idstatus.com/api/public/userFeeds/";
  const SITE_ORIGIN = "https://idstatus.com";
  const LOGO_URL = "https://idstatus.com/idstatus-logo.svg";

  const cardHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F2F2F2",
    padding: "0.6rem",
    borderRadius: "5px 5px 0 0",
  };
  const widgetHeaderStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px",
    backgroundColor: "#FAFAFA",
    marginBottom: "5px",
    fontFamily: "Roboto, sans-serif",
    borderRadius: "5px",
  };
  const avatarCoverStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "40px",
    width: "40px",
    borderRadius: "5%",
    marginRight: "10px",
  };
  const bigAvatarStyle = {
    height: "40px",
    width: "40px",
    borderRadius: "5%",
  };
  const cardBodyStyle = {
    backgroundColor: "#FAFAFA",
  };
  const cardBodyContentStyle = {
    padding: "1rem",
    fontSize: "0.9rem",
    fontFamily: "Arial, sans-serif",
    color: "#444",
    lineHeight: "1.4",
  };
  const logoStyle = {
    fontFamily: "Oxanium, sans-serif",
    fontWeight: 600,
    color: "#ff7700",
    lineHeight: "1",
    fontSize: "1.8rem",
  };
  const cardBodyParagraphStyle = {
    margin: "0px",
    wordBreak: "break-word",
  };
  const cardFooterStyle = {
    padding: "0.5rem 0",
    backgroundColor: "#F2F2F2",
    display: "flex",
    borderRadius: "0 0 5px 5px",
  };
  const materialSymbolsStyle = {
    fontFamily: "Material Symbols Outlined",
    fontWeight: "normal",
    fontStyle: "normal",
    fontSize: "18px",
    lineHeight: "1",
    letterSpacing: "normal",
    textTransform: "none",
    display: "inline-block",
    whiteSpace: "nowrap",
    wordWrap: "normal",
    direction: "ltr",
    WebkitFontFeatureSettings: "'liga'",
    WebkitFontSmoothing: "antialiased",
  };
  const rowSepStyle = {
    marginBottom: "1rem",
  };
  const dFlex = {
    display: "flex",
  };
  const dFlexAbout = {
    display: "flex",
    alignItems: "center",
  };
  const fullNameStyle = {
    fontSize: "1rem",
    lineHeight: "1.1",
    margin: "0",
    padding: "0",
    fontFamily: "Roboto, sans-serif",
    textDecoration: "none",
    fontWeight: "600",
  };
  const createDate = {
    fontSize: "0.8rem",
    color: "#666",
    fontFamily: "Roboto, sans-serif",
    textDecoration: "none",
  };
  const count = {
    lineHeight: "1",
    marginLeft: "0.3rem",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "#666",
    fontFamily: "Roboto, sans-serif",
  };
  const countCnr = {
    margin: "0 0.5rem",
    lineHeight: "1",
    display: "flex",
    alignItems: "center",
  };
  const media = {
    margin: "0.3rem 0",
    width: "100%",
    height: "auto",
    display: "block",
    maxWidth: "100%",
  };
  const readMoreLink = {
    textDecoration: "underline",
    color: "#0077ff",
    cursor: "pointer",
  };

  let fontsInserted = false;
  let stylesInserted = false;

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function safeHttpUrl(value) {
    if (!value) return "";
    try {
      const parsed = new URL(String(value), SITE_ORIGIN);
      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
    } catch (_err) {
      return "";
    }
    return "";
  }

  function profileUrl(username) {
    const clean = String(username || "")
      .trim()
      .replace(/^\/+/, "");
    if (!clean) return SITE_ORIGIN;
    return `${SITE_ORIGIN}/${encodeURIComponent(clean)}`;
  }

  function addCustomStyles() {
    if (stylesInserted) return;
    stylesInserted = true;
    const style = document.createElement("style");
    style.textContent =
      "a h6, a h6 span, a span { text-decoration: none!important; color: inherit; }";
    document.head.appendChild(style);
  }

  function insertFontLinks() {
    if (fontsInserted) return;
    fontsInserted = true;
    const linkoxanium = document.createElement("link");
    linkoxanium.rel = "stylesheet";
    linkoxanium.href =
      "https://fonts.googleapis.com/css2?family=Oxanium:wght@600&display=swap";
    document.head.appendChild(linkoxanium);
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'Material Symbols Outlined';
        font-style: normal;
        font-weight: 100 700;
        src: url('https://fonts.gstatic.com/s/materialsymbolsoutlined/v207/kJEhBvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2') format('woff2');
      }
    `;
    document.head.appendChild(style);
  }

  function getInlineStyle(styleObject) {
    return Object.entries(styleObject)
      .map(([key, value]) => `${camelToKebab(key)}: ${value};`)
      .join(" ");
  }

  function camelToKebab(camelCase) {
    return camelCase.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
  }

  function getQueryParams(url) {
    try {
      const params = new URLSearchParams(new URL(url, SITE_ORIGIN).search);
      return {
        username: params.get("username") || "",
        width: params.get("width") || "",
        height: params.get("height") || "",
      };
    } catch (_err) {
      return { username: "", width: "", height: "" };
    }
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    if (seconds < 60) return `${Math.max(0, seconds)} seconds ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  }

  function isVideoUrl(url) {
    return /\.(mp4|webm)(\?|$)/i.test(url);
  }

  function mountWidget(widgetRoot, index) {
    if (widgetRoot.getAttribute("data-idstatus-mounted") === "1") return;
    widgetRoot.setAttribute("data-idstatus-mounted", "1");

    const link = widgetRoot.querySelector("a");
    const fromHref = link ? getQueryParams(link.getAttribute("href") || "") : {};
    const username =
      widgetRoot.getAttribute("data-username") || fromHref.username || "";
    const width =
      widgetRoot.getAttribute("data-width") || fromHref.width || "500px";
    const height =
      widgetRoot.getAttribute("data-height") || fromHref.height || "300px";

    if (link) {
      link.style.display = "none";
    }

    if (!username || username === "default") {
      widgetRoot.textContent = "ID Status embed is missing a username.";
      return;
    }

    const instanceId = `idstatus-embed-${index}-${Date.now()}`;
    const state = {
      cursor: null,
      hasMore: true,
      isFetching: false,
      headerReady: false,
    };

    const postsContainer = document.createElement("div");
    postsContainer.id = `${instanceId}-posts`;
    postsContainer.style.overflowY = "auto";
    postsContainer.style.overflowX = "hidden";
    postsContainer.style.width = width;
    postsContainer.style.height = height;
    widgetRoot.appendChild(postsContainer);

    const headerHost = document.createElement("div");
    const feedHost = document.createElement("div");
    const statusHost = document.createElement("div");
    postsContainer.appendChild(headerHost);
    postsContainer.appendChild(feedHost);
    postsContainer.appendChild(statusHost);

    function showStatus(message) {
      statusHost.textContent = message || "";
    }

    function displayTopSection() {
      if (state.headerReady) return;
      const safeName = escapeHtml(username);
      headerHost.innerHTML = `
    <div style="${getInlineStyle(widgetHeaderStyle)}">
      <div style="${getInlineStyle(dFlexAbout)}">
        <img src="${LOGO_URL}" alt="ID Status Logo" style="${getInlineStyle({ height: "1.5rem", marginRight: "10px" })}" />
        <span style="${getInlineStyle(logoStyle)}">ID Status</span>
      </div>
      <div style="${getInlineStyle({ border: 0, padding: "6px 0.8rem", fontSize: "0.8rem", backgroundColor: "#333", color: "#fff", borderRadius: "4px" })}">
        <a href="${profileUrl(username)}" style="${getInlineStyle({ color: "#fff", textDecoration: "none" })}" target="_blank" rel="noopener noreferrer">Follow ${safeName}</a>
      </div>
    </div>
  `;
      state.headerReady = true;
    }

    function toggleReadMore(postId) {
      const contentElement = document.getElementById(`${postId}-content`);
      const moreContentElement = document.getElementById(`${postId}-more-content`);
      const readMoreElement = document.getElementById(`${postId}-read-more`);
      if (!contentElement || !moreContentElement || !readMoreElement) return;
      const hidden = moreContentElement.style.display === "none";
      moreContentElement.style.display = hidden ? "inline" : "none";
      readMoreElement.textContent = hidden ? "Hide Content" : "Read More";
    }

    function displayPosts(posts) {
      const list = Array.isArray(posts) ? posts : [];
      const postsHTML = list
        .map((post, postIndex) => {
          const avatarUrl = safeHttpUrl(post.user?.avatar);
          const fullname = escapeHtml(post.user?.fullname || "");
          const postUsername = escapeHtml(post.user?.username || username);
          const createdAt = escapeHtml(formatDate(post.createdAt));
          const content = String(post.content || "");
          const safePreview = escapeHtml(
            content.length > 333 ? content.substring(0, 333) + "..." : content,
          );
          const safeRest = escapeHtml(
            content.length > 333 ? content.substring(333) : "",
          );
          const mediaUrl = safeHttpUrl(post.media?.[0]?.url);
          const postId = `${instanceId}-${escapeHtml(post._id || post.id || postIndex)}`;
          const mediaTag = mediaUrl
            ? isVideoUrl(mediaUrl)
              ? `<video controls src="${escapeHtml(mediaUrl)}" style="${getInlineStyle(media)}"></video>`
              : `<img src="${escapeHtml(mediaUrl)}" style="${getInlineStyle(media)}" alt="" />`
            : "";
          return `
      <div style="${getInlineStyle(rowSepStyle)}">
        <div style="${getInlineStyle(cardHeaderStyle)}">
          <a href="${profileUrl(post.user?.username || username)}" target="_blank" rel="noopener noreferrer" style="${getInlineStyle({ textDecoration: "none", color: "inherit" })}">
            <div style="${getInlineStyle(dFlex)}">
              <div style="${getInlineStyle(avatarCoverStyle)}">
                ${avatarUrl ? `<img src="${escapeHtml(avatarUrl)}" alt="" style="${getInlineStyle(bigAvatarStyle)}" />` : ""}
              </div>
              <div>
                <h6 style="${getInlineStyle(fullNameStyle)}">${fullname}</h6>
                <span style="${getInlineStyle(createDate)}">${createdAt}</span>
              </div>
            </div>
          </a>
        </div>
        <div style="${getInlineStyle(cardBodyStyle)}">
          <div style="${getInlineStyle(cardBodyContentStyle)}">
            <p style="${getInlineStyle(cardBodyParagraphStyle)}" id="${postId}-content">${safePreview}</p>
            ${content.length > 333 ? `<span id="${postId}-more-content" style="display: none;">${safeRest}</span>` : ""}
            ${content.length > 333 ? `<span data-idstatus-read-more="${postId}" style="${getInlineStyle(readMoreLink)}">Read More</span>` : ""}
          </div>
          ${mediaTag}
        </div>
        <div style="${getInlineStyle(cardFooterStyle)}">
          <span style="${getInlineStyle(countCnr)}"><span style="${getInlineStyle(materialSymbolsStyle)}">&#xe8dc;</span><span style="${getInlineStyle(count)}">${escapeHtml(post?.likesCount ?? 0)}</span></span>
          <span style="${getInlineStyle(countCnr)}"><span style="${getInlineStyle(materialSymbolsStyle)}">&#xe8db;</span><span style="${getInlineStyle(count)}">${escapeHtml(post?.disLikesCount ?? 0)}</span></span>
          <span style="${getInlineStyle(countCnr)}"><span style="${getInlineStyle(materialSymbolsStyle)}">&#xe0bf;</span><span style="${getInlineStyle(count)}">${escapeHtml(post?.commentsCount ?? 0)}</span></span>
          <span style="${getInlineStyle(countCnr)}"><span style="${getInlineStyle(materialSymbolsStyle)}">&#xe80d;</span><span style="${getInlineStyle(count)}">${escapeHtml(post?.sharesCount ?? 0)}</span></span>
          <span style="${getInlineStyle(countCnr)}"><span style="${getInlineStyle(materialSymbolsStyle)}">&#xe8f4;</span><span style="${getInlineStyle(count)}">${escapeHtml(post?.impressions ?? 0)}</span></span>
        </div>
      </div>
    `;
        })
        .join("");

      const wrap = document.createElement("div");
      wrap.innerHTML = postsHTML;
      while (wrap.firstChild) {
        feedHost.appendChild(wrap.firstChild);
      }
      feedHost
        .querySelectorAll("[data-idstatus-read-more]")
        .forEach((element) => {
          element.addEventListener("click", function () {
            toggleReadMore(this.getAttribute("data-idstatus-read-more"));
          });
        });
    }

    async function fetchPosts(isFirstLoad) {
      if (!state.hasMore || state.isFetching) return;
      state.isFetching = true;
      showStatus("");
      try {
        const url = new URL(API_BASE + encodeURIComponent(username));
        url.searchParams.append("limit", "9");
        if (state.cursor) {
          url.searchParams.append("cursor", state.cursor);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (isFirstLoad) {
          displayTopSection();
        }
        displayPosts(data.data);
        state.cursor = data.nextCursor || null;
        state.hasMore = Boolean(data.hasMore);
        if (!state.hasMore) {
          postsContainer.removeEventListener("scroll", onScroll);
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
        if (!state.headerReady) {
          displayTopSection();
        }
        showStatus("Sorry, we could not load the posts at this time.");
      } finally {
        state.isFetching = false;
      }
    }

    function onScroll(event) {
      const target = event.target;
      if (
        target.scrollTop + target.clientHeight >=
        target.scrollHeight - 100
      ) {
        fetchPosts(false);
      }
    }

    postsContainer.addEventListener("scroll", onScroll);
    fetchPosts(true);
  }

  function boot() {
    addCustomStyles();
    insertFontLinks();
    const widgets = document.querySelectorAll("#widget-container, [data-idstatus-embed]");
    if (!widgets.length) {
      console.error('No container with id "widget-container" found.');
      return;
    }
    widgets.forEach((node, index) => mountWidget(node, index));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

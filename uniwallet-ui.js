<script>
/*
  uniwallet-select.js
  - Shows a grid of wallets (no detection on open).
  - On wallet click: detect that wallet only; if available, request connection and await user auth.
  - If not available, show "Wallet not found".
  - Place AFTER your other scripts (optional). Works standalone (will use heuristics).
*/
(function () {
  // ---- Wallet catalog (56 items) ----
  const WALLET_CATALOG = [
    { name: "MetaMask", url: "https://metamask.io/download.html", icon: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg", key: "metamask" },
    { name: "Trust Wallet", url: "https://trustwallet.com/download", icon: "https://trustwallet.com/assets/images/media/assets/TWT.png", key: "trustwallet" },
    { name: "Coinbase Wallet", url: "https://www.coinbase.com/wallet", icon: "https://avatars.githubusercontent.com/u/1885080?s=200&v=4", key: "coinbasewallet" },
    { name: "Binance Wallet", url: "https://www.binance.com/", icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png", key: "binancewallet" },
    { name: "OKX Wallet", url: "https://www.okx.com/web3", icon: "https://www.okx.com/cdn/assets/imgs/221/C797A9C1B070D1A3.png", key: "okxwallet" },
    { name: "Phantom Wallet", url: "https://phantom.app/download", icon: "https://phantom.app/img/logo.png", key: "phantom" },
    { name: "Bybit Wallet", url: "https://www.bybit.com/en/web3-wallet/", icon: "", key: "bybitwallet" },
    { name: "Kraken Wallet", url: "https://support.kraken.com/hc/en-us/articles/360001464026-How-to-use-Kraken-s-wallet-feature", icon: "", key: "krakenwallet" },
    { name: "Bitget Wallet", url: "https://web3.bitget.com/", icon: "", key: "bitgetwallet" },
    { name: "Exodus Wallet", url: "https://www.exodus.com/download/", icon: "https://www.exodus.com/img/exodus-logo.png", key: "exodus" },
    { name: "TronLink", url: "https://www.tronlink.org/", icon: "https://www.tronlink.org/images/logo.svg", key: "tronlink" },
    { name: "SafePal", url: "https://www.safepal.com/", icon: "https://www.safepal.com/favicon.ico", key: "safepal" },
    { name: "Robinhood Wallet", url: "https://robinhood.com/wallet", icon: "https://cdn.robinhood.com/assets/generated_assets/favicon.png", key: "robinhoodwallet" },
    { name: "Blockchain.com Wallet", url: "https://www.blockchain.com/wallet", icon: "https://www.blockchain.com/static/favicon.ico", key: "blockchaincom" },
    { name: "Atomic Wallet", url: "https://atomicwallet.io/", icon: "https://atomicwallet.io/favicon.ico", key: "atomicwallet" },
    { name: "Trezor Wallet", url: "https://trezor.io/", icon: "https://trezor.io/static/favicon.ico", key: "trezor" },
    { name: "Electrum Bitcoin Wallet", url: "https://electrum.org/", icon: "https://electrum.org/favicon.ico", key: "electrum" },
    { name: "MyEtherWallet (MEW)", url: "https://www.myetherwallet.com/", icon: "https://www.myetherwallet.com/img/favicon.ico", key: "mew" },
    { name: "Solflare", url: "https://solflare.com/", icon: "https://solflare.com/favicon.ico", key: "solflare" },
    { name: "Tonkeeper", url: "https://tonkeeper.com/", icon: "", key: "tonkeeper" },
    { name: "Sui Wallet", url: "https://suiet.app/", icon: "", key: "suiwallet" },
    { name: "Zengo", url: "https://zengo.com/", icon: "", key: "zengo" },
    { name: "Wirex Wallet", url: "https://wirexapp.com/", icon: "", key: "wirex" },
    { name: "BitPay Wallet", url: "https://bitpay.com/wallet/", icon: "https://bitpay.com/favicon.ico", key: "bitpay" },
    { name: "Guarda Wallet", url: "https://guarda.com/", icon: "https://guarda.com/favicon.ico", key: "guarda" },
    { name: "Coinomi", url: "https://www.coinomi.com/", icon: "https://www.coinomi.com/img/favicon.ico", key: "coinomi" },
    { name: "Enjin Wallet", url: "https://enjin.io/wallet", icon: "https://enjin.io/favicon.ico", key: "enjin" },
    { name: "TokenPocket", url: "https://www.tokenpocket.pro/en/download", icon: "https://www.tokenpocket.pro/favicon.ico", key: "tokenpocket" },
    { name: "ImToken", url: "https://token.im/", icon: "https://token.im/favicon.ico", key: "imtoken" },
    { name: "Keplr", url: "https://www.keplr.app/", icon: "https://www.keplr.app/favicon.ico", key: "keplr" },
    { name: "Klever Wallet", url: "https://klever.org/", icon: "", key: "klever" },
    { name: "Edge Wallet", url: "https://edge.app/", icon: "https://edge.app/favicon.ico", key: "edge" },
    { name: "BlueWallet (Bitcoin)", url: "https://bluewallet.io/", icon: "https://bluewallet.io/favicon.ico", key: "bluewallet" },
    { name: "Wallet of Satoshi", url: "https://www.walletofsatoshi.com/", icon: "", key: "walletofsatoshi" },
    { name: "Tangem", url: "https://tangem.com/", icon: "https://tangem.com/favicon.ico", key: "tangem" },
    { name: "CoolWallet", url: "https://www.coolwallet.io/", icon: "https://www.coolwallet.io/favicon.ico", key: "coolwallet" },
    { name: "Ellipal", url: "https://www.ellipal.com/", icon: "https://www.ellipal.com/favicon.ico", key: "ellipal" },
    { name: "Cake Wallet (Monero)", url: "https://cakewallet.com/", icon: "", key: "cakewallet" },
    { name: "Phoenix Wallet (BTC Lightning)", url: "https://phoenix.acinq.co/", icon: "", key: "phoenix" },
    { name: "Blockstream Green (BTC)", url: "https://blockstream.com/green/", icon: "https://blockstream.com/favicon.ico", key: "blockstream" },
    { name: "NOW Wallet", url: "https://nowwallet.io/", icon: "", key: "nowwallet" },
    { name: "Pera Algo Wallet", url: "https://perawallet.app/", icon: "https://perawallet.app/favicon.ico", key: "pera" },
    { name: "NEAR Wallet", url: "https://wallet.near.org/", icon: "https://wallet.near.org/favicon.ico", key: "near" },
    { name: "Pontem Aptos Wallet", url: "https://pontem.network/", icon: "", key: "pontem" },
    { name: "Rainbow Wallet", url: "https://rainbow.me/", icon: "https://rainbow.me/favicon.ico", key: "rainbow" },
    { name: "Mycelium Wallet", url: "https://wallet.mycelium.com/", icon: "", key: "mycelium" },
    { name: "Monerujo (Monero)", url: "https://www.monerujo.io/", icon: "", key: "monerujo" },
    { name: "Unstoppable Wallet", url: "https://unstoppable.money/", icon: "", key: "unstoppable" },
    { name: "Onchain Wallet", url: "https://onchainwallet.io/", icon: "", key: "onchain" },
    { name: "Zypto Wallet", url: "https://www.zypto.com/", icon: "", key: "zypto" },
    { name: "Cypherock", url: "https://www.cypherock.com/", icon: "", key: "cypherock" },
    { name: "BRD Wallet", url: "https://brd.com/", icon: "https://brd.com/favicon.ico", key: "brd" },
    { name: "Best Wallet", url: "https://bestwallet.com/", icon: "", key: "bestwallet" },
    { name: "MathWallet", url: "https://mathwallet.org/en-us/", icon: "https://mathwallet.org/favicon.ico", key: "mathwallet" }
  ];

  // ---- Helpers ----
  function normalize(s) {
    return String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  }
  function shortAddr(addr) { if (!addr) return ""; return addr.length > 12 ? addr.slice(0,6) + "..." + addr.slice(-4) : addr; }
  function makeEl(tag, props = {}, children = []) {
    const e = document.createElement(tag);
    Object.entries(props).forEach(([k,v]) => { if (k === "style") Object.assign(e.style, v); else if (k === "class") e.className = v; else e[k] = v; });
    (children || []).forEach(c => e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }

  // Attempts to use window.UniWallet.detect() if present (better), otherwise falls back to manual heuristics
  async function detectProviders() {
    // prefer user's detection if provided
    try {
      if (window.UniWallet && typeof window.UniWallet.detect === "function") {
        const list = await window.UniWallet.detect();
        // normalize names
        return (list || []).map(p => ({ name: p.name || p.type || "unknown", type: p.type || "unknown", provider: p.provider || p }));
      }
    } catch (e) {
      // ignore and continue to heuristics
    }

    // heuristics: gather known global injected objects
    const res = [];
    try {
      if (window.ethereum) {
        const providers = Array.isArray(window.ethereum.providers) ? window.ethereum.providers : [window.ethereum];
        providers.forEach(p => {
          // best guess name via flags
          let name = "EVM Provider";
          if (p.isMetaMask) name = "MetaMask";
          else if (p.isCoinbaseWallet) name = "Coinbase Wallet";
          else if (p.isBraveWallet) name = "Brave Wallet";
          else if (p.isTrust) name = "Trust Wallet";
          res.push({ name, type: "evm", provider: p });
        });
      }
    } catch (e) {}
    if (window.solana) res.push({ name: (window.solana.isPhantom ? "Phantom Wallet" : "Solana Provider"), type: "solana", provider: window.solana });
    if (window.solflare) res.push({ name: "Solflare", type: "solana", provider: window.solflare });
    if (window.tronWeb) res.push({ name: "TronLink", type: "tron", provider: window.tronWeb });
    if (window.keplr) res.push({ name: "Keplr", type: "cosmos", provider: window.keplr });
    if (window.near) res.push({ name: "NEAR Wallet", type: "near", provider: window.near });
    if (window.aptos) res.push({ name: "Aptos Wallet", type: "aptos", provider: window.aptos });
    if (window.petra) res.push({ name: "Petra (Aptos)", type: "aptos", provider: window.petra });
    if (window.martian) res.push({ name: "Martian (Aptos)", type: "aptos", provider: window.martian });
    if (window.fcl) res.push({ name: "Flow (FCL)", type: "flow", provider: window.fcl });
    if (window.injectedWeb3) { // polkadot-style
      Object.keys(window.injectedWeb3).forEach(k => res.push({ name: k, type: "polkadot", provider: window.injectedWeb3[k] }));
    }
    return res;
  }

  // Find provider from detected list that matches clicked wallet name using normalization and flags:
  function matchDetectedToWallet(detectedList, walletName) {
    const target = normalize(walletName);
    // try exact or substring matching on normalized names
    for (const d of detectedList) {
      if (!d || !d.name) continue;
      const n = normalize(d.name);
      if (n === target || n.includes(target) || target.includes(n)) return d;
    }
    // additional flag-based guesses for common wallets:
    for (const d of detectedList) {
      const p = d.provider || {};
      const n = normalize(d.name || "");
      if (target.includes("metamask") && (p.isMetaMask || n.includes("metamask"))) return d;
      if ((target.includes("coinbase") || target.includes("coinbasewallet")) && (p.isCoinbaseWallet || n.includes("coinbase"))) return d;
      if (target.includes("trust") && (p.isTrust || n.includes("trust"))) return d;
      if (target.includes("phantom") && (p.isPhantom || (typeof window.solana !== "undefined" && window.solana.isPhantom))) return d;
      if (target.includes("solflare") && (typeof window.solflare !== "undefined" || n.includes("solflare"))) return d;
      if (target.includes("tron") && (typeof window.tronWeb !== "undefined" || n.includes("tron"))) return d;
      if (target.includes("keplr") && (typeof window.keplr !== "undefined" || n.includes("keplr"))) return d;
      if (target.includes("near") && (typeof window.near !== "undefined" || n.includes("near"))) return d;
      if (target.includes("aptos") && (typeof window.aptos !== "undefined" || n.includes("aptos") || typeof window.martian !== "undefined" || typeof window.petra !== "undefined")) return d;
      if (target.includes("sui") && (typeof window.suiWallet !== "undefined" || typeof window.sui !== "undefined" || n.includes("sui"))) return d;
    }
    return null;
  }

  // Connect routine for a matched provider object (returns result or throws)
  async function connectWithProvider(match) {
    const p = match.provider;
    const t = match.type || "";

    // EVM standard
    if (t === "evm" || (p && typeof p.request === "function")) {
      // request accounts (user will see approval popup)
      const accounts = await p.request({ method: "eth_requestAccounts" });
      return { chain: "evm", address: Array.isArray(accounts) ? accounts[0] : accounts, provider: p };
    }

    // Solana (Phantom/Solflare)
    if (t === "solana" || (p && p.connect && typeof p.connect === "function")) {
      const res = await p.connect();
      // Phantom returns { publicKey }
      const pub = (res && res.publicKey && res.publicKey.toString) ? res.publicKey.toString() : (res && res.toString ? res.toString() : null);
      return { chain: "solana", address: pub, provider: p };
    }

    // Tron
    if (t === "tron" || (typeof window.tronWeb !== "undefined" && p && p.defaultAddress)) {
      const tron = p || window.tronWeb;
      const addr = (tron && tron.defaultAddress && tron.defaultAddress.base58) ? tron.defaultAddress.base58 : null;
      return { chain: "tron", address: addr, provider: tron };
    }

    // Keplr / Cosmos
    if (t === "cosmos" || (typeof window.keplr !== "undefined" && p === window.keplr)) {
      try {
        // try enabling cosmoshub as an example; many wallets will prompt; we tolerate failure
        await p.enable && p.enable("cosmoshub-4").catch(()=>{});
        const key = p.getKey ? await p.getKey("cosmoshub-4").catch(()=>null) : null;
        const addr = key && key.bech32Address ? key.bech32Address : null;
        return { chain: "cosmos", address: addr, provider: p };
      } catch (e) {
        return { chain: "cosmos", address: null, provider: p };
      }
    }

    // Near
    if (t === "near" || (typeof window.near !== "undefined" && p === window.near)) {
      // many NEAR wallets use redirect flows; try requestSignIn if available
      if (p.requestSignIn) {
        await p.requestSignIn && p.requestSignIn().catch(()=>{});
      }
      return { chain: "near", address: null, provider: p };
    }

    // Aptos / Sui / Flow / others: attempt common connect functions if exposed
    if (t === "aptos" || (p && (p.connect || p.account))) {
      try {
        const r = await (p.connect ? p.connect() : Promise.resolve(null));
        const addr = r && (r.address || r.account || (r[0] && r[0].address)) ? (r.address || r.account || (r[0] && r[0].address)) : null;
        return { chain: "aptos", address: addr, provider: p };
      } catch (e) {
        return { chain: "aptos", address: null, provider: p };
      }
    }

    // Flow FCL
    if (t === "flow" || (p && p.authenticate)) {
      try {
        await p.authenticate && p.authenticate();
        return { chain: "flow", address: null, provider: p };
      } catch(e) {
        return { chain: "flow", address: null, provider: p };
      }
    }

    // Generic fallback: try eth_requestAccounts
    if (p && typeof p.request === "function") {
      try {
        const accounts = await p.request({ method: "eth_requestAccounts" });
        return { chain: "evm", address: Array.isArray(accounts) ? accounts[0] : accounts, provider: p };
      } catch(e) {
        throw e;
      }
    }

    throw new Error("Provider found but no supported connect flow");
  }

  // ---- UI ----
  function createStyles() {
    if (document.getElementById("uniwallet-styles")) return;
    const s = document.createElement("style");
    s.id = "uniwallet-styles";
    s.innerHTML = `
      .uw-modal { position: fixed; inset:0; background: rgba(0,0,0,0.6); display:flex; align-items:center; justify-content:center; z-index:2147483647; }
      .uw-card { width: 760px; max-width: calc(100% - 40px); max-height: 80vh; background:#fff; border-radius:12px; padding:18px; box-sizing:border-box; overflow:auto; font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }
      .uw-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; }
      .uw-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:12px; }
      .uw-item { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; border:1px solid #eee; border-radius:8px; background:#fff; cursor:pointer; min-height:86px; text-align:center; }
      .uw-item.disabled { opacity:0.6; }
      .uw-item img { width:40px; height:40px; object-fit:contain; margin-bottom:8px; }
      .uw-footer { margin-top:12px; display:flex; justify-content:flex-end; gap:8px; }
      .uw-btn { padding:8px 12px; border-radius:8px; border:1px solid #ddd; background:#fff; cursor:pointer; }
      .uw-btn.primary { background:#111; color:#fff; border: none; }
      .uw-msg { padding:10px; margin-bottom:8px; border-radius:8px; background:#fff9d9; border:1px solid #ffeec2; color:#5a4b00; }
      @media (max-width:740px) { .uw-grid{ grid-template-columns: repeat(2,1fr); } .uw-card{ width: 92%; } }
    `;
    document.head.appendChild(s);
  }

  function showToast(msg) {
    const id = "uniwallet-toast";
    let t = document.getElementById(id);
    if (!t) {
      t = makeEl("div", { id, style: { position: "fixed", right: "16px", top: "16px", zIndex: 2147483647 } });
      document.body.appendChild(t);
    }
    t.innerText = msg;
    t.style.background = "#111";
    t.style.color = "#fff";
    t.style.padding = "10px 12px";
    t.style.borderRadius = "8px";
    setTimeout(()=>{ if (t) t.remove(); }, 3500);
  }

  function buildModal() {
    createStyles();

    // modal wrapper
    const modal = makeEl("div", { className: "uw-modal" });
    const card = makeEl("div", { className: "uw-card" });

    // header
    const header = makeEl("div", { className: "uw-header" }, [
      makeEl("div", {}, [ makeEl("h3", { innerText: "Connect Wallet", style: "margin:0;font-size:18px" }) ]),
      makeEl("div", {}, [ makeEl("button", { innerText: "Close", className: "uw-btn", onclick: () => closeModal(modal) }) ])
    ]);
    card.appendChild(header);

    // message
    const msg = makeEl("div", { className: "uw-msg", innerText: "Select your wallet. The app will check availability when you click a wallet." });
    card.appendChild(msg);

    // grid
    const grid = makeEl("div", { className: "uw-grid" });

    // build wallet tiles
    WALLET_CATALOG.forEach(wallet => {
      const item = makeEl("div", { className: "uw-item", title: wallet.name });
      const img = makeEl("img");
      img.src = wallet.icon || "";
      img.onerror = function(){ this.onerror=null; this.src = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48'><rect width='100%' height='100%' fill='%23eee'/><text x='50%' y='50%' font-size='10' text-anchor='middle' fill='%23999' dy='.3em'>W</text></svg>"; };
      item.appendChild(img);
      item.appendChild(makeEl("div", { innerText: wallet.name, style: "font-size:13px; margin-top:6px;" }));

      // click handler (no detection until click)
      item.addEventListener("click", async (ev) => {
        try {
          // visual feedback
          const original = item.innerHTML;
          item.innerHTML = "<div style='font-size:12px'>Checking...</div>";
          // 1) attempt to get detected providers using user's detection (if available)
          let detected = [];
          try {
            if (window.UniWallet && typeof window.UniWallet.detect === "function") {
              detected = await window.UniWallet.detect();
              // normalize to expected shape
              detected = (detected || []).map(d => ({ name: d.name || d.type || "unknown", type: d.type || "unknown", provider: d.provider || d }));
            }
          } catch (e) {
            detected = [];
          }

          // 2) find match by name normalization or heuristics
          let match = matchDetectedToWallet(detected, wallet.name);

          // 3) fallback heuristics if no match
          if (!match) {
            // build heuristics-based list
            const heur = await detectProviders();
            match = matchDetectedToWallet(heur, wallet.name);
          }

          // 4) If matched -> connect; otherwise -> "Wallet not found"
          if (!match) {
            item.innerHTML = original; // restore
            alert(wallet.name + " not found on this device. Please install or open the wallet and try again.");
            return;
          }

          // Attempt connect (this will prompt auth in extension)
          item.innerHTML = "<div style='font-size:12px'>Connecting…</div>";
          let result;
          try {
            result = await connectWithProvider(match);
          } catch (err) {
            item.innerHTML = original;
            console.error(err);
            alert("Failed to connect to " + wallet.name + (err && err.message ? (": " + err.message) : ""));
            return;
          }

          // success — update main button text (if present)
          const mainBtn = document.getElementById("uniwallet-floating-btn");
          if (mainBtn) {
            const label = result && result.address ? (wallet.name + ": " + shortAddr(result.address)) : (wallet.name + " connected");
            mainBtn.innerText = label;
          } else {
            showToast(wallet.name + " connected");
          }
          closeModal(modal);
        } catch (err) {
          console.error(err);
        }
      });

      grid.appendChild(item);
    });

    card.appendChild(grid);

    // footer with WalletConnect fallback and Close
    const footer = makeEl("div", { className: "uw-footer" });
    const wcBtn = makeEl("button", { innerText: "WalletConnect (QR)", className: "uw-btn", onclick: async () => {
      closeModal(modal);
      if (window.UniWallet && typeof window.UniWallet.connect === "function") {
        try {
          await window.UniWallet.connect();
          showToast("WalletConnect opened");
        } catch (e) { alert("WalletConnect failed: " + (e && e.message ? e.message : e)); }
      } else {
        alert("WalletConnect not configured. Ensure WalletConnect provider script is loaded.");
      }
    }});
    footer.appendChild(wcBtn);
    footer.appendChild(makeEl("button", { innerText: "Close", className: "uw-btn", onclick: () => closeModal(modal) }));

    card.appendChild(footer);
    modal.appendChild(card);
    document.body.appendChild(modal);
  }

  function closeModal(modal) {
    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
  }

  // Floating main button (opens selector)
  function createFloatingButton() {
    if (document.getElementById("uniwallet-floating-btn")) return;
    const btn = makeEl("button", { id: "uniwallet-floating-btn", innerText: "Connect Wallet" });
    Object.assign(btn.style, {
      position: "fixed", right: "16px", bottom: "16px", padding: "10px 14px", borderRadius: "10px",
      background: "#111", color: "#fff", border: "none", cursor: "pointer", zIndex: 2147483646, fontWeight: 600
    });
    btn.onclick = () => buildModal();
    document.body.appendChild(btn);
  }

  // Init on load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { createFloatingButton(); });
  } else {
    createFloatingButton();
  }

  // expose for programmatic open if needed
  window.UniWalletSelector = window.UniWalletSelector || {};
  window.UniWalletSelector.open = buildModal;

})();
</script>

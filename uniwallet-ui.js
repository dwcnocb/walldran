<script>
/*
  uniwallet-ui.js
  - Drop this AFTER your detection scripts (script1, script2, script3).
  - Exposes window.UniWallet.openSelector() for programmatic opening.
  - Requires window.UniWallet.detect() to exist.
*/

(function () {
  if (!window.UniWallet || typeof window.UniWallet.detect !== 'function') {
    console.error('[UniWallet UI] window.UniWallet.detect() not found. Load detection scripts first.');
    return;
  }

  // --- Configuration: popular wallets and install URLs (feel free to adjust) ---
  const POPULAR_WALLETS = [
    // EVM
    { id: 'metamask', name: 'MetaMask', chains: ['evm'], install: 'https://metamask.io/download/' },
    { id: 'coinbase', name: 'Coinbase Wallet', chains: ['evm'], install: 'https://www.coinbase.com/wallet' },
    { id: 'brave', name: 'Brave Wallet', chains: ['evm'], install: 'https://brave.com/wallet/' },
    { id: 'trust', name: 'Trust Wallet', chains: ['evm'], install: 'https://trustwallet.com/' },

    // Solana
    { id: 'phantom', name: 'Phantom', chains: ['solana'], install: 'https://phantom.app/download' },
    { id: 'solflare', name: 'Solflare', chains: ['solana'], install: 'https://solflare.com/' },

    // Tron
    { id: 'tronlink', name: 'TronLink', chains: ['tron'], install: 'https://www.tronlink.org/' },

    // NEAR
    { id: 'near', name: 'NEAR Wallet', chains: ['near'], install: 'https://wallet.near.org/' },

    // Aptos
    { id: 'petra', name: 'Petra (Aptos)', chains: ['aptos'], install: 'https://petra.app/' },
    { id: 'martian', name: 'Martian (Aptos)', chains: ['aptos'], install: 'https://martianwallet.xyz/' },

    // Cosmos
    { id: 'keplr', name: 'Keplr', chains: ['cosmos'], install: 'https://keplr.app/' },
    { id: 'leap', name: 'Leap', chains: ['cosmos'], install: 'https://wallet.leapwallet.io/' },

    // Algorand
    { id: 'pera', name: 'Pera Wallet', chains: ['algorand'], install: 'https://perawallet.app/' },

    // Tezos
    { id: 'temple', name: 'Temple Wallet', chains: ['tezos'], install: 'https://templewallet.com/' },

    // ICP
    { id: 'plug', name: 'Plug (ICP)', chains: ['icp'], install: 'https://plugwallet.ooo/' },
    { id: 'stoic', name: 'Stoic (ICP)', chains: ['icp'], install: 'https://stoic.ai/' },

    // Polkadot
    { id: 'polkadotjs', name: 'Polkadot{.js}', chains: ['polkadot'], install: 'https://polkadot.js.org/extension/' },
    { id: 'talisman', name: 'Talisman', chains: ['polkadot'], install: 'https://talisman.xyz/' },

    // Flow
    { id: 'blocto', name: 'Blocto', chains: ['flow'], install: 'https://blocto.app/' },
  ];

  // Utility: create elements quickly
  function el(tag, props={}, children=[]) {
    const e = document.createElement(tag);
    Object.assign(e, props);
    (children || []).forEach(c => e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c));
    return e;
  }

  // Shorten address for display
  function short(addr) {
    if (!addr) return '';
    return addr.length > 12 ? `${addr.slice(0,6)}...${addr.slice(-4)}` : addr;
  }

  // --- Modal creation ---
  let modal = null;
  function createModal() {
    if (modal) return modal;

    modal = el('div', { id: 'uniwallet-modal' });
    Object.assign(modal.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.6)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 2147483647, padding: '20px',
    });

    const card = el('div', { id: 'uniwallet-card' });
    Object.assign(card.style, {
      width: '420px', maxHeight: '80vh', overflowY: 'auto',
      background: '#fff', borderRadius: '12px', padding: '18px', boxSizing: 'border-box',
      boxShadow: '0 10px 30px rgba(0,0,0,0.2)', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
    });

    const header = el('div', {}, [
      el('div', { style: 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px' }, [
        el('h3', { innerText: 'Connect Wallet', style: 'margin:0;font-size:16px' }),
        el('button', { innerText: '×', onclick: () => closeModal(), style: 'background:none;border:none;font-size:20px;cursor:pointer' })
      ]),
      el('p', { innerText: 'Choose a wallet from your device or install a supported wallet.', style: 'margin:0 0 12px 0;font-size:13px;color:#444' })
    ]);
    card.appendChild(header);

    // container for lists
    const lists = el('div', { id: 'uniwallet-lists' });
    card.appendChild(lists);

    // footer: walletconnect fallback + cancel
    const footer = el('div', {}, [
      el('div', { style: 'display:flex;gap:8px;margin-top:12px' }, [
        el('button', {
          innerText: 'Use WalletConnect',
          onclick: async () => { await useWalletConnect(); },
          style: 'flex:1;padding:10px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer'
        }),
        el('button', {
          innerText: 'Close',
          onclick: () => closeModal(),
          style: 'padding:10px;border-radius:8px;border:1px solid #ddd;background:#fff;cursor:pointer'
        })
      ])
    ]);
    card.appendChild(footer);

    modal.appendChild(card);
    modal.onclick = (ev) => { if (ev.target === modal) closeModal(); };

    document.body.appendChild(modal);
    return modal;
  }

  function closeModal() {
    if (modal && modal.parentNode) modal.parentNode.removeChild(modal);
    modal = null;
  }

  // --- Build lists: detected and not detected ---
  async function buildLists() {
    const m = createModal();
    const lists = m.querySelector('#uniwallet-lists');
    lists.innerHTML = '';

    const detected = (await window.UniWallet.detect()) || [];
    // Normalize detected entries into a map for easy lookup
    const detectedMap = {};
    detected.forEach((d, i) => {
      // Some providers may not include unique ids — create a reliable key
      const key = (d.name || d.type || `provider-${i}`).toLowerCase().replace(/\s+/g,'');
      detectedMap[key] = d;
    });

    // Detected section
    const detSection = el('div', {});
    detSection.appendChild(el('h4', { innerText: 'Detected wallets', style: 'margin:8px 0;font-size:13px' }));
    if (detected.length === 0) {
      detSection.appendChild(el('div', { innerText: 'No injected wallets found on this device.', style: 'font-size:13px;color:#666;margin-bottom:8px' }));
    } else {
      detected.forEach((w, idx) => {
        const row = el('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin:6px 0;padding:8px;border-radius:8px;border:1px solid #eee' });
        const left = el('div', {}, [ el('div', { innerText: w.name || (w.type||'Wallet'), style: 'font-weight:600' }),
                                     el('div', { innerText: (w.type || '') , style: 'font-size:12px;color:#666' }) ]);
        const actions = el('div', {});
        const connectBtn = el('button', { innerText: 'Connect', style: 'padding:6px 10px;border-radius:8px;border:1px solid #ccc;background:#fff;cursor:pointer' });
        connectBtn.onclick = async () => {
          connectBtn.disabled = true;
          connectBtn.innerText = 'Connecting...';
          try {
            await connectToProvider(w, connectBtn);
          } catch (e) {
            console.error(e);
            alert('Failed to connect: ' + (e && e.message ? e.message : e));
            connectBtn.innerText = 'Connect';
            connectBtn.disabled = false;
            return;
          }
          // update label in main floating button if present
          const mainBtn = document.getElementById('uniwallet-btn-main');
          if (mainBtn && w._lastAddress) mainBtn.innerText = `${w.name}: ${short(w._lastAddress)}`;
          connectBtn.innerText = 'Connected';
          connectBtn.disabled = true;
        };
        actions.appendChild(connectBtn);
        row.appendChild(left);
        row.appendChild(actions);
        detSection.appendChild(row);
      });
    }
    lists.appendChild(detSection);

    // Not-detected / install suggestions
    const notdetSection = el('div', {});
    notdetSection.appendChild(el('h4', { innerText: 'Install a wallet (not detected)', style: 'margin:12px 0 8px 0;font-size:13px' }));

    // Prepare set of detected wallet ids (simple matching)
    const presentNames = new Set(Object.keys(detectedMap));

    POPULAR_WALLETS.forEach(w => {
      const key = (w.name || w.id).toLowerCase().replace(/\s+/g,'');
      if (presentNames.has(key)) return; // skip if present

      // Show only a compact list; you can extend or filter by chain here
      const row = el('div', { style: 'display:flex;align-items:center;justify-content:space-between;margin:6px 0;padding:8px;border-radius:8px;border:1px dashed #f0f0f0' });
      const left = el('div', {}, [ el('div', { innerText: w.name, style: 'font-weight:600' }), el('div', { innerText: w.chains.join(', '), style: 'font-size:12px;color:#666' }) ]);
      const actions = el('div', {});
      const installBtn = el('button', { innerText: 'Install', style: 'padding:6px 10px;border-radius:8px;border:1px solid #0b72ff;background:#0b72ff;color:#fff;cursor:pointer' });
      installBtn.onclick = () => window.open(w.install, '_blank', 'noopener');
      actions.appendChild(installBtn);
      row.appendChild(left);
      row.appendChild(actions);
      notdetSection.appendChild(row);
    });

    lists.appendChild(notdetSection);

    return { detected, detectedMap };
  }

  // --- Connect handlers for multiple ecosystems ---
  async function connectToProvider(w, progressBtn=null) {
    // w is an object from detection scripts with { name, type, provider }
    if (!w || !w.provider) throw new Error('Invalid provider');

    const p = w.provider;

    // EVM
    if (w.type === 'evm' || (p.request && (p.isMetaMask || p.isCoinbaseWallet || p.request))) {
      // preferred method: eth_requestAccounts
      const accounts = await p.request({ method: 'eth_requestAccounts' });
      const addr = Array.isArray(accounts) ? accounts[0] : accounts;
      w._lastAddress = addr;
      return { chain: 'evm', address: addr, provider: p };
    }

    // Solana
    if (w.type === 'solana' || p.isPhantom || p.connect) {
      const res = await p.connect();
      // Phantom returns publicKey object
      const pub = res && (res.publicKey ? res.publicKey.toString() : res.toString ? res.toString() : null);
      w._lastAddress = pub;
      return { chain: 'solana', address: pub, provider: p };
    }

    // Tron (tronWeb)
    if (w.type === 'tron' || (window.tronWeb && window.tronWeb.defaultAddress)) {
      // TronLink exposes tronWeb; it may already be connected
      const tron = p || window.tronWeb;
      const addr = (tron.defaultAddress && tron.defaultAddress.base58) || null;
      w._lastAddress = addr;
      return { chain: 'tron', address: addr, provider: tron };
    }

    // NEAR (injected window.near)
    if (w.type === 'near' || (window.near && w.name && w.name.toLowerCase().includes('near'))) {
      // many NEAR wallets require redirect flows; some expose walletConnection API
      // attempt simple connect call if available
      if (p.requestSignIn) {
        try {
          await p.requestSignIn();
        } catch (e) { /* silent */ }
      }
      // can't reliably return address in all injectors
      return { chain: 'near', address: null, provider: p };
    }

    // Aptos (window.aptos)
    if (w.type === 'aptos' || (window.aptos && p.connect)) {
      try {
        const r = await p.connect();
        const addr = r && (r.address || r.toString && r.toString());
        w._lastAddress = addr;
        return { chain: 'aptos', address: addr, provider: p };
      } catch (e) {
        throw e;
      }
    }

    // Cosmos (Keplr / Leap)
    if (w.type === 'cosmos' || p.enable) {
      try {
        // keplr/leap use enable(chainId)
        // we'll call with a broad chain (cosmoshub-4) but many wallets ignore unknown chains
        await p.enable && p.enable('cosmoshub-4').catch(() => {});
        // attempt to get key
        if (p.getKey) {
          const key = await p.getKey && await p.getKey('cosmoshub-4').catch(()=>null);
          const addr = key && key.bech32Address;
          w._lastAddress = addr;
          return { chain: 'cosmos', address: addr, provider: p };
        }
        return { chain: 'cosmos', address: null, provider: p };
      } catch (e) { throw e; }
    }

    // Polkadot / Substrate (injectedWeb3)
    if (w.type === 'polkadot' || (window.injectedWeb3 && (w.name && w.name.toLowerCase().includes('polkadot')))) {
      // polkadot-js requires enabling the extension; we cannot fully standardize here, return provider
      return { chain: 'polkadot', address: null, provider: p };
    }

    // Algorand (window.algorand)
    if (w.type === 'algorand' || (window.algorand && p.connect)) {
      try {
        const resp = await p.connect();
        const addr = resp && resp.address;
        w._lastAddress = addr;
        return { chain: 'algorand', address: addr, provider: p };
      } catch (e) { throw e; }
    }

    // Tezos (Beacon / temple)
    if (w.type === 'tezos' || (p.requestPermission || p.client)) {
      // many tezos wallets use Beacon SDK; detection returns provider differently
      // attempt requestPermissions if present
      try {
        if (p.requestPermissions) {
          const perm = await p.requestPermissions();
          w._lastAddress = perm && perm.address;
          return { chain: 'tezos', address: w._lastAddress, provider: p };
        }
      } catch (e) {}
      return { chain: 'tezos', address: null, provider: p };
    }

    // ICP (Plug / Stoic)
    if (w.type === 'icp' || p.agent) {
      try {
        if (p.requestConnect) {
          await p.requestConnect();
        }
        return { chain: 'icp', address: null, provider: p };
      } catch (e) { throw e; }
    }

    // Flow (FCL / Blocto)
    if (w.type === 'flow' || p.currentUser) {
      try {
        if (p.authenticate) {
          await p.authenticate();
        }
        return { chain: 'flow', address: null, provider: p };
      } catch (e) { throw e; }
    }

    // Fallback: if provider supports request
    if (p.request) {
      try {
        const accounts = await p.request({ method: 'eth_requestAccounts' }).catch(()=>null);
        const addr = Array.isArray(accounts) && accounts[0];
        w._lastAddress = addr;
        return { chain: 'unknown', address: addr, provider: p };
      } catch (e) {}
    }

    throw new Error('Unsupported provider type or missing connect method');
  }

  // --- WalletConnect fallback wrapper (uses window.UniWallet.connect if available) ---
  async function useWalletConnect() {
    if (typeof window.UniWallet.connect === 'function') {
      try {
        const provider = await window.UniWallet.connect();
        // provider may expose accounts
        const accounts = provider && (await provider.request({ method: 'eth_accounts' }).catch(()=>null));
        const addr = Array.isArray(accounts) ? accounts[0] : accounts;
        // update main button if present
        const mainBtn = document.getElementById('uniwallet-btn-main');
        if (mainBtn) mainBtn.innerText = addr ? `WalletConnect: ${short(addr)}` : 'WalletConnect';
        closeModal();
      } catch (e) {
        alert('WalletConnect failed: ' + (e && e.message ? e.message : e));
      }
    } else {
      alert('WalletConnect is not available. Ensure Script 1 (WalletConnect) is loaded and initialized with a projectId.');
    }
  }

  // --- Floating main button (opens selector) ---
  function createMainButton() {
    if (document.getElementById('uniwallet-btn-main')) return;
    const btn = el('button', { id: 'uniwallet-btn-main', innerText: 'Connect Wallet' });
    Object.assign(btn.style, {
      position: 'fixed', right: '16px', bottom: '16px',
      padding: '10px 14px', borderRadius: '10px', background: '#111', color: '#fff',
      border: 'none', cursor: 'pointer', zIndex: 2147483646, fontWeight: 600
    });
    btn.onclick = () => window.UniWallet.openSelector();
    document.body.appendChild(btn);
  }

  // --- Public API: openSelector ---
  window.UniWallet.openSelector = async function () {
    try {
      await buildLists();
      createMainButton();
    } catch (e) {
      console.error('[UniWallet UI] openSelector error', e);
    }
  };

  // init small
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => { window.UniWallet.openSelector(); });
  } else {
    window.UniWallet.openSelector();
  }

})();
</script>

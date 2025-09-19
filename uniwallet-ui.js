<script>
;(function () {
  if (!window.UniWallet) {
    console.error("UniWallet detection scripts not loaded");
    return;
  }

  // Popular wallets + their official download links
  const knownWallets = [
    { name: "MetaMask", type: "evm", url: "https://metamask.io/download.html" },
    { name: "Coinbase Wallet", type: "evm", url: "https://www.coinbase.com/wallet" },
    { name: "Brave Wallet", type: "evm", url: "https://brave.com/wallet/" },
    { name: "Phantom (Solana)", type: "solana", url: "https://phantom.app/download" },
    { name: "Solflare (Solana)", type: "solana", url: "https://solflare.com/download" },
    { name: "TronLink", type: "tron", url: "https://www.tronlink.org/" },
    { name: "NEAR Wallet", type: "near", url: "https://wallet.near.org/" },
    { name: "Petra (Aptos)", type: "aptos", url: "https://petra.app/" },
    { name: "Martian (Aptos)", type: "aptos", url: "https://martianwallet.xyz/" },
    { name: "Keplr (Cosmos)", type: "cosmos", url: "https://www.keplr.app/download" },
    { name: "Leap (Cosmos)", type: "cosmos", url: "https://www.leapwallet.io/" },
    { name: "Pera (Algorand)", type: "algorand", url: "https://perawallet.app/" },
    { name: "Temple (Tezos)", type: "tezos", url: "https://templewallet.com/" },
    { name: "Plug (ICP)", type: "icp", url: "https://plugwallet.ooo/" },
    { name: "Polkadot.js", type: "polkadot", url: "https://polkadot.js.org/extension/" },
    { name: "Blocto (Flow)", type: "flow", url: "https://blocto.io/" },
  ];

  function createWalletUI() {
    if (document.getElementById("uniwallet-btn")) return;

    // Button
    const btn = document.createElement("button");
    btn.id = "uniwallet-btn";
    btn.innerText = "Connect Wallet";
    Object.assign(btn.style, {
      position: "fixed",
      right: "16px",
      bottom: "16px",
      padding: "10px 14px",
      borderRadius: "8px",
      background: "#fff",
      border: "1px solid #ccc",
      cursor: "pointer",
      zIndex: 99999,
    });

    btn.onclick = async () => {
      const detected = await window.UniWallet.detect();
      const detectedNames = detected.map((w) => w.name);

      // Separate detected vs undetected
      const undetected = knownWallets.filter((w) => !detectedNames.includes(w.name));

      // Modal
      const modal = document.createElement("div");
      Object.assign(modal.style, {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 100000,
      });

      const box = document.createElement("div");
      Object.assign(box.style, {
        background: "#fff",
        borderRadius: "8px",
        padding: "20px",
        minWidth: "280px",
        maxWidth: "420px",
      });

      const title = document.createElement("h3");
      title.innerText = "Select Wallet";
      Object.assign(title.style, { marginBottom: "12px" });
      box.appendChild(title);

      // === Detected Wallets ===
      if (detected.length) {
        const subTitle = document.createElement("p");
        subTitle.innerText = "Detected:";
        subTitle.style.fontWeight = "bold";
        box.appendChild(subTitle);

        detected.forEach((w) => {
          const opt = document.createElement("button");
          opt.innerText = w.name;
          Object.assign(opt.style, {
            display: "block",
            width: "100%",
            padding: "8px",
            margin: "6px 0",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
            background: "#f9f9f9",
          });

          opt.onclick = async () => {
            try {
              if (w.type === "evm") {
                const accounts = await w.provider.request({ method: "eth_requestAccounts" });
                btn.innerText = `${w.name}: ${accounts[0].slice(0, 6)}...`;
              } else if (w.type === "solana") {
                const res = await w.provider.connect();
                btn.innerText = `Solana: ${res.publicKey.toString().slice(0, 6)}...`;
              } else if (w.type === "tron") {
                btn.innerText = `Tron: ${w.provider.defaultAddress.base58.slice(0, 6)}...`;
              } else {
                btn.innerText = w.name;
              }
            } catch (e) {
              alert(`Failed to connect to ${w.name}`);
            }
            document.body.removeChild(modal);
          };

          box.appendChild(opt);
        });
      }

      // === Undetected Wallets (Download Links) ===
      if (undetected.length) {
        const subTitle = document.createElement("p");
        subTitle.innerText = "Not Installed (Download):";
        subTitle.style.fontWeight = "bold";
        subTitle.style.marginTop = "12px";
        box.appendChild(subTitle);

        undetected.forEach((w) => {
          const link = document.createElement("a");
          link.innerText = `Get ${w.name}`;
          link.href = w.url;
          link.target = "_blank";
          Object.assign(link.style, {
            display: "block",
            padding: "6px 0",
            color: "#0066cc",
            textDecoration: "none",
          });
          box.appendChild(link);
        });
      }

      modal.appendChild(box);
      modal.onclick = (e) => {
        if (e.target === modal) document.body.removeChild(modal);
      };

      document.body.appendChild(modal);
    };

    document.body.appendChild(btn);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createWalletUI);
  } else {
    createWalletUI();
  }
})();
</script>

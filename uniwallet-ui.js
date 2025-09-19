<script>
;(function () {
  if (!window.UniWallet) {
    console.error("UniWallet detection scripts not loaded");
    return;
  }

  function createWalletUI() {
    if (document.getElementById("uniwallet-btn")) return;

    // Floating Connect Button
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
      const wallets = await window.UniWallet.detect();

      // Modal Wrapper
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
      title.innerText = "Select a Wallet";
      Object.assign(title.style, { marginBottom: "12px" });
      box.appendChild(title);

      if (!wallets.length) {
        const none = document.createElement("p");
        none.innerText = "No wallets detected on this device.";
        box.appendChild(none);
      } else {
        wallets.forEach((w) => {
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

          // === Only connect AFTER the user chooses one ===
          opt.onclick = async () => {
            try {
              let label = w.name;
              if (w.type === "evm") {
                const accounts = await w.provider.request({ method: "eth_requestAccounts" });
                label = `${w.name}: ${accounts[0].slice(0, 6)}...`;
              } else if (w.type === "solana") {
                const res = await w.provider.connect();
                label = `Solana: ${res.publicKey.toString().slice(0, 6)}...`;
              } else if (w.type === "tron") {
                label = `Tron: ${w.provider.defaultAddress.base58.slice(0, 6)}...`;
              }
              btn.innerText = label;
            } catch (e) {
              alert(`Failed to connect to ${w.name}`);
            }
            document.body.removeChild(modal);
          };

          box.appendChild(opt);
        });
      }

      // Optional Download Section
      const download = document.createElement("p");
      download.innerHTML =
        'Don’t see your wallet? <a href="https://metamask.io/download.html" target="_blank">Get MetaMask</a>';
      Object.assign(download.style, {
        marginTop: "14px",
        fontSize: "14px",
      });
      box.appendChild(download);

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

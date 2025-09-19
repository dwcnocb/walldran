<script>
;(function () {
  if (!window.UniWallet) {
    console.error("UniWallet detection scripts not loaded");
    return;
  }

  // Create UI elements
  function createWalletUI() {
    if (document.getElementById("uniwallet-btn")) return;

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
      if (!wallets.length) {
        alert("No wallets detected.");
        return;
      }

      // Create selection modal
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
        minWidth: "250px",
        maxWidth: "400px",
      });

      const title = document.createElement("h3");
      title.innerText = "Select Wallet";
      Object.assign(title.style, { marginBottom: "12px" });
      box.appendChild(title);

      wallets.forEach((w, idx) => {
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

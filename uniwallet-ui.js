<script>
;(function () {
  if (!window.UniWallet) {
    console.error("UniWallet detection scripts not loaded");
    return;
  }

  // Catalog of wallets (name + official URL + optional icon)
  const WALLET_CATALOG = [
    { name: "MetaMask", url: "https://metamask.io/download.html", icon: "https://raw.githubusercontent.com/MetaMask/brand-resources/master/SVG/metamask-fox.svg" },
    { name: "Trust Wallet", url: "https://trustwallet.com/download", icon: "https://trustwallet.com/assets/images/media/assets/trust-platform.svg" },
    { name: "Coinbase Wallet", url: "https://www.coinbase.com/wallet", icon: "https://avatars.githubusercontent.com/u/1885080?s=280&v=4" },
    { name: "Binance Wallet", url: "https://www.bnbchain.org/en/binance-wallet", icon: "https://cryptologos.cc/logos/binance-coin-bnb-logo.png" },
    { name: "OKX Wallet", url: "https://www.okx.com/web3", icon: "https://www.okx.com/cdn/assets/imgs/221/C797A9C1B070D1A3.png" },
    { name: "Phantom Wallet", url: "https://phantom.app/download", icon: "https://pbs.twimg.com/profile_images/1436371897553911809/nH0ebW1t_400x400.jpg" },
    { name: "Bybit Wallet", url: "https://www.bybit.com/en/web3-wallet/" },
    { name: "Kraken Wallet", url: "https://www.kraken.com/learn/what-is-kraken-wallet" },
    { name: "Bitget Wallet", url: "https://web3.bitget.com/" },
    { name: "Exodus Wallet", url: "https://www.exodus.com/download/" },
    { name: "TronLink", url: "https://www.tronlink.org/" },
    { name: "SafePal", url: "https://www.safepal.com/download" },
    { name: "Robinhood Wallet", url: "https://robinhood.com/wallet" },
    { name: "Blockchain.com Wallet", url: "https://www.blockchain.com/wallet" },
    { name: "Atomic Wallet", url: "https://atomicwallet.io/" },
    { name: "Trezor Wallet", url: "https://trezor.io/" },
    { name: "Electrum Bitcoin Wallet", url: "https://electrum.org/" },
    { name: "MyEtherWallet (MEW)", url: "https://www.myetherwallet.com/" },
    { name: "Solflare", url: "https://solflare.com/" },
    { name: "Tonkeeper", url: "https://tonkeeper.com/" },
    { name: "Sui Wallet", url: "https://suiet.app/" },
    { name: "Zengo", url: "https://zengo.com/" },
    { name: "Wirex Wallet", url: "https://wirexapp.com/" },
    { name: "BitPay Wallet", url: "https://bitpay.com/wallet/" },
    { name: "Guarda Wallet", url: "https://guarda.com/" },
    { name: "Coinomi", url: "https://www.coinomi.com/" },
    { name: "Enjin Wallet", url: "https://enjin.io/wallet" },
    { name: "TokenPocket", url: "https://www.tokenpocket.pro/en/download" },
    { name: "ImToken", url: "https://token.im/" },
    { name: "Keplr", url: "https://www.keplr.app/" },
    { name: "Klever Wallet", url: "https://klever.org/" },
    { name: "Edge Wallet", url: "https://edge.app/" },
    { name: "BlueWallet", url: "https://bluewallet.io/" },
    { name: "Wallet of Satoshi", url: "https://www.walletofsatoshi.com/" },
    { name: "Tangem", url: "https://tangem.com/" },
    { name: "CoolWallet", url: "https://www.coolwallet.io/" },
    { name: "Ellipal", url: "https://www.ellipal.com/" },
    { name: "Cake Wallet", url: "https://cakewallet.com/" },
    { name: "Phoenix Wallet", url: "https://phoenix.acinq.co/" },
    { name: "Blockstream Green", url: "https://blockstream.com/green/" },
    { name: "NOW Wallet", url: "https://nowwallet.io/" },
    { name: "Pera Algo Wallet", url: "https://perawallet.app/" },
    { name: "NEAR Wallet", url: "https://wallet.near.org/" },
    { name: "Pontem Aptos Wallet", url: "https://pontem.network/" },
    { name: "Rainbow Wallet", url: "https://rainbow.me/" },
    { name: "Mycelium Wallet", url: "https://wallet.mycelium.com/" },
    { name: "Monerujo", url: "https://www.monerujo.io/" },
    { name: "Unstoppable Wallet", url: "https://unstoppable.money/" },
    { name: "Onchain Wallet", url: "https://onchainwallet.io/" },
    { name: "Zypto Wallet", url: "https://www.zypto.com/" },
    { name: "Cypherock", url: "https://www.cypherock.com/" },
    { name: "BRD Wallet", url: "https://brd.com/" },
    { name: "Best Wallet", url: "https://bestwallet.com/" },
    { name: "MathWallet", url: "https://mathwallet.org/en-us/" }
  ];

  function createUI() {
    if (document.getElementById("uniwallet-btn")) return;

    // Floating button
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
      const detectedNames = detected.map((w) => w.name.toLowerCase());

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
        maxHeight: "80%",
        overflowY: "auto",
        width: "360px",
      });

      const title = document.createElement("h3");
      title.innerText = "Select a Wallet";
      Object.assign(title.style, { marginBottom: "12px" });
      box.appendChild(title);

      WALLET_CATALOG.forEach((wallet) => {
        const available = detectedNames.includes(wallet.name.toLowerCase());

        const row = document.createElement("div");
        Object.assign(row.style, {
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px",
          margin: "6px 0",
          border: "1px solid #ddd",
          borderRadius: "6px",
          cursor: "pointer",
          background: available ? "#f0fff0" : "#f9f9f9",
        });

        // Icon
        const img = document.createElement("img");
        img.src = wallet.icon || "https://via.placeholder.com/24";
        img.alt = wallet.name;
        Object.assign(img.style, {
          width: "24px",
          height: "24px",
          marginRight: "10px",
        });

        const name = document.createElement("span");
        name.innerText = wallet.name + (available ? " (Available)" : "");

        row.appendChild(img);
        row.appendChild(name);

        if (available) {
          const w = detected.find((d) => d.name.toLowerCase() === wallet.name.toLowerCase());
          row.onclick = async () => {
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
                btn.innerText = `${w.name} connected`;
              }
            } catch (e) {
              alert(`Failed to connect to ${w.name}`);
            }
            document.body.removeChild(modal);
          };
        } else {
          row.onclick = () => window.open(wallet.url, "_blank");
        }

        box.appendChild(row);
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
    document.addEventListener("DOMContentLoaded", createUI);
  } else {
    createUI();
  }
})();
</script>

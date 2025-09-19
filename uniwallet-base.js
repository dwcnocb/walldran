<!-- Script 1: EVM + Solana + WalletConnect -->
<script src="https://unpkg.com/@walletconnect/ethereum-provider/dist/index.umd.js"></script>
<script src="https://unpkg.com/@web3modal/ethereum/dist/index.umd.js"></script>
<script src="https://unpkg.com/@web3modal/html/dist/index.umd.js"></script>

<script>
;(function () {
  if (window.UniWallet) return;

  const PROJECT_ID = "YOUR_PROJECT_ID_HERE"; // <-- EDIT THIS ONLY

  function detectInjected() {
    const res = [];
    if (window.ethereum) {
      const providers = Array.isArray(window.ethereum.providers)
        ? window.ethereum.providers
        : [window.ethereum];
      providers.forEach((p) => {
        const name = p.isMetaMask
          ? "MetaMask"
          : p.isCoinbaseWallet
          ? "Coinbase Wallet"
          : p.isBraveWallet
          ? "Brave Wallet"
          : "EVM Provider";
        res.push({ name, type: "evm", provider: p });
      });
    }
    if (window.solana) {
      res.push({
        name: window.solana.isPhantom ? "Phantom" : "Solana Provider",
        type: "solana",
        provider: window.solana,
      });
    }
    if (window.BinanceChain) {
      res.push({
        name: "Binance Chain Wallet",
        type: "binance",
        provider: window.BinanceChain,
      });
    }
    return res;
  }

  async function initWalletConnect() {
    const provider = await window.WalletConnectEthereumProvider.init({
      projectId: PROJECT_ID,
      chains: [1, 137],
      showQrModal: true,
    });
    await provider.enable();
    return provider;
  }

  function createButton() {
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
      btn.disabled = true;
      btn.innerText = "Connecting...";
      const detected = detectInjected();
      try {
        if (detected.length) {
          const choice = detected[0];
          if (choice.type === "evm") {
            const accounts = await choice.provider.request({
              method: "eth_requestAccounts",
            });
            btn.innerText = `${choice.name}: ${accounts[0]}`;
          } else if (choice.type === "solana") {
            const res = await choice.provider.connect();
            btn.innerText = `Solana: ${res.publicKey.toString().slice(0, 6)}...`;
          } else {
            btn.innerText = choice.name;
          }
        } else {
          const provider = await initWalletConnect();
          const accounts = await provider.request({ method: "eth_accounts" });
          btn.innerText = `WalletConnect: ${accounts[0]}`;
        }
      } catch (e) {
        btn.innerText = "Connect Wallet";
      } finally {
        btn.disabled = false;
      }
    };

    document.body.appendChild(btn);
  }

  window.UniWallet = { detect: detectInjected, connect: initWalletConnect };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createButton);
  } else {
    createButton();
  }
})();
</script>

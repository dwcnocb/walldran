;(function () {
  if (window.UniWallet) return;

  const PROJECT_ID = "YOUR_PROJECT_ID_HERE"; // <-- replace with WalletConnect projectId

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
    if (!window.WalletConnectEthereumProvider) {
      throw new Error("WalletConnect provider not available");
    }
    const provider = await window.WalletConnectEthereumProvider.init({
      projectId: PROJECT_ID,
      chains: [1, 137],
      showQrModal: true,
    });
    await provider.enable();
    return provider;
  }

  // Expose global API
  window.UniWallet = {
    detect: detectInjected,
    connect: initWalletConnect,
  };
})();

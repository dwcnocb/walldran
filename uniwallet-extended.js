<!-- Script 2: Tron, NEAR, Aptos, Cosmos -->
<script src="https://cdn.jsdelivr.net/npm/tronweb/dist/TronWeb.js"></script>
<script src="https://unpkg.com/near-api-js/dist/near-api-js.min.js"></script>
<script src="https://unpkg.com/aptos/dist/aptos.min.js"></script>

<script>
;(function () {
  if (!window.UniWallet) {
    console.error("[MultiChain] Base UniWallet script missing");
    return;
  }

  const oldDetect = window.UniWallet.detect;

  async function detectExtended() {
    const res = oldDetect ? await oldDetect() : [];

    if (window.tronWeb && window.tronWeb.ready) {
      res.push({ name: "TronLink", type: "tron", provider: window.tronWeb });
    }

    if (window.near) {
      res.push({ name: "NEAR Wallet", type: "near", provider: window.near });
    }

    if (window.aptos) {
      res.push({ name: "Aptos Wallet", type: "aptos", provider: window.aptos });
    }

    if (window.keplr) {
      res.push({ name: "Keplr (Cosmos)", type: "cosmos", provider: window.keplr });
    }
    if (window.leap) {
      res.push({ name: "Leap (Cosmos)", type: "cosmos", provider: window.leap });
    }

    return res;
  }

  window.UniWallet.detect = detectExtended;
})();
</script>

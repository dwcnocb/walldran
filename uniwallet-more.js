<!-- Script 3: Algorand, Tezos, ICP, Polkadot, Flow -->
<script>
;(function () {
  if (!window.UniWallet) {
    console.error("[MultiChain v3] Base UniWallet script missing");
    return;
  }

  const oldDetect = window.UniWallet.detect;

  async function detectMore() {
    const res = oldDetect ? await oldDetect() : [];

    if (window.algorand) {
      res.push({ name: "Algorand Wallet", type: "algorand", provider: window.algorand });
    }

    if (window.tezosWallet) {
      res.push({ name: "Tezos Wallet", type: "tezos", provider: window.tezosWallet });
    }
    if (window.beaconWallet) {
      res.push({ name: "Beacon (Tezos)", type: "tezos", provider: window.beaconWallet });
    }

    if (window.ic && window.ic.plug) {
      res.push({ name: "Plug Wallet (ICP)", type: "icp", provider: window.ic.plug });
    }
    if (window.stoic) {
      res.push({ name: "Stoic Wallet (ICP)", type: "icp", provider: window.stoic });
    }

    if (window.injectedWeb3 && window.injectedWeb3["polkadot-js"]) {
      res.push({
        name: "Polkadot{.js}",
        type: "polkadot",
        provider: window.injectedWeb3["polkadot-js"],
      });
    }
    if (window.injectedWeb3 && window.injectedWeb3.talisman) {
      res.push({
        name: "Talisman (Polkadot)",
        type: "polkadot",
        provider: window.injectedWeb3.talisman,
      });
    }

    if (window.fcl) {
      res.push({ name: "Flow Wallet (FCL)", type: "flow", provider: window.fcl });
    }
    if (window.BloctoSDK) {
      res.push({ name: "Blocto (Flow)", type: "flow", provider: window.BloctoSDK });
    }

    return res;
  }

  window.UniWallet.detect = detectMore;
})();
</script>

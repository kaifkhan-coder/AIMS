const ping = require("ping");
const axios = require("axios");

const TARGET = "192.168.1.6";
const ALTERNET = "192.168.1.1"
const CHECK_INTERVAL = 60000; // 1 minute

async function checkNetwork() {
  const res = await ping.promise.probe(TARGET) || ping.promise.probe(ALTERNET);

  if (!res.alive) {
    console.log("❌ Network Down!");

    await axios.post("${import.meta.env.VITE_API_URL}/api/incidents/auto", {
      title: "Network Down",
      description: `Unable to reach ${TARGET} || ${ALTERNET}`,
      priority: "High",
      category: "Network",
      createdBy: "System",
      source: "Monitoring System"
    });
  } else {
    console.log("✅ Network OK");
  }
}

setInterval(checkNetwork, CHECK_INTERVAL);

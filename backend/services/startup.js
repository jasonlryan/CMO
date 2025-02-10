// New startup validation
function validateConfigs() {
  // Check benchmark and depth stages match
  const benchmarkStages = Object.keys(BENCHMARKS);
  const depthStages = Object.keys(DEPTH_LEVELS);

  if (!benchmarkStages.every((s) => depthStages.includes(s))) {
    warnLog("Config stage mismatch - some scoring stages lack depth configs");
  }
}

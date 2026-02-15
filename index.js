const TeevoDriver = require("./TeevoDriver");

const driver = new TeevoDriver();

console.log("--- Teevo Driver Console ---");

try {
    driver.on('battery', (data) => {
        console.log(`Event [Battery]: ${data.level}% | Charging: ${data.isCharging} | ${data.voltage}mV`);
    })

    driver.on('driverStatus', (data) => {
        console.log(`Status [Driver]: ${data.isOn ? "Online" : "Offline"}`);
    })
    
    driver.on('online', (data) => {
        console.log(`Status [Device]: ${data.isOn ? "Connected" : "Disconnected"} | ID : ${data.address}`);
    })

    driver.connect();

    // Small delays ensure the mouse isn't overwhelmed during startup
    setTimeout(() => driver.checkOnline(), 500);
    setTimeout(() => driver.requestBattery(), 1000);

} catch (error) {
    console.error("Critical Error:", error.message);
    process.exit(1);
}

// Cleanly close connection on Ctrl+C
process.on("SIGINT", () => {
    driver.disconnect();
    process.exit();
});

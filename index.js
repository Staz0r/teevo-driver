const TeevoDriver = require("./TeevoDriver");
const Protocol = require("./Protocol");

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
    
    driver.on('flash', (flash) => {
        console.log(`Event [Flash]: ${flash.data} from ${flash.address}`);
    })

    driver.on('lightEffect', (light) => {
        const modes = ['Off', 'Steady', 'Breathing'];
        console.log(`- Current Light Mode: ${modes[light.mode] || "Unknown (" + light.mode + ")"}`);
        console.log(`-> Color: ${light.color.join(',')}`);
        console.log(`-> Brightness: ${light.brightness}`);
        console.log(`-> Speed: ${light.speed}`);
    })

    driver.on('dpiEffect', (dpi) => {
        const modes = ['Steady', 'Breathing'];
        const isOn = dpi.state === 1;
        console.log(`- Current DPI Effect Mode: ${isOn ? modes[dpi.mode - 1] : 'Off'  || "Unknown (" + dpi.mode + ")"}`);
        console.log(`-> Brightness Byte: ${dpi.brightness}`);
        console.log(`-> Speed Byte: ${dpi.speed}`);
        console.log(`-> State Byte: ${dpi.state}`);
    })
    
    driver.on('debug', (data) => {
        console.log(data.message);
    })
    
    driver.on('error', () => {
        console.log('[Error]');
    })

    driver.connect();

    // Small delays ensure the mouse isn't overwhelmed during startup
    setTimeout(() => driver.checkOnline(), 500);
    setTimeout(() => driver.requestBattery(), 1000);
    setTimeout(() => {
        // console.log("Reading Light Settings...");
        // driver.readFlash(Protocol.MEMORY.Light, 7);
        driver.readFlash(Protocol.MEMORY.DPIEffectMode, 8);
    }, 2000);

} catch (error) {
    console.error("Critical Error:", error.message);
    process.exit(1);
}

// Cleanly close connection on Ctrl+C
process.on("SIGINT", () => {
    driver.disconnect();
    process.exit();
});

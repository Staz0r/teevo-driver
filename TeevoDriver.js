const HID = require("node-hid");
const EventEmitter = require("events");

/**
 * Driver for the Teevo/Terra Pro XD9 Mouse.
 * Handles HID communication, battery reports, and device status.
 * @example
 * const driver = new TeevoDriver();
 * driver.on('battery', (data) => console.log(data));
 * driver.connect();
 */
class TeevoDriver extends EventEmitter {

    #device = null;

    // VID 13652
    static VENDOR_ID = 0x3554;
    // PID 62752
    static PRODUCT_ID = 0xF520;
    // Usage Page 65282
    static USAGE_PAGE = 0xFF02;
    static REPORT_ID = 0x08; 

    constructor() {
        super();

        this.COMMANDS = {
            PCDriverStatus: 0x02,
            BatteryLevel: 0x04,
            DeviceOnLine: 0x03,
            GetCurrentConfig: 0x0E
        };
    }
    
    /**
     * Scans for and establishes a connection with the Teevo hardware.
     * 
     * @throws {Error} If the Teevo mouse is not found.
     */
    connect() {
        const devices = HID.devices();
        
        const targetInterface = devices.find(d =>
            d.vendorId === TeevoDriver.VENDOR_ID &&
            d.productId === TeevoDriver.PRODUCT_ID &&
            d.usagePage === TeevoDriver.USAGE_PAGE
        );

        if (!targetInterface) {
            throw new Error("Teevo Mouse not found. Please check connection.");
        }
        
        try {
            this.#device = new HID.HID(targetInterface.path);
            console.log(`[System] Connected: ${targetInterface.product || 'Teevo Mouse'}`);
            
            this.#device.on("data", (data) => this.#decode(data));
            this.#device.on("error", (err) => this.emit('error', err));

            // Set driver mode to 'Active' on startup
            this.setDriverStatus(true);
            
        } catch (error){
            throw new Error(`Could not open device: ${error.message}`);
        }
    }
    
    /**
     * Calculates the 8-bit checksum for a 16-byte packet.
     * 
     * @param {Buffer|Array} packet - The 16-byte packet to calculate for.
     * @returns {number} The calculated checksum byte.
     */
    calculateChecksum(packet) {
        let sum = 0;
        for (let i = 0; i < 15; i++) {
            sum += packet[i];
        }
        let val = (85 - (sum & 0xFF)) & 0xFF;
        return (val - 8) & 0xFF;
    }

    /**
     * Packs and sends a 16-byte command to the hardware.
     * 
     * @param {number} cmdId - The Command ID from this.COMMANDS.
     * @param {number[]} [data=[]] - Data bytes to include in the packet.
     */
    send(cmdId, data = []) {
        if (!this.#device) return;

        const packet = Buffer.alloc(16);
        
        packet[0] = cmdId;
        packet[4] = data.length;
        packet.set(data, 5);

        packet[15] = this.calculateChecksum(packet);

        try {
            const message = Buffer.from([TeevoDriver.REPORT_ID, ...packet]);
            this.#device.write(message);
            console.log(`Sent [0x${cmdId.toString(16)}]: ${message.toString("hex")}`);
        } catch (err) {
            console.error("Write failed:", err.message);
        }
    }

    /**
     * Toggles the mouse between standard mode and driver-aware mode.
     * @param {boolean} isActive - True to enable driver features.
     */
    setDriverStatus(isActive) {
        this.send(this.COMMANDS.PCDriverStatus, [isActive ? 1 : 0]);
    }

    /**
     * Requests the current battery level and charging status from the mouse.
     */
    requestBattery() {
        this.send(this.COMMANDS.BatteryLevel); 
    }

    /**
     * Checks if the device is currently online and responding.
     */
    checkOnline() {
        this.send(this.COMMANDS.DeviceOnLine);
    }

    /**
     * Internal method to parse raw data received from the mouse.
     * @param {Buffer} data - The raw HID report buffer.
     */
    #decode(data) {
        const buf = [...data]; 
        const cmdId = buf[1]; // Index 1 because Index 0 is Report ID 0x08

        if (cmdId === this.COMMANDS.BatteryLevel) {
            this.emit("battery", {
                level: buf[6],
                isCharging: buf[7] === 1,
                voltage: (buf[8] << 8) + buf[9]
            });
        } else if (cmdId === this.COMMANDS.PCDriverStatus) {
            this.emit("driverStatus", {
                isOn: buf[6] === 1,
            });
        } else if (cmdId === this.COMMANDS.DeviceOnLine) {
            const addr = [buf[9], buf[8], buf[7]]
                .map(b => b.toString(16).toUpperCase().padStart(2, '0'))
                .join(':');

            this.emit("online", {
                isOn: buf[6] === 1,
                address: addr
            })
        }
    }
    
    /**
     * Safely closes the connection to the mouse.
     */
    disconnect() {
        if (this.#device) {
            try {
                this.setDriverStatus(false);
            } catch (e) {}
            this.#device.close();
            this.#device = null;
            console.log("Disconnected.");
        }
    }
}

module.exports = TeevoDriver;

# Teevo-Driver (Terra Pro XD9)

A custom, high-performance Node.js driver for the **Terra Pro XD9** gaming mouse. This project replaces the stock manufacturer software with a professional, event-driven interface designed for better performance and cross-platform compatibility.

## 💡 Motivation
As a fan of the Logitech G403 shape, I switched to the Teevo Terra Pro XD9 to try something new. However, as a developer and designer, I found the stock software lacking. I wanted to create a driver that is lightweight while maintaining a modern, polished interface. 

Comparing the stock software to something like the Logitech G-Hub made the gap in UI quality obvious, so I took this as an opportunity to satisfy my curiosity and learn about hardware communication. This project serves as a research phase and a stepping stone before the logic is eventually optimized in a lower-level language (like C# or C++) to create a truly lightweight native driver.

## 🚀 Features
- **Direct HID Communication**: Leverages `node-hid` to talk directly to the mouse hardware.
- **Event-Driven Architecture**: Uses the Node.js `EventEmitter` pattern to report hardware changes (Battery, Connectivity) in real-time.
- **Protocol Decoding**: Custom parser for a proprietary 16-byte HID protocol discovered through reverse engineering.
- **Real-time Monitoring**: Tracks battery percentage, charging status, and raw millivolt voltage.
- **Hardware Identification**: Automatically detects and formats the unique 3-byte hardware address of the device.

## 🛠️ Technical Implementation
This project involved reverse-engineering an existing Webpack-bundled driver to extract the underlying communication protocol.

### Key Technical Challenges:
1. **Protocol Discovery**: Identified the main control channel on a **Vendor Defined Usage Page (0xFF02)** using a custom scanning utility.
2. **Proprietary Checksum**: Implemented the firmware's specific security signature: `(85 - Sum(Bytes 0..14)) - 8`.
3. **Binary Data Marshalling**: Handled Little Endian byte positioning and bit-shifting to combine 8-bit registers into 16-bit values (e.g., Voltage decoding).
4. **OOP Principles**: Focused on encapsulation and decoupling, ensuring the driver logic is entirely separate from the display/UI logic.

## 💻 Usage

```javascript
const TeevoDriver = require('./TeevoDriver');
const mouse = new TeevoDriver();

// 1. Setup listeners for hardware events
mouse.on('battery', (data) => {
    console.log(`Battery: ${data.level}% | ${data.voltage}mV | Charging: ${data.isCharging}`);
});

mouse.on('online', (data) => {
    console.log(`Device ID: ${data.address} | Status: ${data.isOnline ? 'Online' : 'Offline'}`);
});

// 2. Establish connection
try {
    mouse.connect();
    
    // Request initial data
    mouse.checkOnline();
    mouse.requestBattery();
} catch (err) {
    console.error("Connection failed:", err.message);
}
```

## 📚 What I Learned
- **Systems Programming**: Working with raw binary data, Buffers, and bitwise operations in Node.js.
- **Reverse Engineering**: Analyzing minified JavaScript bundles to locate command mappings and protocol logic.
- **Software Architecture**: Implementing the Observer pattern (EventEmitter) to build a scalable and reactive system.
- **Hardware Interaction**: Understanding USB HID descriptors, Report IDs, and Usage Pages.

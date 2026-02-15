# Teevo Driver Protocol Documentation

## Connection Details
- **Vendor ID:** `13652` (`0x3554`)
- **Product ID:** `62752` (`0xF520`)
- **Usage Page:** `0xFF00` (65280) or `0xFF02` (65282)
- **Interface:** Must support **Output Report ID 8**.

## Packet Structure
The device communicates via **Fixed 16-byte Packets**.

**Format:**
| Byte Index | Name | Description |
| :--- | :--- | :--- |
| 0 | Report ID | Always `0x08` (Prefix added by node-hid) |
| 1 | **Command ID** | The action to perform (e.g., `0x04`) |
| 2-4 | Padding | Always `0x00` |
| 5 | Data Length | Number of data bytes following |
| 6... | Data | The payload |
| ... | Padding | Zero padding up to byte 15 |
| 16 | **Checksum** | Validation Byte |

> **Note on Indexing:** 
> When using `node-hid`, the buffer includes the Report ID at Index 0. 
> Therefore, all offsets are shifted by +1 compared to the raw firmware definition.
> - Command ID is at `buf[1]`
> - Data starts at `buf[6]`
> - Checksum is at `buf[16]` (Last byte of the 17-byte buffer including Report ID)

## Checksum Algorithm
To validate a packet, the device checks the last byte.
```javascript
// Sum bytes 0 to 14 of the 16-byte packet (excluding Report ID)
let sum = packet[0] + ... + packet[14];
let checksum = (85 - (sum & 0xFF)) - 8;
```

## Command List

### 0x02: Driver Status (Handshake)
Switches the device between Hardware/Software modes.
- **Send:** `[0x01]` (Active/Online) or `[0x00]` (Inactive).
- **Receive:** Echo of the command.

### 0x03: Device OnLine (Heartbeat)
Checks the status of the **Wireless Link**.
- **Send:** Empty Data.
- **Receive:**
    - Byte 6: `0x01` (Wireless Connected) or `0x00` (Wireless Disconnected/Sleeping).
- **Note:** When **Wired/Charging**, this often returns `0` (False) because the wireless radio is disabled in favor of USB.

### 0x04: Battery Level
- **Send:** Empty Data.
- **Receive:**
    - Byte 6: Level % (e.g., `0x28` = 40%)
    - Byte 7: Charging Status (`0x01` = Yes, `0x00` = No)
    - Byte 8-9: Voltage (Big Endian uint16, e.g., `0x0E C7` = 3783 mV)

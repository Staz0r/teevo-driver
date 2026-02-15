/**
 * Protocol Definitions for Teevo/Terra Pro XD9
 */

const Protocol = {
    // USB Communication Rules
    HID: {
        // VID 13652
        VENDOR_ID: 0x3554,
        // PID 62752
        PRODUCT_ID: 0xF520,
        // Usage Page 65282
        USAGE_PAGE: 0xFF02,
        REPORT_ID: 0x08,
        PACKET_SIZE: 16
    },

    // Commands sent in Byte 0 (names match firmware source in App.js)
    COMMANDS: {
        EncryptionData: 0x01,
        PCDriverStatus: 0x02,
        DeviceOnLine: 0x03,
        BatteryLevel: 0x04,
        DongleEnterPair: 0x05,
        GetPairState: 0x06,
        WriteFlashData: 0x07,
        ReadFlashData: 0x08,
        ClearSetting: 0x09,
        StatusChanged: 0x0A,
        SetDeviceVidPid: 0x0B,
        SetDeviceDescriptorString: 0x0C,
        EnterUsbUpdateMode: 0x0D,
        GetCurrentConfig: 0x0E,
        SetCurrentConfig: 0x0F,
        ReadCIDMID: 0x10,
        EnterMTKMode: 0x11,
        ReadVersionID: 0x12,
        Set4KDongleRGB: 0x14,
        Get4KDongleRGBValue: 0x15,
        SetLongRangeMode: 0x16,
        GetLongRangeMode: 0x17,
        SetDongleRGBBarMode: 0x18,
        GetDongleRGBBarMode: 0x19,
        GetDongleVersion: 0x1D,
        SetDongle3RGBMode: 0x2C,
        GetDongle3RGBMode: 0x2D,
        MusicColorful: 0xB0,
        MusicSingleColor: 0xB1,
        WriteKBCIdMID: 0xF0,
        ReadKBCIdMID: 0xF1
    },

    // Byte offsets for incoming messages (after the 0x08 Report ID)
    OFFSETS: {
        CMD_ID: 1,
        DATA_LEN: 5,
        
        // Battery (Relative to buf[0])
        BAT_LEVEL: 6,
        BAT_CHARGING: 7,
        BAT_VOLT_HI: 8,
        BAT_VOLT_LO: 9,

        // Online (Relative to buf[0])
        ONLINE_STATE: 6
    },

    // The Mouse's Internal Memory "Map" (EEPROM Addresses)
    // These are used with the READ_FLASH (0x08) command
    MEMORY: {
        POLLING_RATE: 0x00,
        DPI_STAGES: 0x02,
        CURRENT_DPI_INDEX: 0x04,
        LOD: 0x0A,
        DPI_VALUES: 0x0C,       // Start of DPI value block
        RGB_MODE: 160,          // 0xA0
        SLEEP_TIME: 173         // 0xAD
    },

    // Static Values
    VALUES: {
        ACTIVE: 1,
        INACTIVE: 0,
        CHARGING: 1
    }
};

module.exports = Protocol;

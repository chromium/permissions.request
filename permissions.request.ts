type PermissionName =
    "geolocation" |
    "notifications" |
    "push" |
    "midi" |
    "camera" |
    "microphone" |
    "speaker" |
    "device-info" |
    "background-sync" |
    "bluetooth" |
    "persistent-storage";


// Descriptors:

interface PermissionDescriptor {
    name: PermissionName;
}

interface GeolocationPermissionDescriptor extends PermissionDescriptor {
    name: "geolocation";
    enableHighAccuracy: boolean;
    timeout: number;
    maximumAge: number;
}

interface NotificationsPermissionDescriptor extends PermissionDescriptor {
    name: "notifications";
}

interface PushPermissionDescriptor extends PermissionDescriptor {
    name: "push";
}

interface MidiPermissionDescriptor extends PermissionDescriptor {
    name: "midi";
}

interface CameraPermissionDescriptor extends PermissionDescriptor {
    name: "camera";
}

interface MicrophonePermissionDescriptor extends PermissionDescriptor {
    name: "microphone";
}

interface SpeakerPermissionDescriptor extends PermissionDescriptor {
    name: "speaker";
}

interface DeviceInfoPermissionDescriptor extends PermissionDescriptor {
    name: "device-info";
}

interface BackgroundSyncPermissionDescriptor extends PermissionDescriptor {
    name: "background-sync";
}

interface BluetoothPermissionDescriptor extends PermissionDescriptor {
    name: "bluetooth";
}

interface PersistentStoragePermissionDescriptor extends PermissionDescriptor {
    name: "persistent-storage";
}


type PermissionState = "granted" | "denied" | "prompt";

// Query and Request results:

interface PermissionStatus {
    state: PermissionState;
}

interface Permissions {
    query(permissionDesc: PermissionDescriptor): Promise<PermissionStatus>;

    request(permissionDesc: GeolocationPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: NotificationsPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: PushPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: MidiPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: CameraPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: MicrophonePermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: SpeakerPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: DeviceInfoPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: BackgroundSyncPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: BluetoothPermissionDescriptor): Promise<PermissionStatus>;
    request(permissionDesc: PersistentStoragePermissionDescriptor): Promise<PermissionStatus>;
}

interface Navigator {
    permissions: Permissions;
}

function tryQuery(permissionDesc: PermissionDescriptor, dflt: PermissionState
                 ): Promise<PermissionStatus> {
    if (navigator.permissions && navigator.permissions.query) {
        return navigator.permissions.query(permissionDesc);
    } else {
        return Promise.resolve({state: dflt});
    }
}

export function request(permissionDesc: GeolocationPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: NotificationsPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: PushPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: MidiPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: CameraPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: MicrophonePermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: SpeakerPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: DeviceInfoPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: BackgroundSyncPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: BluetoothPermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: PersistentStoragePermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: PermissionDescriptor): Promise<PermissionStatus> {
    switch (permissionDesc.name) {
    case 'geolocation':
        let desc = <GeolocationPermissionDescriptor>permissionDesc;
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                ({coords, timestamp}) => {
                    resolve({state: 'granted', coords, timestamp});
                }, ({code, message}) => {
                    resolve(tryQuery(permissionDesc, 'prompt'));
                },
                {enableHighAccuracy: desc.enableHighAccuracy,
                 timeout: desc.timeout,
                 maximumAge: desc.maximumAge})
        });
    }
    return Promise.reject<PermissionStatus>(new TypeError());
};

export function polyfill() {
    if (!self.navigator.permissions) {
        self.navigator.permissions = <Permissions>{};
    }
    if (!self.navigator.permissions.request) {
        self.navigator.permissions.request = request;
    }
}

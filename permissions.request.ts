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

interface PermissionDescriptor {
    name: PermissionName;
}

interface GeolocationPermissionDescriptor extends PermissionDescriptor {
    name: "geolocation";
}

interface NotificationsPermissionDescriptor extends PermissionDescriptor{
    name: "notifications";
}

interface PushPermissionDescriptor extends PermissionDescriptor{
    name: "push";
}

interface MidiPermissionDescriptor extends PermissionDescriptor{
    name: "midi";
}

interface CameraPermissionDescriptor extends PermissionDescriptor{
    name: "camera";
}

interface MicrophonePermissionDescriptor extends PermissionDescriptor{
    name: "microphone";
}

interface SpeakerPermissionDescriptor extends PermissionDescriptor{
    name: "speaker";
}

interface DeviceInfoPermissionDescriptor extends PermissionDescriptor{
    name: "device-info";
}

interface BackgroundSyncPermissionDescriptor extends PermissionDescriptor{
    name: "background-sync";
}

interface BluetoothPermissionDescriptor extends PermissionDescriptor{
    name: "bluetooth";
}

interface PersistentStoragePermissionDescriptor extends PermissionDescriptor{
    name: "persistent-storage";
}

interface Permissions {
    request(permissionDesc: PermissionDescriptor): Promise<PermissionStatus> ;
}

interface Navigator {
    permissions: Permissions;
}


export function request() {
}

export function polyfill() {
    if (!self.navigator.permissions) {
        self.navigator.permissions = <Permissions>{};
    }
    if (!self.navigator.permissions.request) {
        self.navigator.permissions.request = request;
    }
}

// Copyright 2016 Google Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

export type PermissionName =
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

export interface PermissionDescriptor {
    name: PermissionName;
}

export interface GeolocationPermissionDescriptor extends PermissionDescriptor {
    name: "geolocation";
    enableHighAccuracy?: boolean;
    timeout?: number;
    maximumAge?: number;
}

interface NotificationsPermissionDescriptor extends PermissionDescriptor {
    name: "notifications";
}

export interface PushPermissionDescriptor extends PermissionDescriptor {
    name: "push";
    serviceWorker: ServiceWorkerRegistration;
    userVisibleOnly?: boolean;
    applicationServerKey?: ArrayBuffer | ArrayBufferView;
}

export interface MidiPermissionDescriptor extends PermissionDescriptor {
    name: "midi";
    sysex: boolean;
    software: boolean;
}

type MediaTrackConstraints = any;
export interface CameraPermissionDescriptor extends PermissionDescriptor {
    name: "camera";
    constraints?: MediaTrackConstraints;
    peerIdentity?: string;
}

export interface MicrophonePermissionDescriptor extends PermissionDescriptor {
    name: "microphone";
    constraints?: MediaTrackConstraints;
    peerIdentity?: string;
}

interface SpeakerPermissionDescriptor extends PermissionDescriptor {
    name: "speaker";
}

interface DeviceInfoPermissionDescriptor extends PermissionDescriptor {
    name: "device-info";
}

export interface BackgroundSyncPermissionDescriptor extends PermissionDescriptor {
    name: "background-sync";
    serviceWorker: ServiceWorkerRegistration;
    tag: string;
}

export interface BluetoothPermissionDescriptor extends PermissionDescriptor {
    name: "bluetooth";
    deviceId?: string;
    // These match RequestDeviceOptions.
    filters?: Array<any>;
    optionalServices?: Array<any>;
}

interface PersistentStoragePermissionDescriptor extends PermissionDescriptor {
    name: "persistent-storage";
}


export type PermissionState = "granted" | "denied" | "prompt";

// Query and Request results:

export interface PermissionStatus {
    state: PermissionState;
}

export interface GeolocationPermissionResult extends PermissionStatus {
    // For stream=false, from Position:
    coords?: Coordinates;
    timestamp?: number;
}

interface NotificationsPermissionResult extends PermissionStatus {
}

export interface PushPermissionResult extends PermissionStatus {
    subscription: PushSubscription;
}

type MIDIAccess = any;
export interface MidiPermissionResult extends PermissionStatus {
    access: MIDIAccess;
}

type MediaStream = any;
export interface CameraPermissionResult extends PermissionStatus {
    stream?: MediaStream;
}

export interface MicrophonePermissionResult extends PermissionStatus {
    stream?: MediaStream;
}

interface SpeakerPermissionResult extends PermissionStatus {
}

interface DeviceInfoPermissionResult extends PermissionStatus {
}

interface BackgroundSyncPermissionResult extends PermissionStatus {
}

type BluetoothDevice = any;
export interface BluetoothPermissionResult extends PermissionStatus {
    devices: Array<BluetoothDevice>;
}

interface PersistentStoragePermissionResult extends PermissionStatus {
}

export interface Permissions {
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
    request(permissionDesc: BluetoothPermissionDescriptor): Promise<BluetoothPermissionResult>;
    request(permissionDesc: PersistentStoragePermissionDescriptor): Promise<PermissionStatus>;
}

declare global {
    interface Navigator {
        permissions: Permissions;

        // Incomplete members from other specs:
        bluetooth: any;
        mediaDevices: {
            getUserMedia(opts: any,
                         success: (stream: MediaStream)=>any,
                         failure: (err: DOMException)=>any): void;
        }
        requestMIDIAccess(options?: any): Promise<MIDIAccess>;
        storage: { persist(): Promise<boolean>; };
    }
    interface PushManager {
        subscribe(options?: any): Promise<PushSubscription>;
    }
    interface ServiceWorkerRegistration {
        sync: any;
    }
    var ServiceWorkerRegistration: {
        prototype: ServiceWorkerRegistration;
        new(): ServiceWorkerRegistration;
    }
}
declare var Notification: {
    requestPermission(): Promise<"default"|"denied"|"granted">;
}


function tryQuery(permissionDesc: PermissionDescriptor, dflt: PermissionState
                 ): Promise<PermissionStatus> {
    if (navigator.permissions && navigator.permissions.query) {
        return navigator.permissions.query(permissionDesc);
    } else {
        return Promise.resolve({state: dflt});
    }
}


function requestGeolocation(permissionDesc: GeolocationPermissionDescriptor): Promise<GeolocationPermissionResult> {
    return new Promise((resolve, reject) => {
        let {enableHighAccuracy, timeout, maximumAge} =
            permissionDesc;
        navigator.geolocation.getCurrentPosition(
            ({coords, timestamp}) => {
                resolve(tryQuery(permissionDesc, "granted")
                        .then(({state}) => state));
            }, ({code, message}) => {
                resolve(tryQuery(permissionDesc, "prompt"));
            },
            {enableHighAccuracy, timeout, maximumAge})
    });
}

function requestNotifications(permissionDesc: NotificationsPermissionDescriptor): Promise<NotificationsPermissionResult> {
    return Notification.requestPermission().then(state => {
        switch(state) {
        case "default": return {state: "prompt"};
        case "granted": return {state: "granted"};
        case "denied": return {state: "denied"};
        }
        throw new TypeError(state);
    });
}

function requestPush(permissionDesc: PushPermissionDescriptor): Promise<PushPermissionResult> {
    return new Promise((resolve, reject) => {
        let {serviceWorker, userVisibleOnly, applicationServerKey} =
            <PushPermissionDescriptor>permissionDesc;
        if (!(serviceWorker instanceof ServiceWorkerRegistration)) {
            throw new TypeError();
        }
        resolve(
            serviceWorker.pushManager.subscribe(
                {userVisibleOnly, applicationServerKey})
                .then(subscription => ({state: "granted", subscription}),
                      err => {
                          if (err.name === "NotAllowedError") {
                              return {state: "denied"};
                          }
                          // Re-throw SecurityError, InvalidStateError,
                          // and AbortError.
                          throw err;
                      })
        );
    });
}

function requestMidi(permissionDesc: MidiPermissionDescriptor): Promise<MidiPermissionResult> {
    let {sysex, software} = permissionDesc;
    return navigator.requestMIDIAccess({sysex, software})
        .then(access => ({state: "granted", access}),
              err => {
                  if (err.name === "SecurityError") {
                      return {state: "denied"};
                  }
                  throw err;
              })
}

function requestCamera(permissionDesc: CameraPermissionDescriptor): Promise<CameraPermissionResult> {
    return new Promise((resolve, reject) => {
        let {constraints, peerIdentity} = permissionDesc;
        navigator.mediaDevices.getUserMedia(
            {video: constraints ? constraints: true,
             peerIdentity},
            stream => resolve({state: "granted", stream}),
            err => {
                if (err.name === "PermissionDeniedError") {
                    resolve({state: "denied"});
                }
                reject(err);
            })
    });
}

function requestMicrophone(permissionDesc: MicrophonePermissionDescriptor): Promise<MicrophonePermissionResult> {
    return new Promise((resolve, reject) => {
        let {constraints, peerIdentity} = permissionDesc;
        navigator.mediaDevices.getUserMedia(
            {audio: constraints ? constraints: true,
             peerIdentity},
            stream => resolve({state: "granted", stream}),
            err => {
                if (err.name === "PermissionDeniedError") {
                    resolve({state: "denied"});
                }
                reject(err);
            })
    });
}

function requestSpeaker(permissionDesc: SpeakerPermissionDescriptor): Promise<SpeakerPermissionResult> {
    return Promise.reject(new TypeError("speaker can't be requested (yet?)"));
}

function requestDeviceInfo(permissionDesc: DeviceInfoPermissionDescriptor): Promise<DeviceInfoPermissionResult> {
    return Promise.reject(new TypeError("device-info can't be requested (yet?)"));
}

function requestBackgroundSync(permissionDesc: BackgroundSyncPermissionDescriptor): Promise<BackgroundSyncPermissionResult> {
    try {
        let {serviceWorker, tag} = permissionDesc;
        return serviceWorker.sync.register(tag).then(
            () => ({state: "granted"}),
            (err: DOMException) => {
                if (err.name === "NotAllowedError") {
                    return {state: "denied"};
                }
                throw err;
            });
    } catch(e) {
        return Promise.reject(e);
    }
}

function requestBluetooth(permissionDesc: BluetoothPermissionDescriptor): Promise<BluetoothPermissionResult> {
    if (navigator.bluetooth && navigator.bluetooth.requestDevice) {
        return (navigator.bluetooth.requestDevice(permissionDesc) as Promise<BluetoothDevice>)
            .then<BluetoothPermissionResult>(
                device => ({state: "prompt", devices: [device]}),
                (err: DOMException) => {
                    if (err.name === "NotFoundError") {
                        return {state: "prompt", devices: []};
                    }
                    throw err;
                });
    }
    return Promise.reject(new TypeError("navigator.bluetooth not supported"));
}

function requestPersistentStorage(permissionDesc: PersistentStoragePermissionDescriptor): Promise<PersistentStoragePermissionResult> {
    return navigator.storage.persist().then(persisted => {
        if (persisted) {
            return {state: "granted"};
        } else {
            return {state: "denied"};
        }
    });
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
export function request(permissionDesc: BluetoothPermissionDescriptor): Promise<BluetoothPermissionResult>;
export function request(permissionDesc: PersistentStoragePermissionDescriptor): Promise<PermissionStatus>;
export function request(permissionDesc: PermissionDescriptor): Promise<PermissionStatus> {
    switch (permissionDesc.name) {
    case "geolocation":
        return requestGeolocation(<GeolocationPermissionDescriptor>permissionDesc);
    case "notifications":
        return requestNotifications(<NotificationsPermissionDescriptor>permissionDesc);
    case "push":
        return requestPush(<PushPermissionDescriptor>permissionDesc);
    case "midi":
        return requestMidi(<MidiPermissionDescriptor>permissionDesc);
    case "camera":
        return requestCamera(<CameraPermissionDescriptor>permissionDesc);
    case "microphone":
        return requestMicrophone(<MicrophonePermissionDescriptor>permissionDesc);
    case "speaker":
        return requestSpeaker(<SpeakerPermissionDescriptor>permissionDesc);
    case "device-info":
        return requestDeviceInfo(<DeviceInfoPermissionDescriptor>permissionDesc);
    case "background-sync":
        return requestBackgroundSync(<BackgroundSyncPermissionDescriptor>permissionDesc);
    case "bluetooth":
        return requestBluetooth(<BluetoothPermissionDescriptor>permissionDesc);
    case "persistent-storage":
        return requestPersistentStorage(<PersistentStoragePermissionDescriptor>permissionDesc);
    }

    // Issue: Permissions doesn't specify what to do for an unrecognized
    // PermissionName.
    return Promise.reject(new TypeError(
        "Unknown PermissionName: " + permissionDesc.name));
};

export function polyfill() {
    if (!self.navigator.permissions) {
        self.navigator.permissions = <Permissions>{};
    }
    if (!self.navigator.permissions.request) {
        self.navigator.permissions.request = request;
    }
}

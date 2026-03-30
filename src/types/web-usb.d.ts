// Web USB API 类型声明
// 参考：https://wicg.github.io/webusb/

interface USBDevice {
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  releaseInterface(interfaceNumber: number): Promise<void>;
  selectAlternateInterface(interfaceNumber: number, alternateSetting: number): Promise<void>;
  controlTransferIn(setup: USBControlTransferParameters, length: number): Promise<USBInTransferResult>;
  controlTransferOut(setup: USBControlTransferParameters, data?: BufferSource | number): Promise<USBOutTransferResult>;
  clearHalt(direction: USBDirection, endpointNumber: number): Promise<void>;
  transferIn(endpointNumber: number, length: number): Promise<USBInTransferResult>;
  transferOut(endpointNumber: number, data: BufferSource | number): Promise<USBOutTransferResult>;
  isochronousTransferIn(endpointNumber: number, packetLengths: number[]): Promise<USPIsochronousInTransferResult>;
  isochronousTransferOut(endpointNumber: number, data: BufferSource | number, packetLengths: number[]): Promise<USPIsochronousOutTransferResult>;
  reset(): Promise<void>;
  
  readonly opened: boolean;
  readonly configuration: USBConfiguration | null;
  readonly configurations: USBConfiguration[];
  readonly deviceClass: number;
  readonly deviceProtocol: number;
  readonly deviceSubclass: number;
  readonly deviceVersionMajor: number;
  readonly deviceVersionMinor: number;
  readonly deviceVersionSubminor: number;
  readonly manufacturerName: string | null;
  readonly productID: number;
  readonly productName: string | null;
  readonly serialNumber: string | null;
  readonly vendorID: number;
}

interface USBConfiguration {
  readonly configurationValue: number;
  readonly interfaces: USBInterface[];
}

interface USBInterface {
  readonly interfaceNumber: number;
  readonly alternate: USBAlternateInterface;
  readonly alternates: USBAlternateInterface[];
  readonly claimed: boolean;
}

interface USBAlternateInterface {
  readonly interfaceClass: number;
  readonly interfaceProtocol: number;
  readonly interfaceSubclass: number;
  readonly endpoints: USBEndpoint[];
}

interface USBEndpoint {
  readonly direction: USBDirection;
  readonly endpointNumber: number;
  readonly type: USBTransferType;
  readonly packetSize: number;
}

type USBDirection = "in" | "out";
type USBTransferType = "bulk" | "interrupt" | "isochronous";

interface USBControlTransferParameters {
  requestType: USBRequestType;
  recipient: USBRecipient;
  request: number;
  value: number;
  index: number;
}

type USBRequestType = "standard" | "class" | "vendor";
type USBRecipient = "device" | "interface" | "endpoint" | "other";

interface USBInTransferResult {
  readonly data?: DataView;
  readonly status: "ok" | "stall" | "babble" | undefined;
}

interface USBOutTransferResult {
  readonly bytesWritten: number;
  readonly status: "ok" | "stall" | undefined;
}

interface USPIsochronousInTransferResult {
  readonly data: DataView;
  readonly packets: USPPacketResult[];
}

interface USPPacketResult {
  readonly status: "ok" | "stall" | "babble" | undefined;
  readonly bytesWritten: number;
}

interface USPIsochronousOutTransferResult {
  readonly packets: USPPacketResult[];
}

interface USBDeviceFilter {
  vendorId?: number;
  productId?: number;
  classCode?: number;
  subclassCode?: number;
  protocolCode?: number;
  serialNumber?: string;
}

interface Navigator {
  readonly usb: USB | undefined;
}

interface USB {
  getDevices(): Promise<USBDevice[]>;
  requestDevice(options: { filters?: USBDeviceFilter[] }): Promise<USBDevice>;
}

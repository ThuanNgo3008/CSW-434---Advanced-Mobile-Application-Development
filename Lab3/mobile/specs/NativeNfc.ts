import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type NfcTagInfo = {
    id: string;
    technologies: string;
    text: string;
};

export interface Spec extends TurboModule {
    getNfcStatus(): string;
    startScanning(): void;
    stopScanning(): void;

    readonly onTagDiscovered:
    CodegenTypes.EventEmitter<NfcTagInfo>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
    'NativeNfc',
);
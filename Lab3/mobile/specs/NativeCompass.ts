import type { TurboModule, CodegenTypes } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type CompassData = {
    heading: number;
    x: number;
    y: number;
    z: number;
};

export interface Spec extends TurboModule {
    getCompassStatus(): string;
    startListening(): void;
    stopListening(): void;

    readonly onCompassChanged:
    CodegenTypes.EventEmitter<CompassData>;
}

export default TurboModuleRegistry.getEnforcing<Spec>(
    'NativeCompass',
);

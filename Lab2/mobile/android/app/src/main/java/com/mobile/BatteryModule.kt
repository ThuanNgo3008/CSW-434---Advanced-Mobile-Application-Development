package com.mobile

import android.content.Context
import android.os.BatteryManager
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BatteryModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BatteryModule"
    }

    @ReactMethod
    fun getBatteryLevel(promise: Promise) {
        val batteryManager =
            reactApplicationContext.getSystemService(
                Context.BATTERY_SERVICE
            ) as BatteryManager

        val batteryLevel = batteryManager.getIntProperty(
            BatteryManager.BATTERY_PROPERTY_CAPACITY
        )

        if (batteryLevel == Int.MIN_VALUE) {
            promise.reject("BATTERY_ERROR", "Cannot read battery level")
            return
        }

        promise.resolve(batteryLevel)
    }
}

package com.mobile

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BrightnessModule(
    reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BrightnessModule"
    }

    @ReactMethod
    fun setBrightness(value: Double, promise: Promise) {
        if (!value.isFinite() || value < 0.0 || value > 1.0) {
            promise.reject(
                "INVALID_BRIGHTNESS",
                "Brightness must be between 0 and 1"
            )
            return
        }

        val activity = reactApplicationContext.currentActivity

        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Activity not available")
            return
        }

        activity.runOnUiThread {
            try {
                val params = activity.window.attributes
                params.screenBrightness = value.toFloat()
                activity.window.attributes = params

                promise.resolve(null)
            } catch (e: Exception) {
                promise.reject("BRIGHTNESS_ERROR", e)
            }
        }
    }
}

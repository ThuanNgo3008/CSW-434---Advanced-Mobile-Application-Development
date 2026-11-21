package com.mobile.compass

import com.mobile.nfc.NativeCompassSpec
import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.os.SystemClock

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext


class NativeCompassModule(
    private val context: ReactApplicationContext
) : NativeCompassSpec(context),
    SensorEventListener,
    LifecycleEventListener {

    companion object {
        const val NAME = "NativeCompass"
    }

    private val sensorManager =
        context.getSystemService(
            Context.SENSOR_SERVICE
        ) as SensorManager

    // Hai cảm biến dùng để tính hướng
    private val accelerometer =
        sensorManager.getDefaultSensor(
            Sensor.TYPE_ACCELEROMETER
        )

    private val magnetometer =
        sensorManager.getDefaultSensor(
            Sensor.TYPE_MAGNETIC_FIELD
        )

    private val gravity = FloatArray(3)
    private val magnetic = FloatArray(3)

    private var hasGravity = false
    private var hasMagnetic = false
    private var requested = false
    private var registered = false
    private var lastUpdate = 0L

    init {
        context.addLifecycleEventListener(this)
    }

    override fun getName(): String = NAME

    // Kiểm tra cảm biến
    override fun getCompassStatus(): String {
        return if (
            accelerometer != null &&
            magnetometer != null
        ) {
            "READY"
        } else {
            "UNAVAILABLE"
        }
    }

    // Bắt đầu lắng nghe cảm biến
    override fun startListening() {
        requested = true
        registerSensors()
    }

    private fun registerSensors() {
        if (registered) return

        val acc = accelerometer ?: return
        val mag = magnetometer ?: return

        hasGravity = false
        hasMagnetic = false

        val accOk = sensorManager.registerListener(
            this,
            acc,
            SensorManager.SENSOR_DELAY_UI
        )

        val magOk = sensorManager.registerListener(
            this,
            mag,
            SensorManager.SENSOR_DELAY_UI
        )

        registered = accOk && magOk

        if (!registered) {
            sensorManager.unregisterListener(this)
        }
    }

    // Dừng lắng nghe
    override fun stopListening() {
        requested = false
        unregisterSensors()
    }

    private fun unregisterSensors() {
        sensorManager.unregisterListener(this)
        registered = false
    }

    override fun onSensorChanged(event: SensorEvent) {

        when (event.sensor.type) {
            Sensor.TYPE_ACCELEROMETER -> {
                gravity[0] = event.values[0]
                gravity[1] = event.values[1]
                gravity[2] = event.values[2]
                hasGravity = true
            }

            Sensor.TYPE_MAGNETIC_FIELD -> {
                magnetic[0] = event.values[0]
                magnetic[1] = event.values[1]
                magnetic[2] = event.values[2]
                hasMagnetic = true
            }
        }

        if (!hasGravity || !hasMagnetic) return

        // Tạo ma trận xoay
        val rotationMatrix = FloatArray(9)

        val success = SensorManager.getRotationMatrix(
            rotationMatrix,
            null,
            gravity,
            magnetic
        )

        if (!success) return

        // Tính góc hướng
        val orientation = FloatArray(3)

        SensorManager.getOrientation(
            rotationMatrix,
            orientation
        )

        // Radian -> độ, chuẩn hóa về [0, 360)
        val heading = (
            Math.toDegrees(orientation[0].toDouble()) +
            360.0
        ) % 360.0

        // Giới hạn số lần gửi dữ liệu
        val now = SystemClock.elapsedRealtime()

        if (now - lastUpdate < 100) return
        lastUpdate = now

        // Gửi dữ liệu về React Native
        val data = Arguments.createMap().apply {
            putDouble("heading", heading)
            putDouble("x", magnetic[0].toDouble())
            putDouble("y", magnetic[1].toDouble())
            putDouble("z", magnetic[2].toDouble())
        }

        if (registered) {
            emitOnCompassChanged(data)
        }
    }

    override fun onAccuracyChanged(
        sensor: Sensor,
        accuracy: Int
    ) {
        // Có thể xử lý thay đổi độ chính xác ở đây
    }

    override fun onHostResume() {
        if (requested) {
            registerSensors()
        }
    }

    override fun onHostPause() {
        unregisterSensors()
    }

    override fun onHostDestroy() {
        stopListening()
    }

    override fun invalidate() {
        stopListening()
        context.removeLifecycleEventListener(this)
        super.invalidate()
    }
}

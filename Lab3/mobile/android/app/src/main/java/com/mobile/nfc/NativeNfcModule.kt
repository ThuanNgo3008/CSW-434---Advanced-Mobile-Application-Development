package com.mobile.nfc

import android.nfc.NfcAdapter
import android.nfc.Tag
import android.nfc.NdefRecord
import android.nfc.tech.Ndef
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.ReactApplicationContext

class NativeNfcModule(
    private val context: ReactApplicationContext
) : NativeNfcSpec(context), LifecycleEventListener {

    companion object {
        const val NAME = "NativeNfc"
        const val TAG = "Lab3Nfc"
    }

    private val adapter: NfcAdapter? =
        NfcAdapter.getDefaultAdapter(context)

    private var scanning = false

    init {
        context.addLifecycleEventListener(this)
    }

    override fun getName(): String = NAME

    // Kiểm tra trạng thái NFC
    override fun getNfcStatus(): String {
        return when {
            adapter == null -> "UNAVAILABLE"
            !adapter.isEnabled -> "DISABLED"
            else -> "READY"
        }
    }

    // Bắt đầu quét thẻ
    override fun startScanning() {
        scanning = true
        enableReader()
    }

    // Dừng quét thẻ
    override fun stopScanning() {
        scanning = false
        disableReader()
    }

    private fun enableReader() {
        val activity = context.currentActivity ?: return
        val nfc = adapter ?: return

        if (getNfcStatus() != "READY") return

        activity.runOnUiThread {
            if (!scanning) return@runOnUiThread

            try {
                val flags =
                    NfcAdapter.FLAG_READER_NFC_A or
                    NfcAdapter.FLAG_READER_NFC_B or
                    NfcAdapter.FLAG_READER_NFC_F or
                    NfcAdapter.FLAG_READER_NFC_V

                nfc.enableReaderMode(
                    activity,
                    NfcAdapter.ReaderCallback { tag ->
                        handleTag(tag)
                    },
                    flags,
                    null
                )
            } catch (e: Exception) {
                Log.e(TAG, "Cannot enable NFC reader", e)
            }
        }
    }

    private fun disableReader() {
        val activity = context.currentActivity ?: return

        activity.runOnUiThread {
            try {
                adapter?.disableReaderMode(activity)
            } catch (e: Exception) {
                Log.e(TAG, "Cannot disable NFC reader", e)
            }
        }
    }

    // Xử lý dữ liệu khi phát hiện thẻ NFC
    private fun handleTag(tag: Tag) {
        if (!scanning) return

        val id = tag.id.joinToString("") {
            "%02X".format(it.toInt() and 0xFF)
        }

        val technologies = tag.techList.joinToString(", ") {
            it.substringAfterLast(".")
        }

        val content = readNdef(tag)

        val eventData = Arguments.createMap().apply {
            putString("id", id)
            putString("technologies", technologies)
            putString("text", content)
        }

        if (scanning) {
            emitOnTagDiscovered(eventData)
        }
    }

    // Đọc nội dung Text hoặc URI của thẻ NDEF
    private fun readNdef(tag: Tag): String {
        val ndef = Ndef.get(tag)
            ?: return "Thẻ không hỗ trợ NDEF"

        return try {
            ndef.connect()

            val message = ndef.ndefMessage
                ?: return "Thẻ NDEF trống"

            for (record in message.records) {
                if (
                    record.tnf == NdefRecord.TNF_WELL_KNOWN &&
                    record.type.contentEquals(NdefRecord.RTD_TEXT)
                ) {
                    val payload = record.payload
                    if (payload.isEmpty()) continue

                    val languageLength =
                        payload[0].toInt() and 0x3F

                    val start = 1 + languageLength
                    if (start > payload.size) continue

                    val charset =
                        if ((payload[0].toInt() and 0x80) == 0)
                            Charsets.UTF_8
                        else
                            Charsets.UTF_16

                    return String(
                        payload,
                        start,
                        payload.size - start,
                        charset
                    )
                }

                val uri = record.toUri()
                if (uri != null) {
                    return uri.toString()
                }
            }

            "Không tìm thấy NDEF Text hoặc URI"
        } catch (e: Exception) {
            "Không thể đọc NDEF: ${e.message}"
        } finally {
            try {
                ndef.close()
            } catch (_: Exception) {
            }
        }
    }

    override fun onHostResume() {
        if (scanning) enableReader()
    }

    override fun onHostPause() {
        disableReader()
    }

    override fun onHostDestroy() {
        scanning = false
        disableReader()
    }

    override fun invalidate() {
        stopScanning()
        context.removeLifecycleEventListener(this)
        super.invalidate()
    }
}

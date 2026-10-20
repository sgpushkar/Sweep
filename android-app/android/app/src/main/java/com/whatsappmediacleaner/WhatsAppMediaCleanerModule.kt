package com.whatsappmediacleaner

import android.app.Activity
import android.content.ContentResolver
import android.content.ContentUris
import android.content.Context
import android.content.Intent
import android.content.IntentSender
import android.content.pm.PackageManager
import android.database.Cursor
import android.net.Uri
import android.os.Build
import android.provider.DocumentsContract
import android.provider.MediaStore
import android.provider.Settings
import android.graphics.Bitmap
import android.util.Size
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.InputStream
import java.net.HttpURLConnection
import java.net.URL
import java.security.MessageDigest
import java.util.concurrent.atomic.AtomicBoolean

class WhatsAppMediaCleanerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    companion object {
        const val MODULE_NAME = "WhatsAppCleanerNative"
        private const val REQUEST_CODE_DELETE = 4201
        private const val REQUEST_CODE_PICK_FOLDER = 4202
        private const val REQUEST_CODE_PERMISSIONS = 4203
        private const val REQUEST_CODE_INSTALL_PERMISSION = 4204
    }

    private val moduleScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private var pendingDeletePromise: Promise? = null
    private var pendingDeleteUris: List<String> = emptyList()
    private var pendingFolderPromise: Promise? = null
    private var pendingPermissionsPromise: Promise? = null

    private var currentDownloadJob: Job? = null
    private val isDownloadCancelled = AtomicBoolean(false)

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName(): String = MODULE_NAME

    // =========================================================================
    // PERMISSIONS
    // =========================================================================

    @ReactMethod
    fun checkMediaPermissions(promise: Promise) {
        try {
            val result = Arguments.createMap()
            val apiLevel = Build.VERSION.SDK_INT
            result.putInt("apiLevel", apiLevel)

            if (apiLevel >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) { // Android 14+ (API 34)
                val readImages = ContextCompat.checkSelfPermission(
                    reactContext,
                    android.Manifest.permission.READ_MEDIA_IMAGES
                ) == PackageManager.PERMISSION_GRANTED

                val readVideos = ContextCompat.checkSelfPermission(
                    reactContext,
                    android.Manifest.permission.READ_MEDIA_VIDEO
                ) == PackageManager.PERMISSION_GRANTED

                val readVisualSelected = ContextCompat.checkSelfPermission(
                    reactContext,
                    "android.permission.READ_MEDIA_VISUAL_USER_SELECTED"
                ) == PackageManager.PERMISSION_GRANTED

                result.putBoolean("canReadImages", readImages || readVisualSelected)
                result.putBoolean("canReadVideos", readVideos || readVisualSelected)
                result.putBoolean("isPartialAccess", readVisualSelected && (!readImages || !readVideos))

                val status = when {
                    readImages && readVideos -> "granted"
                    readVisualSelected -> "partial"
                    else -> "denied"
                }
                result.putString("status", status)

            } else if (apiLevel >= Build.VERSION_CODES.TIRAMISU) { // Android 13 (API 33)
                val readImages = ContextCompat.checkSelfPermission(
                    reactContext,
                    android.Manifest.permission.READ_MEDIA_IMAGES
                ) == PackageManager.PERMISSION_GRANTED

                val readVideos = ContextCompat.checkSelfPermission(
                    reactContext,
                    android.Manifest.permission.READ_MEDIA_VIDEO
                ) == PackageManager.PERMISSION_GRANTED

                result.putBoolean("canReadImages", readImages)
                result.putBoolean("canReadVideos", readVideos)
                result.putBoolean("isPartialAccess", false)

                val status = when {
                    readImages && readVideos -> "granted"
                    readImages || readVideos -> "partial"
                    else -> "denied"
                }
                result.putString("status", status)

            } else { // Android 12 and below
                val readStorage = ContextCompat.checkSelfPermission(
                    reactContext,
                    android.Manifest.permission.READ_EXTERNAL_STORAGE
                ) == PackageManager.PERMISSION_GRANTED

                result.putBoolean("canReadImages", readStorage)
                result.putBoolean("canReadVideos", readStorage)
                result.putBoolean("isPartialAccess", false)
                result.putString("status", if (readStorage) "granted" else "denied")
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("PERMISSION_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun requestMediaPermissions(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        try {
            pendingPermissionsPromise = promise
            val permissionsToRequest = mutableListOf<String>()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
                permissionsToRequest.add(android.Manifest.permission.READ_MEDIA_IMAGES)
                permissionsToRequest.add(android.Manifest.permission.READ_MEDIA_VIDEO)
                permissionsToRequest.add("android.permission.READ_MEDIA_VISUAL_USER_SELECTED")
            } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                permissionsToRequest.add(android.Manifest.permission.READ_MEDIA_IMAGES)
                permissionsToRequest.add(android.Manifest.permission.READ_MEDIA_VIDEO)
            } else {
                permissionsToRequest.add(android.Manifest.permission.READ_EXTERNAL_STORAGE)
            }

            ActivityCompat.requestPermissions(activity, permissionsToRequest.toTypedArray(), REQUEST_CODE_PERMISSIONS)
        } catch (e: Exception) {
            pendingPermissionsPromise = null
            promise.reject("REQUEST_PERMISSION_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openAppSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.fromParts("package", reactContext.packageName, null)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", e.message, e)
        }
    }

    // =========================================================================
    // MEDIASTORE DISCOVERY (IMAGES & VIDEOS)
    // =========================================================================

    @ReactMethod
    fun scanWhatsAppMedia(options: ReadableMap?, promise: Promise) {
        moduleScope.launch {
            try {
                val mediaList = Arguments.createArray()
                val contentResolver = reactContext.contentResolver

                var totalBytes: Long = 0
                var imageCount = 0
                var videoCount = 0

                // 1. Query Images
                queryMediaCollection(
                    contentResolver = contentResolver,
                    collectionUri = MediaStore.Images.Media.EXTERNAL_CONTENT_URI,
                    isVideo = false,
                    targetList = mediaList,
                    onItemFound = { size ->
                        totalBytes += size
                        imageCount++
                    }
                )

                // 2. Query Videos
                queryMediaCollection(
                    contentResolver = contentResolver,
                    collectionUri = MediaStore.Video.Media.EXTERNAL_CONTENT_URI,
                    isVideo = true,
                    targetList = mediaList,
                    onItemFound = { size ->
                        totalBytes += size
                        videoCount++
                    }
                )

                val summary = Arguments.createMap().apply {
                    putInt("totalCount", imageCount + videoCount)
                    putInt("imageCount", imageCount)
                    putInt("videoCount", videoCount)
                    putDouble("totalSizeBytes", totalBytes.toDouble())
                    putArray("items", mediaList)
                }

                promise.resolve(summary)
            } catch (e: Exception) {
                promise.reject("SCAN_ERROR", e.message, e)
            }
        }
    }

    private fun queryMediaCollection(
        contentResolver: ContentResolver,
        collectionUri: Uri,
        isVideo: Boolean,
        targetList: WritableArray,
        onItemFound: (Long) -> Unit
    ) {
        val projection = mutableListOf(
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.MIME_TYPE,
            MediaStore.MediaColumns.DATE_ADDED,
            MediaStore.MediaColumns.DATE_MODIFIED,
            MediaStore.MediaColumns.WIDTH,
            MediaStore.MediaColumns.HEIGHT
        )

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            projection.add(MediaStore.MediaColumns.RELATIVE_PATH)
        } else {
            projection.add(MediaStore.MediaColumns.DATA)
        }

        if (isVideo) {
            projection.add(MediaStore.Video.VideoColumns.DURATION)
        }

        // WhatsApp path filters & filename hints
        val sortOrder = "${MediaStore.MediaColumns.DATE_ADDED} DESC"

        var cursor: Cursor? = null
        try {
            cursor = contentResolver.query(
                collectionUri,
                projection.toTypedArray(),
                null,
                null,
                sortOrder
            )

            cursor?.let { c ->
                val idCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
                val nameCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
                val sizeCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
                val mimeCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE)
                val dateAddedCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_ADDED)
                val dateModifiedCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.DATE_MODIFIED)
                val widthCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.WIDTH)
                val heightCol = c.getColumnIndexOrThrow(MediaStore.MediaColumns.HEIGHT)

                val pathCol = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    c.getColumnIndex(MediaStore.MediaColumns.RELATIVE_PATH)
                } else {
                    c.getColumnIndex(MediaStore.MediaColumns.DATA)
                }

                val durationCol = if (isVideo) c.getColumnIndex(MediaStore.Video.VideoColumns.DURATION) else -1

                while (c.moveToNext()) {
                    val displayName = c.getString(nameCol) ?: ""
                    val path = if (pathCol != -1) c.getString(pathCol) ?: "" else ""

                    val lowerName = displayName.lowercase()
                    if (lowerName.endsWith(".nomedia") || lowerName.endsWith(".tmp")) {
                        continue
                    }

                    // Check if this file belongs to WhatsApp (modern path, legacy path, or filename)
                    if (isWhatsAppMedia(displayName, path)) {
                        val mediaId = c.getLong(idCol)
                        val contentUri = ContentUris.withAppendedId(collectionUri, mediaId).toString()
                        val size = if (sizeCol != -1 && !c.isNull(sizeCol)) c.getLong(sizeCol) else 0L
                        if (size <= 0L) continue

                        val mime = if (mimeCol != -1) c.getString(mimeCol) ?: (if (isVideo) "video/mp4" else "image/jpeg") else (if (isVideo) "video/mp4" else "image/jpeg")
                        val dateAdded = if (dateAddedCol != -1 && !c.isNull(dateAddedCol)) c.getLong(dateAddedCol) else 0L
                        val dateModified = if (dateModifiedCol != -1 && !c.isNull(dateModifiedCol)) c.getLong(dateModifiedCol) else 0L
                        val width = if (widthCol != -1 && !c.isNull(widthCol)) c.getInt(widthCol) else 0
                        val height = if (heightCol != -1 && !c.isNull(heightCol)) c.getInt(heightCol) else 0
                        val duration = if (isVideo && durationCol != -1 && !c.isNull(durationCol)) c.getLong(durationCol) else 0L

                        val isRealVideo = isVideo || mime.startsWith("video/") ||
                                lowerName.endsWith(".mp4") || lowerName.endsWith(".3gp") ||
                                lowerName.endsWith(".mkv") || lowerName.endsWith(".mov")

                        val item = Arguments.createMap().apply {
                            putString("id", "${if (isRealVideo) "vid" else "img"}_$mediaId")
                            putDouble("mediaStoreId", mediaId.toDouble())
                            putString("uri", contentUri)
                            putString("name", displayName)
                            putString("mimeType", mime)
                            putString("mediaType", if (isRealVideo) "video" else "image")
                            putDouble("size", size.toDouble())
                            putString("relativePath", path)
                            putDouble("dateAdded", dateAdded.toDouble())
                            putDouble("dateModified", dateModified.toDouble())
                            putInt("width", width)
                            putInt("height", height)
                            putDouble("duration", duration.toDouble())
                            putString("sourceType", "mediastore")
                        }

                        targetList.pushMap(item)
                        onItemFound(size)
                    }
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        } finally {
            cursor?.close()
        }
    }

    private fun isWhatsAppMedia(name: String, path: String): Boolean {
        val lowerPath = path.lowercase()
        val lowerName = name.lowercase()

        // 1. Path matches modern or legacy WhatsApp directories
        val matchesPath = lowerPath.contains("com.whatsapp") ||
                lowerPath.contains("whatsapp") ||
                lowerPath.contains("whatsapp images") ||
                lowerPath.contains("whatsapp video") ||
                lowerPath.contains("whatsapp business") ||
                lowerPath.contains("com.whatsapp.w4b")

        if (matchesPath) return true

        // 2. Standard WhatsApp filename patterns:
        // IMG-YYYYMMDD-WA0000.jpg, VID-YYYYMMDD-WA0000.mp4, etc.
        val matchesNamePattern = lowerName.startsWith("img-") && lowerName.contains("-wa") ||
                lowerName.startsWith("vid-") && lowerName.contains("-wa") ||
                lowerName.startsWith("wa-") ||
                lowerName.contains("whatsapp")

        return matchesNamePattern
    }

    // =========================================================================
    // SYSTEM-AUTHORIZED DELETION
    // =========================================================================

    @ReactMethod
    fun deleteMediaItems(uriStrings: ReadableArray, promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        val uris = mutableListOf<Uri>()
        val uriList = mutableListOf<String>()
        for (i in 0 until uriStrings.size()) {
            val s = uriStrings.getString(i)
            if (!s.isNullOrEmpty()) {
                uris.add(Uri.parse(s))
                uriList.add(s)
            }
        }

        if (uris.isEmpty()) {
            val emptyResult = Arguments.createMap().apply {
                putString("status", "completed")
                putInt("requestedCount", 0)
                putInt("deletedCount", 0)
                putArray("deletedUris", Arguments.createArray())
                putArray("failedUris", Arguments.createArray())
            }
            promise.resolve(emptyResult)
            return
        }

        pendingDeletePromise = promise
        pendingDeleteUris = uriList

        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) { // Android 11+
                val pi = MediaStore.createDeleteRequest(reactContext.contentResolver, uris)
                activity.startIntentSenderForResult(
                    pi.intentSender,
                    REQUEST_CODE_DELETE,
                    null,
                    0,
                    0,
                    0
                )
            } else {
                // Android 10 and below: direct contentResolver.delete
                moduleScope.launch {
                    val deleted = Arguments.createArray()
                    val failed = Arguments.createArray()
                    var deletedCount = 0

                    for (uri in uris) {
                        try {
                            val rows = reactContext.contentResolver.delete(uri, null, null)
                            if (rows > 0) {
                                deleted.pushString(uri.toString())
                                deletedCount++
                            } else {
                                failed.pushString(uri.toString())
                            }
                        } catch (e: Exception) {
                            failed.pushString(uri.toString())
                        }
                    }

                    val res = Arguments.createMap().apply {
                        putString("status", "completed")
                        putInt("requestedCount", uris.size)
                        putInt("deletedCount", deletedCount)
                        putArray("deletedUris", deleted)
                        putArray("failedUris", failed)
                    }

                    pendingDeletePromise?.resolve(res)
                    pendingDeletePromise = null
                }
            }
        } catch (e: Exception) {
            pendingDeletePromise = null
            promise.reject("DELETE_REQUEST_FAILED", e.message, e)
        }
    }

    private fun verifyDeletedUris(requestedUris: List<String>) {
        moduleScope.launch {
            val deleted = Arguments.createArray()
            val failed = Arguments.createArray()
            var deletedCount = 0

            val cr = reactContext.contentResolver
            for (uriStr in requestedUris) {
                var exists = false
                try {
                    val u = Uri.parse(uriStr)
                    cr.query(u, arrayOf(MediaStore.MediaColumns._ID), null, null, null)?.use { cursor ->
                        if (cursor.moveToFirst()) {
                            exists = true
                        }
                    }
                } catch (e: Exception) {
                    exists = false
                }

                if (!exists) {
                    deleted.pushString(uriStr)
                    deletedCount++
                } else {
                    failed.pushString(uriStr)
                }
            }

            val res = Arguments.createMap().apply {
                putString("status", if (deletedCount == requestedUris.size) "completed" else "partial")
                putInt("requestedCount", requestedUris.size)
                putInt("deletedCount", deletedCount)
                putArray("deletedUris", deleted)
                putArray("failedUris", failed)
            }

            pendingDeletePromise?.resolve(res)
            pendingDeletePromise = null
            pendingDeleteUris = emptyList()
        }
    }

    // =========================================================================
    // STORAGE ACCESS FRAMEWORK (SAF) FALLBACK
    // =========================================================================

    @ReactMethod
    fun pickWhatsAppFolder(promise: Promise) {
        val activity = reactContext.currentActivity
        if (activity == null) {
            promise.reject("NO_ACTIVITY", "Current activity is null")
            return
        }

        try {
            pendingFolderPromise = promise
            val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE).apply {
                addFlags(
                    Intent.FLAG_GRANT_READ_URI_PERMISSION or
                            Intent.FLAG_GRANT_WRITE_URI_PERMISSION or
                            Intent.FLAG_GRANT_PERSISTABLE_URI_PERMISSION
                )
            }
            activity.startActivityForResult(intent, REQUEST_CODE_PICK_FOLDER)
        } catch (e: Exception) {
            pendingFolderPromise = null
            promise.reject("SAF_PICK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun scanDocumentFolder(treeUriString: String, promise: Promise) {
        moduleScope.launch {
            try {
                val treeUri = Uri.parse(treeUriString)
                val docId = DocumentsContract.getTreeDocumentId(treeUri)
                val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, docId)

                val mediaList = Arguments.createArray()
                var totalBytes: Long = 0
                var count = 0

                val cr = reactContext.contentResolver
                cr.query(
                    childrenUri,
                    arrayOf(
                        DocumentsContract.Document.COLUMN_DOCUMENT_ID,
                        DocumentsContract.Document.COLUMN_DISPLAY_NAME,
                        DocumentsContract.Document.COLUMN_MIME_TYPE,
                        DocumentsContract.Document.COLUMN_SIZE,
                        DocumentsContract.Document.COLUMN_LAST_MODIFIED
                    ),
                    null,
                    null,
                    null
                )?.use { cursor ->
                    val idCol = cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_DOCUMENT_ID)
                    val nameCol = cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_DISPLAY_NAME)
                    val mimeCol = cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_MIME_TYPE)
                    val sizeCol = cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_SIZE)
                    val dateCol = cursor.getColumnIndexOrThrow(DocumentsContract.Document.COLUMN_LAST_MODIFIED)

                    while (cursor.moveToNext()) {
                        val childDocId = cursor.getString(idCol)
                        val name = cursor.getString(nameCol) ?: ""
                        val mime = cursor.getString(mimeCol) ?: ""
                        val size = if (!cursor.isNull(sizeCol)) cursor.getLong(sizeCol) else 0L
                        val date = if (!cursor.isNull(dateCol)) cursor.getLong(dateCol) else 0L

                        val isImage = mime.startsWith("image/")
                        val isVideo = mime.startsWith("video/")

                        if (isImage || isVideo) {
                            val docUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, childDocId)
                            val item = Arguments.createMap().apply {
                                putString("id", "saf_$childDocId")
                                putString("uri", docUri.toString())
                                putString("name", name)
                                putString("mimeType", mime)
                                putString("mediaType", if (isVideo) "video" else "image")
                                putDouble("size", size.toDouble())
                                putString("relativePath", "SAF Document Tree")
                                putDouble("dateAdded", (date / 1000).toDouble())
                                putDouble("dateModified", (date / 1000).toDouble())
                                putInt("width", 0)
                                putInt("height", 0)
                                putDouble("duration", 0.0)
                                putString("sourceType", "saf")
                            }
                            mediaList.pushMap(item)
                            totalBytes += size
                            count++
                        }
                    }
                }

                val result = Arguments.createMap().apply {
                    putInt("totalCount", count)
                    putDouble("totalSizeBytes", totalBytes.toDouble())
                    putArray("items", mediaList)
                }
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("SAF_SCAN_ERROR", e.message, e)
            }
        }
    }

    // =========================================================================
    // APP INFO & IN-APP APK UPDATE SYSTEM
    // =========================================================================

    @ReactMethod
    fun getAppInfo(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val pInfo = pm.getPackageInfo(reactContext.packageName, 0)
            val versionCode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                pInfo.versionCode.toLong()
            }

            val result = Arguments.createMap().apply {
                putString("packageName", reactContext.packageName)
                putString("versionName", pInfo.versionName ?: "1.0.0")
                putDouble("versionCode", versionCode.toDouble())
                putInt("minSdkVersion", 26)
                putInt("targetSdkVersion", Build.VERSION.SDK_INT)
            }
            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("APP_INFO_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun canInstallPackages(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                promise.resolve(reactContext.packageManager.canRequestPackageInstalls())
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("INSTALL_CHECK_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun openInstallPermissionSettings(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${reactContext.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                reactContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.reject("INSTALL_SETTINGS_ERROR", e.message, e)
        }
    }

    @ReactMethod
    fun downloadApk(urlStr: String, expectedSha256: String?, promise: Promise) {
        if (!urlStr.startsWith("https://")) {
            promise.reject("INVALID_URL", "Only HTTPS URLs are permitted for APK downloads")
            return
        }

        isDownloadCancelled.set(false)

        currentDownloadJob = moduleScope.launch {
            var connection: HttpURLConnection? = null
            var inputStream: InputStream? = null
            var outputStream: FileOutputStream? = null

            try {
                val url = URL(urlStr)
                connection = url.openConnection() as HttpURLConnection
                connection.connectTimeout = 15000
                connection.readTimeout = 30000
                connection.requestMethod = "GET"
                connection.setRequestProperty("Accept-Encoding", "identity")
                connection.connect()

                val responseCode = connection.responseCode
                if (responseCode != HttpURLConnection.HTTP_OK) {
                    promise.reject("HTTP_ERROR", "Server returned HTTP $responseCode")
                    return@launch
                }

                val totalLength = connection.contentLength.toLong()
                val updatesDir = File(reactContext.cacheDir, "apk_updates").apply { mkdirs() }
                val targetFile = File(updatesDir, "update-${System.currentTimeMillis()}.apk")

                inputStream = connection.inputStream
                outputStream = FileOutputStream(targetFile)

                val buffer = ByteArray(8192)
                var bytesRead: Int
                var totalBytesRead: Long = 0
                val digest = MessageDigest.getInstance("SHA-256")
                var lastProgressEmit = 0L

                while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                    if (isDownloadCancelled.get()) {
                        targetFile.delete()
                        promise.reject("DOWNLOAD_CANCELLED", "Download was cancelled by user")
                        return@launch
                    }

                    outputStream.write(buffer, 0, bytesRead)
                    digest.update(buffer, 0, bytesRead)
                    totalBytesRead += bytesRead

                    val now = System.currentTimeMillis()
                    if (now - lastProgressEmit > 200 || totalBytesRead == totalLength) {
                        lastProgressEmit = now
                        val percent = if (totalLength > 0) ((totalBytesRead * 100) / totalLength).toInt() else 0
                        emitDownloadProgress(percent, totalBytesRead, totalLength)
                    }
                }

                outputStream.flush()

                // Calculate computed SHA-256
                val hashBytes = digest.digest()
                val computedSha256 = hashBytes.joinToString("") { "%02x".format(it) }

                val checksumVerified = if (!expectedSha256.isNullOrBlank()) {
                    computedSha256.equals(expectedSha256.trim(), ignoreCase = true)
                } else {
                    false
                }

                if (!expectedSha256.isNullOrBlank() && !checksumVerified) {
                    targetFile.delete()
                    promise.reject("CHECKSUM_MISMATCH", "SHA-256 mismatch. Expected: $expectedSha256, got: $computedSha256")
                    return@launch
                }

                val result = Arguments.createMap().apply {
                    putString("filePath", targetFile.absolutePath)
                    putDouble("fileSize", targetFile.length().toDouble())
                    putString("sha256", computedSha256)
                    putBoolean("checksumVerified", checksumVerified)
                    putString("expectedSha256", expectedSha256)
                }

                promise.resolve(result)

            } catch (e: Exception) {
                if (isDownloadCancelled.get()) {
                    promise.reject("DOWNLOAD_CANCELLED", "Download cancelled")
                } else {
                    promise.reject("DOWNLOAD_FAILED", e.message, e)
                }
            } finally {
                outputStream?.close()
                inputStream?.close()
                connection?.disconnect()
            }
        }
    }

    @ReactMethod
    fun cancelDownload(promise: Promise) {
        isDownloadCancelled.set(true)
        currentDownloadJob?.cancel()
        promise.resolve(true)
    }

    private fun emitDownloadProgress(percent: Int, downloaded: Long, total: Long) {
        val params = Arguments.createMap().apply {
            putInt("percent", percent)
            putDouble("downloadedBytes", downloaded.toDouble())
            putDouble("totalBytes", total.toDouble())
        }
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            ?.emit("onDownloadProgress", params)
    }

    @ReactMethod
    fun installApk(filePath: String, promise: Promise) {
        try {
            val file = File(filePath)
            if (!file.exists()) {
                promise.reject("FILE_NOT_FOUND", "APK file does not exist at $filePath")
                return
            }

            val contentUri = FileProvider.getUriForFile(
                reactContext,
                "${reactContext.packageName}.fileprovider",
                file
            )

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            reactContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("INSTALL_LAUNCH_ERROR", e.message, e)
        }
    }

    // =========================================================================
    // LOCAL ATOMIC STORAGE (SESSIONS & SETTINGS)
    // =========================================================================

    @ReactMethod
    fun saveData(key: String, jsonString: String, promise: Promise) {
        moduleScope.launch {
            try {
                val file = File(reactContext.filesDir, "store_${key}.json")
                file.writeText(jsonString, Charsets.UTF_8)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("SAVE_DATA_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun loadData(key: String, promise: Promise) {
        moduleScope.launch {
            try {
                val file = File(reactContext.filesDir, "store_${key}.json")
                if (file.exists()) {
                    val text = file.readText(Charsets.UTF_8)
                    promise.resolve(text)
                } else {
                    promise.resolve(null)
                }
            } catch (e: Exception) {
                promise.reject("LOAD_DATA_ERROR", e.message, e)
            }
        }
    }

    @ReactMethod
    fun getThumbnail(uriString: String, isVideo: Boolean, promise: Promise) {
        moduleScope.launch {
            try {
                val uri = Uri.parse(uriString)
                val cleanSeg = uri.lastPathSegment?.replace(Regex("[^a-zA-Z0-9_-]"), "_") ?: "tmp"
                val thumbsDir = File(reactContext.cacheDir, "thumbs")
                if (!thumbsDir.exists()) {
                    thumbsDir.mkdirs()
                }
                val thumbFile = File(thumbsDir, "th_${cleanSeg}.jpg")
                if (thumbFile.exists() && thumbFile.length() > 0) {
                    promise.resolve("file://${thumbFile.absolutePath}")
                    return@launch
                }

                var bitmap: Bitmap? = null
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    try {
                        bitmap = reactContext.contentResolver.loadThumbnail(uri, Size(512, 512), null)
                    } catch (e: Exception) {
                        bitmap = null
                    }
                }

                if (bitmap == null) {
                    try {
                        val id = ContentUris.parseId(uri)
                        bitmap = if (isVideo) {
                            MediaStore.Video.Thumbnails.getThumbnail(
                                reactContext.contentResolver,
                                id,
                                MediaStore.Video.Thumbnails.MINI_KIND,
                                null
                            )
                        } else {
                            MediaStore.Images.Thumbnails.getThumbnail(
                                reactContext.contentResolver,
                                id,
                                MediaStore.Images.Thumbnails.MINI_KIND,
                                null
                            )
                        }
                    } catch (e: Exception) {
                        bitmap = null
                    }
                }

                if (bitmap != null) {
                    FileOutputStream(thumbFile).use { out ->
                        bitmap.compress(Bitmap.CompressFormat.JPEG, 80, out)
                    }
                    bitmap.recycle()
                    promise.resolve("file://${thumbFile.absolutePath}")
                } else {
                    promise.resolve(null)
                }
            } catch (e: Exception) {
                promise.resolve(null)
            }
        }
    }

    // =========================================================================
    // ACTIVITY EVENT LISTENER
    // =========================================================================

    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        if (requestCode == REQUEST_CODE_DELETE) {
            if (resultCode == Activity.RESULT_OK) {
                // System deletion was authorized by user! Verify what got deleted.
                verifyDeletedUris(pendingDeleteUris)
            } else {
                // System deletion was cancelled or denied by user
                val res = Arguments.createMap().apply {
                    putString("status", "cancelled")
                    putInt("requestedCount", pendingDeleteUris.size)
                    putInt("deletedCount", 0)
                    putArray("deletedUris", Arguments.createArray())
                    putArray("failedUris", Arguments.createArray())
                }
                pendingDeletePromise?.resolve(res)
                pendingDeletePromise = null
                pendingDeleteUris = emptyList()
            }
        } else if (requestCode == REQUEST_CODE_PICK_FOLDER) {
            if (resultCode == Activity.RESULT_OK && data?.data != null) {
                val uri = data.data!!
                val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                reactContext.contentResolver.takePersistableUriPermission(uri, takeFlags)
                pendingFolderPromise?.resolve(uri.toString())
            } else {
                pendingFolderPromise?.reject("SAF_CANCELLED", "User cancelled folder selection")
            }
            pendingFolderPromise = null
        }
    }

    override fun onNewIntent(intent: Intent) {}
}

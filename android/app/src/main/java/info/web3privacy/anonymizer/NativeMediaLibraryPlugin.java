package info.web3privacy.anonymizer;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.provider.MediaStore;
import android.util.Base64;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.io.OutputStream;

@CapacitorPlugin(name = "NativeMediaLibrary")
public class NativeMediaLibraryPlugin extends Plugin {
    @PluginMethod
    public void saveMedia(PluginCall call) {
        String rawData = call.getString("data", "");
        String mediaType = call.getString("mediaType", "photo");
        String mimeType = call.getString("mimeType", mediaType.equals("video") ? "video/mp4" : "image/jpeg");
        String fileName = sanitizeFileName(call.getString("fileName"), mimeType, mediaType);

        if (rawData.isEmpty()) {
            call.reject("Missing media data.");
            return;
        }
        if (!mediaType.equals("photo") && !mediaType.equals("video")) {
            call.reject("Unsupported media type.");
            return;
        }

        try {
            String base64 = rawData.contains(",") ? rawData.substring(rawData.indexOf(",") + 1) : rawData;
            byte[] bytes = Base64.decode(base64, Base64.DEFAULT);
            Uri uri = writeToMediaStore(bytes, fileName, mimeType, mediaType);
            JSObject result = new JSObject();
            result.put("uri", uri.toString());
            call.resolve(result);
        } catch (Exception e) {
            call.reject("Could not save media: " + e.getMessage(), e);
        }
    }

    private Uri writeToMediaStore(byte[] bytes, String fileName, String mimeType, String mediaType) throws Exception {
        ContentResolver resolver = getContext().getContentResolver();
        boolean isVideo = mediaType.equals("video");
        Uri collection;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            collection = isVideo
                ? MediaStore.Video.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY)
                : MediaStore.Images.Media.getContentUri(MediaStore.VOLUME_EXTERNAL_PRIMARY);
        } else {
            collection = isVideo
                ? MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                : MediaStore.Images.Media.EXTERNAL_CONTENT_URI;
        }

        ContentValues values = new ContentValues();
        values.put(MediaStore.MediaColumns.DISPLAY_NAME, fileName);
        values.put(MediaStore.MediaColumns.MIME_TYPE, mimeType);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            String directory = isVideo ? Environment.DIRECTORY_MOVIES : Environment.DIRECTORY_PICTURES;
            values.put(MediaStore.MediaColumns.RELATIVE_PATH, directory + "/W3PN Anonymizer");
            values.put(MediaStore.MediaColumns.IS_PENDING, 1);
        }

        Uri uri = resolver.insert(collection, values);
        if (uri == null) throw new Exception("MediaStore insert failed.");

        try (OutputStream out = resolver.openOutputStream(uri)) {
            if (out == null) throw new Exception("Could not open media output stream.");
            out.write(bytes);
        } catch (Exception e) {
            resolver.delete(uri, null, null);
            throw e;
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            ContentValues done = new ContentValues();
            done.put(MediaStore.MediaColumns.IS_PENDING, 0);
            resolver.update(uri, done, null, null);
        }

        return uri;
    }

    private String sanitizeFileName(String fileName, String mimeType, String mediaType) {
        String fallbackExt;
        if (mimeType.contains("webm")) fallbackExt = "webm";
        else if (mimeType.contains("quicktime")) fallbackExt = "mov";
        else if (mimeType.contains("png")) fallbackExt = "png";
        else if (mimeType.contains("webp")) fallbackExt = "webp";
        else fallbackExt = mediaType.equals("video") ? "mp4" : "jpg";

        String raw = fileName == null || fileName.isEmpty() ? "w3pn-capture." + fallbackExt : fileName;
        int slash = Math.max(raw.lastIndexOf('/'), raw.lastIndexOf('\\'));
        if (slash >= 0) raw = raw.substring(slash + 1);
        String cleaned = raw.replaceAll("[^A-Za-z0-9._-]+", "-").replaceAll("^-+|-+$", "");
        if (cleaned.isEmpty()) cleaned = "w3pn-capture." + fallbackExt;
        return cleaned.matches(".*\\.[A-Za-z0-9]{2,5}$") ? cleaned : cleaned + "." + fallbackExt;
    }
}

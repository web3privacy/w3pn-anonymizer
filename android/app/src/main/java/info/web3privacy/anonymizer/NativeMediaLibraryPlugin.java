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
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.util.UUID;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import android.content.Intent;
import android.content.ClipData;
import androidx.core.content.FileProvider;

@CapacitorPlugin(name = "NativeMediaLibrary")
public class NativeMediaLibraryPlugin extends Plugin {
    private static class Export {
        File file;
        String name, mime, type;
    }
    private final Map<String, Export> exports = new ConcurrentHashMap<>();

    @Override public void load() {
        // Stale shares survive only until the next app launch; never erase an active share.
        File dir = new File(getContext().getCacheDir(), "anonymizer-exports");
        File[] dirs = dir.listFiles();
        if (dirs != null) for (File sub : dirs) {
            File[] files = sub.listFiles();
            if (files != null) for (File file : files) file.delete();
            sub.delete();
        }
    }

    @PluginMethod public void beginExport(PluginCall call) {
        try {
            Export entry = new Export();
            entry.type = call.getString("mediaType", "file");
            entry.mime = call.getString("mimeType", "application/octet-stream");
            entry.name = sanitizeFileName(call.getString("fileName"), entry.mime, entry.type);
            String id = UUID.randomUUID().toString();
            File dir = new File(getContext().getCacheDir(), "anonymizer-exports/" + id);
            if (!dir.mkdirs()) throw new Exception("Could not create export directory.");
            entry.file = new File(dir, entry.name);
            if (!entry.file.createNewFile()) throw new Exception("Could not create export file.");
            exports.put(id, entry);
            JSObject result = new JSObject(); result.put("id", id); call.resolve(result);
        } catch (Exception e) { call.reject("Could not prepare export.", e); }
    }

    @PluginMethod public void appendExport(PluginCall call) {
        Export entry = exports.get(call.getString("id", ""));
        if (entry == null) { call.reject("Export expired."); return; }
        String data = call.getString("data", "");
        if (data.length() > 350000) { call.reject("Export chunk too large."); return; }
        try (FileOutputStream out = new FileOutputStream(entry.file, true)) {
            out.write(Base64.decode(data, Base64.DEFAULT)); call.resolve();
        } catch (Exception e) { call.reject("Could not write export.", e); }
    }

    @PluginMethod public void cancelExport(PluginCall call) {
        Export entry = exports.remove(call.getString("id", ""));
        if (entry != null) { entry.file.delete(); entry.file.getParentFile().delete(); }
        call.resolve();
    }

    @PluginMethod public void finishExport(PluginCall call) {
        String id = call.getString("id", "");
        Export entry = exports.get(id);
        if (entry == null) { call.reject("Export expired."); return; }
        // Android 9 and earlier use the save/share sheet instead of requiring broad storage access.
        if (entry.type.equals("file") || Build.VERSION.SDK_INT < Build.VERSION_CODES.Q) {
            getActivity().runOnUiThread(() -> {
                try {
                    Uri uri = FileProvider.getUriForFile(getContext(), getContext().getPackageName() + ".fileprovider", entry.file);
                    Intent send = new Intent(Intent.ACTION_SEND);
                    send.setType(entry.mime);
                    send.putExtra(Intent.EXTRA_STREAM, uri);
                    send.setClipData(ClipData.newRawUri(entry.name, uri));
                    send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                    getActivity().startActivity(Intent.createChooser(send, "Save or share export"));
                    exports.remove(id); // Keep file until next launch so the receiving app can read it.
                    call.resolve();
                } catch (Exception e) { call.reject("Could not open share sheet.", e); }
            });
            return;
        }
        try {
            Uri uri = writeToMediaStore(entry.file, entry.name, entry.mime, entry.type);
            entry.file.delete(); entry.file.getParentFile().delete(); exports.remove(id);
            JSObject result = new JSObject(); result.put("uri", uri.toString()); call.resolve(result);
        } catch (Exception e) { call.reject("Could not save media.", e); }
    }

    private Uri writeToMediaStore(File file, String fileName, String mimeType, String mediaType) throws Exception {
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
            try (FileInputStream input = new FileInputStream(file)) {
                byte[] buffer = new byte[256 * 1024];
                int count;
                while ((count = input.read(buffer)) != -1) out.write(buffer, 0, count);
            }
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

package info.web3privacy.anonymizer;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        registerPlugin(NativeMediaLibraryPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

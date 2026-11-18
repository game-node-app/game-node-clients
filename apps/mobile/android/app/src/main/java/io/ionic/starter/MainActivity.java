package app.gamenode;

import android.os.Bundle;

import com.getcapacitor.BridgeActivity;

import app.gamenode.widget.WrappedWidgetPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(WrappedWidgetPlugin.class);
        super.onCreate(savedInstanceState);
    }
}

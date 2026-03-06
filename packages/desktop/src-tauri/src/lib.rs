use tauri::Manager;

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to Orthrus.", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet])
        .setup(|app| {
            #[cfg(target_os = "macos")]
            {
                use objc2_app_kit::{NSColor, NSWindow};

                let window = app.get_webview_window("main").unwrap();
                let ns_window: &NSWindow =
                    unsafe { &*(window.ns_window().unwrap() as *const NSWindow) };

                // Set background color to match --bg-panel (#161b22)
                // RGB: 22/255, 27/255, 34/255
                let bg_color = NSColor::colorWithSRGBRed_green_blue_alpha(
                    22.0 / 255.0,
                    27.0 / 255.0,
                    34.0 / 255.0,
                    1.0,
                );
                ns_window.setBackgroundColor(Some(&bg_color));
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running Orthrus");
}

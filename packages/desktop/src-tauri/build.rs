use std::process::Command;

fn main() {
    // Embed git commit hash at compile time
    let hash = Command::new("git")
        .args(["rev-parse", "--short=7", "HEAD"])
        .output()
        .ok()
        .and_then(|o| String::from_utf8(o.stdout).ok())
        .unwrap_or_else(|| "unknown".to_string());

    println!("cargo:rustc-env=GIT_HASH={}", hash.trim());

    tauri_build::build();
}

fn main() {
    let env_content = std::fs::read_to_string("../.env").unwrap_or_default();
    for line in env_content.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some((key, value)) = line.split_once('=') {
            println!("cargo:rustc-env={}={}", key.trim(), value.trim().trim_matches('"'));
        }
    }
    tauri_build::build()
}

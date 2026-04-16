// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod ytdlp;
mod auth;
mod discord_rpc;
use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let discord_state = discord_rpc::start_discord_rpc(
                env!("VITE_DISCORD_CLIENT_ID").to_string(),
                "https://discord.gg/sDFJTAurBT".to_string()
            );
            app.manage(discord_state);
            Ok(())
        })
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            ytdlp::check_ytdlp,
            ytdlp::get_default_dir,
            ytdlp::install_ffmpeg,
            ytdlp::install_ytdlp,
            ytdlp::get_video_info,
            ytdlp::get_playlist_info,
            ytdlp::download_video,
            auth::discord_login
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

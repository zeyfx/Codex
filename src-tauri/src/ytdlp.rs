use std::fs;
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::io::{BufReader, BufRead, Read};
use tauri::{AppHandle, Emitter};
use serde_json::Value;

// Constants
fn get_bin_dir() -> PathBuf {
    let path = PathBuf::from("C:\\Codex");
    fs::create_dir_all(&path).unwrap_or_default();
    path
}

fn get_ytdlp_path() -> PathBuf {
    get_bin_dir().join("yt-dlp.exe")
}

fn is_ffmpeg_installed() -> bool {
    let bin_dir = get_bin_dir();
    let ffmpeg = bin_dir.join("ffmpeg.exe");
    let ffprobe = bin_dir.join("ffprobe.exe");
    if ffmpeg.exists() && ffprobe.exists() {
        if let (Ok(f_meta), Ok(p_meta)) = (fs::metadata(&ffmpeg), fs::metadata(&ffprobe)) {
            return f_meta.len() > 1_000_000 && p_meta.len() > 1_000_000;
        }
    }
    false
}

fn is_ytdlp_installed() -> bool {
    let path = get_ytdlp_path();
    if path.exists() {
        if let Ok(meta) = fs::metadata(&path) {
            return meta.len() > 100_000;
        }
    }
    false
}

#[tauri::command]
pub fn check_ytdlp() -> Result<Value, String> {
    let ytdlp_installed = is_ytdlp_installed();
    let ffmpeg_installed = is_ffmpeg_installed();
    
    let mut version = String::new();
    if ytdlp_installed {
        if let Ok(output) = Command::new(get_ytdlp_path()).arg("--version").output() {
            version = String::from_utf8_lossy(&output.stdout).trim().to_string();
        }
    }

    Ok(serde_json::json!({
        "installed": ytdlp_installed,
        "version": version,
        "ffmpegReady": ffmpeg_installed,
        "path": get_ytdlp_path().to_string_lossy().to_string()
    }))
}

#[tauri::command]
pub fn get_default_dir() -> String {
    "C:\\Codex\\downloads".to_string()
}

// Emits events like "ytdlp:progress" and "ytdlp:status" 
#[tauri::command]
pub fn install_ytdlp(app: AppHandle) -> Result<(), String> {
    let _ = app.emit("ytdlp:status", serde_json::json!({ "type": "installing", "message": "Inicializando Motor de Captura..." }));
    
    let url = "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe";
    let path = get_ytdlp_path();
    
    let response = reqwest::blocking::get(url).map_err(|e| e.to_string())?;
    let bytes = response.bytes().map_err(|e| e.to_string())?;
    fs::write(&path, bytes).map_err(|e| e.to_string())?;
    
    let _ = app.emit("ytdlp:status", serde_json::json!({ "type": "ready", "message": "Motor de Captura pronto." }));
    Ok(())
}

#[tauri::command]
pub fn install_ffmpeg(app: AppHandle) -> Result<(), String> {
    let _ = app.emit("ytdlp:status", serde_json::json!({ "type": "installing", "message": "Sincronizando Componentes de Áudio..." }));
    
    let bin_dir = get_bin_dir();
    let url = "https://github.com/yt-dlp/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip";
    let zip_dest = bin_dir.join("ffmpeg.zip");

    let response = reqwest::blocking::get(url).map_err(|e| e.to_string())?;
    let bytes = response.bytes().map_err(|e| e.to_string())?;
    fs::write(&zip_dest, bytes).map_err(|e| e.to_string())?;

    let _ = app.emit("ytdlp:status", serde_json::json!({ "type": "installing", "message": "Ajustando drivers..." }));

    let file = fs::File::open(&zip_dest).map_err(|e| e.to_string())?;
    let mut archive = zip::ZipArchive::new(file).map_err(|e| e.to_string())?;

    for i in 0..archive.len() {
        let mut file = archive.by_index(i).unwrap();
        let outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };

        if let Some(name) = outpath.file_name() {
            let name_str = name.to_string_lossy().to_lowercase();
            if name_str == "ffmpeg.exe" || name_str == "ffprobe.exe" {
                let mut buf = Vec::new();
                file.read_to_end(&mut buf).unwrap();
                let dest = bin_dir.join(name);
                fs::write(dest, buf).unwrap();
            }
        }
    }

    let _ = fs::remove_file(&zip_dest);

    let _ = app.emit("ytdlp:status", serde_json::json!({ "type": "ready", "message": "Sincronização concluída." }));
    Ok(())
}

#[tauri::command]
pub fn get_video_info(url: String) -> Result<Value, String> {
    let mut cmd = Command::new(get_ytdlp_path());
    cmd.args(&[
        "--dump-json",
        "--no-playlist",
        "--no-warnings",
        "--skip-download",
        "--ignore-errors",
    ]);
    
    if is_ffmpeg_installed() {
        cmd.arg("--ffmpeg-location");
        cmd.arg(get_bin_dir());
    }
    
    cmd.arg(&url);

    let output = cmd.output().map_err(|e| e.to_string())?;
    let raw = String::from_utf8_lossy(&output.stdout);
    
    // Parse the JSON directly and return it as a value
    serde_json::from_str(&raw).map_err(|e| format!("Failed to parse JSON: {}", e))
}

#[tauri::command]
pub fn get_playlist_info(url: String) -> Result<Value, String> {
    let mut cmd = Command::new(get_ytdlp_path());
    cmd.args(&[
        "--dump-json",
        "--flat-playlist",
        "--no-warnings",
        "--ignore-errors",
    ]);
    cmd.arg(&url);

    let output = cmd.output().map_err(|e| e.to_string())?;
    let raw = String::from_utf8_lossy(&output.stdout);
    
    // Split by lines and parse each, as flat-playlist dumps multiple JSON entries
    let mut entries = Vec::new();
    for line in raw.lines() {
        if line.trim().is_empty() { continue; }
        if let Ok(entry) = serde_json::from_str::<Value>(line) {
            entries.push(entry);
        }
    }

    Ok(serde_json::json!({
        "entries": entries,
        "isPlaylist": entries.len() > 1
    }))
}

#[tauri::command]
pub fn download_video(
    app: AppHandle,
    url: String, 
    output_dir: String,
    format: String,
    audio_only: bool,
    audio_format: String,
    audio_quality: String,
    merge_format: String,
    embed_thumbnail: bool,
    embed_metadata: bool,
    embed_subtitles: bool,
    subtitle_langs: String,
    sponsorblock_remove: bool,
    video_format_id: String,
    audio_format_id: String
) -> Result<(), String> {
    let mut cmd = Command::new(get_ytdlp_path());
    
    cmd.args(&[
        "-o", &format!("{}/%(title)s.%(ext)s", output_dir),
        "--newline",
        "--no-warnings",
        "--no-playlist",
        "--progress-template", "download:[progress] %(progress._percent_str)s of %(progress._total_bytes_str)s at %(progress._speed_str)s ETA %(progress._eta_str)s",
    ]);

    if is_ffmpeg_installed() {
        cmd.arg("--ffmpeg-location");
        cmd.arg(get_bin_dir());
    }

    if audio_only {
        cmd.arg("-x");
        if audio_format != "" && audio_format != "best" {
            cmd.arg("--audio-format");
            cmd.arg(&audio_format);
        }
        cmd.arg("--audio-quality");
        cmd.arg(&audio_quality);

        if !audio_format_id.is_empty() {
            cmd.args(&["-f", &audio_format_id]);
        }
    } else {
        if !video_format_id.is_empty() && !audio_format_id.is_empty() {
            cmd.args(&["-f", &format!("{}+{}/bv*+ba/b", video_format_id, audio_format_id)]);
        } else if !video_format_id.is_empty() {
            cmd.args(&["-f", &format!("{}+ba/bv*+ba/b", video_format_id)]);
        } else if format != "best" && !format.is_empty() {
            cmd.args(&["-f", &format!("{}/bv*+ba/b", format)]);
        } else {
            cmd.args(&["-f", "bv*+ba/b"]);
        }

        if !merge_format.is_empty() {
            cmd.arg("--merge-output-format");
            cmd.arg(&merge_format);
        }
    }

    if embed_thumbnail {
        cmd.arg("--embed-thumbnail");
    }
    if embed_metadata {
        cmd.arg("--embed-metadata");
    }
    if embed_subtitles && !subtitle_langs.is_empty() {
        cmd.args(&["--write-subs", "--embed-subs", "--sub-langs", &subtitle_langs]);
    }
    if sponsorblock_remove {
        cmd.args(&["--sponsorblock-remove", "default"]);
    }

    cmd.arg(&url);

    cmd.stdout(Stdio::piped());
    cmd.stderr(Stdio::piped());

    let mut process = cmd.spawn().map_err(|e| e.to_string())?;

    if let Some(stdout) = process.stdout.take() {
        let reader = BufReader::new(stdout);
        let app_handle = app.clone();
        
        std::thread::spawn(move || {
            for line in reader.lines() {
                if let Ok(line) = line {
                    // Simple regex replacement / progress parsing
                    if line.contains("[progress]") {
                        let parts: Vec<&str> = line.split(" at ").collect();
                        if parts.len() >= 2 {
                            let percent_size_pt = parts[0].replace("download:[progress]", "");
                            let ps_parts: Vec<&str> = percent_size_pt.trim().split(" of ").collect();
                            
                            let speed_eta_pt = parts[1];
                            let se_parts: Vec<&str> = speed_eta_pt.trim().split(" ETA ").collect();

                            if ps_parts.len() == 2 && se_parts.len() == 2 {
                                let percent_str = ps_parts[0].replace("%", "").trim().to_string();
                                let mut percent = 0.0;
                                if let Ok(p) = percent_str.parse::<f64>() { percent = p; }

                                let _ = app_handle.emit("ytdlp:progress", serde_json::json!({
                                    "percent": percent,
                                    "size": ps_parts[1].trim(),
                                    "speed": se_parts[0].trim(),
                                    "eta": se_parts[1].trim()
                                }));
                            }
                        }
                    } else if line.contains("[download]") && line.contains("of") && line.contains("ETA") {
                        let _ = app_handle.emit("ytdlp:progress", serde_json::json!({
                            "percent": 50.0,
                            "size": "-",
                            "speed": "-",
                            "eta": "Downloading..."
                        }));
                    } else if line.contains("[Merger]") || line.contains("[ExtractAudio]") || line.contains("has already been downloaded") {
                        let _ = app_handle.emit("ytdlp:progress", serde_json::json!({
                            "percent": 100.0,
                            "size": "-",
                            "speed": "-",
                            "eta": "Concluído"
                        }));
                    }
                }
            }
        });
    }

    let status = process.wait().map_err(|e| e.to_string())?;
    
    if status.success() {
        Ok(())
    } else {
        Err("yt-dlp exited with error code".to_string())
    }
}

import { invoke } from '@tauri-apps/api/core';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { open } from '@tauri-apps/plugin-dialog';
import { listen } from '@tauri-apps/api/event';

export const api = {
  startDragging: () => getCurrentWindow().startDragging(),
  minimizeWindow: () => getCurrentWindow().minimize(),
  maximizeWindow: async () => {
    const win = getCurrentWindow();
    if (await win.isMaximized()) {
      win.unmaximize();
    } else {
      win.maximize();
    }
  },
  forceMaximize: () => getCurrentWindow().maximize(),
  focusWindow: () => {
    const win = getCurrentWindow();
    win.setFocus();
  },
  closeWindow: () => getCurrentWindow().close(),

  // ytdlp wrappers
  ytdlpCheck: () => invoke('check_ytdlp'),
  ytdlpDefaultDir: () => invoke('get_default_dir'),
  ytdlpInfo: (url: string) => invoke('get_video_info', { url }),
  ytdlpPlaylistInfo: (url: string) => invoke('get_playlist_info', { url }),
  ytdlpChooseFolder: async () => {
    const selected = await open({ directory: true });
    return selected;
  },
  ytdlpInstall: () => invoke('install_ytdlp'),
  ytdlpInstallFfmpeg: () => invoke('install_ffmpeg'),
  ytdlpDownload: (options: any) => invoke('download_video', {
    url: options.url,
    outputDir: options.outputDir,
    format: options.format,
    audioOnly: options.audioOnly,
    audioFormat: options.audioFormat,
    audioQuality: options.audioQuality,
    mergeFormat: options.mergeFormat,
    embedThumbnail: options.embedThumbnail,
    embedMetadata: options.embedMetadata,
    embedSubtitles: options.embedSubtitles,
    subtitleLangs: options.subtitleLangs,
    sponsorblockRemove: options.sponsorblockRemove,
    videoFormatId: options.videoFormatId,
    audioFormatId: options.audioFormatId
  }),

  // Events
  onYtdlpProgress: (cb: (data: any) => void) => {
    const unlisten = listen('ytdlp:progress', (event) => cb(event.payload));
    return async () => (await unlisten)();
  },
  onYtdlpStatus: (cb: (data: any) => void) => {
    const unlisten = listen('ytdlp:status', (event) => cb(event.payload));
    return async () => (await unlisten)();
  },

  // Auth
  discordLogin: () => invoke('discord_login', { clientId: (import.meta as any).env.VITE_DISCORD_CLIENT_ID })
};

// Set global explicitly for remaining code
;(window as any).api = api;

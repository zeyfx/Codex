use discord_rich_presence::{activity, DiscordIpc, DiscordIpcClient};
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

pub struct DiscordState {
    #[allow(dead_code)]
    pub client: Arc<Mutex<Option<DiscordIpcClient>>>,
}

pub fn start_discord_rpc(client_id: String, server_url: String) -> DiscordState {
    let client_arc = Arc::new(Mutex::new(None));
    let client_clone = client_arc.clone();

    thread::spawn(move || {
        loop {
            let mut client = DiscordIpcClient::new(&client_id);

            match client.connect() {
                Ok(_) => {
                    log::info!("Connected to Discord RPC");
                    
                    let activity = activity::Activity::new()
                        .state("Criado por Vortex")
                        .details("Explorando o Catálogo")
                        .assets(activity::Assets::new()
                            .large_image("logo_large")
                            .large_text("Codex")
                            .small_image("logo_small")
                            .small_text("Criado por Vortex")
                        )
                        .timestamps(activity::Timestamps::new()
                            .start(std::time::SystemTime::now()
                                .duration_since(std::time::UNIX_EPOCH)
                                .unwrap()
                                .as_secs() as i64)
                        )
                        .buttons(vec![
                            activity::Button::new("Acesse o Codex", &server_url)
                        ]);

                    if let Err(e) = client.set_activity(activity) {
                        log::error!("Failed to set Discord activity: {}", e);
                    }

                    // Store client so it's kept alive
                    *client_clone.lock().unwrap() = Some(client);
                    break;
                }
                Err(_e) => {
                    // It will fail if discord is not open. Try again later.
                    log::warn!("Could not connect to Discord RPC (is Discord running?). Retrying in 15 seconds...");
                    thread::sleep(Duration::from_secs(15));
                }
            }
        }
    });

    DiscordState { client: client_arc }
}

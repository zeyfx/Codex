use tauri::command;
use tiny_http::{Server, Response};


#[command]
pub fn discord_login(client_id: String) -> Result<serde_json::Value, String> {
    let port = 6543;
    let redirect_uri = format!("http://127.0.0.1:{}/auth/callback", port);

    let auth_url = format!(
        "https://discord.com/oauth2/authorize?client_id={}&redirect_uri={}&response_type=code&scope=identify+email+guilds",
        client_id, urlencoding::encode(&redirect_uri)
    );

    let server = Server::http(format!("127.0.0.1:{}", port)).map_err(|e| format!("Could not start server: {}", e))?;

    if open::that(&auth_url).is_err() {
        return Err("Failed to open browser".into());
    }

    // Wait for the single request
    for request in server.incoming_requests() {
        let url = request.url();
        if url.starts_with("/auth/callback") {
            // Very naive query param parsing
            let mut code = None;
            let mut error = None;

            if let Some(query) = url.split('?').nth(1) {
                for param in query.split('&') {
                    let mut parts = param.split('=');
                    match (parts.next(), parts.next()) {
                        (Some("code"), Some(v)) => code = Some(v.to_string()),
                        (Some("error"), Some(v)) => error = Some(v.to_string()),
                        _ => {}
                    }
                }
            }

            if let Some(err_msg) = error {
                let html = format!("<html><body><h1>Auth Failed: {}</h1><script>setTimeout(() => window.close(), 4000);</script></body></html>", err_msg);
                let response = Response::from_string(html).with_status_code(400);
                let _ = request.respond(response);
                return Err(err_msg);
            }

            if let Some(code_val) = code {
                let html = "<html><body><h1>Autorizado com sucesso!</h1><script>setTimeout(() => window.close(), 4000);</script></body></html>";
                let response = Response::from_string(html).with_status_code(200);
                let _ = request.respond(response);
                return Ok(serde_json::json!({ "code": code_val }));
            }
        }
    }

    Err("Server closed".into())
}

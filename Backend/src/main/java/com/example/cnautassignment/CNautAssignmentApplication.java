package com.example.cnautassignment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import java.awt.Desktop;
import java.net.URI;

@SpringBootApplication
public class CNautAssignmentApplication {
	public static void main(String[] args) {
		SpringApplication.run(CNautAssignmentApplication.class, args); // Open landing page in browser
		String url = "http://localhost:8080/";
		openBrowser(url);
	}

	private static void openBrowser(String url) {
		try {
			// Check if Desktop API is supported
			if (Desktop.isDesktopSupported() && Desktop.getDesktop().isSupported(Desktop.Action.BROWSE)) {
				Desktop.getDesktop().browse(new URI(url));
			} else { // Fallback: use Runtime exec
				Runtime rt = Runtime.getRuntime();
				String os = System.getProperty("os.name").toLowerCase();
				if (os.contains("win")) {
					rt.exec("rundll32 url.dll,FileProtocolHandler " + url);
				} else if (os.contains("mac")) {
					rt.exec("open " + url);
				} else if (os.contains("nix") || os.contains("nux")) {
					rt.exec("xdg-open " + url);
				} else {
					System.out.println("Please open browser manually: " + url);
				}
			}
		} catch (Exception e) {
			e.printStackTrace();
			System.out.println("Failed to open browser. Open manually: " + url);
		}
	}
}
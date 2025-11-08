"use strict";
/**
 * @type {HTMLFormElement}
 */
const form = document.getElementById("sj-form");
/**
 * @type {HTMLInputElement}
 */
const address = document.getElementById("sj-address");
/**
 * @type {HTMLInputElement}
 */
const searchEngine = document.getElementById("sj-search-engine");
/**
 * @type {HTMLParagraphElement}
 */
const error = document.getElementById("sj-error");
/**
 * @type {HTMLPreElement}
 */
const errorCode = document.getElementById("sj-error-code");

const { ScramjetController } = $scramjetLoadController();

const scramjet = new ScramjetController({
	files: {
		wasm: '/scram/scramjet.wasm.wasm',
		all: '/scram/scramjet.all.js',
		sync: '/scram/scramjet.sync.js',
	},
});

scramjet.init();

const connection = new BareMux.BareMuxConnection("/baremux/worker.js");
/**
 * Close button for the proxy iframe (added in HTML)
 * Script is loaded with `defer` so DOM elements are available.
 */
const closeBtn = document.getElementById("sj-close");

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	try {
		await registerSW();
	} catch (err) {
		error.textContent = "Failed to register service worker.";
		errorCode.textContent = err.toString();
		throw err;
	}

	const url = search(address.value, searchEngine.value);

	let frame = document.getElementById("sj-frame");
	frame.style.display = "block";
	if (closeBtn) closeBtn.style.display = "block";
	// Prevent body scrolling when iframe is shown
	document.body.classList.add("no-scroll");
	document.documentElement.classList.add("no-scroll");
	let wispUrl =
		(location.protocol === "https:" ? "wss" : "ws") +
		"://" +
		location.host +
		"/wisp/";
	if ((await connection.getTransport()) !== "/epoxy/index.mjs") {
		await connection.setTransport("/epoxy/index.mjs", [{ wisp: wispUrl }]);
	}
	const sjEncode = scramjet.encodeUrl.bind(scramjet);
	frame.src = sjEncode(url);
});

// Close behavior: hide iframe, clear src and hide button
if (closeBtn) {
	closeBtn.addEventListener("click", () => {
		const frame = document.getElementById("sj-frame");
		if (!frame) return;
		frame.style.display = "none";
		// Clear src to stop any activity / media playback
		try {
			frame.src = "about:blank";
		} catch (e) {
			// ignore
		}
		closeBtn.style.display = "none";
		// Re-enable body scrolling when iframe is closed
		document.body.classList.remove("no-scroll");
		document.documentElement.classList.remove("no-scroll");
	});

	// Close on Escape
	document.addEventListener("keydown", (ev) => {
		if (ev.key === "Escape") {
			const frame = document.getElementById("sj-frame");
			if (!frame) return;
			frame.style.display = "none";
			try {
				frame.src = "about:blank";
			} catch (e) {}
			closeBtn.style.display = "none";
			// Re-enable body scrolling when iframe is closed
			document.body.classList.remove("no-scroll");
		}
	});
}

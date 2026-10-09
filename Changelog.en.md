## v2.5.8

<details>
<summary><strong> 🐞 Bug Fixes </strong></summary>

- Fixed proxy group rows in the system tray not showing latency, and timeout or untested entries being indistinguishable
- Fixed latency tests and latency display pointing at the wrong node when different subscriptions contain nodes with the same name
- Fixed port settings mixing up the saved value with the running value, and missing a hint when the input is invalid
- Fixed the missing multi-language explanation and suggested action when an existing core process blocks startup
- Fixed the window popping up repeatedly and reporting a startup failure when the app is reopened from the Start menu
- Fixed nodes turning grey and showing "ambiguous" (and becoming unselectable) in proxy groups when several proxy collections contain same-named nodes
- Fixed manual updates re-downloading a package already downloaded in the background, and re-downloading on every launch after choosing "Later" at startup
- Fixed a slow or stalled mirror not switching to another download URL during an update, and "Cancel" not stopping the download
- Fixed the already-downloaded-update prompt still appearing at startup after automatic update checks were turned off
- Fixed the app sometimes hanging for a long time when quitting from the Dock, logging out, or shutting down
- Fixed too many cards per row on the Subscriptions page in wide windows, which truncated profile names

**🖥️ Windows**

- Fixed the app failing to start after a Windows upgrade because of abnormal file permissions, which required clearing the configuration manually
- Fixed the app hanging for about two minutes when the Windows service start type had been changed to Manual, and added a one-click repair
- Fixed the tray menu becoming unresponsive after the app had been running for a long time on Windows

**🍎 macOS**

- Fixed system DNS staying on `114.114.114.114` after TUN was turned off or the app quit on macOS, which broke domain name resolution

**🖥️/🍎 Windows/macOS**

- Fixed node latency and auto-select status not refreshing when the system tray menu was opened on Windows/macOS

</details>

<details>
<summary><strong> ✨ New Features </strong></summary>

- Added a "Test latency" menu item to the proxy group in the system tray

</details>

<details>
<summary><strong> 🚀 Improvements </strong></summary>

- Improved the port settings window implementation and removed duplicated code
- Reduced the CPU usage of the sidebar traffic chart

**🖥️ Windows**

- Improved the message shown when the Windows service safety check fails: it now explains the cause and the core process holding it when starting, installing, or repairing the service, and suggests how to resolve it

</details>

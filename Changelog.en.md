## v2.5.10

<details>
<summary><strong> 🐞 Bug Fixes </strong></summary>

- Fixed Global mode missing the `GLOBAL` proxy group, so the global outbound could not be selected separately
- Fixed the core failing to start in Service mode when an SSH node's `private-key` uses a private key file
- Fixed the core-updated GEO database in Service mode not being synced back to the app directory, which made rules using the new categories fail validation
- Fixed that after a subscription's DNS configuration changed, "DNS Override" was actually off while the toggle still showed it as on with no hint

**🖥️ Windows**

- Windows: fixed the installer not prompting to quit the running app on reinstall or overwrite, which caused uninstall errors or a failed overwrite

</details>

<details>
<summary><strong> ✨ New Features </strong></summary>


</details>

<details>
<summary><strong> 🚀 Improvements </strong></summary>


</details>

## v2.5.9

- **Mihomo(Meta) core upgraded to v1.19.33**

<details>
<summary><strong> 🐞 Bug Fixes </strong></summary>

- Fixed the "Edit Rules" dialog erroring when a rule-extension item is an empty list
- Fixed scheduled automatic backups not running after the app restarts
- Fixed tray latency tests behaving differently from the Proxy page, and removed the "Test latency" entry from the tray
- Fixed importing a subscription from a URL reloading the current configuration even when the imported subscription is not the one in use
- Fixed the Home page speed-test card staying in "testing" after a failure
- Fixed the Proxy page not showing the latest latency after expanding a group until the node is switched
- Fixed node groups not expanding in Global mode on the Proxy page
- Fixed custom CSS being unable to change the editor font and font size
- Fixed WebDAV settings not saving after being cleared

**🍎 macOS**

- macOS: fixed the Home page speed test and traffic graph not rendering on Big Sur

**🐧 Linux**

- Linux: fixed deb/rpm packages wrongly bundling the extra `frontend-contract` executable, which broke downstream repackaging

</details>

<details>
<summary><strong> ✨ New Features </strong></summary>

- Added a "DNS mode" option to the virtual NIC settings, letting you configure mihomo's system DNS behaviour
- Added an auto-refresh toggle for "IP information"; manual refresh still works when it is off
- Added Muse AI unlock detection, with a "Risky" marker for Muse AI's Cloudflare challenge

</details>

<details>
<summary><strong> 🚀 Improvements </strong></summary>

- Improved chained proxies: the speed-impact warning must now be confirmed before enabling, and empty panels gained a "Close" button

**🖥️ Windows**

- Windows system proxy now bypasses `*.local` domains by default, so `.local` hostnames of LAN devices are no longer proxied

</details>

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

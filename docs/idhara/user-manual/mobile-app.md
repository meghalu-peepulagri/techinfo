---
title: Mobile App User Manual
sidebar_position: 1
---

# iDhara Mobile App — User Manual

---

## 1. Authentication

### 1.1 Login

The Login screen is the entry point of the app. Users who have already registered can enter their mobile number here to receive an OTP and access the dashboard.

<img src="/img/idhara-manual/1_login.jpg" width="300" />

| Element | Purpose |
|---|---|
| Mobile Number field | Enter the registered 10-digit mobile number |
| Login button | Submits the number and triggers OTP delivery to that number |
| Register link | Navigates to the Registration screen for new users |

---

### 1.2 OTP Verification

After submitting a mobile number (either during Login or after Registration), the app sends an OTP to that number. This screen collects and verifies the OTP before granting access.

<img src="/img/idhara-manual/2_login_register_otp_verification.jpg" width="300" />

| Element | Purpose |
|---|---|
| OTP input field | Enter the one-time password received on the mobile number |
| Verify / Submit button | Validates the OTP; on success navigates to the Dashboard |
| Resend OTP option | Sends a new OTP to the same number if the original was not received |
| Back navigation | Returns to the Login or Registration screen |

---

### 1.3 Register Account

New users must create a profile before their first login. This screen collects basic identity details.

<img src="/img/idhara-manual/3_register_account.jpg" width="300" />

| Element | Purpose |
|---|---|
| Full Name field | User's full name (mandatory) |
| Mobile Number field | Mobile number that will be used for OTP-based login (mandatory) |
| Email field | User's email address (mandatory) |
| Address field | User's address (optional) |
| Register / Submit button | Saves the profile and sends an OTP to the provided mobile number |

---

## 2. Dashboard

### 2.1 Dashboard Overview

The Dashboard is the home screen after login. It displays all devices linked to the user's account as live data cards. Each card updates in real time using the live data topic.

<img src="/img/idhara-manual/4_dashboard.jpg" width="300" />

| Element | Purpose |
|---|---|
| Device card | Represents one device; shows device name, current status, and live sensor values |
| Motor on/off toggle on card | Initiates motor start or stop for that device |
| Mode indicator on card | Shows current mode (Auto / Manual) for the device |
| Last updated timestamp | Shows when the device last sent data |
| Test Run status indicator | Visible on cards where calibration has not yet been completed |
| Location filter icon (hamburger) | Opens a dropdown to filter cards by location |
| Navigation bar | Bottom bar for switching between Dashboard, Locations, Devices, and Settings |

---

### 2.2 Dashboard — Location Filter

Tapping the hamburger/dropdown icon at the top of the Dashboard opens a location picker. Selecting a location filters the device cards to show only devices belonging to that location.

<img src="/img/idhara-manual/22_dashboard_location_filter.jpg" width="300" />

| Element | Purpose |
|---|---|
| Dropdown / hamburger icon | Opens the location selection list |
| Location list items | Each entry represents a saved location |
| "All" option | Clears the filter and shows all devices across all locations |
| Current selection highlight | Indicates which location is currently active as a filter |

---

### 2.3 Dashboard — Motor On/Off Confirmation

Before executing a motor on or off command, the app shows a confirmation dialog. This prevents accidental toggling and gives the user a chance to verify the intended action.

<img src="/img/idhara-manual/41_dashboard_motor_on_off_confirm.jpg" width="300" />

| Element | Purpose |
|---|---|
| Motor Name display | Shows the name of the pump/motor being controlled |
| Selected motor mode display | Shows the mode (Auto / Manual) at the time of the action |
| Confirm button | Sends the motor command to the device |
| Cancel button | Dismisses the dialog without sending any command |

---

### 2.4 Dashboard — Motor Command Acknowledgement Failed

When a motor on/off command is sent but the device does not respond within the expected time, the app displays a snack bar error at the bottom of the screen.

<img src="/img/idhara-manual/42_dashboard_motor_on_off_ack_failed.jpg" width="300" />

| Element | Purpose |
|---|---|
| Snack bar / toast message | Informs the user that the device did not respond to the command |
| Auto-dismiss behavior | Snack bar disappears after a short timeout without requiring user action |

---

### 2.5 Dashboard — Clear Fault on Motor Start

If a device has an active fault when the user tries to start the motor, the app requires the fault to be cleared first. A prompt is shown explaining this before proceeding.

<img src="/img/idhara-manual/43_dashboard_motor_clear_fault_on_motor_start.jpg" width="300" />

| Element | Purpose |
|---|---|
| Fault warning message | Explains that an active fault is blocking the motor start |
| Clear Fault button | Sends the clear fault command via the Signal topic and then retries motor start |
| Cancel button | Dismisses the prompt without starting the motor or clearing the fault |

---

### 2.6 Dashboard — Motor Off While in Auto Mode

When the user attempts to turn off the motor while the device is operating in Auto mode, the app presents a choice: switch to Manual mode first (recommended), or turn off directly without changing mode.

<img src="/img/idhara-manual/45_motor_off_on_auto_mode.jpg" width="300" />

| Element | Purpose |
|---|---|
| Mode conflict message | Informs the user that the device is in Auto mode |
| "Switch to Manual then turn off" option | Changes mode via the Mode topic, then sends the motor off command |
| "Turn off directly" option | Sends motor off command without changing mode |
| Cancel button | Dismisses without any action |

---

### 2.7 Dashboard — First Test Run Status

Devices that have not yet been calibrated show a specific status on their dashboard card, prompting the user to complete the Test Run for proper operation.

<img src="/img/idhara-manual/46_dashboard_motor_first_test_run_status.jpg" width="300" />

| Element | Purpose |
|---|---|
| Test Run required indicator | Shown on the device card to flag that calibration is pending |
| Test Run CTA button | Tapping this begins the Test Run flow for that device |

---

## 3. Navigation Menu

The slide-out menu provides access to all major sections of the app. It can be opened from any screen via the menu icon in the top navigation bar.

<img src="/img/idhara-manual/5_user_menu.jpg" width="300" />

| Element | Purpose |
|---|---|
| Home | Navigates to the Dashboard |
| Locations | Opens the Locations list screen |
| Devices | Opens the Devices list screen |
| Settings | Opens the Device Settings screen |
| Profile | Opens the User Profile screen |

---

## 4. Locations

### 4.1 Locations Screen

The Locations screen lists all locations the user has created. Devices are organised under locations. A search field at the top helps find locations quickly in a long list.

<img src="/img/idhara-manual/6_locations.jpg" width="300" />

| Element | Purpose |
|---|---|
| Location list | Each row shows a location name; tap to view devices under it |
| Search field | Filters the list in real time as the user types a location name |
| Add new location button | Opens the Add New Location screen |
| Location row menu (⋮) | Reveals Rename and Delete options for that location |

---

### 4.2 Add New Location

A simple form to create a new location. After saving, the app navigates back to the Locations list and the new location appears at the appropriate position.

<img src="/img/idhara-manual/7_add_new_location.jpg" width="300" />

| Element | Purpose |
|---|---|
| Location name text field | Enter the name for the new location |
| Save button | Creates the location and returns to the Locations list |
| Back navigation | Discards the entry and returns without saving |

---

### 4.3 Rename Location

Allows the user to update the display name of an existing location. The text field is pre-filled with the current name for easy editing.

<img src="/img/idhara-manual/47_rename_location.jpg" width="300" />

| Element | Purpose |
|---|---|
| Location name text field | Pre-filled with the current location name; edit to update |
| Save button | Saves the new name and updates it across all associated devices |
| Cancel | Discards the change and returns to the Locations list |

---

### 4.4 Delete Location

Tapping Delete on a location shows a confirmation dialog to prevent accidental deletion.

<img src="/img/idhara-manual/9_location_delete.jpg" width="300" />

| Element | Purpose |
|---|---|
| Confirmation message | Names the location being deleted so the user can verify |
| Delete / Confirm button | Permanently removes the location |
| Cancel button | Closes the dialog without deleting |

---

## 5. Devices

### 5.1 Devices List

Lists all devices linked to the user's account. Each device shows its name and serial number. Tapping the right arrow on a device opens its detail view.

<img src="/img/idhara-manual/10_devices_list.jpg" width="300" />

| Element | Purpose |
|---|---|
| Device row | Shows device name and serial number |
| Right arrow (→) | Navigates to the device detail / settings screen |
| Search field | Filters devices by name or serial number |
| Add device button | Opens the Add Device flow (scan or manual) |
| Device row menu (⋮) | Reveals Info, Rename, Replace Location, and Delete options |

---

### 5.2 Add Device — Scan

Devices can be added by scanning their QR code or barcode. The scanner automatically fills in the device fields on a successful scan.

<img src="/img/idhara-manual/11_add_new_device_scan.jpg" width="300" />

| Element | Purpose |
|---|---|
| Camera viewfinder | Shows live camera feed for scanning the device QR/barcode |
| Scan target overlay | Guide frame indicating where to position the code |
| Manual entry option | Switch to manual entry if scanning is not possible |
| Back navigation | Returns to the Devices list without adding a device |

---

### 5.3 Add Device — Manual Entry

All device fields can be entered manually. The user also assigns the device to a location, either by selecting an existing one or creating a new one inline.

<img src="/img/idhara-manual/12_add_new_device_fields.jpg" width="300" />

| Element | Purpose |
|---|---|
| Serial Number field | Unique identifier of the device |
| Pump Name field | Friendly name for the pump/motor |
| HP (Horsepower) field | Motor horsepower rating |
| Location selector | Dropdown to pick an existing location |
| Add New Location option | Opens inline location creation without leaving this screen |
| Save / Add button | Registers the device and proceeds to the default settings step |

---

### 5.4 Add Device — Assign New Location

When adding a device, if no suitable location exists, a new location can be created inline from the same screen without navigating away.

<img src="/img/idhara-manual/13_add_new_device_new_location.jpg" width="300" />

| Element | Purpose |
|---|---|
| New location name field | Enter the name for the location to be created |
| Add / Save button | Creates the location and automatically selects it for the device being added |
| Existing location list | Still visible so the user can switch to an existing location instead |

---

### 5.5 Device Info

Available from the device row menu, this screen shows hardware and SIM-related details for the device. All values can be copied to the clipboard.

<img src="/img/idhara-manual/21_devices_list_single_device_info.jpg" width="300" />

| Element | Purpose |
|---|---|
| SIM Number | The SIM card number installed in the device |
| Recharge Expiry | Date when the SIM plan expires |
| Starter Number | Contact number of the starter unit |
| PCB Number | Printed circuit board identification number |
| Copy icon (each row) | Copies that specific field value to the clipboard |
| Close button | Dismisses the info panel |

---

### 5.6 Devices List — Location Filter

The location filter on the Devices list screen narrows down the list to show only devices belonging to a chosen location.

<img src="/img/idhara-manual/23_device_list_location_filter.jpg" width="300" />

| Element | Purpose |
|---|---|
| Filter / location selector | Opens the location list for selection |
| Location list items | Each item filters the device list to that location |
| Clear / All option | Removes the filter and shows all devices |

---

### 5.7 Rename Device (Pump)

From the device row menu, tap Rename to update the pump name and horsepower value. Both fields are pre-filled with the current values.

<img src="/img/idhara-manual/24_devices_list_rename_pump.jpg" width="300" />

| Element | Purpose |
|---|---|
| Pump Name field | Pre-filled with current name; update to rename |
| HP field | Pre-filled with current horsepower; update if needed |
| Save / Update button | Applies the changes and refreshes the device list |
| Cancel | Discards changes |

---

### 5.8 Delete Device — Confirmation

Before removing a device from the account, a confirmation dialog is shown to prevent accidental deletion.

<img src="/img/idhara-manual/24_device_list_delete_confirmation.jpg" width="300" />

| Element | Purpose |
|---|---|
| Confirmation message | Displays the device name to confirm the correct device is being deleted |
| Delete / Confirm button | Permanently removes the device from the account |
| Cancel button | Closes the dialog; device remains in the list |

---

## 6. Device Settings

### 6.1 Settings — Devices List

The Settings screen opens with a list of all devices. Tap the arrow next to a device to configure its limit values and fault settings.

<img src="/img/idhara-manual/_settings_devices_list.jpg" width="300" />

| Element | Purpose |
|---|---|
| Device list rows | Each row shows device name and serial number |
| Right arrow (→) | Opens the Limit Settings screen for that device |
| Search field | Filter devices by name or serial to find one quickly |

---

### 6.2 Device Limit Settings

Shows the operating limit values for the device — FLC, Voltage, and Current. These values define the safe operating thresholds. They can be edited directly or restored to factory defaults.

<img src="/img/idhara-manual/14_new_device_default_settings.jpg" width="300" />

| Element | Purpose |
|---|---|
| FLC (Full Load Current) field | Displays and allows editing of the full load current value |
| Voltage field | Displays and allows editing of the voltage limit |
| Current field | Displays and allows editing of the current limit |
| Info icon (ⓘ) | Opens a panel explaining what each parameter means |
| Default button | Triggers the Restore Default confirmation card |
| Save button | Triggers the update confirmation before sending to device |

---

### 6.3 Device Limit Settings — Parameter Info

Tapping the info icon on the limits screen shows a detailed explanation of each parameter (FLC, Volt, Current) so the user understands what they are configuring.

<img src="/img/idhara-manual/15_new_device_settings_data.jpg" width="300" />

| Element | Purpose |
|---|---|
| Parameter info card | Lists each setting (FLC, Volt, Current) with a description of its function |
| Close / Dismiss button | Returns to the Limit Settings screen |

---

### 6.4 Restore Default Settings — Confirmation

Tapping the Default button on the limit settings screen shows this confirmation card. The user must explicitly confirm before default values are applied to prevent accidental resets.

<img src="/img/idhara-manual/16_new_device_settings_restore_default.jpg" width="300" />

| Element | Purpose |
|---|---|
| Confirmation message | States that defaults will be restored, asking for confirmation |
| Confirm button | Sends default values to device via Settings topic |
| Cancel button | Dismisses the card; current values remain unchanged |

---

### 6.5 Settings Update — Single Value Confirmation

When the user edits and saves a single parameter (Volt or Current), a confirmation card appears showing the new value before it is sent to the device.

<img src="/img/idhara-manual/17_device_settings_update_confirm.jpg" width="300" />

| Element | Purpose |
|---|---|
| Parameter name | Identifies which setting is being changed |
| New value display | Shows the value that will be applied |
| Confirm button | Sends the updated setting to the device via Settings topic |
| Cancel button | Discards the change |

---

### 6.6 Settings Update — Multiple Values Confirmation

When the user changes more than one parameter before saving, a single confirmation card lists all the changes together for review.

<img src="/img/idhara-manual/18_device_settings_multi_update_confirm.jpg" width="300" />

| Element | Purpose |
|---|---|
| Changed parameters list | Lists all modified settings with their new values |
| Confirm button | Sends all updates to the device in one operation via Settings topic |
| Cancel button | Discards all pending changes |

---

### 6.7 Device Fault Settings

Lists all configurable fault types for the device. Each fault can be independently toggled on or off. Changes are sent to the device via the Settings topic.

<img src="/img/idhara-manual/19_device_faults_settings.jpg" width="300" />

| Element | Purpose |
|---|---|
| Fault name label | Identifies each fault type (e.g. over voltage, under voltage, dry run) |
| Toggle switch | Enables or disables detection/action for that fault |
| Info icon (ⓘ) per row | Opens the About Fault panel for that specific fault |
| Current state indicator | Shows whether the fault is currently active on the device |

---

### 6.8 Fault Settings — About Fault

Tapping the info icon on any fault row opens a panel explaining what that fault means and what conditions trigger it.

<img src="/img/idhara-manual/20_device_faults_settings_about_fault.jpg" width="300" />

| Element | Purpose |
|---|---|
| Fault name | Title of the fault being described |
| Fault description | Explains the condition that triggers this fault and its effect on the device |
| Close button | Returns to the Fault Settings list |

---

## 7. Test Run

The Test Run is a calibration process that measures the motor's operating parameters under real load. The app sends current values to the device, records the response, and saves calibration data. This must be completed once after adding a new device for accurate operation.

### 7.1 Test Run — Start (Pre-test Verification)

Before the test begins, the app verifies two conditions using the live data topic and signal (heartbeat) topic: that the device is online and that live sensor data is available.

<img src="/img/idhara-manual/32_devices_list_single_device_test_run_start.jpg" width="300" />

| Element | Purpose |
|---|---|
| Live Data status indicator | Shows whether live data is being received from the device |
| Signal / Heartbeat indicator | Shows whether the device is actively communicating |
| Start Test Run button | Enabled only when both checks pass; begins the calibration process |
| Status messages | Describe what each check is verifying |

---

### 7.2 Test Run — Progress

Once started, the app sends current values to the device. The user has up to 1 minute to complete this phase. A progress bar tracks the remaining time.

<img src="/img/idhara-manual/25_device_list_motor_test_run_progress.jpg" width="300" />

| Element | Purpose |
|---|---|
| Progress bar | Visual indicator of time remaining (1-minute window) |
| Countdown timer | Shows exact seconds remaining in the calibration window |
| Current values display | Shows the values being sent to the device in real time |
| Emergency Stop / Cancel button | Halts the test immediately at any point during this phase |

---

### 7.3 Test Run — Emergency Stop

At any point during the progress phase, the user can tap Stop or Cancel to halt the test run immediately. This is useful if a problem is observed during calibration.

<img src="/img/idhara-manual/26_device_list_motor_emergency_stop.jpg" width="300" />

| Element | Purpose |
|---|---|
| Stop button | Immediately halts calibration and stops the motor if running |
| Cancel button | Same function as Stop; exits the test run |
| Confirmation prompt | Brief confirmation before executing the emergency stop |

---

### 7.4 Test Run — Summary

After the 1-minute calibration window, the app shows a summary of the values captured during the test. The user can now choose to save these values or cancel.

<img src="/img/idhara-manual/27_device_list_motor_test_run_summary.jpg" width="300" />

| Element | Purpose |
|---|---|
| Signal value | Recorded signal strength reading from the test |
| Live Data values | Sensor readings captured during the calibration run |
| Setting data | The configuration values that will be saved if confirmed |
| Save Settings button | Proceeds to save the calibration data to the device |
| Cancel button | Opens the cancel confirmation card |

---

### 7.5 Test Run — Cancel Confirmation

Tapping Cancel on the summary screen shows a confirmation card before discarding the test results. This prevents accidental loss of calibration data.

<img src="/img/idhara-manual/28_device_list_motor_test_run_cancel.jpg" width="300" />

| Element | Purpose |
|---|---|
| Confirmation message | States that calibration data will be discarded |
| Confirm Cancel button | Discards the test results and exits the test run flow |
| Go Back button | Returns to the summary screen to reconsider |

---

### 7.6 Test Run — Saving Settings

After the user confirms Save on the summary, the app sends the calibration values to the device. A saving card is shown while this operation is in progress.

<img src="/img/idhara-manual/29_device_list_motor_test_run_summary_save.jpg" width="300" />

| Element | Purpose |
|---|---|
| Saving settings card | Visual indicator that the app is pushing settings to the device |
| Loading / progress indicator | Shows the operation is in progress |
| Result state (success/fail) | After completion, transitions to either the Success or Failed screen |

---

### 7.7 Test Run — Failed

If calibration fails (device did not respond correctly or values could not be recorded), the app displays a "Smart calibration failed" message.

<img src="/img/idhara-manual/30_device_list_motor_test_run_failed.jpg" width="300" />

| Element | Purpose |
|---|---|
| "Smart calibration failed" message | Informs the user that calibration was not completed successfully |
| Retry button | Starts the test run process again from the beginning |
| Close / Back button | Exits the test run flow without retrying |

---

### 7.8 Test Run — Success

When calibration completes successfully, the app shows a success confirmation and saves the values. The device is now calibrated for accurate operation.

<img src="/img/idhara-manual/31_device_list_motor_test_run_success.jpg" width="300" />

| Element | Purpose |
|---|---|
| "Smart calibration" success message | Confirms that calibration data has been saved |
| Saved values summary | Brief display of the values that were recorded and applied |
| Done button | Returns to the device list or dashboard |

---

## 8. Single Device View

### 8.1 Mode Tab

The Mode tab inside a device's detail view shows the current operating mode and allows switching between Auto and Manual. A mode change is sent to the device via the Mode topic.

<img src="/img/idhara-manual/35_single_device_view_mode_tab.jpg" width="300" />

| Element | Purpose |
|---|---|
| Mode toggle switch | Switches between Auto mode and Manual mode |
| Current mode label | Displays whether the device is currently in Auto or Manual |
| Mode card / tap area | An alternate tap target that also triggers the mode change flow |
| Info icon (I) | Opens the Mode Info panel explaining both modes |

---

### 8.2 Mode Change — Info Panel

Tapping the (I) icon on the Mode tab opens a panel explaining the difference between Auto mode and Manual mode so the user can choose the appropriate one.

<img src="/img/idhara-manual/36_single_device_view_mode_change_info.jpg" width="300" />

| Element | Purpose |
|---|---|
| Auto mode description | Explains that in Auto mode the device controls the motor based on configured schedule or sensor inputs |
| Manual mode description | Explains that in Manual mode the user directly controls motor on/off |
| Close button | Dismisses the panel and returns to the Mode tab |

---

### 8.3 Analytics Tab

The Analytics tab shows historical runtime data for the motor and power supply with colour-coded bar graphs. It also calculates and displays the total cumulative run time.

<img src="/img/idhara-manual/38_single_device_view_analytics_tab.jpg" width="300" />

| Element | Purpose |
|---|---|
| Total Run Time display | Shows the overall calculated run time (e.g. 0h 34 min) |
| Motor Run Time graph | Bar/segment graph: **green** = ON, **red** = OFF, **orange** = Running |
| Power Run Time graph | Bar/segment graph: **blue** = ON, **red** = OFF, **orange** = Running |
| Value labels on graph | Each segment shows its duration value alongside the colour indicator |

---

### 8.4 Logs Tab

The Logs tab displays a chronological list of all events recorded by the device, including faults, alerts, and motor state changes. Each entry shows the log message and the time it was recorded.

<img src="/img/idhara-manual/39_single_device_view_logs_tab.jpg" width="300" />

| Element | Purpose |
|---|---|
| Log list | Scrollable list of all device events in reverse chronological order |
| Log type indicator | Icon or label identifying the type (Fault, Alert, Pump On, Pump Off, Pump Mode) |
| Log message | Description of the specific event that occurred |
| Timestamp | Date and time the event was recorded |
| Filter button | Opens the Logs Filter panel |

---

### 8.5 Logs — Apply Filter

The Logs filter panel lets the user narrow the log list to a specific event type, making it easier to find relevant entries in a long history.

<img src="/img/idhara-manual/40_single_device_view_logs_apply_filter.jpg" width="300" />

| Element | Purpose |
|---|---|
| Faults option | Shows only fault events |
| Alerts option | Shows only alert events |
| Pump On option | Shows only motor start events |
| Pump Off option | Shows only motor stop events |
| Pump Mode option | Shows only mode change events |
| Apply button | Applies the selected filter and refreshes the log list |
| Clear / All option | Removes the filter and shows all log types |

---

## 9. User Profile

The Profile screen shows the logged-in user's account details. All fields are read-only and can be copied to the clipboard. The Logout button ends the session.

<img src="/img/idhara-manual/_user_profile.jpg" width="300" />

| Element | Purpose |
|---|---|
| Full Name | Displays the name provided during registration |
| Email | Displays the registered email address |
| Address | Displays the address provided during registration (if any) |
| Copy icon (each field) | Copies that field's value to the device clipboard |
| Logout button | Ends the current session and navigates back to the Login screen |

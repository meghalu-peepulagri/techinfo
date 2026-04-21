---
title: iDhara Mobile App — Test Cases
---

# iDhara Mobile App — Test Cases

---

## 1. Authentication

### 1.1 Login

- [ ] Enter valid registered mobile number → OTP screen appears
- [ ] Enter unregistered mobile number → error message shown
- [ ] Submit with empty mobile number field → validation error shown
- [ ] Tap Register link → navigates to Registration screen

### 1.2 OTP Verification

- [ ] Enter correct OTP after login → navigates to Dashboard
- [ ] Enter incorrect OTP → error message shown, stays on OTP screen
- [ ] Enter correct OTP after new registration → navigates to Dashboard
- [ ] Tap Resend OTP → new OTP sent, confirmation message shown
- [ ] OTP input accepts only numeric characters

### 1.3 Register Account

- [ ] Fill Full Name, Mobile, Email → submit → OTP sent to mobile
- [ ] Submit without Full Name → validation error on that field
- [ ] Submit without Mobile Number → validation error on that field
- [ ] Submit with invalid email format → validation error on that field
- [ ] Submit without Address → form submits successfully (field is optional)
- [ ] After successful registration OTP → verify → lands on Dashboard

---

## 2. Dashboard

### 2.1 Dashboard Overview

- [ ] Dashboard loads with all device cards visible after login
- [ ] Each card shows device name, current status, and live sensor values
- [ ] Last updated timestamp visible on each card
- [ ] Device without completed Test Run shows Test Run required indicator on card
- [ ] Live data updates on cards in real time

### 2.2 Dashboard — Location Filter

- [ ] Tap dropdown/hamburger icon → location list appears
- [ ] Select a location → only devices under that location are shown
- [ ] Select "All" → all device cards shown regardless of location
- [ ] Currently active filter location is highlighted in the list

### 2.3 Dashboard — Motor On/Off Confirmation

- [ ] Tap motor toggle on a card → confirmation dialog appears
- [ ] Dialog shows correct Motor Name
- [ ] Dialog shows correct current motor mode (Auto / Manual)
- [ ] Tap Confirm → motor command sent, card status updates
- [ ] Tap Cancel → dialog dismissed, motor state unchanged

### 2.4 Dashboard — Motor Command Acknowledgement Failed

- [ ] Send motor command when device is offline/unresponsive → snack bar error appears
- [ ] Snack bar message is readable and descriptive
- [ ] Snack bar auto-dismisses after timeout without requiring user action

### 2.5 Dashboard — Clear Fault on Motor Start

- [ ] Attempt to start motor with active fault → clear fault prompt appears
- [ ] Prompt clearly explains the fault is blocking motor start
- [ ] Tap Clear Fault → fault cleared via Signal topic, motor start proceeds
- [ ] Tap Cancel → motor start aborted, fault remains

### 2.6 Dashboard — Motor Off While in Auto Mode

- [ ] Attempt to turn off motor while device is in Auto mode → mode conflict dialog appears
- [ ] "Switch to Manual then turn off" option → device mode changes to Manual via Mode topic, then motor turns off
- [ ] "Turn off directly" option → motor turns off without mode change
- [ ] Cancel → no action taken, motor and mode unchanged

### 2.7 Dashboard — First Test Run Status

- [ ] Newly added device with no prior calibration shows Test Run required indicator on dashboard card
- [ ] Tap Test Run CTA on card → navigates into Test Run flow for that device

---

## 3. Navigation Menu

- [ ] Open menu → all five items visible: Home, Locations, Devices, Settings, Profile
- [ ] Tap Home → navigates to Dashboard
- [ ] Tap Locations → navigates to Locations list
- [ ] Tap Devices → navigates to Devices list
- [ ] Tap Settings → navigates to Device Settings list
- [ ] Tap Profile → navigates to User Profile

---

## 4. Locations

### 4.1 Locations Screen

- [ ] All saved locations are listed
- [ ] Type in search field → list filters in real time by location name
- [ ] Clear search → full location list restored

### 4.2 Add New Location

- [ ] Enter valid location name and tap Save → new location appears in the list
- [ ] Tap Save with empty name field → validation error shown
- [ ] Location created during Add Device flow appears in device's location selector

### 4.3 Rename Location

- [ ] Tap Rename on a location → text field pre-filled with current name
- [ ] Edit name and save → updated name shown in list and on all associated devices
- [ ] Save with empty name → validation error shown
- [ ] Cancel → original name unchanged

### 4.4 Delete Location

- [ ] Tap Delete on a location → confirmation dialog appears with location name
- [ ] Confirm delete → location removed from list
- [ ] Cancel delete → location remains in list unchanged

---

## 5. Devices

### 5.1 Devices List

- [ ] All devices shown with device name and serial number
- [ ] Search by device name → list filters correctly
- [ ] Search by serial number → list filters correctly
- [ ] Clear search → full device list restored
- [ ] Tap right arrow on device row → navigates to device detail screen

### 5.2 Add Device — Scan

- [ ] Tap Add Device → scan and manual entry options shown
- [ ] Scan valid device QR/barcode → device fields auto-populated
- [ ] Scan invalid code → error message shown
- [ ] Switch to Manual Entry → manual fields shown

### 5.3 Add Device — Manual Entry

- [ ] Enter all required fields and save → device added successfully
- [ ] Submit with Serial Number missing → validation error
- [ ] Submit with Pump Name missing → validation error
- [ ] Select existing location from dropdown → device linked to that location
- [ ] Device appears in Devices list after successful addition

### 5.4 Add Device — Assign New Location

- [ ] Tap Add New Location during device add → inline location name field appears
- [ ] Enter new location name and save → location created and auto-selected for the device
- [ ] New location available in future device additions

### 5.5 Device Info

- [ ] Open device row menu → Device Info option visible
- [ ] Tap Device Info → SIM Number, Recharge Expiry, Starter Number, PCB Number all displayed
- [ ] Tap copy icon next to SIM Number → value copied to clipboard
- [ ] Tap copy icon next to Recharge Expiry → value copied to clipboard
- [ ] Tap copy icon next to Starter Number → value copied to clipboard
- [ ] Tap copy icon next to PCB Number → value copied to clipboard
- [ ] Tap Close → info panel dismissed

### 5.6 Devices List — Location Filter

- [ ] Open location filter on Devices list → all user locations shown
- [ ] Select a location → list shows only devices under that location
- [ ] Select All / clear filter → all devices shown

### 5.7 Rename Device (Pump)

- [ ] Tap Rename from device row menu → rename dialog opens with current Pump Name and HP pre-filled
- [ ] Update pump name and save → new name shown in devices list
- [ ] Update HP value and save → new HP value reflected in device info
- [ ] Save with empty pump name → validation error shown
- [ ] Cancel → values unchanged

### 5.8 Delete Device — Confirmation

- [ ] Tap Delete from device row menu → confirmation dialog shows device name
- [ ] Confirm → device removed from list
- [ ] Cancel → device remains in list unchanged

---

## 6. Device Settings

### 6.1 Settings — Devices List

- [ ] Settings screen shows all devices with name and serial number
- [ ] Search filters devices correctly
- [ ] Tap right arrow → navigates to limits and fault settings for that device

### 6.2 Device Limit Settings

- [ ] FLC, Voltage, and Current values displayed correctly for the device
- [ ] Edit a value → Save option becomes available
- [ ] Tap Info icon → parameter info panel opens
- [ ] Tap Default button → Restore Default confirmation card appears

### 6.3 Device Limit Settings — Parameter Info

- [ ] Tap Info icon → panel shows description for FLC, Volt, and Current
- [ ] Dismiss panel → returns to Limit Settings screen

### 6.4 Restore Default Settings — Confirmation

- [ ] Confirmation card asks user to confirm before applying defaults
- [ ] Tap Confirm → default values sent to device via Settings topic; fields update to defaults
- [ ] Tap Cancel → values unchanged, card dismissed

### 6.5 Settings Update — Single Value Confirmation

- [ ] Change one value and tap Save → confirmation card shows the parameter name and new value
- [ ] Confirm → updated setting sent to device via Settings topic
- [ ] Cancel → setting reverts, no update sent

### 6.6 Settings Update — Multiple Values Confirmation

- [ ] Change multiple values and tap Save → confirmation card lists all changed parameters with new values
- [ ] Confirm → all updates sent in a single operation via Settings topic
- [ ] Cancel → all pending changes discarded

### 6.7 Device Fault Settings

- [ ] All fault types listed with their current on/off state shown by toggle
- [ ] Toggle a fault ON → setting sent via Settings topic; toggle reflects new state
- [ ] Toggle a fault OFF → setting sent; toggle reflects new state
- [ ] Info icon visible on each fault row

### 6.8 Fault Settings — About Fault

- [ ] Tap Info icon on a fault row → dialog shows that fault's name and description
- [ ] Description explains the conditions that trigger the fault
- [ ] Tap Close → returns to Fault Settings list

---

## 7. Test Run

### 7.1 Test Run — Start (Pre-test Verification)

- [ ] Tap Test Run on a device → pre-test verification screen shown
- [ ] Live Data check runs and shows status (pass / fail)
- [ ] Signal / Heartbeat check runs and shows status (pass / fail)
- [ ] Start Test Run button enabled only when both checks pass
- [ ] If either check fails → Start button remains disabled with descriptive message

### 7.2 Test Run — Progress

- [ ] Test run starts → progress bar visible
- [ ] Countdown timer counts down from 1 minute
- [ ] Current values being sent are displayed in real time
- [ ] Emergency Stop / Cancel button visible and accessible throughout
- [ ] After 1 minute → transitions to Summary screen

### 7.3 Test Run — Emergency Stop

- [ ] Tap Stop / Cancel during progress phase → emergency stop triggers immediately
- [ ] Confirmation prompt shown before executing stop
- [ ] Motor stops if running during the test
- [ ] Test run exits cleanly after stop

### 7.4 Test Run — Summary

- [ ] Summary card shows Signal value, Live Data values, and Setting data after calibration window closes
- [ ] Save Settings button visible and enabled
- [ ] Cancel button visible

### 7.5 Test Run — Cancel Confirmation

- [ ] Tap Cancel on summary → cancel confirmation card appears
- [ ] Confirmation message states that calibration data will be discarded
- [ ] Tap Confirm Cancel → test results discarded, exits test run flow
- [ ] Tap Go Back → returns to summary screen

### 7.6 Test Run — Saving Settings

- [ ] Tap Save on summary → saving settings card appears with loading indicator
- [ ] On success → transitions to Success screen
- [ ] On failure → transitions to Failed screen

### 7.7 Test Run — Failed

- [ ] "Smart calibration failed" message displayed clearly
- [ ] Retry button visible and functional → restarts test run from pre-test verification
- [ ] Close / Back button exits the test run flow

### 7.8 Test Run — Success

- [ ] "Smart calibration" success message displayed
- [ ] Saved values briefly shown or confirmed
- [ ] Done button returns to device list or dashboard
- [ ] Device no longer shows "Test Run required" indicator on dashboard card

---

## 8. Single Device View

### 8.1 Mode Tab

- [ ] Mode tab shows current mode (Auto or Manual) correctly
- [ ] Toggle switch switches mode from Auto → Manual
- [ ] Toggle switch switches mode from Manual → Auto
- [ ] Tapping mode card triggers same mode change flow as toggle
- [ ] Mode change command sent via Mode topic
- [ ] Switching from Auto → Manual while motor is running handles motor state correctly

### 8.2 Mode Change — Info Panel

- [ ] Tap (I) icon → info panel opens
- [ ] Auto mode description is present and accurate
- [ ] Manual mode description is present and accurate
- [ ] Tap Close → returns to Mode tab

### 8.3 Analytics Tab

- [ ] Total run time shown and value is calculated correctly
- [ ] Motor Run Time graph rendered with correct colours: ON = green, OFF = red, Running = orange
- [ ] Power Run Time graph rendered with correct colours: ON = blue, OFF = red, Running = orange
- [ ] Duration values shown alongside each graph segment
- [ ] Graph updates when new data is available

### 8.4 Logs Tab

- [ ] All log types present: Faults, Alerts, Pump On, Pump Off, Pump Mode
- [ ] Each log entry shows type, message, and timestamp
- [ ] Logs listed in reverse chronological order (most recent first)
- [ ] Long log lists are scrollable

### 8.5 Logs — Apply Filter

- [ ] Filter panel shows all five options: Faults, Alerts, Pump On, Pump Off, Pump Mode
- [ ] Select Faults → only fault logs shown
- [ ] Select Alerts → only alert logs shown
- [ ] Select Pump On → only motor start logs shown
- [ ] Select Pump Off → only motor stop logs shown
- [ ] Select Pump Mode → only mode change logs shown
- [ ] Clear filter / select All → all log types shown again

---

## 9. User Profile

- [ ] Full Name displayed correctly (matches registration data)
- [ ] Email displayed correctly
- [ ] Address displayed correctly (or empty if not provided)
- [ ] Tap copy icon on Full Name → value copied to clipboard
- [ ] Tap copy icon on Email → value copied to clipboard
- [ ] Tap copy icon on Address → value copied to clipboard
- [ ] Tap Logout → session ended, app navigates to Login screen
- [ ] After logout, back navigation does not return to Dashboard

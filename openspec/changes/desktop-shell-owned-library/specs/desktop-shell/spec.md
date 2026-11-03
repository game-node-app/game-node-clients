# Spec Delta

## Purpose

Defines the GameNode Desktop application shell: how the window is isolated from Node and remote content, how users
sign in and stay signed in, and how installable builds are produced for Windows and Linux.

## ADDED Requirements

### Requirement: Renderer is isolated from Node and the operating system
The desktop window SHALL run with context isolation and sandboxing enabled and without Node integration. The renderer SHALL reach privileged functionality only through named, task-level calls exposed by the preload; it SHALL NOT receive generic file, process or IPC access.

#### Scenario: Renderer has no Node access
- **WHEN** code in the renderer evaluates `typeof require` or `typeof process`
- **THEN** both are `"undefined"`

#### Scenario: Only task-level calls are exposed
- **WHEN** the renderer inspects the API exposed by the preload
- **THEN** it finds only named tasks (for example sign-in, sign-out, read session token) and no call that takes an arbitrary path, command or IPC channel

### Requirement: Window loads only the bundled UI
The desktop window SHALL load only the UI bundled with the app. Navigation or new windows to any other URL SHALL be blocked in the app window, and http(s) links SHALL open in the system browser instead.

#### Scenario: External link
- **WHEN** the user clicks a link to `https://gamenode.app/...` inside the app
- **THEN** the link opens in the system browser and the app window stays on its current view

#### Scenario: Navigation attempt
- **WHEN** anything tries to navigate the app window to a non-bundled URL
- **THEN** the navigation is cancelled

### Requirement: Sign in with GameNode through the system browser
The app SHALL let the user sign in with the same social providers as the GameNode website, from a sign-in screen designed for the desktop app. Sign-in SHALL happen in the system browser and return to the app through a registered deep link; the app SHALL NOT show provider login pages inside its own window.

#### Scenario: Successful sign-in
- **WHEN** a signed-out user picks a provider and completes login in the system browser
- **THEN** the app is brought to the front, shows the user as signed in and opens the library view

#### Scenario: Sign-in cancelled or failed
- **WHEN** the user closes the browser or the provider returns an error
- **THEN** the app stays on the sign-in screen, re-enables the provider buttons and shows an error when one was returned

### Requirement: Session persists securely across restarts
The app SHALL keep the session token encrypted with the operating system's credential protection and SHALL restore it on start. Signing out, or the server rejecting the token, SHALL delete the stored token and return to the sign-in screen.

#### Scenario: Restart while signed in
- **WHEN** a signed-in user quits and reopens the app
- **THEN** the app opens signed in without asking for login again

#### Scenario: Sign out
- **WHEN** the user signs out
- **THEN** the stored token is deleted and the sign-in screen is shown

#### Scenario: Expired session
- **WHEN** an API call returns 401 for the stored token
- **THEN** the token is deleted and the sign-in screen is shown

### Requirement: Window state persists across restarts
The app SHALL restore its window size, position and maximized state on start, falling back to a default centered window when the saved position is off every connected display.

#### Scenario: Restore window
- **WHEN** the user resizes and moves the window, quits and reopens the app
- **THEN** the window opens with the same size and position

#### Scenario: Display removed
- **WHEN** the saved position was on a monitor that is no longer connected
- **THEN** the window opens centered on the primary display

### Requirement: Linux display fallback
On Linux the app SHALL start with the X11 platform when the user sets the documented fallback switch, so it renders on Wayland sessions with NVIDIA drivers where the default fails.

#### Scenario: Fallback enabled
- **WHEN** the app is started on Linux with the fallback switch set
- **THEN** it runs through XWayland/X11 and the window renders

### Requirement: CI produces installable builds
Every CI run that touches the desktop app SHALL produce an unsigned Windows installer and a Linux AppImage as downloadable workflow artifacts.

#### Scenario: Pull request build
- **WHEN** a pull request changes `apps/desktop` or a package it depends on
- **THEN** the CI run has a Windows installer artifact and an AppImage artifact that install and start on their OS

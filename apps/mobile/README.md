# Mobile app (Expo)

## Running the app

From this directory (`apps/mobile`):

```bash
npm start
```

Or:

```bash
npx expo start --lan
```

## Connection issues ("Cannot connect to the server")

If Expo Go or your device cannot connect to the dev server:

1. **Clear Expo cache** – In `apps/mobile`, run:
   ```bash
   rm -rf .expo
   ```
   Then run `npm start` again.

2. **Multiple network interfaces** – If you use VPN, Docker, or multiple networks, Expo may pick the wrong IP. Set your machine’s LAN IP before starting:
   ```bash
   export REACT_NATIVE_PACKAGER_HOSTNAME=192.168.x.x   # replace with your IP
   npm start
   ```

3. **Use tunnel** – If LAN still fails (e.g. strict firewall), use Expo’s tunnel (slower but works across networks):
   ```bash
   npx expo start --tunnel
   ```

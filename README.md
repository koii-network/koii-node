# Koii Node

## Description

This repo contains a desktop application as the UI for the [Koii Node](https://github.com/koii-network/node). It provides a user-friendly interface for running tasks, managing your wallet and interacting with the Koii Network.

## Prerequisites

- [NodeJS](https://nodejs.org/en/) (v16 or higher recommended)
- npm or yarn package manager
- Git

## Installation

1. Clone the repository:
```sh
git clone https://github.com/koii-network/koii-node
cd koii-node
```

2. Install dependencies:
```sh
npm install
```

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Update the values in `.env` with your configuration

## Development

Start the development server:
```bash
npm start
```

### Common Issues

#### File Watcher Limit
If you encounter the error `ENOSPC: System limit for number of file watchers reached`, run:
```sh
sudo sysctl fs.inotify.max_user_watches=524288
sudo sysctl -p
```

#### Linux Dependencies
On Linux, you may need to install additional packages:
```sh
sudo apt-get update
sudo apt-get install build-essential
```

## Testing

Run the test suite:
```bash
npm test
```

## Building for Production

To package the app for your local platform:
```bash
npm run package
```

The packaged application will be available in `release/build/`

## Contributing

We welcome contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows our coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please:
- Check the [documentation](https://docs.koii.network)
- Join our [Discord community](https://discord.gg/koii)
- Open an issue in this repository

## Security

If you discover any security-related issues, please email security@koii.network instead of using the issue tracker.

## Using Orca

In the desktop node, go to Settings > Task Extensions and install Orca. If it doesn't install automatically or if you run into any issues after installing, [these](https://docs.chaindeck.io/orcaNode) are the instructions to install manually and troubleshoot.

If you are having errors with virtualization on Linux, you may need to install qemu:

```sh
apt install qemu-system
```

## Packaging for Production

To package apps for the local platform:

```bash
npm run package
```

Then ready to be run/installed version of application can be found in `release/build`

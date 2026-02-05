# Infrastructure Setup for Nextcloud Integration

This directory contains scripts to configure the ZFS datasets on the Proxmox host for the Nextcloud integration.

## ZFS Datasets

The following datasets are required:
- `zfs/nc_data`: Storage for Nextcloud data.
- `zfs/doc_index`: Storage for the document index.

### Setup

Run the setup script on the Proxmox host:
```bash
chmod +x infra/zfs-setup.sh
./infra/zfs-setup.sh
```

## Snapshots

Snapshots are configured to run hourly and daily.

### Manual Run

To create an hourly snapshot:
```bash
./infra/zfs-snapshots.sh hourly
```

To create a daily snapshot:
```bash
./infra/zfs-snapshots.sh daily
```

### Automation (Cron)

Add the following to your crontab (`crontab -e`) on the Proxmox host:

```cron
# Hourly snapshots at minute 0
0 * * * * /path/to/infra/zfs-snapshots.sh hourly

# Daily snapshots at 00:00
0 0 * * * /path/to/infra/zfs-snapshots.sh daily
```

#!/bin/bash
# Script to create ZFS snapshots for Nextcloud datasets

FREQUENCY=$1

if [[ -z "$FREQUENCY" ]]; then
  echo "Usage: $0 [hourly|daily]"
  exit 1
fi

POOL_NAME="zfs"
DATASETS=("nc_data" "doc_index")
TIMESTAMP=$(date +%Y-%m-%d_%H%M%S)

for DS in "${DATASETS[@]}"; do
  SNAPSHOT_NAME="${POOL_NAME}/${DS}@${FREQUENCY}-${TIMESTAMP}"
  echo "Creating snapshot: $SNAPSHOT_NAME"
  zfs snapshot "$SNAPSHOT_NAME"

  # Retention policy (simple example)
  if [[ "$FREQUENCY" == "hourly" ]]; then
    # Keep 24 hourly snapshots
    zfs list -t snapshot -o name -s creation | grep "${POOL_NAME}/${DS}@hourly" | head -n -24 | xargs -r -n 1 zfs destroy
  elif [[ "$FREQUENCY" == "daily" ]]; then
    # Keep 30 daily snapshots
    zfs list -t snapshot -o name -s creation | grep "${POOL_NAME}/${DS}@daily" | head -n -30 | xargs -r -n 1 zfs destroy
  fi
done

echo "Snapshots completed."
